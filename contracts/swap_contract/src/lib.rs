#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short,
    token, Address, Env,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    InvalidToken = 4,
    InsufficientLiquidity = 5,
    SlippageExceeded = 6,
    Unauthorized = 7,
    ContractPaused = 8,
    InsufficientLpBalance = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    TokenA,
    TokenB,
    ReserveA,
    ReserveB,
    TotalLp,
    FeeBps,
    IsPaused,
    LpBalance(Address),
}

const DEFAULT_EXTEND_TTL_THRESHOLD: u32 = 17_280; // ~1 day
const DEFAULT_EXTEND_TTL_AMOUNT: u32 = 518_400;   // ~30 days

#[contract]
pub struct SwapContract;

#[contractimpl]
impl SwapContract {
    /// Initialize AMM Liquidity Pool contract with token pair and swap fee in basis points
    pub fn initialize(
        env: Env,
        admin: Address,
        token_a: Address,
        token_b: Address,
        fee_bps: u32,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();

        if token_a == token_b {
            return Err(Error::InvalidToken);
        }
        if fee_bps > 500 {
            // Maximum 5% fee
            return Err(Error::InvalidAmount);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenA, &token_a);
        env.storage().instance().set(&DataKey::TokenB, &token_b);
        env.storage().instance().set(&DataKey::ReserveA, &0i128);
        env.storage().instance().set(&DataKey::ReserveB, &0i128);
        env.storage().instance().set(&DataKey::TotalLp, &0i128);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::IsPaused, &false);

        env.events().publish(
            (symbol_short!("init"), admin),
            (token_a, token_b, fee_bps),
        );

