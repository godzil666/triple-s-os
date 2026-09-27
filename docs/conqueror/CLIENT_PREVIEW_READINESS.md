# PT. SSS Client Preview readiness

Status: **NOT READY** as of 28 September 2026. This is a proposed synthetic client-preview environment, not production. No HTTPS URL is approved for sharing yet.

| Gate | Result |
|---|---|
| Deployment architecture | React/Vite → same-origin Node API → private Supabase PostgreSQL. Vercel Function adapter and versioned migration prepared locally. |
| Environment | `client-preview` branch; `APP_ENV=client-preview`, `VITE_APP_MODE=client-preview`, server-only pooled database URI and bootstrap account configuration required. No production environment configured. |
| Git revision | Historical MVP V2 baseline `8da9928` preserved; preparation started from `f10a85f`. Resolve the candidate revision with `git rev-parse HEAD` on `client-preview`. |
| Local QA | Domain 30/30 PASS; server 24/24 PASS (including preview adapter); browser 82/82 PASS after correcting status semantics and focus visibility; typecheck and normal/client-preview builds PASS; artifact verification PASS; production-dependency audit found 0 vulnerabilities. The first browser run failed 6/82 and was superseded by the clean full rerun. |
| Supabase | `SSS_OS` project exists. Version-controlled migration `20260927203620_client_preview_documents.sql` applied; singleton seed row and SQL write verified; `anon` and `authenticated` cannot read the private schema. Application database connection and concurrency have not been tested remotely. |
| Vercel/GitHub | GitHub remote is private. Preview branch has not been pushed; Vercel PT. SSS project and HTTPS deployment are not created/verified. |
| Remote QA | Public, customer, owner, staff, partner, QR, Signal Run, reset and shared-state scenarios: **NOT TESTED**. |
| Physical devices | Android, iPhone, laptop and physical camera: **NOT TESTED**. See [device checklist](CLIENT_PREVIEW_DEVICE_CHECKLIST.md). |

Preview still deliberately simulates payment/Mayar, MikroTik/RADIUS and captive connectivity, hotspot telemetry and usage categories, WhatsApp, device/SSID context and all fixture pricing/stock. Game score remains device-local. The PostgreSQL document design serializes critical mutations for a small preview but is not the normalized production backend; deployed transaction behavior and restart persistence must be tested before sharing. Staff cookies must be Secure/HttpOnly/SameSite; CSRF, origin, assignment and tenant checks must pass at the remote URL.

D1–D7 remain open. No live customer data, provider credentials, payment QR, router operations, WhatsApp send, production domain or production readiness claim is allowed. Revisit this document with exact revision and actual remote results after deployment; do not convert NOT TESTED to PASS based on localhost.
