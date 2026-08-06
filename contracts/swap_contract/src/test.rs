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
