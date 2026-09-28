# PT. SSS Client Preview readiness

Status: **NOT READY for client sharing — remote QA PARTIAL**, 28 September 2026. The synthetic Client Preview application now loads over HTTPS and persists checkout in Supabase. Authenticated role/session/reset QA is still pending; no production readiness claim.

| Gate | Result |
|---|---|
| Deployment architecture | React/Vite → same-origin `/api` Vercel Node Function → private Supabase PostgreSQL. Existing domain/services retained. |
| Environment | Founder configured the four required Preview variables. Application bootstraps successfully. Values were not retrieved or printed. Deployment protection remains enabled; use authorized Vercel access. |
| Git revision | Runtime repair `51781fe3122c77b10606613dfce147ff5bbd5b84` on `client-preview`. Historical MVP V2 baseline `8da9928` preserved; `main` untouched. Later docs-only commits must not be confused with the tested runtime revision. |
| Local QA | This batch: domain 30/30, server 27/27, typecheck/build, artifact scan and diff whitespace checks PASS. Full local browser 82/82 is historical preparation evidence, not a fresh run after these repairs. |
| Supabase | Application TLS reads and one synthetic checkout write PASS; SQL confirmed exactly one QA order, and the public order link recovered it in a fresh tab. Independent browser-context mutations/reset and concurrency remain pending. |
| Vercel/GitHub | Project `pt-sss-client-preview`; Git pushes restricted to `client-preview`. TLS fix deployment and socketless fix deployment Ready and exercised over HTTPS. Stable branch alias exists. No production deployment made in this batch. |
| Remote QA | See actual outcomes below; public/customer pending and Signal Run verified, authenticated flows pending. |
| Physical devices | Android, iPhone, laptop and physical camera: **NOT TESTED**. See [device checklist](CLIENT_PREVIEW_DEVICE_CHECKLIST.md). |

Preview still deliberately simulates payment/Mayar, MikroTik/RADIUS and captive connectivity, hotspot telemetry and usage categories, WhatsApp, device/SSID context and all fixture pricing/stock. Game score remains device-local. The PostgreSQL document design serializes critical mutations for a small preview but is not the normalized production backend; deployed transaction behavior and restart persistence must be tested before sharing. Staff cookies must be Secure/HttpOnly/SameSite; CSRF, origin, assignment and tenant checks must pass at the remote URL.

D1–D7 remain open. No live customer data, provider credentials, payment QR, router operations, WhatsApp send, production domain or production readiness claim is allowed. Revisit this document with exact revision and actual remote results after deployment; do not convert NOT TESTED to PASS based on localhost.

## Runtime diagnosis and actual remote evidence

- Initial deployment `5d38282`: `/api/auth/session` returned 503. Frontend did not call localhost. Function logs identified `SELF_SIGNED_CERT_IN_CHAIN` in the Supabase TLS connection.
- `d1a55ec`: public Supabase Root 2021 CA bundled server-side; verified TLS retained, URL SSL overrides removed. Fingerprint SHA-256: `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`. CA downloaded from Supabase's public download endpoint; not a password/private key. Runtime health, auth session and state returned 200; application loaded.
- Checkout then returned 500. Safe stack-location logging identified `request.socket.remoteAddress` at `server/application.ts:103`. Vercel request had no Node socket.
- `cde9fb3`: socketless requests use a conservative shared throttle key. HTTPS customer checkout succeeded; the synthetic order remained pending, exactly one row entry confirmed, new tab restored the same order. No real payment or message was sent.
- Branch alias login POST returned 403 because the allowlist only recognized the unique deployment origin. `51781fe` adds the exact `VERCEL_BRANCH_URL` origin alongside `VERCEL_URL` and optional `SSS_PUBLIC_ORIGIN`; HTTPS validation and origin rejection remain enabled. Deployment `dpl_hkJoHUBRhi4WVie3osuLPSzLJDyR` / `pt-sss-client-preview-es98w2cbz-conqueror-studio.vercel.app` is Ready. Alias login with deliberately nonexistent synthetic credentials now returned 401, confirming origin acceptance and credential rejection; auth session/state returned 200. This is not proof of valid-role login.
- Same-profile tab recovery is PASS; it is **not** independent-browser-context proof. Signal Run start, keyboard jump, increasing score and collision/game-over are PASS. Captive invalid-code POST returned 400 and the UI showed the correct rejection.
- Owner flow, Staff assignments, Partner tenant scope, staff cookie flags/session refresh/revocation, simulated payment/provisioning/WhatsApp outcomes, voucher QR/camera, wrong-site activation, regular second device, monthly concurrency, expiry and shared Owner reset are **NOT VERIFIED remotely**. Founder login handoff requested; no account secret was retrieved. Local tests passing do not close these remote gates.
- Direct API navigation in the in-app browser was blocked by its client, although the health request appeared as 200 in Function logs. Direct navigation/refresh can encounter Vercel deployment protection. Protection was not disabled. Full HTTPS/origin/cookie behavior remains a partial gate until authenticated QA completes.

Stable private QA entry: `https://pt-sss-client-preview-git-client-preview-conqueror-studio.vercel.app`. Temporary protection-access links and order tokens are intentionally omitted from this document. The single pending order named `QA Preview Sintetis` is disposable synthetic QA state; Owner reset must be tested through the application once logged in, not by rewriting database state.

Remaining action: Founder enters existing credentials directly into the prepared Preview login tab, then remote QA continues. Do not paste secret values in chat or infer a role PASS from bootstrap success. Dashboard error/waiting copy still includes local-runtime wording; it is not evidence of localhost network access.
