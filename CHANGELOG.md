# Changelog

All notable changes to **StellarSwap+** are documented here. This project follows [Semantic Versioning](https://semver.org/).

---

## [4.0.0] — 2026-08-06 (Level 4 — Green Belt)

### Added
- **React.lazy() code splitting** with Suspense loading skeletons for SwapInterface, EscrowInterface, ActivityTable, LandingHero, and LandingFeatures
- **Web Vitals monitoring** (LCP, FID, CLS, TTFB) via PerformanceObserver API
- **Network status detection** with online/offline event tracking
- **Sentry SDK integration** via CDN with wallet address scrubbing in `beforeSend`
- **Session-level analytics tracking** with unique session IDs and `identifyUser()` for wallet-linked sessions
- **Feedback persistence to localStorage** for submission proof across sessions
- **Vercel deployment configuration** with SPA rewrites, CSP headers, cache-control for assets
- **Environment variable support** via `.env.example` and `import.meta.env` fallbacks in Stellar config
- **Exponential backoff RPC retry service** with jitter and timeout handling
- **RPC health check utility** for Soroban endpoint monitoring
- **5 new escrow contract edge-case tests**: zero amount, duplicate fund, release before fund, refund before timeout, sequential IDs
- **5 new swap contract edge-case tests**: zero amount swap, slippage exceeded, zero deposit, double initialization, rate consistency
- **LICENSE** file (MIT)
- **CONTRIBUTING.md** with code style and PR guidelines
- **CHANGELOG.md** (this file)
- Open Graph / Twitter Card meta tags for link previews

### Changed
- `vite.config.ts` now includes manual chunk splitting for `react`, `stellar-sdk`, and `lucide-react`
- `stellar.ts` config reads from Vite environment variables with testnet defaults
- `analytics.ts` refactored with session tracking, error-as-event forwarding, and periodic localStorage persistence
- `contract.ts` wrapped `fetchPoolReserves` with RPC retry logic
- `index.html` updated with Level 4 SEO metadata, Sentry SDK, and proper title/description

---

## [3.0.0] — 2026-07 (Level 3 — Orange Belt)

### Added
- Soroban Escrow Vault smart contract (`create`, `fund`, `release`, `refund`)
- Escrow Vault UI component with form and list manager
- React ErrorBoundary with Sentry-aware error reporting
- PostHog / Plausible analytics telemetry service
- Interactive 1–5 star user feedback modal
- 10+ user wallet interaction log (`docs/user-testing.md`)
- Real-time Soroban RPC event stream subscriber
- PortfolioBanner connected wallet dashboard
- ActivityTable on-chain event log

---

## [2.0.0] — 2026-06 (Level 2 — Yellow Belt)

### Added
- Constant-product AMM Swap Pool smart contract
- Path payment DEX token swap interface
- Multi-wallet connection modal (Freighter, Albedo, Lobstr, xBull, Rabet)
- 4-step transaction tracker (prepare → sign → submit → confirm)
- Error modal with contextual recovery hints
- Mobile responsive layout (down to 375px)
- Landing hero and features page for unauthenticated users

---

## [1.0.0] — 2026-05 (Level 1 — White Belt)

### Added
- Initial project scaffolding with Vite + React + TypeScript
- Basic token configuration and RPC helper services
- Basic navbar and layout structure
