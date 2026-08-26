#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger as _},
    token, Address, Env, String,
};

fn create_mock_token<'a>(
    env: &Env,
    admin: &Address,
) -> (Address, token::Client<'a>, token::StellarAssetClient<'a>) {
    let token_address = env
        .register_stellar_asset_contract_v2(admin.clone())
        .address();
    let client = token::Client::new(env, &token_address);
    let stellar_client = token::StellarAssetClient::new(env, &token_address);
    (token_address, client, stellar_client)
}

#[test]
fn test_escrow_full_happy_path_with_token_transfers() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, token_client, token_admin_client) = create_mock_token(&env, &token_admin);

    // Mint initial tokens to payer
    token_admin_client.mint(&payer, &1000_0000000i128);
    assert_eq!(token_client.balance(&payer), 1000_0000000i128);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    // 1. Initialize with 50 bps (0.5%) fee
    client.initialize(&admin, &fee_recipient, &50u32);

    let amount = 500_0000000i128;
    let timeout = 1000u32;
    let desc = String::from_str(&env, "Web3 Security Audit Payment");

    // 2. Create Escrow
    let escrow_id = client.create(
        &payer,
        &payee,
        &None,
        &token_address,
        &amount,
        &timeout,
        &desc,
    );
    assert_eq!(escrow_id, 1);

    let record = client.get_escrow(&escrow_id);
    assert_eq!(record.state, EscrowState::Created);
    assert_eq!(record.amount, amount);
    assert_eq!(record.fee_amount, 2_5000000i128); // 0.5% of 500 = 2.5

    // 3. Fund Escrow — transfers tokens into contract
    client.fund(&escrow_id);
    assert_eq!(token_client.balance(&payer), 500_0000000i128);
    assert_eq!(token_client.balance(&contract_id), 500_0000000i128);

    let record_funded = client.get_escrow(&escrow_id);
    assert_eq!(record_funded.state, EscrowState::Funded);

    // 4. Release Escrow — transfers tokens to payee minus fee
    client.release(&payer, &escrow_id);

    assert_eq!(token_client.balance(&contract_id), 0i128);
    assert_eq!(token_client.balance(&payee), 497_5000000i128);
    assert_eq!(token_client.balance(&fee_recipient), 2_5000000i128);

    let record_released = client.get_escrow(&escrow_id);
    assert_eq!(record_released.state, EscrowState::Released);

    // Check stats
    let stats = client.get_platform_stats();
    assert_eq!(stats.total_escrows, 1);
    assert_eq!(stats.total_volume, 500_0000000i128);
}

#[test]
fn test_multisig_2_of_3_arbiter_approval_release() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let arbiter = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, token_client, token_admin_client) = create_mock_token(&env, &token_admin);
    token_admin_client.mint(&payer, &200_0000000i128);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0u32); // 0% fee

    let amount = 200_0000000i128;
    let timeout = 500u32;
    let desc = String::from_str(&env, "Cross-Border Invoice #412");

    let escrow_id = client.create(
        &payer,
        &payee,
        &Some(arbiter.clone()),
        &token_address,
        &amount,
        &timeout,
        &desc,
    );
    client.fund(&escrow_id);

    // Payee approves first (1 of 3 approvals)
    let released1 = client.approve(&payee, &escrow_id);
    assert_eq!(released1, false);

    let record = client.get_escrow(&escrow_id);
    assert_eq!(record.payee_approved, true);
    assert_eq!(record.state, EscrowState::Funded);

    // Arbiter approves (2 of 3 threshold reached! Triggers release)
    let released2 = client.approve(&arbiter, &escrow_id);
    assert_eq!(released2, true);

    let record_final = client.get_escrow(&escrow_id);
    assert_eq!(record_final.state, EscrowState::Released);
    assert_eq!(token_client.balance(&payee), 200_0000000i128);
}

