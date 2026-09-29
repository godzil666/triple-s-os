# PT. SSS / Triple S OS — current project state

Project: PT. Sahabat Sinyal Sejahtera / Triple S OS. Last updated: 29 September 2026. Updated by: Codex. Authoritative repository: `C:\Users\zil\Documents\Triple_S_OS`. Branch: `client-preview`. Latest documented QA deployment: `6fc6d8a5dca9f4ebed4fe8a773ad822daef64d7d` (Ready); runtime fix revision `51781fe3122c77b10606613dfce147ff5bbd5b84` is included. Current phase: controlled Client Preview presentation candidate. Overall status: **READY FOR CONTROLLED CLIENT PREVIEW**. This is not production readiness.

## Architecture

- Frontend: React + TypeScript + Vite; public customer/captive flow, protected owner/staff/partner dashboards.
- API: existing Node HTTP application and domain services; local runtime on loopback, deployed Vercel Function adapter on the preview branch.
- Development persistence: versioned synthetic JSON under ignored `.local/server`, with process-local sessions while running locally.
- Client Preview persistence: private Supabase PostgreSQL document row with transaction locking; migration applied, application TLS connection and one synthetic checkout write verified remotely. Cross-context authenticated mutations/reset remain pending. It is not the historical Fastify/PostgreSQL branch.

## Deployment

- GitHub: private `godzil666/triple-s-os`; runtime fixes pushed to `client-preview` only. No push to `main` in this batch.
- Vercel: `pt-sss-client-preview`, Preview environment, Git-triggered deployments. Stable branch alias: `https://pt-sss-client-preview-git-client-preview-conqueror-studio.vercel.app`. Deployment protection remains enabled. See readiness document for exact tested revisions and outcomes.
- Supabase: `SSS_OS` project exists and is healthy; private Client Preview schema migrated, seed row and SQL write verified, anonymous/authenticated table reads denied.

## Implemented capabilities

Manual partner/hotspot choice, package catalog, guest checkout, simulated payment and voucher allocation, captive voucher login with first-login expiry and device/slot rules, server-side staff RBAC and assignments, owner/admin/partner dashboards, operational demo data, reset, QR code, and Signal Run on the home/captive footer. The current UI changes after MVP V2 baseline are retained.

Real application behavior includes authenticated local staff sessions, scoped API authorization, V2 state validation, idempotent domain transitions, masked partner projections, and local QA. Mayar/payment provider, MikroTik/RADIUS, real captive networking, WhatsApp, telemetry/usage, real SSID/device context and production voucher inventory remain simulated or unavailable. No production integration or real customer data is configured.

Local QA on 28 September 2026: domain 30/30 PASS; server 27/27 PASS, including Supabase CA, exact origin allowlist and socketless checkout/staff/voucher request regressions; typecheck/build PASS; full `npx playwright test --reporter=list` PASS, 82/82 in 24.2 minutes; artifact verifier and `git diff --check` on QA docs PASS. Playwright covered customer, partner, owner/admin, responsive, keyboard and persistence scenarios locally. Founder subsequently supplied a passing remote security harness result; physical-device QA remains pending.

Remote QA history: Owner/customer demo scenarios include idempotent payment callback, delayed provisioning, WhatsApp failure with voucher retained, voucher QR, first-login duration, wrong-site rejection, regular-device lock, monthly slot limit, expiry, and reset. Admin scope, assigned Cisaat search, Owner↔Chrome shared mutation/reset, customer stale-order invalidation, concurrent alert acknowledgement, health endpoint HTTP 200 and no 5xx in sampled Vercel logs were also verified. On 28 September, the authenticated Partner UI showed Mitra Cisaat-only data, masked/read-only stock and orders, own-order detail, foreign Cibadak fixture denial, and Owner/Admin route denials. Earlier browser attempts were incomplete: they lacked direct foreign-tenant/POST and Admin API results, live cookie attributes, logout revocation, or separate role contexts. These limitations are preserved in readiness history and were later closed by the Founder-run automated remote security gate below. Physical-device evidence completed on 29 September is summarized at the end and detailed in `docs/conqueror/CLIENT_PREVIEW_DEVICE_CHECKLIST.md`.

Actual runtime defects fixed: `SELF_SIGNED_CERT_IN_CHAIN` by bundling the public Supabase Root 2021 CA with `rejectUnauthorized: true`; URL SSL options cannot override the supplied verified TLS configuration. Missing Node request socket caused checkout 500 and would affect staff/voucher login; a conservative shared limiter key handles socketless requests. Branch-alias POST returned 403; exact Vercel deployment/branch HTTPS origins are now allowed with no wildcard. Ready deployment of `51781fe` accepted the alias origin and correctly rejected deliberately nonexistent credentials with 401; session/state returned 200. Safe diagnostics exclude request bodies and secret values. No local process is required by the deployed frontend: API calls remain same-origin `/api`.

D1–D7 all remain **OPEN**: D1 commercial terms, D2 real voucher inventory, D3 Mayar, D4 router/RADIUS/captive, D5 production identity, D6 WhatsApp, D7 hosting/operations. Current architecture debt: one locked JSONB aggregate is intentionally low-throughput and not a normalized production model; real backup/restore, monitoring, provider webhooks and production identities are absent.

The reusable automated direct-HTTPS security harness is available as `npm run qa:client-preview-security`; local syntax, typecheck and server regression passed before Founder execution. The first attempt was blocked by Vercel Preview SSO before app health because the automation bypass header was not yet configured in the local runner. That historical attempt is superseded by the completed run below. No source secret is part of the harness or documentation.

