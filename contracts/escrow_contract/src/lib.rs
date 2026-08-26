#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, String,
    Vec,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    InvalidTimeout = 4,
    EscrowNotFound = 5,
    InvalidState = 6,
    Unauthorized = 7,
    TimeoutNotExpired = 8,
    TimeoutAlreadyExpired = 9,
    DisputeAlreadyRaised = 10,
    NotDisputed = 11,
    InvalidSplitBps = 12,
    DuplicateApproval = 13,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowState {
    Created = 0,
    Funded = 1,
    Released = 2,
    Refunded = 3,
    Disputed = 4,
    Resolved = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowRecord {
    pub id: u64,
    pub payer: Address,
    pub payee: Address,
    pub arbiter: Option<Address>,
    pub token: Address,
    pub amount: i128,
    pub fee_amount: i128,
    pub state: EscrowState,
    pub timeout_ledger: u32,
    pub created_ledger: u32,
    pub payer_approved: bool,
    pub payee_approved: bool,
    pub arbiter_approved: bool,
    pub description: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct PlatformStats {
    pub total_escrows: u64,
    pub total_volume: i128,
    pub fee_bps: u32,
    pub fee_recipient: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    FeeRecipient,
    FeeBps,
    NextId,
    TotalVolume,
    Escrow(u64),
    UserEscrows(Address),
}

const DEFAULT_EXTEND_TTL_THRESHOLD: u32 = 17_280; // ~1 day in ledgers (5s/ledger)
const DEFAULT_EXTEND_TTL_AMOUNT: u32 = 518_400; // ~30 days in ledgers

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize global configuration (Admin, Fee Recipient, Protocol Fee in Basis Points)
    pub fn initialize(
        env: Env,
        admin: Address,
        fee_recipient: Address,
        fee_bps: u32,
    ) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        admin.require_auth();

        if fee_bps > 1000 {
            // Max 10% protocol fee
            return Err(Error::InvalidSplitBps);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage()
            .instance()
            .set(&DataKey::FeeRecipient, &fee_recipient);
        env.storage().instance().set(&DataKey::FeeBps, &fee_bps);
        env.storage().instance().set(&DataKey::NextId, &1u64);
        env.storage().instance().set(&DataKey::TotalVolume, &0i128);

        env.events()
            .publish((symbol_short!("init"), admin), (fee_recipient, fee_bps));

        Ok(())
    }

    /// Create and initialize a new Multi-Signature Escrow agreement
    pub fn create(
        env: Env,
        payer: Address,
        payee: Address,
        arbiter: Option<Address>,
        token: Address,
        amount: i128,
        timeout_ledger: u32,
        description: String,
    ) -> Result<u64, Error> {
        payer.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        let current_ledger = env.ledger().sequence();
        if timeout_ledger <= current_ledger {
            return Err(Error::InvalidTimeout);
        }

        let next_id: u64 = env.storage().instance().get(&DataKey::NextId).unwrap_or(1);

        let fee_bps: u32 = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0);

        let fee_amount = (amount * (fee_bps as i128)) / 10_000;

        let record = EscrowRecord {
            id: next_id,
            payer: payer.clone(),
            payee: payee.clone(),
            arbiter: arbiter.clone(),
            token: token.clone(),
            amount,
            fee_amount,
            state: EscrowState::Created,
            timeout_ledger,
            created_ledger: current_ledger,
            payer_approved: false,
            payee_approved: false,
            arbiter_approved: false,
            description,
        };

        // Persistent storage for scalability + long TTL
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(next_id), &record);
        env.storage().persistent().extend_ttl(
            &DataKey::Escrow(next_id),
            DEFAULT_EXTEND_TTL_THRESHOLD,
            DEFAULT_EXTEND_TTL_AMOUNT,
        );

        // Update user indexes in persistent storage
        Self::add_to_user_index(&env, &payer, next_id);
        Self::add_to_user_index(&env, &payee, next_id);
        if let Some(ref arb) = arbiter {
            Self::add_to_user_index(&env, arb, next_id);
        }

        env.storage()
            .instance()
            .set(&DataKey::NextId, &(next_id + 1));

        // Emit Create Event
        env.events().publish(
            (symbol_short!("create"), payer, payee),
            (next_id, amount, timeout_ledger),
        );

        Ok(next_id)
    }

    /// Fund an existing escrow with real SAC tokens transferred to the contract
    pub fn fund(env: Env, escrow_id: u64) -> Result<(), Error> {
        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)?;

        if record.state != EscrowState::Created {
            return Err(Error::InvalidState);
        }

        record.payer.require_auth();

        // Real SAC Token Transfer from Payer to Contract Address
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &record.token);
        token_client.transfer(&record.payer, &contract_address, &record.amount);

        record.state = EscrowState::Funded;

        // Update total platform volume
        let current_volume: i128 = env
            .storage()
            .instance()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalVolume, &(current_volume + record.amount));

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);
        env.storage().persistent().extend_ttl(
            &DataKey::Escrow(escrow_id),
            DEFAULT_EXTEND_TTL_THRESHOLD,
            DEFAULT_EXTEND_TTL_AMOUNT,
        );

        // Emit Fund Event
        env.events().publish(
            (
                symbol_short!("fund"),
                record.payer.clone(),
                record.token.clone(),
            ),
            (escrow_id, record.amount),
        );

        Ok(())
    }

    /// Multi-signature approval: Payer, Payee, or Arbiter marks approval
    pub fn approve(env: Env, caller: Address, escrow_id: u64) -> Result<bool, Error> {
        caller.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)?;

        if record.state != EscrowState::Funded && record.state != EscrowState::Disputed {
            return Err(Error::InvalidState);
        }

        let mut is_authorized = false;

        if caller == record.payer {
            if record.payer_approved {
                return Err(Error::DuplicateApproval);
            }
            record.payer_approved = true;
            is_authorized = true;
        } else if caller == record.payee {
            if record.payee_approved {
                return Err(Error::DuplicateApproval);
            }
            record.payee_approved = true;
            is_authorized = true;
        } else if let Some(ref arb) = record.arbiter {
            if caller == *arb {
                if record.arbiter_approved {
                    return Err(Error::DuplicateApproval);
                }
                record.arbiter_approved = true;
                is_authorized = true;
            }
        }

        if !is_authorized {
            return Err(Error::Unauthorized);
        }

        // Check if multi-sig threshold met (2 out of 3 approvals, or Payer explicit approval)
        let approvals = (if record.payer_approved { 1 } else { 0 })
            + (if record.payee_approved { 1 } else { 0 })
            + (if record.arbiter_approved { 1 } else { 0 });

        let should_release = record.payer_approved || approvals >= 2;

        if should_release && record.state == EscrowState::Funded {
            Self::execute_release(&env, &mut record)?;
            env.storage()
                .persistent()
                .set(&DataKey::Escrow(escrow_id), &record);
            return Ok(true);
        }

        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);

        env.events().publish(
            (symbol_short!("approve"), caller, escrow_id),
            (
                record.payer_approved,
                record.payee_approved,
                record.arbiter_approved,
            ),
        );

        Ok(false)
    }

    /// Direct Release: Payer or Arbiter authorizes full payout to Payee
    pub fn release(env: Env, caller: Address, escrow_id: u64) -> Result<(), Error> {
        caller.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)?;

        if record.state != EscrowState::Funded {
            return Err(Error::InvalidState);
        }

        let is_payer = caller == record.payer;
        let is_arbiter = record.arbiter.as_ref().map_or(false, |a| *a == caller);

        if !is_payer && !is_arbiter {
            return Err(Error::Unauthorized);
        }

        Self::execute_release(&env, &mut record)?;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);

        Ok(())
    }

    /// Time-locked refund: Payer or Arbiter recovers locked funds after timeout_ledger
    pub fn refund(env: Env, caller: Address, escrow_id: u64) -> Result<(), Error> {
        caller.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)?;

        if record.state != EscrowState::Funded {
            return Err(Error::InvalidState);
        }

        let current_ledger = env.ledger().sequence();
        if current_ledger < record.timeout_ledger {
            return Err(Error::TimeoutNotExpired);
        }

        let is_payer = caller == record.payer;
        let is_arbiter = record.arbiter.as_ref().map_or(false, |a| *a == caller);

        if !is_payer && !is_arbiter {
            return Err(Error::Unauthorized);
        }

        // Real SAC Token Transfer: Return full amount to Payer
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &record.token);
        token_client.transfer(&contract_address, &record.payer, &record.amount);

        record.state = EscrowState::Refunded;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);

        // Emit Refund Event
        env.events().publish(
            (symbol_short!("refund"), record.payer.clone()),
            (escrow_id, record.amount),
        );

        Ok(())
    }

    /// Raise a formal dispute locking the escrow until Arbiter resolution
    pub fn raise_dispute(env: Env, caller: Address, escrow_id: u64) -> Result<(), Error> {
        caller.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)?;

        if record.state != EscrowState::Funded {
            return Err(Error::InvalidState);
        }

        if record.arbiter.is_none() {
            return Err(Error::Unauthorized);
        }

        let is_party = caller == record.payer || caller == record.payee;
        if !is_party {
            return Err(Error::Unauthorized);
        }

        record.state = EscrowState::Disputed;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);

        env.events().publish(
            (symbol_short!("dispute"), caller),
            (escrow_id, record.amount),
        );

        Ok(())
    }

    /// Arbiter resolves dispute with customizable split in basis points (0..=10,000)
    pub fn resolve_dispute(
        env: Env,
        arbiter: Address,
        escrow_id: u64,
        payee_share_bps: u32,
    ) -> Result<(), Error> {
        arbiter.require_auth();

        let mut record: EscrowRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)?;

        if record.state != EscrowState::Disputed {
            return Err(Error::NotDisputed);
        }

        let assigned_arbiter = record.arbiter.as_ref().ok_or(Error::Unauthorized)?;
        if *assigned_arbiter != arbiter {
            return Err(Error::Unauthorized);
        }

        if payee_share_bps > 10_000 {
            return Err(Error::InvalidSplitBps);
        }

        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(&env, &record.token);

        let payee_amount = (record.amount * (payee_share_bps as i128)) / 10_000;
        let payer_amount = record.amount - payee_amount;

        // Distribute according to Arbiter adjudication
        if payee_amount > 0 {
            token_client.transfer(&contract_address, &record.payee, &payee_amount);
        }
        if payer_amount > 0 {
            token_client.transfer(&contract_address, &record.payer, &payer_amount);
        }

        record.state = EscrowState::Resolved;
        env.storage()
            .persistent()
            .set(&DataKey::Escrow(escrow_id), &record);

        env.events().publish(
            (symbol_short!("resolved"), arbiter, escrow_id),
            (payee_amount, payer_amount, payee_share_bps),
        );

        Ok(())
    }

    /// Query escrow record by ID
    pub fn get_escrow(env: Env, escrow_id: u64) -> Result<EscrowRecord, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Escrow(escrow_id))
            .ok_or(Error::EscrowNotFound)
    }

    /// Query total escrow count created
    pub fn get_escrow_count(env: Env) -> u64 {
        let next_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextId)
            .unwrap_or(1u64);
        next_id.saturating_sub(1u64)
    }

    /// Query all escrow IDs indexed for a specific user address
    pub fn get_user_escrows(env: Env, user: Address) -> Vec<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::UserEscrows(user))
            .unwrap_or_else(|| Vec::new(&env))
    }

    /// Query platform metadata and analytics
    pub fn get_platform_stats(env: Env) -> PlatformStats {
        let total_escrows = Self::get_escrow_count(env.clone());
        let total_volume = env
            .storage()
            .instance()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0);
        let fee_bps = env.storage().instance().get(&DataKey::FeeBps).unwrap_or(0);
        let fee_recipient = env
            .storage()
            .instance()
            .get(&DataKey::FeeRecipient)
            .unwrap_or_else(|| env.current_contract_address());

        PlatformStats {
            total_escrows,
            total_volume,
            fee_bps,
            fee_recipient,
        }
    }

    /// Admin update protocol fee parameters
    pub fn set_fee(
        env: Env,
        admin: Address,
        new_fee_bps: u32,
        new_fee_recipient: Address,
    ) -> Result<(), Error> {
        admin.require_auth();

        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;

        if stored_admin != admin {
            return Err(Error::Unauthorized);
        }

        if new_fee_bps > 1000 {
            return Err(Error::InvalidSplitBps);
        }

        env.storage().instance().set(&DataKey::FeeBps, &new_fee_bps);
        env.storage()
            .instance()
            .set(&DataKey::FeeRecipient, &new_fee_recipient);

        Ok(())
    }

    // ── Internal Helpers ──

    fn execute_release(env: &Env, record: &mut EscrowRecord) -> Result<(), Error> {
        let contract_address = env.current_contract_address();
        let token_client = token::Client::new(env, &record.token);

        let fee_recipient: Option<Address> = env.storage().instance().get(&DataKey::FeeRecipient);

        let payout_amount = if record.fee_amount > 0 {
            if let Some(recipient) = fee_recipient {
                token_client.transfer(&contract_address, &recipient, &record.fee_amount);
            }
            record.amount - record.fee_amount
        } else {
            record.amount
        };

        // Real SAC Token Transfer: Contract to Payee
        token_client.transfer(&contract_address, &record.payee, &payout_amount);

        record.state = EscrowState::Released;

        env.events().publish(
            (symbol_short!("release"), record.payee.clone()),
            (record.id, payout_amount, record.fee_amount),
        );

        Ok(())
    }

    fn add_to_user_index(env: &Env, user: &Address, escrow_id: u64) {
        let mut list: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserEscrows(user.clone()))
            .unwrap_or_else(|| Vec::new(env));

        list.push_back(escrow_id);
        env.storage()
            .persistent()
            .set(&DataKey::UserEscrows(user.clone()), &list);
        env.storage().persistent().extend_ttl(
            &DataKey::UserEscrows(user.clone()),
            DEFAULT_EXTEND_TTL_THRESHOLD,
            DEFAULT_EXTEND_TTL_AMOUNT,
        );
    }
}

#[cfg(test)]
mod test;
