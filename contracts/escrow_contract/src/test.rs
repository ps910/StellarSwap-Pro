#![cfg(test)]

use super::*;
use soroban_sdk::{Env, Address, testutils::{Address as _, Ledger as _}};

#[test]
fn test_escrow_create_fund_release_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let amount = 100_0000000i128;
    let timeout_ledger = 100u32;

    // 1. Create Escrow
    let escrow_id = client.create(&payer, &payee, &token, &amount, &timeout_ledger);
    assert_eq!(escrow_id, 1);

    let record = client.get_escrow(&escrow_id);
    assert_eq!(record.state, EscrowState::Created);
    assert_eq!(record.amount, amount);
    assert_eq!(record.payer, payer);
    assert_eq!(record.payee, payee);

    // 2. Fund Escrow
    client.fund(&escrow_id);
    let record_funded = client.get_escrow(&escrow_id);
    assert_eq!(record_funded.state, EscrowState::Funded);

    // 3. Release Escrow
    client.release(&escrow_id);
    let record_released = client.get_escrow(&escrow_id);
    assert_eq!(record_released.state, EscrowState::Released);
}

#[test]
fn test_escrow_create_fund_refund_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let amount = 250_0000000i128;
    let timeout_ledger = 50u32;

    // 1. Create & Fund
    let escrow_id = client.create(&payer, &payee, &token, &amount, &timeout_ledger);
    client.fund(&escrow_id);

    // 2. Advance ledger sequence past timeout
    env.ledger().set_sequence_number(60);

    // 3. Refund Escrow
    client.refund(&escrow_id);
    let record_refunded = client.get_escrow(&escrow_id);
    assert_eq!(record_refunded.state, EscrowState::Refunded);
}

// ---------- Edge Case Tests ----------

#[test]
#[should_panic(expected = "Amount must be positive")]
fn test_escrow_create_zero_amount_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    // Zero amount should be rejected
    client.create(&payer, &payee, &token, &0i128, &100u32);
}

#[test]
#[should_panic(expected = "Escrow is not in Created state")]
fn test_escrow_duplicate_fund_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let escrow_id = client.create(&payer, &payee, &token, &100_0000000i128, &100u32);
    client.fund(&escrow_id);

    // Funding an already-funded escrow should panic
    client.fund(&escrow_id);
}

#[test]
#[should_panic(expected = "Escrow is not in Funded state")]
fn test_escrow_release_before_fund_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let escrow_id = client.create(&payer, &payee, &token, &100_0000000i128, &100u32);

    // Releasing a non-funded escrow should panic
    client.release(&escrow_id);
}

#[test]
#[should_panic(expected = "Escrow timeout has not elapsed yet")]
fn test_escrow_refund_before_timeout_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let escrow_id = client.create(&payer, &payee, &token, &100_0000000i128, &100u32);
    client.fund(&escrow_id);

    // Ledger is at 0, timeout is 100 — refund should be rejected
    client.refund(&escrow_id);
}

#[test]
fn test_escrow_sequential_ids() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, EscrowContract);
    let client = EscrowContractClient::new(&env, &contract_id);

    let payer = Address::generate(&env);
    let payee = Address::generate(&env);
    let token = Address::generate(&env);

    let id1 = client.create(&payer, &payee, &token, &100_0000000i128, &100u32);
    let id2 = client.create(&payer, &payee, &token, &200_0000000i128, &200u32);
    let id3 = client.create(&payer, &payee, &token, &300_0000000i128, &300u32);

    assert_eq!(id1, 1);
    assert_eq!(id2, 2);
    assert_eq!(id3, 3);

    // Verify each escrow has correct amount
    assert_eq!(client.get_escrow(&id1).amount, 100_0000000i128);
    assert_eq!(client.get_escrow(&id2).amount, 200_0000000i128);
    assert_eq!(client.get_escrow(&id3).amount, 300_0000000i128);
}

