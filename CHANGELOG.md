# Changelog

All notable changes to **StellarSwap+** are documented here. This project follows [Semantic Versioning](https://semver.org/).

---

## [5.0.0] — 2026-08-13 (Level 5 — Blue Belt)

### Added
- **Analytics Dashboard** (`AnalyticsDashboard.tsx`): Real-time platform metrics with animated counters, 7-day activity bar chart, rating display, volume/uptime cards, and JSON analytics proof export
- **Onboarding Hub** (`OnboardingHub.tsx`): Google Form embed for user data collection (wallet, email, name, feedback), step-by-step onboarding guide, user milestone tracker (10→25→50→100), and referral share CTA
- **NPS Survey** in FeedbackModal: Net Promoter Score (0-10) slider alongside star rating
- **Feature Request Voting**: Multi-select chip picker for feature preferences (More token pairs, Batch escrow, Price alerts, etc.)
- **Share/Referral CTA**: Post-feedback sharing button using Web Share API with clipboard fallback
- **Trust Badges** on LandingHero: 50+ users, 170+ transactions, 99.8% uptime indicators
- **Analytics Tab** in Navbar: 3rd navigation tab for connected users (Swap / Escrow / Analytics)
- **L5 Blue Belt Badge** in Navbar and Footer
- **User Count Indicator** in price ticker tape
- **Platform Stats Service**: `getPlatformStats()`, `trackUserOnboarded()`, `exportAnalyticsProof()` in analytics.ts
- **Professional Pitch Deck** (`docs/pitch-deck.html`): 9-slide HTML presentation with keyboard navigation, scroll-snap, print-to-PDF
- **User Growth Documentation** (`docs/user-growth.md`): Google Form template, onboarding strategy, growth metrics
- **Pitch Deck Guide** (`docs/pitch-deck.md`): Slide-by-slide outline and usage instructions

### Changed
- **LandingFeatures** expanded from 3 → 6 features with colored icon badges and hover animations (Analytics, Security, Multi-Wallet)
- **Navbar** now uses `AppTab` union type supporting `'analytics'` tab, with mobile 3-tab selector
- **Footer** updated from Level 4 to Level 5 with Feedback Form, Pitch Deck, and Demo Video links
- **FeedbackModal** enhanced with NPS score, feature request chips, and sharing CTA
- **App.tsx** refactored with `AppTab` type, lazy-loaded AnalyticsDashboard and OnboardingHub, and user growth tracking on wallet connect
- **types.ts** extended with `AppTab`, `PlatformStats`, `DailyActivity`, `OnboardingStep`, `UserGrowthEntry`
- **analytics.ts** extended with platform stats aggregation, unique user tracking, daily activity generation, and analytics proof export
- **user-testing.md** expanded from 11 → 52+ user interactions with NPS metrics and feature request voting results

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