Former blocker (closed): direct response-header/API-boundary verification, separate role context, and deployed logout/session-revocation evidence were incomplete in earlier browser attempts. The later Founder-run gate reported all 24 checks passing. Do not start M1.2/M1.3 reconciliation, live payment/router/WhatsApp integrations, production domain, or D1–D7 closure as part of this readiness update.

## Historical remote security gate retry before automated request-level verification — 28 September 2026

At that time, Edge Profile 1 Partner remained scoped to Mitra Cisaat, but Chrome's supposed Admin tab instead identified the user as Mitra. No direct API tests, Partner logout, cookie-header inspection, or runtime gate were run in that retry. No code or deployment changed; no secrets/session material was accessed. Its **NOT READY** conclusion was superseded by the Founder-run automated gate below. Device checks remain NOT TESTED; D1–D7 remain OPEN.

## Historical security gate retry — 28 September 2026

At that time, Chrome Admin survived refresh and showed the Cisaat dashboard, while Edge Partner redirected to `/login?next=%2Fmitra-dashboard`. API authorization, cookie flags, logout/revocation, and runtime checks were not run in that attempt. No credentials or session data were accessed and no application state changed. Its **NOT READY** conclusion was superseded by the Founder-run automated gate below; physical-device QA remains pending and D1–D7 remain OPEN.

## Historical security gate retry 3 — 28 September 2026

At that time, Chrome Admin survived refresh, but Edge's debugger was unattached and Partner could not be verified. API, cookie, logout/revocation, and runtime gates were not run in that attempt. No credentials/session material or app data was accessed or changed. Its **NOT READY** conclusion was superseded by the Founder-run automated gate below. Physical devices remain untested; D1–D7 remain OPEN.

## Historical remote security gate retry — 28 September 2026

At that time, Chrome remained Admin and the Codex browser remained Mitra Cisaat after refresh. Direct API inspection was blocked by the QA browser; Vercel runtime aggregates were not request-correlated, and Partner logout was not run in that attempt. No code, deployment, credentials, session values, or app data changed. Its **NOT READY** conclusion was superseded by the later Founder-run request-level harness below; physical QA remains pending and D1–D7 remain OPEN.

## Founder-run remote Client Preview security gate — 28 September 2026

Founder supplied terminal evidence from `npm run qa:client-preview-security` against the protected Vercel Preview branch alias. Result: **24 passed, 0 failed, 0 not run**. The evidence contains no secret values, passwords, cookies, CSRF tokens, or authorization headers.

- HTTPS health returned HTTP 200 from Triple S OS, not Vercel SSO.
- Admin login/scope passed for assigned Cisaat resources. Unassigned Cibadak search returned no fixture; foreign transaction, Owner-only API, and privilege-escalation requests were denied with HTTP 403.
- Partner login and own Cisaat tenant passed. Foreign Cibadak, Owner-only API, Admin-only API, and prohibited mutation requests were denied with HTTP 403; the rejected mutation did not change the order count.
- Separate Admin and Partner cookie jars remained independent during simultaneous requests.
- Deployed cookie attributes passed: Secure, HttpOnly, SameSite=Strict, Path=/, and HTTPS.
- Foreign credentialed Origin was not allowed; preflight returned HTTP 403. Denial responses passed sanitization checks.
- Partner logout returned HTTP 200, the old Partner session was rejected with HTTP 401, and the Admin session remained active and Cisaat-scoped.

**Automated REMOTE WEB SECURITY GATE: PASS.** At the time of that web-security-only update, the classification was READY FOR CONTROLLED CLIENT PREVIEW with physical-device QA still pending. Founder has since completed and reported the physical checks in the section below, so the current classification is READY FOR CONTROLLED CLIENT PREVIEW. Historical incomplete runs above remain as evidence of earlier limitations, but their not-ready conclusions due solely to missing API boundary, cookie-header, logout/revocation, or role-cookie isolation evidence are superseded by the completed run.

Physical QA status, based on Founder-provided results: Android/Chrome **PASS** for landing, customer flow, responsive layout, voucher/QR display, and touch; iPhone/Safari **PASS** for landing, customer flow, responsive layout, voucher/QR display, touch, forms/keyboard, no horizontal overflow, and no unexpected error; Windows laptop/Chrome **PASS** and Windows laptop/Edge **PASS** for landing, customer flow, responsive/desktop layout, voucher/QR display, navigation, refresh/persistence, and no unexpected error; physical QR camera **PASS** for detecting and decoding a synthetic voucher without exposing a payment/account URL. The camera device and exact hardware/browser versions were not specified. This evidence applies only to the reported device/browser combinations and checks; it does not establish broader hardware/network compatibility. Full results: `docs/conqueror/CLIENT_PREVIEW_DEVICE_CHECKLIST.md`.

**Physical-device gate: PASS for the tested Client Preview scope. Current classification: READY FOR CONTROLLED CLIENT PREVIEW.** D1–D7 remain **OPEN**. Mayar/payment provider, MikroTik/RADIUS, real captive networking, WhatsApp, telemetry/usage, real SSID/device context, and production voucher inventory remain simulated or unavailable. This is not production readiness, pilot readiness for real customers, real-payment readiness, real MikroTik/RADIUS readiness, real WhatsApp readiness, or real captive-network readiness. This documentation update changed no application code and made no deployment/configuration changes.

**Presentation freeze:** Treat the current tested Vercel Preview deployment as the presentation candidate for PT. SSS. Do not add features or perform speculative refactors before the presentation; reopen implementation only for a presentation-blocking defect.
