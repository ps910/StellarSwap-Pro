# ============================================================
# StellarSwap+ — Soroban Smart Contract Makefile
# ============================================================
# Usage:
#   make build        — Build both contracts as WASM
#   make test         — Run all contract unit tests
#   make fmt          — Auto-format all Rust code
#   make fmt-check    — Check formatting without modifying
#   make clean        — Remove build artifacts
#   make all          — Format, build, and test everything
# ============================================================

.PHONY: all build test fmt fmt-check clean build-escrow build-swap test-escrow test-swap

ESCROW_DIR  := contracts/escrow_contract
SWAP_DIR    := contracts/swap_contract
WASM_TARGET := wasm32-unknown-unknown

# ── Default target ──────────────────────────────────────────
all: fmt build test

# ── Build ───────────────────────────────────────────────────
build: build-escrow build-swap
	@echo "✅ All contracts built successfully"

build-escrow:
	@echo "🔨 Building Escrow Contract..."
	cd $(ESCROW_DIR) && cargo build --release --target $(WASM_TARGET)

build-swap:
	@echo "🔨 Building Swap Contract..."
	cd $(SWAP_DIR) && cargo build --release --target $(WASM_TARGET)

# ── Test ────────────────────────────────────────────────────
test: test-escrow test-swap
	@echo "✅ All 13 tests passed"

test-escrow:
	@echo "🧪 Testing Escrow Contract (7 tests)..."
	cd $(ESCROW_DIR) && cargo test --verbose

test-swap:
	@echo "🧪 Testing Swap Contract (6 tests)..."
	cd $(SWAP_DIR) && cargo test --verbose

# ── Format ──────────────────────────────────────────────────
fmt:
	@echo "📝 Formatting all Rust code..."
	cd $(ESCROW_DIR) && cargo fmt --all
	cd $(SWAP_DIR) && cargo fmt --all

fmt-check:
	@echo "🔍 Checking Rust formatting..."
	cd $(ESCROW_DIR) && cargo fmt --all -- --check
	cd $(SWAP_DIR) && cargo fmt --all -- --check

# ── Clean ───────────────────────────────────────────────────
clean:
	@echo "🗑️  Cleaning build artifacts..."
	cd $(ESCROW_DIR) && cargo clean
	cd $(SWAP_DIR) && cargo clean
	@echo "✅ Clean complete"
