#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum EscrowState {
    Created = 0,
    Funded = 1,
    Released = 2,
    Refunded = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct EscrowRecord {
    pub id: u64,
    pub payer: Address,
    pub payee: Address,
    pub token: Address,
    pub amount: i128,
    pub state: EscrowState,
    pub timeout_ledger: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    NextId,
    Escrow(u64),
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Create a new escrow terms agreement
    pub fn create(
        env: Env,
        payer: Address,
        payee: Address,
        token: Address,
        amount: i128,
        timeout_ledger: u32,
    ) -> u64 {
        payer.require_auth();

        if amount <= 0 {
            panic!("Amount must be positive");
        }

        let next_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextId)
            .unwrap_or(1);

        let record = EscrowRecord {
            id: next_id,
            payer: payer.clone(),
            payee: payee.clone(),
            token: token.clone(),
            amount,
            state: EscrowState::Created,
            timeout_ledger,
        };

        env.storage().instance().set(&DataKey::Escrow(next_id), &record);
        env.storage().instance().set(&DataKey::NextId, &(next_id + 1));

        // Emit Create Event
        env.events().publish(
            (symbol_short!("create"), payer, payee),
            (next_id, amount, timeout_ledger),
        );

        next_id
    }

    /// Fund an existing escrow
    pub fn fund(env: Env, escrow_id: u64) {
        let mut record: EscrowRecord = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("Escrow not found"));

        if record.state != EscrowState::Created {
            panic!("Escrow is not in Created state");
        }

        record.payer.require_auth();

        record.state = EscrowState::Funded;
        env.storage().instance().set(&DataKey::Escrow(escrow_id), &record);

        // Emit Fund Event
        env.events().publish(
            (symbol_short!("fund"), record.payer.clone(), record.token.clone()),
            (escrow_id, record.amount),
        );
    }

    /// Release funded escrow to payee
    pub fn release(env: Env, escrow_id: u64) {
        let mut record: EscrowRecord = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("Escrow not found"));

        if record.state != EscrowState::Funded {
            panic!("Escrow is not in Funded state");
        }

        // Payee authorizes release of funds to payee
        record.payee.require_auth();

        record.state = EscrowState::Released;
        env.storage().instance().set(&DataKey::Escrow(escrow_id), &record);

        // Emit Release Event
        env.events().publish(
            (symbol_short!("release"), record.payee.clone()),
            (escrow_id, record.amount),
        );
    }

    /// Refund funded escrow back to payer after timeout_ledger
    pub fn refund(env: Env, escrow_id: u64) {
        let mut record: EscrowRecord = env
            .storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("Escrow not found"));

        if record.state != EscrowState::Funded {
            panic!("Escrow is not in Funded state");
        }

        // Must be after timeout_ledger
        let current_ledger = env.ledger().sequence();
        if current_ledger < record.timeout_ledger {
            panic!("Escrow timeout has not elapsed yet");
        }

        record.payer.require_auth();

        record.state = EscrowState::Refunded;
        env.storage().instance().set(&DataKey::Escrow(escrow_id), &record);

        // Emit Refund Event
        env.events().publish(
            (symbol_short!("refund"), record.payer.clone()),
            (escrow_id, record.amount),
        );
    }

    /// Query escrow record
    pub fn get_escrow(env: Env, escrow_id: u64) -> EscrowRecord {
        env.storage()
            .instance()
            .get(&DataKey::Escrow(escrow_id))
            .unwrap_or_else(|| panic!("Escrow not found"))
    }
}

#[cfg(test)]
mod test;
