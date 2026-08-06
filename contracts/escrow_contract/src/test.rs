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
