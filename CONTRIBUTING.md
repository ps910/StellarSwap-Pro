# Contributing to StellEx Pro

Thank you for your interest in contributing to StellEx Pro! This guide covers how to set up the project and submit contributions.

---

## Getting Started

### Prerequisites

- **Node.js** v18.0.0+
- **Rust** toolchain with `wasm32-unknown-unknown` target (for Soroban contracts)
- **Git** 2.25+

### Local Setup

```bash
# Clone the repository
git clone https://github.com/ps910/StellarSwap-Pro.git
cd StellarSwap-Pro

# Install frontend dependencies
npm install

# Run development server
npm run dev
```

### Running Smart Contract Tests

```bash
cd contracts/escrow_contract
cargo test

cd ../swap_contract
cargo test
```

---

## Code Style

### TypeScript / React
- Use functional components with hooks
- Prefer named exports for components
- Use `type` imports when importing only types
- Keep component files focused and under 300 lines

### Rust / Soroban
- Follow standard `rustfmt` formatting
- All public contract functions must include doc comments
- Every new contract function requires at least one happy-path and one edge-case test

---

## Submitting Changes

1. **Fork** the repository
2. Create a **feature branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes with **meaningful commit messages**:
   ```
   feat(component): add token selector dropdown
   fix(contract): handle zero-amount edge case
   docs: update deployment instructions
   ```
4. Ensure the **build passes**:
   ```bash
   npm run build
   ```
5. Open a **Pull Request** against `main`

---

## Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) standard:

| Prefix | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `perf` | Performance improvement |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `ci` | CI/CD pipeline changes |

---

## Reporting Issues

Open an issue on GitHub with:
- Clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Browser/wallet/OS information

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
