#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

/// Represents a recorded swap on-chain
#[contracttype]
#[derive(Clone)]
pub struct SwapRecord {
    pub user: Address,
    pub sell_asset: String,
    pub buy_asset: String,
    pub amount: i128,
    pub timestamp: u64,
}

/// Storage keys for contract data
#[contracttype]
pub enum DataKey {
    SwapCount,
    LastSwap,
}

#[contract]
pub struct SwapTrackerContract;

#[contractimpl]
impl SwapTrackerContract {
    /// Record a swap event on-chain
    /// Requires authorization from the user performing the swap
    pub fn record_swap(
        env: Env,
        user: Address,
        sell_asset: String,
        buy_asset: String,
        amount: i128,
    ) {
        // Require user authorization
        user.require_auth();

        // Get and increment swap count
        let count: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::SwapCount)
            .unwrap_or(0);
        let new_count = count + 1;

        // Create swap record
        let record = SwapRecord {
            user: user.clone(),
            sell_asset,
            buy_asset,
            amount,
            timestamp: env.ledger().timestamp(),
        };

        // Store data persistently
        env.storage()
            .persistent()
            .set(&DataKey::SwapCount, &new_count);
        env.storage()
            .persistent()
            .set(&DataKey::LastSwap, &record);

        // Emit event for frontend to listen to
        env.events().publish((symbol_short!("swap"),), new_count);
    }

    /// Read the total number of swaps recorded
    pub fn get_swap_count(env: Env) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::SwapCount)
            .unwrap_or(0)
    }

    /// Read the most recently recorded swap
    pub fn get_last_swap(env: Env) -> Option<SwapRecord> {
        env.storage().persistent().get(&DataKey::LastSwap)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_record_and_read_swap() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SwapTrackerContract, ());
        let client = SwapTrackerContractClient::new(&env, &contract_id);
        let user = Address::generate(&env);

        // Initial count should be 0
        assert_eq!(client.get_swap_count(), 0);

        // Record a swap
        client.record_swap(
            &user,
            &String::from_str(&env, "XLM"),
            &String::from_str(&env, "USDC"),
            &1000000_i128,
        );

        // Count should be 1
        assert_eq!(client.get_swap_count(), 1);

        // Last swap should exist
        let last = client.get_last_swap();
        assert!(last.is_some());
        let record = last.unwrap();
        assert_eq!(record.user, user);
        assert_eq!(record.amount, 1000000_i128);
    }

    #[test]
    fn test_multiple_swaps() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(SwapTrackerContract, ());
        let client = SwapTrackerContractClient::new(&env, &contract_id);
        let user1 = Address::generate(&env);
        let user2 = Address::generate(&env);

        client.record_swap(
            &user1,
            &String::from_str(&env, "XLM"),
            &String::from_str(&env, "USDC"),
            &500000_i128,
        );

        client.record_swap(
            &user2,
            &String::from_str(&env, "USDC"),
            &String::from_str(&env, "XLM"),
            &250000_i128,
        );

        assert_eq!(client.get_swap_count(), 2);

        // Last swap should be from user2
        let last = client.get_last_swap().unwrap();
        assert_eq!(last.user, user2);
        assert_eq!(last.amount, 250000_i128);
    }
}