#[test]
fn test_dispute_and_arbiter_custom_split_resolution() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let arbiter = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, token_client, token_admin_client) = create_mock_token(&env, &token_admin);
    token_admin_client.mint(&payer, &100_0000000i128);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0u32);

    let amount = 100_0000000i128;
    let timeout = 200u32;
    let desc = String::from_str(&env, "Freelance Dev Milestone");

    let escrow_id = client.create(
        &payer,
        &payee,
        &Some(arbiter.clone()),
        &token_address,
        &amount,
        &timeout,
        &desc,
    );
    client.fund(&escrow_id);

    // Payer raises dispute
    client.raise_dispute(&payer, &escrow_id);

    let record_disputed = client.get_escrow(&escrow_id);
    assert_eq!(record_disputed.state, EscrowState::Disputed);

    // Arbiter resolves dispute: 70% to Payee, 30% to Payer
    client.resolve_dispute(&arbiter, &escrow_id, &7000u32);

    let record_resolved = client.get_escrow(&escrow_id);
    assert_eq!(record_resolved.state, EscrowState::Resolved);

    assert_eq!(token_client.balance(&payee), 70_0000000i128);
    assert_eq!(token_client.balance(&payer), 30_0000000i128);
    assert_eq!(token_client.balance(&contract_id), 0i128);
}

#[test]
fn test_timelocked_refund_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, token_client, token_admin_client) = create_mock_token(&env, &token_admin);
    token_admin_client.mint(&payer, &300_0000000i128);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0u32);

    let timeout_ledger = 50u32;
    let escrow_id = client.create(
        &payer,
        &payee,
        &None,
        &token_address,
        &300_0000000i128,
        &timeout_ledger,
        &String::from_str(&env, "Time-lock Test"),
    );
    client.fund(&escrow_id);

    // Advance ledger past timeout
    env.ledger().set_sequence_number(60);

    // Payer claims refund
    client.refund(&payer, &escrow_id);

    assert_eq!(token_client.balance(&payer), 300_0000000i128);
    assert_eq!(token_client.balance(&contract_id), 0i128);

    let record = client.get_escrow(&escrow_id);
    assert_eq!(record.state, EscrowState::Refunded);
}

#[test]
fn test_user_index_and_scaling() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee1 = Address::generate(&env);
    let payee2 = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, token_admin_client) = create_mock_token(&env, &token_admin);
    token_admin_client.mint(&payer, &1000_0000000i128);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &10u32);

    let id1 = client.create(
        &payer,
        &payee1,
        &None,
        &token_address,
        &100_0000000i128,
        &100u32,
        &String::from_str(&env, "Contract 1"),
    );
    let id2 = client.create(
        &payer,
        &payee2,
        &None,
        &token_address,
        &200_0000000i128,
        &100u32,
        &String::from_str(&env, "Contract 2"),
    );
    let id3 = client.create(
        &payer,
        &payee1,
        &None,
        &token_address,
        &300_0000000i128,
        &100u32,
        &String::from_str(&env, "Contract 3"),
    );

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(id3, 3);

    let payer_escrows = client.get_user_escrows(&payer);
    assert_eq!(payer_escrows.len(), 3);

    let payee1_escrows = client.get_user_escrows(&payee1);
    assert_eq!(payee1_escrows.len(), 2);
    assert_eq!(payee1_escrows.get(0).unwrap(), 1);
    assert_eq!(payee1_escrows.get(1).unwrap(), 3);

    let payee2_escrows = client.get_user_escrows(&payee2);
    assert_eq!(payee2_escrows.len(), 1);
    assert_eq!(payee2_escrows.get(0).unwrap(), 2);
}

#[test]
#[should_panic(expected = "Error(Contract, #3)")]
fn test_create_zero_amount_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);

    client.create(
        &payer,
        &payee,
        &None,
        &token,
        &0i128,
        &100u32,
        &String::from_str(&env, "Invalid"),
    );
}

#[test]
#[should_panic(expected = "Error(Contract, #8)")]
fn test_refund_before_timeout_fails() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let fee_recipient = Address::generate(&env);
    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_address, _, token_admin_client) = create_mock_token(&env, &token_admin);
    token_admin_client.mint(&payer, &100_0000000i128);

    let contract_id = env.register(EscrowContract, ());
    let client = EscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin, &fee_recipient, &0u32);

    let escrow_id = client.create(
        &payer,
        &payee,
        &None,
        &token_address,
        &100_0000000i128,
        &500u32,
        &String::from_str(&env, "Early Refund"),
    );
    client.fund(&escrow_id);

    // Ledger sequence is 0, timeout is 500 — refund must fail
    client.refund(&payer, &escrow_id);
}
