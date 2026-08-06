#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    FeeBps,
    Reserve(Symbol),
}

#[contract]
pub struct SwapContract;

#[contractimpl]
impl SwapContract {
    /// Initialize DEX Liquidity Pool contract
    pub fn initialize(env: Env, admin: Address, fee_bps: u32) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);

        // Initialize default token reserves
        let xlm = symbol_short!("XLM");
        let usdc = symbol_short!("USDC");
        env.storage().instance().set(&DataKey::Reserve(xlm.clone()), &100_000_0000000i128); // 100,000 XLM
        env.storage().instance().set(&DataKey::Reserve(usdc.clone()), &10_000_0000000i128); // 10,000 USDC

        // Emit Initialization Event
        env.events().publish((symbol_short!("init"), admin), fee_bps);
    }

    /// Deposit liquidity into token reserve
    pub fn deposit(env: Env, from: Address, token: Symbol, amount: i128) -> i128 {
        from.require_auth();
        if amount <= 0 {
            panic!("Deposit amount must be positive");
        }

        let current_reserve: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Reserve(token.clone()))
            .unwrap_or(0);

        let new_reserve = current_reserve + amount;
        env.storage().instance().set(&DataKey::Reserve(token.clone()), &new_reserve);

        // Emit deposit event: topics (symbol_short!("deposit"), from, token), data: (amount, new_reserve)
        env.events().publish(
            (symbol_short!("deposit"), from.clone(), token),
            (amount, new_reserve),
        );

        new_reserve
    }

    /// Execute token swap
    pub fn swap(
        env: Env,
        user: Address,
        token_in: Symbol,
        token_out: Symbol,
        amount_in: i128,
        min_amount_out: i128,
    ) -> i128 {
        user.require_auth();

        if amount_in <= 0 {
            panic!("Amount in must be positive");
        }

        let reserve_in: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Reserve(token_in.clone()))
            .unwrap_or(0);
        let reserve_out: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Reserve(token_out.clone()))
            .unwrap_or(0);

        if reserve_in <= 0 || reserve_out <= 0 {
            panic!("Insufficient pool liquidity");
        }

        // Apply 0.3% fee (30 bps)
        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(30);
        let amount_in_with_fee = amount_in * (10000 - fee_bps as i128);
        
        // Constant product formula: dy = (y * dx_with_fee) / (x * 10000 + dx_with_fee)
        let numerator = reserve_out * amount_in_with_fee;
        let denominator = (reserve_in * 10000) + amount_in_with_fee;
        let amount_out = numerator / denominator;

        if amount_out < min_amount_out {
            panic!("Slippage tolerance exceeded");
        }

        if amount_out > reserve_out {
            panic!("Insufficient reserve balance for payout");
        }

        // Update reserves
        let new_reserve_in = reserve_in + amount_in;
        let new_reserve_out = reserve_out - amount_out;

        env.storage().instance().set(&DataKey::Reserve(token_in.clone()), &new_reserve_in);
        env.storage().instance().set(&DataKey::Reserve(token_out.clone()), &new_reserve_out);

        // Publish Swap Soroban Event
        env.events().publish(
            (symbol_short!("swap"), user.clone(), token_in, token_out),
            (amount_in, amount_out, new_reserve_in, new_reserve_out),
        );

        amount_out
    }

    /// Query current pool reserve for token
    pub fn get_reserve(env: Env, token: Symbol) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::Reserve(token))
            .unwrap_or(0)
    }

    /// Query estimated output for swap
    pub fn get_rate(env: Env, token_in: Symbol, token_out: Symbol, amount_in: i128) -> i128 {
        let reserve_in: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Reserve(token_in))
            .unwrap_or(0);
        let reserve_out: i128 = env
            .storage()
            .instance()
            .get(&DataKey::Reserve(token_out))
            .unwrap_or(0);

        if reserve_in == 0 || reserve_out == 0 || amount_in <= 0 {
            return 0;
        }

        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(30);
        let amount_in_with_fee = amount_in * (10000 - fee_bps as i128);
        let numerator = reserve_out * amount_in_with_fee;
        let denominator = (reserve_in * 10000) + amount_in_with_fee;
        
        numerator / denominator
    }
}

#[cfg(test)]
mod test;
