# PT. SSS / Triple S OS — current project state

Project: PT. Sahabat Sinyal Sejahtera / Triple S OS. Last updated: 28 September 2026. Updated by: Codex. Authoritative repository: `C:\Users\zil\Documents\Triple_S_OS`. Branch: `client-preview`. Runtime fix revision: `51781fe3122c77b10606613dfce147ff5bbd5b84`; later documentation revisions do not change application behavior. Current phase: remote Client Preview QA. Overall status: **NOT READY for external sharing; authenticated QA pending**.

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

Real application behavior includes authenticated local staff sessions, scoped API authorization, V2 state validation, idempotent domain transitions, masked partner projections, and local QA. Payment/Mayar, WiFi/MikroTik/RADIUS, telemetry/usage, WhatsApp, device/SSID context and customer network access remain simulated. No production integration or real customer data is configured.

Local QA in this runtime repair batch: domain 30/30 PASS; server 27/27 PASS, including Supabase CA, exact origin allowlist and socketless checkout/staff/voucher request regressions; typecheck/build, artifact verifier and `git diff --check` PASS. Historical preparation browser suite: 82/82 PASS after an initial 6 failures were fixed; that full localhost browser suite was not rerun in this batch.

Remote QA on revision `cde9fb3`: home/catalog and checkout pending PASS; one synthetic order confirmed in PostgreSQL and recovered by its token in a new tab; Signal Run start/jump/score/game-over PASS; invalid captive voucher rejected. This is tab recovery in one browser profile, not independent-context authorization proof. Health endpoint returned 200 in the runtime logs on TLS-fix revision `d1a55ec`. Owner/staff/partner sessions and scopes, paid/provisioning/WhatsApp scenarios, QR scan, expiry/device/monthly limits and Owner reset across independent contexts are **NOT VERIFIED remotely**. Physical Android, iPhone and laptop checks remain **NOT TESTED**.

Actual runtime defects fixed: `SELF_SIGNED_CERT_IN_CHAIN` by bundling the public Supabase Root 2021 CA with `rejectUnauthorized: true`; URL SSL options cannot override the supplied verified TLS configuration. Missing Node request socket caused checkout 500 and would affect staff/voucher login; a conservative shared limiter key handles socketless requests. Branch-alias POST returned 403; exact Vercel deployment/branch HTTPS origins are now allowed with no wildcard. Ready deployment of `51781fe` accepted the alias origin and correctly rejected deliberately nonexistent credentials with 401; session/state returned 200. Safe diagnostics exclude request bodies and secret values. No local process is required by the deployed frontend: API calls remain same-origin `/api`.

D1–D7 all remain **OPEN**: D1 commercial terms, D2 real voucher inventory, D3 Mayar, D4 router/RADIUS/captive, D5 production identity, D6 WhatsApp, D7 hosting/operations. Current architecture debt: one locked JSONB aggregate is intentionally low-throughput and not a normalized production model; real backup/restore, monitoring, provider webhooks and production identities are absent.

Current blockers: Founder must enter existing preview credentials directly in the prepared browser login, without sending secrets to chat, to enable authenticated remote QA. The four required variables were configured by Founder; no secret value was retrieved. QA has not been declared complete. Do not start M1.2/M1.3 reconciliation, live payment/router/WhatsApp integrations, production domain, or D1–D7 closure in this batch.
