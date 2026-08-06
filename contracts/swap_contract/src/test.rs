#![cfg(test)]

use super::*;
use soroban_sdk::{symbol_short, Env, Address, testutils::Address as _};

#[test]
fn test_swap_contract_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SwapContract);
    let client = SwapContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    // Initialize
    client.initialize(&admin, &30);

    let xlm = symbol_short!("XLM");
    let usdc = symbol_short!("USDC");

    // Check initial reserves
    let reserve_xlm = client.get_reserve(&xlm);
    let reserve_usdc = client.get_reserve(&usdc);

    assert_eq!(reserve_xlm, 100_000_0000000i128);
    assert_eq!(reserve_usdc, 10_000_0000000i128);

    // Test deposit
    client.deposit(&user, &xlm, &500_0000000i128);
    assert_eq!(client.get_reserve(&xlm), 100_500_0000000i128);

    // Test get_rate
    let rate = client.get_rate(&xlm, &usdc, &100_0000000i128);
    assert!(rate > 0);

    // Test swap
    let received = client.swap(&user, &xlm, &usdc, &100_0000000i128, &1);
    assert!(received > 0);
}

// ---------- Edge Case Tests ----------

#[test]
#[should_panic(expected = "Amount in must be positive")]
fn test_swap_zero_amount_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SwapContract);
    let client = SwapContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &30);

    let xlm = symbol_short!("XLM");
    let usdc = symbol_short!("USDC");

    // Zero amount swap should panic
    client.swap(&user, &xlm, &usdc, &0i128, &0);
}

#[test]
#[should_panic(expected = "Slippage tolerance exceeded")]
fn test_swap_slippage_exceeded() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SwapContract);
    let client = SwapContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &30);

    let xlm = symbol_short!("XLM");
    let usdc = symbol_short!("USDC");

    // Set min_amount_out impossibly high to trigger slippage error
    client.swap(&user, &xlm, &usdc, &100_0000000i128, &999_000_0000000i128);
}

#[test]
#[should_panic(expected = "Deposit amount must be positive")]
fn test_deposit_zero_amount_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SwapContract);
    let client = SwapContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &30);

    let xlm = symbol_short!("XLM");

    // Zero deposit should panic
    client.deposit(&user, &xlm, &0i128);
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_double_initialization_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SwapContract);
    let client = SwapContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);

    client.initialize(&admin, &30);

    // Second initialization should panic
    client.initialize(&admin, &30);
}

#[test]
fn test_swap_rate_consistency() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register_contract(None, SwapContract);
    let client = SwapContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let user = Address::generate(&env);

    client.initialize(&admin, &30);

    let xlm = symbol_short!("XLM");
    let usdc = symbol_short!("USDC");

    // get_rate should return a non-zero estimated output
    let rate = client.get_rate(&xlm, &usdc, &1000_0000000i128);
    assert!(rate > 0, "Rate must be positive for valid reserves");

    // Actual swap output should match or be close to get_rate
    let actual = client.swap(&user, &xlm, &usdc, &1000_0000000i128, &1);
    assert_eq!(actual, rate, "Swap output should match quoted rate");
}

