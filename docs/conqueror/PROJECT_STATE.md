# PT. SSS / Triple S OS — current project state

Project: PT. Sahabat Sinyal Sejahtera / Triple S OS. Last updated: 28 September 2026. Updated by: Codex. Authoritative repository: `C:\Users\zil\Documents\Triple_S_OS`. Branch: `client-preview`. Current Git revision: the branch HEAD (resolve with `git rev-parse HEAD`; parent before preparation `f10a85f`). Current phase: Client Preview preparation. Overall status: **NOT READY for external sharing**.

## Architecture

- Frontend: React + TypeScript + Vite; public customer/captive flow, protected owner/staff/partner dashboards.
- API: existing Node HTTP application and domain services; local runtime on loopback, prepared Vercel Function adapter on the preview branch.
- Development persistence: versioned synthetic JSON under ignored `.local/server`, with process-local sessions while running locally.
- Client Preview persistence: private Supabase PostgreSQL document row with transaction locking; migration applied, secure application connection and actual remote verification pending. It is not the historical Fastify/PostgreSQL branch.

## Deployment

- GitHub: private `godzil666/triple-s-os` remote exists; preview branch awaits reviewed candidate commit and push.
- Vercel: Conqueror Studio team is connected; no PT. SSS project/deployment verified.
- Supabase: `SSS_OS` project exists and is healthy; private Client Preview schema migrated, seed row and SQL write verified, anonymous/authenticated table reads denied.

## Implemented capabilities

Manual partner/hotspot choice, package catalog, guest checkout, simulated payment and voucher allocation, captive voucher login with first-login expiry and device/slot rules, server-side staff RBAC and assignments, owner/admin/partner dashboards, operational demo data, reset, QR code, and Signal Run on the home/captive footer. The current UI changes after MVP V2 baseline are retained.

Real application behavior includes authenticated local staff sessions, scoped API authorization, V2 state validation, idempotent domain transitions, masked partner projections, and local QA. Payment/Mayar, WiFi/MikroTik/RADIUS, telemetry/usage, WhatsApp, device/SSID context and customer network access remain simulated. No production integration or real customer data is configured.

QA on the current preparation branch: domain 30/30, server 24/24 including preview adapter, browser 82/82 on the clean full rerun, typecheck and normal/client-preview builds passed, bundle artifact verifier passed and `git diff --check` passed. The initial browser run failed 6/82; its two UI regressions were fixed and the entire suite rerun. Remote QA and physical Android, iPhone and laptop checks: **NOT TESTED**.

D1–D7 all remain **OPEN**: D1 commercial terms, D2 real voucher inventory, D3 Mayar, D4 router/RADIUS/captive, D5 production identity, D6 WhatsApp, D7 hosting/operations. Current architecture debt: one locked JSONB aggregate is intentionally low-throughput and not a normalized production model; real backup/restore, monitoring, provider webhooks and production identities are absent.

Current blockers: secure preview database URI and bootstrap credentials in Vercel, Vercel project/repository connection, actual application database transactions and remote HTTPS verification. Next objective: complete the candidate commit and private preview-branch push, configure secure Vercel environment variables, then run remote multi-context QA. Do not start M1.2/M1.3 reconciliation, live payment/router/WhatsApp integrations, production domain, or D1–D7 closure in this batch.
