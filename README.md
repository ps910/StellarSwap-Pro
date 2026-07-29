# 🚀 Stellar Level 2: Soroban Multi-Wallet DEX Terminal & Event Engine

A high-performance, production-grade Stellar Testnet application featuring **StellarWalletsKit** multi-wallet integration, a compiled and deployed **Rust Soroban Smart Contract** liquidity pool, comprehensive **3-stage error handling**, **real-time event synchronization**, and a step-by-step **transaction status tracker**.

---

## 📸 Screenshots & Wallet Options

### 1. Multi-Wallet Selection Modal (StellarWalletsKit)
![Wallet Options Available](./docs/screenshots/wallet_options.png)

### 2. Live DEX Terminal & Real-Time Soroban Event Sync
![Stellar DEX Terminal](./docs/screenshots/app_preview.png)

---

## 📜 Deployed Smart Contract & Verifiable Testnet Data

- **Network**: Stellar Testnet (`Test SDF Network ; September 2015`)
- **Soroban Smart Contract Address**:  
  [`CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S`](https://stellar.expert/explorer/testnet/contract/CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S)
- **Contract Deploy Transaction Hash**:  
  [`da8e93d45fc05ad4b7450b9873b7d72b12c4d5945afeda06f483e3657e4a45a0`](https://stellar.expert/explorer/testnet/tx/da8e93d45fc05ad4b7450b9873b7d72b12c4d5945afeda06f483e3657e4a45a0)
- **WASM Code Upload Transaction Hash**:  
  [`d212ab4eae302b60d1f46b81702865fe5d344e0e439963f5270133645896bea7`](https://stellar.expert/explorer/testnet/tx/d212ab4eae302b60d1f46b81702865fe5d344e0e439963f5270133645896bea7)
- **Verifiable Stellar Explorer Link**:  
  [View Contract on Stellar Expert Explorer](https://stellar.expert/explorer/testnet/contract/CD32CDHJPRITTOX53LSKONEOTPC2QR55MLWGQET3X46O2EQNFOZK423S)

---

## ✨ Features & Technical Implementation

### 1. Multi-Wallet Integration (`StellarWalletsKit`)
Supports seamless connection to 5 major Stellar/Soroban wallet providers:
- **Freighter** (Official Stellar Foundation browser extension)
- **Albedo** (Web-based lightweight popup wallet)
- **LOBSTR** (Popular mobile & web wallet)
- **xBull** (Feature-rich extension wallet for DeFi)
- **Rabet** (Sleek browser extension)

### 2. Soroban Smart Contract (`contracts/swap_contract`)
Written in Rust using `soroban-sdk 22.0.0` and compiled to target `wasm32-unknown-unknown`:
- **`initialize(admin, fee_bps)`**: Sets up protocol governance and initial reserves.
- **`swap(user, token_in, token_out, amount_in, min_amount_out)`**: Constant product formula (`dy = y * dx / (x + dx)`) with a 0.3% pool fee.
- **`deposit(from, token, amount)`**: Increases token reserve liquidity.
- **`get_reserve(token)` / `get_rate(token_in, token_out, amount_in)`**: State read methods.
- **Contract Events**: Emits `swap` and `deposit` Soroban events with user address, amounts, and timestamp topics.

### 3. Explicit Error Handling Architecture (3 Error Types Handled)
Categorized and handled with actionable diagnostic modals (`src/components/ErrorModal.tsx` & `src/services/wallet.ts`):
1. **`WALLET_NOT_FOUND`**: Detects missing browser extension wallet and provides a direct Chrome Web Store link or one-click fallback to Albedo Web Wallet.
2. **`USER_REJECTED`**: Catches user-initiated cancellation or closed signature popups, gracefully resetting transaction states without breaking UI.
3. **`INSUFFICIENT_BALANCE`**: Validates wallet token balances against trade amounts and Stellar transaction fees, providing a one-click Stellar Friendbot funding link.

### 4. Real-Time Soroban Event Synchronization & State Sync
- Subscribes to Soroban RPC event stream (`getEvents`).
- Live Activity Feed updates instantly on new `swap` or `deposit` operations.
- Automatically synchronizes contract reserve balances and price conversion rates in real time.

### 5. Step-by-Step Transaction Status Tracker
Visual 4-stage pipeline modal (`src/components/TransactionTracker.tsx`):
1. **Preparing XDR**: Builds Soroban smart contract invocation.
2. **Signing with Wallet**: Awaits signature from connected wallet provider.
3. **Submitting to Testnet**: Transmits signed XDR to Stellar Testnet consensus nodes.
4. **Ledger Finalized**: Confirmed status with direct link to Stellar Expert Explorer.

---

## 🛠️ Project Structure

```
├── contracts/
│   └── swap_contract/
│       ├── Cargo.toml          # Soroban SDK dependencies & WASM profile
│       └── src/
│           ├── lib.rs          # Soroban Rust smart contract implementation
│           └── test.rs         # Soroban smart contract unit tests
├── docs/
│   └── screenshots/            # Verification screenshots
│       ├── wallet_options.png  # Screenshot: Wallet options modal
│       └── app_preview.png     # Screenshot: App interface preview
├── src/
│   ├── components/             # Modular React UI components
│   │   ├── Navbar.tsx
│   │   ├── WalletModal.tsx     # Multi-wallet selection modal
│   │   ├── SwapInterface.tsx   # DEX Swap & Deposit card
│   │   ├── TransactionTracker.tsx # 4-step status tracker
│   │   ├── EventFeed.tsx       # Real-time event log
│   │   ├── ErrorModal.tsx      # Diagnostic error handling modal
│   │   └── StatsBanner.tsx
│   ├── config/
│   │   └── stellar.ts          # Testnet RPC & Contract config
│   ├── services/
│   │   ├── wallet.ts           # StellarWalletsKit & Error parsing
│   │   ├── contract.ts         # Soroban RPC invocations
│   │   └── events.ts           # Real-time event subscriber
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # Modern glassmorphic styles
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Local Setup & Running Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **Rust / Cargo**: Required only if modifying smart contract (`wasm32-unknown-unknown` target)

### 1. Installation
```bash
# Clone repository
git clone https://github.com/yourusername/stellar-level2-multiwallet.git
cd stellar-level2-multiwallet

# Install frontend dependencies
npm install
```

### 2. Compile & Deploy Smart Contract (Optional)
```bash
cd contracts/swap_contract

# Build Soroban WASM target
cargo build --target wasm32-unknown-unknown --release

# Deploy to Stellar Testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_swap_contract.wasm \
  --source deployer \
  --network testnet
```

### 3. Run Frontend Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🛠️ Verification Commands

```bash
# Production Bundle Validation
npm run build

# Cargo Contract Check
cd contracts/swap_contract
cargo check
```

---

## 📜 Git Commit History

```text
* docs: add comprehensive Level 2 submission README with testnet contract address and tx hash
* feat: implement DEX Token Swap UI, real-time Soroban event subscriber & transaction tracker
* feat: implement StellarWalletsKit multi-wallet connector & 3-stage error handling engine
* feat: deploy Soroban smart contract to Stellar Testnet and generate RPC bindings
* feat: initialize Rust Soroban swap smart contract and compile WASM target
```
