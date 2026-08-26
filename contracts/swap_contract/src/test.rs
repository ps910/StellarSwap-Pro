#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env};

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
fn test_amm_deposit_swap_withdraw_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let trader = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_a, client_a, admin_a) = create_mock_token(&env, &token_admin);
    let (token_b, client_b, admin_b) = create_mock_token(&env, &token_admin);

    // Mint tokens to provider and trader
    admin_a.mint(&provider, &100_000_0000000i128); // 100,000 XLM
    admin_b.mint(&provider, &10_000_0000000i128); // 10,000 USDC
    admin_a.mint(&trader, &1_000_0000000i128); // 1,000 XLM

    let contract_id = env.register(SwapContract, ());
    let client = SwapContractClient::new(&env, &contract_id);

    // 1. Initialize with 30 bps (0.3%) fee
    client.initialize(&admin, &token_a, &token_b, &30u32);

    // 2. Deposit Initial Liquidity
    let lp_minted = client.deposit(&provider, &100_000_0000000i128, &10_000_0000000i128, &1i128);
    assert!(lp_minted > 0);
    assert_eq!(client.get_lp_balance(&provider), lp_minted);

    let (res_a, res_b, total_lp) = client.get_reserves();
    assert_eq!(res_a, 100_000_0000000i128);
    assert_eq!(res_b, 10_000_0000000i128);
    assert_eq!(total_lp, lp_minted);

    assert_eq!(client_a.balance(&contract_id), 100_000_0000000i128);
    assert_eq!(client_b.balance(&contract_id), 10_000_0000000i128);

    // 3. Query Swap Rate for 1,000 Token A
    let estimated_out = client.get_rate(&token_a, &1_000_0000000i128);
    assert!(estimated_out > 0);

    // 4. Trader executes Swap A -> B
    let amount_out = client.swap(&trader, &token_a, &1_000_0000000i128, &estimated_out);
    assert_eq!(amount_out, estimated_out);
    assert_eq!(client_a.balance(&trader), 0i128);
    assert_eq!(client_b.balance(&trader), amount_out);

    // 5. Provider withdraws 50% of liquidity
    let half_lp = lp_minted / 2;
    let (withdrawn_a, withdrawn_b) = client.withdraw(&provider, &half_lp, &1i128, &1i128);

    assert!(withdrawn_a > 0);
    assert!(withdrawn_b > 0);
    assert_eq!(client.get_lp_balance(&provider), lp_minted - half_lp);
}

#[test]
fn test_reverse_swap_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let trader = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_a, client_a, admin_a) = create_mock_token(&env, &token_admin);
    let (token_b, client_b, admin_b) = create_mock_token(&env, &token_admin);

    admin_a.mint(&provider, &50_000_0000000i128);
    admin_b.mint(&provider, &50_000_0000000i128);
    admin_b.mint(&trader, &500_0000000i128);

    let contract_id = env.register(SwapContract, ());
    let client = SwapContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a, &token_b, &30u32);
    client.deposit(&provider, &50_000_0000000i128, &50_000_0000000i128, &1i128);

    // Trader swaps B -> A
    let rate_b_to_a = client.get_rate(&token_b, &500_0000000i128);
    let out_a = client.swap(&trader, &token_b, &500_0000000i128, &rate_b_to_a);

    assert_eq!(out_a, rate_b_to_a);
    assert_eq!(client_b.balance(&trader), 0i128);
    assert_eq!(client_a.balance(&trader), out_a);
}

#[test]
#[should_panic(expected = "Error(Contract, #8)")]
fn test_emergency_pause_blocks_swaps() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let trader = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_a, _, admin_a) = create_mock_token(&env, &token_admin);
    let (token_b, _, admin_b) = create_mock_token(&env, &token_admin);

    admin_a.mint(&provider, &10_000_0000000i128);
    admin_b.mint(&provider, &10_000_0000000i128);
    admin_a.mint(&trader, &100_0000000i128);

    let contract_id = env.register(SwapContract, ());
    let client = SwapContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a, &token_b, &30u32);
    client.deposit(&provider, &10_000_0000000i128, &10_000_0000000i128, &1i128);

    // Admin pauses contract
    client.set_paused(&admin, &true);

    // Swap should fail with ContractPaused
    client.swap(&trader, &token_a, &100_0000000i128, &1i128);
}

#[test]
#[should_panic(expected = "Error(Contract, #6)")]
fn test_slippage_protection_triggers() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let provider = Address::generate(&env);
    let trader = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let (token_a, _, admin_a) = create_mock_token(&env, &token_admin);
    let (token_b, _, admin_b) = create_mock_token(&env, &token_admin);

    admin_a.mint(&provider, &10_000_0000000i128);
    admin_b.mint(&provider, &10_000_0000000i128);
    admin_a.mint(&trader, &100_0000000i128);

    let contract_id = env.register(SwapContract, ());
    let client = SwapContractClient::new(&env, &contract_id);
    client.initialize(&admin, &token_a, &token_b, &30u32);
    client.deposit(&provider, &10_000_0000000i128, &10_000_0000000i128, &1i128);

    // Asking for min_out = 999999999999999 (unreasonable slippage) should panic
    client.swap(&trader, &token_a, &100_0000000i128, &999_999_0000000i128);
}