        Ok(())
    }

    /// Deposit liquidity (Token A + Token B) and mint proportional LP shares
    pub fn deposit(
        env: Env,
        provider: Address,
        amount_a: i128,
        amount_b: i128,
        min_lp: i128,
    ) -> Result<i128, Error> {
        Self::check_not_paused(&env)?;
        provider.require_auth();

        if amount_a <= 0 || amount_b <= 0 {
            return Err(Error::InvalidAmount);
        }

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).ok_or(Error::NotInitialized)?;
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).ok_or(Error::NotInitialized)?;
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let total_lp: i128 = env.storage().instance().get(&DataKey::TotalLp).unwrap_or(0);

        let lp_to_mint: i128 = if total_lp == 0 || reserve_a == 0 || reserve_b == 0 {
            // Initial liquidity: geometric mean approximation via integer sqrt
            Self::integer_sqrt(amount_a * amount_b)
        } else {
            // Proportional share: min(amount_a * total_lp / reserve_a, amount_b * total_lp / reserve_b)
            let lp_a = (amount_a * total_lp) / reserve_a;
            let lp_b = (amount_b * total_lp) / reserve_b;
            if lp_a < lp_b { lp_a } else { lp_b }
        };

        if lp_to_mint < min_lp || lp_to_mint <= 0 {
            return Err(Error::SlippageExceeded);
        }

        // Real SAC Token Transfers from Provider to Pool Contract
        let contract_address = env.current_contract_address();
        token::Client::new(&env, &token_a).transfer(&provider, &contract_address, &amount_a);
        token::Client::new(&env, &token_b).transfer(&provider, &contract_address, &amount_b);

        // Update reserves and LP accounting
        let new_reserve_a = reserve_a + amount_a;
        let new_reserve_b = reserve_b + amount_b;
        let new_total_lp = total_lp + lp_to_mint;

        env.storage().instance().set(&DataKey::ReserveA, &new_reserve_a);
        env.storage().instance().set(&DataKey::ReserveB, &new_reserve_b);
        env.storage().instance().set(&DataKey::TotalLp, &new_total_lp);

        let provider_lp: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::LpBalance(provider.clone()))
            .unwrap_or(0);
        env.storage().persistent().set(&DataKey::LpBalance(provider.clone()), &(provider_lp + lp_to_mint));
        env.storage().persistent().extend_ttl(
            &DataKey::LpBalance(provider.clone()),
            DEFAULT_EXTEND_TTL_THRESHOLD,
            DEFAULT_EXTEND_TTL_AMOUNT,
        );

        env.events().publish(
            (symbol_short!("deposit"), provider),
            (amount_a, amount_b, lp_to_mint),
        );

        Ok(lp_to_mint)
    }

    /// Withdraw liquidity by burning LP shares and receiving proportional Token A + Token B
    pub fn withdraw(
        env: Env,
        provider: Address,
        lp_amount: i128,
        min_a: i128,
        min_b: i128,
    ) -> Result<(i128, i128), Error> {
        Self::check_not_paused(&env)?;
        provider.require_auth();

        if lp_amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let provider_lp: i128 = env
            .storage()
            .persistent()
            .get(&DataKey::LpBalance(provider.clone()))
            .unwrap_or(0);

        if provider_lp < lp_amount {
            return Err(Error::InsufficientLpBalance);
        }

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).ok_or(Error::NotInitialized)?;
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).ok_or(Error::NotInitialized)?;
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let total_lp: i128 = env.storage().instance().get(&DataKey::TotalLp).unwrap_or(0);

        if total_lp <= 0 {
            return Err(Error::InsufficientLiquidity);
        }

        let amount_a = (lp_amount * reserve_a) / total_lp;
        let amount_b = (lp_amount * reserve_b) / total_lp;

        if amount_a < min_a || amount_b < min_b {
            return Err(Error::SlippageExceeded);
        }

        // Real SAC Token Transfers from Contract to Provider
        let contract_address = env.current_contract_address();
        token::Client::new(&env, &token_a).transfer(&contract_address, &provider, &amount_a);
        token::Client::new(&env, &token_b).transfer(&contract_address, &provider, &amount_b);

        // Update reserves and LP balances
        let new_reserve_a = reserve_a - amount_a;
        let new_reserve_b = reserve_b - amount_b;
        let new_total_lp = total_lp - lp_amount;

        env.storage().instance().set(&DataKey::ReserveA, &new_reserve_a);
        env.storage().instance().set(&DataKey::ReserveB, &new_reserve_b);
        env.storage().instance().set(&DataKey::TotalLp, &new_total_lp);
        env.storage().persistent().set(&DataKey::LpBalance(provider.clone()), &(provider_lp - lp_amount));

        env.events().publish(
            (symbol_short!("withdraw"), provider),
            (amount_a, amount_b, lp_amount),
        );

        Ok((amount_a, amount_b))
    }

    /// Swap Token In for Token Out using Constant Product formula ($x \cdot y = k$)
    pub fn swap(
        env: Env,
        user: Address,
        token_in: Address,
        amount_in: i128,
        min_amount_out: i128,
    ) -> Result<i128, Error> {
        Self::check_not_paused(&env)?;
        user.require_auth();

        if amount_in <= 0 {
            return Err(Error::InvalidAmount);
        }

        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).ok_or(Error::NotInitialized)?;
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).ok_or(Error::NotInitialized)?;
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(30);

        let (is_a_in, reserve_in, reserve_out, token_out) = if token_in == token_a {
            (true, reserve_a, reserve_b, token_b.clone())
        } else if token_in == token_b {
            (false, reserve_b, reserve_a, token_a.clone())
        } else {
            return Err(Error::InvalidToken);
        };

        if reserve_in <= 0 || reserve_out <= 0 {
            return Err(Error::InsufficientLiquidity);
        }

        // Constant Product Swap with Fee: dy = (reserve_out * dx * (10000 - fee)) / (reserve_in * 10000 + dx * (10000 - fee))
        let effective_dx = amount_in * (10_000 - fee_bps as i128);
        let numerator = reserve_out * effective_dx;
        let denominator = (reserve_in * 10_000) + effective_dx;
        let amount_out = numerator / denominator;

        if amount_out < min_amount_out {
            return Err(Error::SlippageExceeded);
        }
        if amount_out >= reserve_out {
            return Err(Error::InsufficientLiquidity);
        }

        // Execute Real SAC Token Transfers
        let contract_address = env.current_contract_address();
        token::Client::new(&env, &token_in).transfer(&user, &contract_address, &amount_in);
        token::Client::new(&env, &token_out).transfer(&contract_address, &user, &amount_out);

        // Update reserves
        if is_a_in {
            env.storage().instance().set(&DataKey::ReserveA, &(reserve_a + amount_in));
            env.storage().instance().set(&DataKey::ReserveB, &(reserve_b - amount_out));
        } else {
            env.storage().instance().set(&DataKey::ReserveA, &(reserve_a - amount_out));
            env.storage().instance().set(&DataKey::ReserveB, &(reserve_b + amount_in));
        }

        env.events().publish(
            (symbol_short!("swap"), user, token_in),
            (amount_in, amount_out, token_out),
        );

        Ok(amount_out)
    }

    /// Query estimated swap output given input amount
    pub fn get_rate(env: Env, token_in: Address, amount_in: i128) -> Result<i128, Error> {
        let token_a: Address = env.storage().instance().get(&DataKey::TokenA).ok_or(Error::NotInitialized)?;
        let token_b: Address = env.storage().instance().get(&DataKey::TokenB).ok_or(Error::NotInitialized)?;
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(30);

        let (reserve_in, reserve_out) = if token_in == token_a {
            (reserve_a, reserve_b)
        } else if token_in == token_b {
            (reserve_b, reserve_a)
        } else {
            return Err(Error::InvalidToken);
        };

        if reserve_in <= 0 || reserve_out <= 0 || amount_in <= 0 {
            return Ok(0);
        }

        let effective_dx = amount_in * (10_000 - fee_bps as i128);
        let numerator = reserve_out * effective_dx;
        let denominator = (reserve_in * 10_000) + effective_dx;

        Ok(numerator / denominator)
    }

    /// Query current pool reserves and total LP supply
    pub fn get_reserves(env: Env) -> Result<(i128, i128, i128), Error> {
        let reserve_a: i128 = env.storage().instance().get(&DataKey::ReserveA).unwrap_or(0);
        let reserve_b: i128 = env.storage().instance().get(&DataKey::ReserveB).unwrap_or(0);
        let total_lp: i128 = env.storage().instance().get(&DataKey::TotalLp).unwrap_or(0);
        Ok((reserve_a, reserve_b, total_lp))
    }

    /// Query provider LP share balance
    pub fn get_lp_balance(env: Env, provider: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::LpBalance(provider))
            .unwrap_or(0)
    }

    /// Admin toggle emergency pause
    pub fn set_paused(env: Env, admin: Address, paused: bool) -> Result<(), Error> {
        admin.require_auth();
        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        if stored_admin != admin {
            return Err(Error::Unauthorized);
        }
        env.storage().instance().set(&DataKey::IsPaused, &paused);
        Ok(())
    }

    // ── Internal Helpers ──

    fn check_not_paused(env: &Env) -> Result<(), Error> {
        let is_paused: bool = env.storage().instance().get(&DataKey::IsPaused).unwrap_or(false);
        if is_paused {
            return Err(Error::ContractPaused);
        }
        Ok(())
    }

    fn integer_sqrt(y: i128) -> i128 {
        if y < 0 {
            return 0;
        }
        if y == 0 {
            return 0;
        }
        let mut z = y;
        let mut x = y / 2 + 1;
        while x < z {
            z = x;
            x = (y / x + x) / 2;
        }
        z
    }
}

#[cfg(test)]
mod test;
