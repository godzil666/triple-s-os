# Acceptance Checklist — MVP lokal (25 September 2026)

Status definitions: **PASS** means fresh local evidence exists; **PARTIAL** means only a subset was checked; **NOT RUN** means required tooling or an environment was unavailable.

## Otomatis

| Area | Status | Bukti |
|---|---|---|
| Runtime/dependencies | PASS | `node --version` = v24.20.0; `npm ls --depth=0` exit 0 |
| Typecheck | PASS | `npm run typecheck`, exit 0 |
| Domain | PASS | `npm run test:domain`, 21/21 |
| API/auth/security | PASS | `npm run test:server`, 19/19 |
| Production build | PASS | `npm run build`, exit 0 |
| Browser full suite | PARTIAL, no product-flow failure observed | `npm run test:browser`: 53/55 passed. Two failed assertions were stale UI expectations in `tests/glass.spec.ts`; after updating accessible CTA name and opaque fallback color, `npx playwright test tests/glass.spec.ts --reporter=list` passed 5/5. Stage 2 + stage 4 were rerun separately: 10/10 passed. A single clean full-suite run after correcting the assertions was not performed. |
| Patch whitespace | PASS | `git diff --check`, exit 0 |
| PostgreSQL/migrations | NOT RUN | Repo has no database service, migration/schema files, or corresponding test script. |

## Alur dan batas akses

| Skenario | Status | Bukti |
|---|---|---|
| Customer guest checkout, duplicate recovery, purchase snapshot | PASS | Browser stage 3/5; domain and server suite |
| Payment success cannot be forged from public customer URL | PASS | Server test `a public customer order link cannot forge payment, provisioning, or notification outcomes` |
| Pending/fail/timeout, delayed provisioning, WhatsApp failure retains voucher | PASS | Browser stage 3 and server suite |
| Single-code and username/password voucher login | PASS | Server suite and browser auth-hotspot |
| Wrong site, device binding, monthly concurrency, expiry/reconnect | PASS | Browser stage 3/auth-hotspot; domain and server suites |
| Purchase during wait, then activate later | PASS | Browser stage 3 golden path |
| Partner scope, masked contact/secrets, read-only, stale monitoring `unknown` | PASS | Browser stage 4; server tests |
| Admin changes package/rate → customer purchase → partner/owner snapshot | PASS | Browser stage 5 cross-role test |
| Reset and deterministic synthetic fixture | PASS | Browser stage 2; domain/server tests |
| Unauthenticated/role/customer access boundaries | PASS | Browser auth-hotspot and server suite |

## Tampilan dan aksesibilitas

| Pemeriksaan | Status | Bukti |
|---|---|---|
| Responsive 360/768/1440 px | PASS | Browser route scans plus customer, owner, partner, and demo panel cases |
| 390/1024 px | PASS | `tests/stage6.spec.ts`, 2/2; customer, partner, owner |
| Page overflow | PASS for tested routes | Automated `scrollWidth` checks across route scans and role pages |
| Keyboard/focus and labels | PASS for tested flows | Login, dialogs, navigation, checkout and dashboard browser tests; not a full assistive-technology audit |
| Error, empty, loading states | PARTIAL | Covered where represented in tested purchase/auth/stock/monitoring flows |
| Formal contrast / screen reader | NOT RUN | No formal WCAG audit or screen-reader test performed |
| Safari, Firefox, real phones/routers | NOT RUN | Evidence is local Chromium only |

The current browser JSON report is `docs/verification/conqueror/mvp-final-rerun/browser-results.json`. Targeted post-fix glass run output is recorded by Playwright under `test-results/`; it is not a product bug report.

## Production gate

**Not production ready.** The application is local JSON-backed demo software. No PostgreSQL compatibility or migration checks ran, and no live payment, WhatsApp, voucher provider, captive portal, MikroTik/RADIUS, production identity, or hosting behavior was tested. D1–D7 remain open in `docs/conqueror/MVP_READINESS.md` and `docs/PRODUCTION_READINESS.md`.
