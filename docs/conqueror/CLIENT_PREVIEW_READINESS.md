# PT. SSS Client Preview readiness

Status: **READY FOR CONTROLLED CLIENT PREVIEW**, 29 September 2026. Founder-run automated remote security harness against the protected Client Preview reported 24 passed, 0 failed, 0 not run. Founder also completed physical QA on Android/Chrome, iPhone/Safari, and a Windows laptop using Chrome and Edge, plus a physical QR-camera decode. Detailed scope and limitations are in [CLIENT_PREVIEW_DEVICE_CHECKLIST.md](CLIENT_PREVIEW_DEVICE_CHECKLIST.md). The historical incomplete browser attempts below remain as history and are superseded for API authorization, tenant/assignment scope, cookie attributes, CORS, session isolation and logout/revocation by the completed request-level run. This is not production readiness.

| Gate | Result |
|---|---|
| Deployment architecture | React/Vite → same-origin `/api` Vercel Node Function → private Supabase PostgreSQL. Existing domain/services retained. |
| Environment | Founder configured the four required Preview variables. Application bootstraps successfully. Values were not retrieved or printed. Deployment protection remains enabled; use authorized Vercel access. |
| Git revision | Tested deployment `dpl_BWbadkU1SFyHrDfnoPwexT7L6v5c`, commit `6fc6d8a5dca9f4ebed4fe8a773ad822daef64d7d` on `client-preview` (Vercel state Ready). Runtime fix `51781fe3122c77b10606613dfce147ff5bbd5b84` is included. Historical MVP V2 baseline `8da9928` preserved; `main` untouched. |
| Local QA | 28 September 2026: domain 30/30, server 27/27, typecheck/build, full Playwright browser suite 82/82, artifact scan and `git diff --check` PASS. The remote harness source also passed local syntax/typecheck/server regression before Founder executed it. Playwright completed in 24.2 minutes. |
| Supabase | Application TLS reads and synthetic checkout writes PASS; SQL confirmed a QA order, and its public link recovered in a fresh tab. Owner payment idempotency and monthly slot-limit checks passed. Latest Owner↔Chrome Admin/customer mutation/reset and one concurrent alert acknowledgement also passed. Partner write mutations are prohibited by role; broader multi-writer/load concurrency remains untested and is outside this controlled-preview web-security gate. |
| Vercel/GitHub | Project `pt-sss-client-preview`; Git pushes restricted to `client-preview`. TLS fix deployment and socketless fix deployment Ready and exercised over HTTPS. Stable branch alias exists. No production deployment made in this batch. |
| Automated remote web security gate | **PASS — 24 passed, 0 failed, 0 not run**, Founder-run against the protected Vercel Preview branch alias. Evidence covers health, Admin and Partner role/scope authorization, tenant and assignment denials, Owner/Admin-only denials, mutation rejection, separate sessions, cookie attributes, HTTPS, foreign-origin rejection, sanitized errors and logout revocation. Full record below. |
| Other remote product QA | Owner/customer synthetic scenarios, Partner UI and Owner/Admin shared state/reset remain as recorded in the dated QA history. This web-security result does not claim broader load/concurrency verification. |
| Physical-device gate | **PASS for reported scope** — Android/Chrome, iPhone/Safari, Windows/Chrome, Windows/Edge, and physical QR camera. No broader device, version, or network compatibility is inferred. See [device checklist](CLIENT_PREVIEW_DEVICE_CHECKLIST.md). |

Preview still simulates the Mayar/payment provider, MikroTik/RADIUS, real captive networking, WhatsApp, telemetry/usage and real SSID/device context; production voucher inventory is unavailable. Fixture prices and stock are synthetic; game score remains device-local. The PostgreSQL document design serializes critical mutations for a small preview but is not the normalized production backend. Broader concurrency and physical-device behavior remain outside the passed automated web-security gate. The gate verified Secure/HttpOnly/SameSite=Strict cookies remotely.

D1–D7 remain OPEN. No live customer data, provider credentials, payment QR, router operations, WhatsApp send, production domain or production readiness claim is implied by this Client Preview classification. Do not convert physical-device NOT TESTED results to PASS based on localhost or the remote web harness.

## Runtime diagnosis and actual remote evidence

- Initial deployment `5d38282`: `/api/auth/session` returned 503. Frontend did not call localhost. Function logs identified `SELF_SIGNED_CERT_IN_CHAIN` in the Supabase TLS connection.
- `d1a55ec`: public Supabase Root 2021 CA bundled server-side; verified TLS retained, URL SSL overrides removed. Fingerprint SHA-256: `80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`. CA downloaded from Supabase's public download endpoint; not a password/private key. Runtime health, auth session and state returned 200; application loaded.
- Checkout then returned 500. Safe stack-location logging identified `request.socket.remoteAddress` at `server/application.ts:103`. Vercel request had no Node socket.
- `cde9fb3`: socketless requests use a conservative shared throttle key. HTTPS customer checkout succeeded; the synthetic order remained pending, exactly one row entry confirmed, new tab restored the same order. No real payment or message was sent.
- Branch alias login POST returned 403 because the allowlist only recognized the unique deployment origin. `51781fe` adds the exact `VERCEL_BRANCH_URL` origin alongside `VERCEL_URL` and optional `SSS_PUBLIC_ORIGIN`; HTTPS validation and origin rejection remain enabled. Deployment `dpl_hkJoHUBRhi4WVie3osuLPSzLJDyR` / `pt-sss-client-preview-es98w2cbz-conqueror-studio.vercel.app` is Ready. Alias login with deliberately nonexistent synthetic credentials now returned 401, confirming origin acceptance and credential rejection; auth session/state returned 200. This is not proof of valid-role login.
- Same-profile tab recovery is PASS; it is **not** independent-browser-context proof. Signal Run start, keyboard jump, increasing score and collision/game-over are PASS. Captive invalid-code POST returned 400 and the UI showed the correct rejection.
- At the time of this earlier runtime-repair pass, authenticated role QA had not started. Later Owner/Admin/customer and cross-context evidence is recorded below. Partner tenant scope, staff cookie response flags/logout revocation, and physical QR camera scan remain **NOT VERIFIED remotely**. No account secret was retrieved. Local tests passing do not close these remote gates.
- Direct API navigation in the in-app browser was blocked by its client, although the health request appeared as 200 in Function logs. Direct navigation/refresh can encounter Vercel deployment protection. Protection was not disabled. Full HTTPS/origin/cookie behavior remains a partial gate until authenticated QA completes.

Stable private QA entry: `https://pt-sss-client-preview-git-client-preview-conqueror-studio.vercel.app`. Temporary protection-access links and order tokens are intentionally omitted from this document. The single pending order named `QA Preview Sintetis` is disposable synthetic QA state; Owner reset must be tested through the application once logged in, not by rewriting database state.

At that earlier QA pass, the Founder had authenticated Owner, Admin and Partner, but only Owner (in-app browser) and Admin/customer (Chrome) were accessible to the test controller. Edge was not an available browser surface then, so Partner authorization had not yet been exercised. The subsequent Partner Chrome session and test results are recorded in the later dated sections below. Cookie attributes still require a response-header capture; source configuration alone is not remote evidence. Do not paste secret values in chat or infer a role PASS from bootstrap success. Dashboard error/waiting copy still includes local-runtime wording; it is not evidence of localhost network access.

## Authenticated Owner/customer QA update — 28 September 2026

Tested interactively over HTTPS on the deployed Client Preview in the existing Owner-authenticated tab. The deployment opened at `/owner/transaksi`; the browser showed the signed-in Owner identity. Vercel deployment `dpl_BWbadkU1SFyHrDfnoPwexT7L6v5c` is Ready at `https://pt-sss-client-preview-5z9lx4ef8-conqueror-studio.vercel.app`, from `client-preview` commit `6fc6d8a5dca9f4ebed4fe8a773ad822daef64d7d`. Browser scenarios used synthetic fixtures only. No application code was changed during this QA continuation.

| Scenario | Observed result |
|---|---|
| Owner dashboard and synthetic store | PASS — 50 synthetic locations visible; dashboard shows online/offline/unknown and separates gross online sales, partner share, allocated stock and potential offline margin. |
| Duplicate payment callback | PASS — repeated callback leaves one paid order and one commission amount from the saved rate snapshot. |
| Paid order with delayed provisioning | PASS — customer sees voucher processing guidance and is told not to pay again; Owner can issue/retry the voucher. |
| WhatsApp failure | PASS — simulated failure is shown while voucher code and QR remain available. |
| Voucher detail and QR | PASS — synthetic voucher detail displays a QR and indicates it is a demo representation, not a payment QR. Voucher is unused and has no expiry until first login. Physical-camera decoding was not tested. |
| Correct-site first login and duration | PASS — first login at the matching mock site activated the voucher and showed a 180-minute session and expiry from the first login. |
| Wrong site | PASS — submitting the voucher at a different mock site returned the partner/site mismatch message and did not create a session. |
| Regular second device | PASS — Owner panel reported the regular voucher is locked to its first device. |
| Monthly concurrency | PASS — fixture with two of two monthly slots used rejected a third mock device with “Slot sesi bulanan penuh. Logout salah satu perangkat terlebih dahulu.” |
| Expiry and refresh | PASS — advancing the demo clock past expiry changed the monthly voucher to expired; reloading its tokenized customer page preserved the expired state. |
| Owner reset | PASS — confirmation was required; reset restored the fixture clock/data and the prior customer order link became unavailable after refresh. This was verified between two tabs in the same browser profile only. |
| Session / persistence across independent contexts | NOT TESTED — two tabs in one profile do not prove independent browser-context persistence or authorization. |
| Staff and Partner scope | NOT TESTED — Owner login does not establish those roles' access boundaries. |
| Cookies, console errors, physical devices | NOT TESTED — Secure/HttpOnly/SameSite values, full console inspection, real Android/iPhone/laptop and physical QR camera remain unchecked. |

Owner reset was completed after the expiry scenario; the Owner panel confirmed the synthetic fixture reset. Browser logs previously observed for this preview had no 5xx responses; expected invalid/wrong-site requests included 400 responses. That runtime-log observation is not a substitute for checking browser-console errors or all endpoint behavior.

**Historical readiness decision at the end of that earlier QA pass:** NOT READY for client sharing. The following sections preserve the evidence available then. Its missing Partner/API/cookie/session gates were completed by the later Founder-run automated gate recorded at the end of this document. Owner/Admin/customer shared state and reset passed for the exercised cross-context scenarios. This is not a production-readiness determination. D1–D7 remain OPEN.

## Final remote QA continuation — 28 September 2026

Tested deployment: Vercel deployment `dpl_BWbadkU1SFyHrDfnoPwexT7L6v5c`, state Ready, branch `client-preview`, commit `6fc6d8a5dca9f4ebed4fe8a773ad822daef64d7d`. `/api/health` returned HTTP 200 with `{"ok":true}`. The app remained on same-origin `/api`; this batch made no code changes and did not access secret values.

| Gate | Result and evidence |
|---|---|
| Owner | PASS for dashboard/reset. Owner authenticated session survived refresh. Owner saw Cisaat telemetry change and its reset restoration. |
| Admin dashboard / assignment | PARTIAL PASS. Authenticated Admin dashboard showed one assigned hotspot, Mitra Cisaat. Acknowledge-alert action on that assignment succeeded. |
| Admin direct role routes | PASS at the app route guard. Direct `/owner` and `/mitra-dashboard` navigation returned the access-denied page while the browser remained signed in as Admin. This alone is not server API proof. |
| Admin operational data scope | PASS for the exercised server-backed search. Admin search returned the synthetic Cisaat order with WhatsApp masked; searching a known Cibadak fixture order returned “Tidak ada hasil dalam penugasan Anda.” Owner-only account endpoint/API denial was not directly exercised remotely. |
| Partner | PARTIAL PASS after a newly available authenticated Chrome tab was found. Mitra Cisaat dashboard, masked read-only stock, sales and payout views, own-order detail, foreign-order detail denial, and direct Owner/Admin route denials were verified through the UI. Direct server/API authorization, remote response cookie flags and a Partner mutation/persistence scenario were not independently tested. |
| Shared persistence across contexts | PASS for Owner ↔ Chrome Admin/customer. Owner set Cisaat status to offline; after refresh, Admin saw offline and zero online users for its one assigned hotspot. Admin/Owner both acknowledged the same Cisaat low-stock alert concurrently; both showed acknowledged and no duplicate visible alert. |
| Owner reset across contexts | PASS for Owner ↔ Chrome Admin/customer. Owner reset returned Cisaat to online and reopened the baseline alert. Owner transaction list returned to fixture count (8 at check); the synthetic unpaid customer order disappeared. Chrome refresh of its pre-reset order URL displayed “Tautan pesanan tidak ditemukan atau data demo sudah direset.” Partner context was not available for reset verification. |
| Persistence after refresh | PASS for exercised state. Owner and Admin remained authenticated after normal page reload; offline state and synthetic pending order survived until Owner reset, then the reset propagated to Chrome. This does not verify logout revocation. |
| Concurrent mutation | PARTIAL PASS. One same-alert acknowledge action was submitted concurrently from Owner and assigned Admin contexts. Both received success and converged to one acknowledged alert in the UI; reset restored the single fixture alert. This is a small demo check, not load testing. |
| Console | PASS for captured error/warning logs in Owner, Admin and customer Chrome tabs: none returned. Partner console was unavailable. |
| Network/runtime | `/api/health` 200. Vercel runtime logs for this deployment in the preceding 3 hours showed 200 responses, 60 404 and 3 400 at query time; a separate 5xx filter returned no entries and no error/warning/fatal logs were returned. The 404s were not individually classified, so unexpected 4xx are not ruled out. Browser network panel, CORS and mixed-content inspection were not available. |
| Cookie/session security | PARTIAL / NOT REMOTELY VERIFIED. Source config sets deployed `secureCookies: true` and emits `HttpOnly; SameSite=Strict; Secure`; response headers were not captured. Owner/Admin sessions survived refresh. Logout revocation and cookie flags remain unverified. Static source search found no password storage in localStorage; localStorage is used for Signal Run score, while sessionStorage is used for checkout and a pending stock-operation draft. CSRF token is held in application memory for same-origin requests. |
| QR | Rendering and intended payload PASS from prior remote voucher-detail exercise and source review: QR image encodes the voucher code only, not an order/account URL or payment. Camera scan is NOT TESTED. |
| Supabase | Shared synthetic state remained consistent between separate Owner in-app-browser and Chrome contexts through refresh and reset. This is functional persistence evidence; no direct database credential, secret, or table data was retrieved during this batch. |

### Final verdict

**Historical verdict at that checkpoint: NOT READY for a controlled client preview.** Partner's UI-level scope had been tested, but direct server/API authorization and remote cookie/session evidence remained incomplete at that point. Those specific gaps were subsequently closed by the automated remote gate below. Owner/Admin/customer shared state and reset passed for the exercised cross-context scenarios. This is not a production-readiness determination. D1–D7 remain OPEN.

Next verification requires direct server/API negative authorization tests without extracting session or CSRF secrets, a safe remote response-header inspection for cookie attributes, and a Partner mutation/read-after-refresh check if one is needed for the preview acceptance scope. Physical-device checks remain separately pending.

### Local QA rerun — 28 September 2026

After the remote checks above, `npm run test:domain` passed 30/30, `npm run test:server` passed 27/27, and `npm run build` passed (including typecheck). `npx playwright test --reporter=list` passed 82/82 in 24.2 minutes, including customer, partner, owner/admin, responsive, keyboard, persistence and simulated QR coverage. `node .local/verify-artifacts.mjs` passed; `git diff --check` on the three updated QA documents passed (Git emitted only configured LF-to-CRLF conversion notices). These are local QA results; physical-device gates remain open. Remote API/cookie/session gates were later completed by the Founder-run harness below.

## Partner role QA — 28 September 2026

Founder made an authenticated Partner session available in a separate Chrome tab. The UI identified the account as Mitra and scoped its context to Mitra Cisaat (`SSS-DEMO-CISAAT`). QA used the deployed Preview in that existing tab and performed read-only navigation only; no voucher credentials were copied, no operational state was changed, and no secrets were retrieved.

| Scenario | Observed result |
|---|---|
| Partner dashboard scope | PASS at UI level. Dashboard named Mitra Cisaat and showed only that partner's two synthetic hotspot rows, monitoring snapshot, stock summary and recent transaction. |
| Offline stock visibility | PASS at UI level. One synthetic batch showed 5 allocated, 5 not active and 0 active/expired. Voucher codes were masked. Margin was labeled potential only, separate from online share and from unknown receipt/realized margin. No stock purchase, transfer or edit action was present in the rendered view. Copy-code actions were not used. |
| Online sales and customer masking | PASS at UI level. List showed Cisaat's synthetic pending order, its status/package/amount, masked WhatsApp and an available detail link. |
| Own transaction detail | PASS at UI level. `seed-order-1` displayed Mitra Cisaat, masked customer, payment/provisioning pending, no issued voucher, assumed 20% gross-before-fee rate snapshot, no commission until paid, and payout schedule not determined. |
| Foreign partner transaction detail | PASS at UI route level. Directly opening known synthetic Cibadak fixture `seed-order-2` displayed “Akses ditolak” and “Transaksi tidak tersedia untuk mitra aktif. Detail mitra lain tidak ditampilkan.” No foreign transaction details were rendered. |
| Owner/Admin routes | PASS at UI route level. Direct `/owner` and `/admin` navigation displayed “Akses tidak tersedia” for the signed-in Partner. The session remained identified as Mitra and could return to its dashboard. |
| Online users | PASS at UI level. The Partner page showed 0 active devices/sessions and states that device names are aliases and MAC/SSID are not read. |
| API authorization, cookies and errors at that time | NOT TESTED directly in this browser QA; it did not inspect raw API state, session/cookie values, response headers or logout revocation. UI-denied routes did not independently prove server/API denial. The later harness closes these listed security checks. |

The Partner tab was restored to its dashboard after these route checks. At that time, this added UI evidence but did not close the direct API/server authorization gate. The later harness closes that web-security gate; neither result makes the preview production-ready. D1–D7 remain OPEN.

## Final remote security gate attempt — 28 September 2026

Target deployment remained Vercel Preview `dpl_BWbadkU1SFyHrDfnoPwexT7L6v5c`, branch `client-preview`, commit `6fc6d8a5dca9f4ebed4fe8a773ad822daef64d7d`. No source change, deployment, reset, voucher copy, or operational mutation was performed. The authenticated Partner and Admin tabs were in the same Chrome profile and therefore shared the staff-session cookie. After navigation/reload, the former Admin tab resolved as the Partner identity and `/admin` denied access. This invalidates that profile as two independent role contexts; no password was requested and no logout was performed.

| Gate | Result and evidence |
|---|---|
| Partner own-scope data | PARTIAL PASS. Refreshing the authenticated Partner dashboard retained Mitra Cisaat-only content. Vercel aggregate runtime counts showed `/api/state` HTTP 200 and `/api/auth/session` HTTP 200 during that refresh window (the grouped counts are not request-ID correlated). |
| Partner foreign tenant | NOT VERIFIED at API boundary. Known Cibadak transaction detail was denied by the UI route, but the browser test interface blocks direct `/api` navigation and provides no Network panel or safe request-response status capture. No direct POST was made. |
| Partner Owner-only API | PARTIAL PASS. A GET attempt to `/api/accounts` from the authenticated Partner tab was followed by Vercel grouped logs showing 403 for that path (two 403 entries total during the one-hour window; no request-ID correlation). The browser rendered `ERR_BLOCKED_BY_CLIENT`; no account body was read. |
| Partner Admin-only API | PARTIAL PASS. A GET attempt to `/api/ops/overview` from the Partner tab was followed by one Vercel grouped 403 for that path. Chrome blocked rendering the response and logs expose aggregate counts only; no response body or request ID was read. |
| Partner read-only mutation enforcement | NOT VERIFIED remotely. No legitimate Partner mutation exists in the tested role. No write action was invented, and no `/api/service` POST was generated; its CSRF value was not accessed. Source authorization and the local server suite are supporting evidence only. |
| Admin assigned/unassigned and Owner-only APIs | NOT VERIFIED in this gate. Earlier server-backed Admin dashboard/search UI showed assigned Cisaat and no Cibadak search result, but exact HTTP status was not captured. The current Admin tab now shares the Partner cookie, so no direct Admin API request was run. |
| Admin privilege escalation | NOT VERIFIED remotely. Local server tests cover Admin inability to create Owners, but this does not prove the deployed endpoint behavior. |
| Cookie HTTPS response flags | NOT VERIFIED remotely. Source config for Preview sets `secureCookies: true` and emits `Path=/; HttpOnly; SameSite=Strict; Secure`; local auth tests assert HttpOnly/SameSite and logout behavior. No deployed `Set-Cookie` header was captured. Preview itself was visited over HTTPS. |
| Session revocation at that time | NOT TESTED remotely. Partner remained signed in; logout was deferred because the API authorization phase was incomplete. Local server tests verified revocation; deployed old-session rejection was later verified by the automated gate below. |
| Partner refresh/persistence | PASS for read-only scope only. Normal refresh returned the same Cisaat-scoped data. No Partner write was performed. |
| Console/network | PARTIAL. Vercel logs for the deployment over the preceding hour showed no error/fatal/warning entries and no 5xx entries. Grouped request logs do not prove per-request behavior. Browser console, CORS and mixed-content panels are unavailable through the connected interface; no response bodies or secrets were inspected. |

Local supporting verification rerun: `npm run test:server` passed 27/27, including server-side Partner projection/object-query scoping, Admin assignment and Owner-only restrictions, HttpOnly/session logout revocation, CSRF/origin rejection, and Supabase TLS configuration. These local tests do not replace the missing remote request-level evidence.

### Security gate verdict

**Historical verdict at that checkpoint: NOT READY.** It was based on missing direct foreign-tenant/POST checks, Admin API tests using an independent session, live cookie response headers, and deployed logout/session-revocation tests. The later automated remote security gate below completed those checks. Physical Android/iPhone/laptop-camera checks remain separately **NOT TESTED**. D1–D7 remain OPEN; no production-readiness claim.

### Safe setup needed to resume

Use separate browser profiles (or separate browser products) for Partner and Admin so a single `sss_staff` cookie cannot switch their server identity. Keep the Owner session in its separate in-app browser. To capture remote API status and response headers without exposing auth material, provide a task-isolated Chrome DevTools Network surface attached only to the QA profile; inspect status/attribute booleans only and never copy the cookie, CSRF token, authorization header, or response data into chat. Once Partner API checks finish, the explicitly requested Partner logout test can run; the Partner role may remain logged out afterward if re-login requires Founder credentials.

## Security gate retry — separate browser contexts reported — 28 September 2026

Founder reported Owner, Admin, and Partner signed in across three browsers and enabled Edge computer-use access. Browser inventory confirmed Edge Profile 1 with the Preview Partner tab. After refresh, Edge remained identified as `sizinet · Mitra` on the Mitra Cisaat dashboard. Chrome's purported Admin tab at `/admin` was refreshed/read and still identified the session as `sizinet · Mitra`; the page showed “Akses tidak tersedia.” This is an Admin identity verification failure; it does not prove that the separate Edge and Chrome browser products share a cookie jar. Per the gate sequence, authorization testing stopped immediately. Partner was not logged out.

| Gate | Result and evidence |
|---|---|
| Admin session identity after refresh | FAIL — Chrome `/admin` still identified the session as Mitra and denied the Admin page; Admin dashboard availability was not established. |
| Partner session identity after refresh | PASS — Edge Profile 1 remained on the Mitra Cisaat dashboard with the partner context visible. |
| Admin API authorization | NOT RUN — stopped because the purported Admin context did not verify as Admin. |
| Partner direct API authorization | NOT RUN — stopped at session verification before any authorization requests. |
| Cookie response flags | NOT TESTED — no safe remote response-header capture was made. |
| Partner logout/revocation and Admin independence | NOT TESTED — logout is sequenced after Partner API checks, which were not run. |
| Runtime 5xx/CORS/mixed content/errors | NOT TESTED in this retry; previous sampled-log evidence above remains partial only. |

No code, deployment, account state, or operational data was changed in this historical retry. No credentials, cookies, CSRF tokens, session IDs, or response bodies were retrieved. Its verdict was **NOT READY for controlled client sharing** because Admin identity did not verify at that time. The later Founder-run API harness supplied separate Admin and Partner sessions and superseded this security-gate conclusion. Physical-device checks remain NOT TESTED; D1–D7 remain OPEN.

## Security gate retry 2 — role refresh check — 28 September 2026

After Founder reported a fresh Admin login, Chrome was refreshed and verified as `udin123 · Admin`; its Admin dashboard and assigned Cisaat summary were visible. Edge Profile 1 was refreshed in the same verification step, but `/mitra-dashboard` redirected to `/login?next=%2Fmitra-dashboard` and showed the staff login form, with no authenticated identity. The Partner session therefore did not survive refresh in the available Edge context. Per the required session gate, testing stopped before Admin/Partner API authorization, cookie response headers, Partner logout, and runtime checks. No credentials were entered, no session values were inspected, and no account or application state was changed.

| Check | Result |
|---|---|
| Admin identity and dashboard after refresh | PASS — Chrome showed Admin identity and assigned Cisaat dashboard. |
| Partner identity/dashboard after refresh | FAIL / unavailable — Edge redirected to staff login; Mitra Cisaat identity was not present after refresh. |
| API authorization, cookie flags, logout/revocation, runtime | NOT RUN — stopped because both authenticated role contexts were not available after refresh. |

**Historical verdict at that time: NOT READY for controlled client sharing.** Partner had not survived refresh in the available Edge context. The later Founder-run harness independently authenticated and exercised Admin and Partner sessions, superseding this role-isolation blocker. Physical-device checks remain NOT TESTED; D1–D7 remain OPEN.

## Security gate retry 3 — browser recheck — 28 September 2026

Chrome Admin was refreshed and remained identified as `udin123 · Admin`; the assigned Cisaat Admin dashboard was visible. Edge appeared in the browser inventory, but the Partner tab could not be inspected because the Edge debugger connection reported unattached. Therefore Partner identity after refresh could not be confirmed in this retry. The session-isolation gate remains incomplete; no Admin/Partner API tests, cookie header inspection, Partner logout, or runtime gate was run. No credentials or session data were retrieved, and no app state was changed.

| Check | Result |
|---|---|
| Admin identity/dashboard after refresh | PASS — Chrome remained Admin and showed its assigned dashboard. |
| Partner identity/dashboard after refresh | NOT VERIFIED — Edge debugger unattached; the Partner page could not be inspected. |
| Remaining remote security gates | NOT RUN — session check did not establish both active role contexts. |

Historical verdict at that time: **NOT READY for controlled client sharing**. Edge could not be inspected, so that retry could not confirm Partner. The later Founder-run harness superseded this missing role-session evidence. Device checks remain NOT TESTED; D1–D7 remain OPEN.

## Security gate retry 4 — session isolation and runtime sample — 28 September 2026

The current user reported Partner signed in in the Codex in-app browser and Admin in Chrome. Both roles were refreshed and verified: Chrome continued to identify `udin123 · Admin` and showed the assigned Cisaat operations dashboard; Codex continued to identify `sizinet · Mitra` and showed Mitra Cisaat's dashboard. Session-isolation UI check PASS for this observation.

Direct API boundary checks could not proceed through the QA browser surface. A safe read-only navigation attempt to same-origin `GET /api/state` was blocked by the browser with `ERR_BLOCKED_BY_CLIENT`; no API response body was opened. No Network/response panel is exposed by the available computer-use surface. Vercel runtime aggregates for deployment `dpl_BWbadkU1SFyHrDfnoPwexT7L6v5c` over the sampled 5-minute window showed request-path counts `/api/state` 46, `/api/auth/session` 10, `/api/ops/overview` 2, `/api/auth/logout` 1, and `/api/auth/login` 1. Aggregate response grouping showed 200 as the top result (58 entries); filtering the same window for 403 and 5xx returned no rows, and error/warning/fatal grouping returned no rows. These are aggregate observations only; they are not correlated to a specific browser request, and the unexpected-looking auth path counts are not attributed to this QA action.

| Gate | Result |
|---|---|
| Admin refresh identity | PASS — Admin identity and assigned Cisaat dashboard visible after refresh. |
| Partner refresh identity | PASS — Mitra Cisaat identity/dashboard visible after refresh. |
| Admin assigned-resource API | NOT VERIFIED at request/status boundary; dashboard loaded but per-request status unavailable. |
| Admin Cibadak, Owner-only API, foreign resource, privilege escalation | NOT TESTED — direct response status/network capture unavailable. |
| Partner own-scope API | PARTIAL — dashboard loaded; aggregate `/api/state` path activity observed but no correlated status. |
| Partner foreign resource, Owner/Admin API, mutation denial | NOT TESTED at direct API boundary. |
| Cookie flags | NOT TESTED from remote `Set-Cookie` response. HTTPS page origin observed. |
| Partner logout/revocation | NOT TESTED — must follow completed Partner API tests; no logout performed. |
| Runtime sampled logs | No 5xx rows and no error/warning/fatal rows in the narrow 5-minute query; this does not substitute for browser CORS, mixed-content, console, or per-request inspection. |

No code, deployment, session mutation, or operational data change was performed in this historical attempt. No credentials, cookies, CSRF tokens, session identifiers, or response bodies were accessed. Its **NOT READY** verdict and missing request-level evidence were later superseded by the Founder-run harness result below. Physical devices remain NOT TESTED; D1–D7 remain OPEN.

## Automated direct-HTTPS security harness — 28 September 2026

Added `tests/remote/client-preview-security.mjs`, invoked with `npm run qa:client-preview-security`. It keeps separate in-memory Admin and Partner cookie jars and checks health, role/session identity, Cisaat assignment and tenant scope, foreign Cibadak denials, Owner/Admin-only APIs, Admin escalation, Partner read-only enforcement, cookie attributes, foreign-origin behavior, safe error responses, session isolation and logout revocation. It does not print credentials, cookie values, CSRF tokens, or response bodies. The logout test preserves the pre-logout cookie only in a private in-memory jar, then verifies the old session is rejected.

Historical first direct HTTPS attempt: `/api/health` returned HTTP 302 to Vercel `/sso-api`; that non-browser attempt did not have the configured automation bypass header, so no app login occurred. A Vercel connector response also contained a temporary `_vercel_share` query in its redirect header; its value is intentionally omitted and the link was treated as exposed. The subsequent Founder-run test accessed the protected Preview successfully and is recorded below.

## Automated remote web security gate — Founder-run result — 28 September 2026

Founder executed `npm run qa:client-preview-security` locally against the protected Preview branch alias. The supplied terminal evidence reports **24 passed, 0 failed, 0 not run**. It contains no secret values, credentials, cookies, CSRF tokens, or authorization headers. No deployment or application source change was part of this documentation update.

| Remote check | Result |
|---|---|
| HTTPS `/api/health` reaches Triple S OS | PASS — HTTP 200, same HTTPS deployment, not Vercel SSO. |
| Admin and Partner login | PASS — same-origin POST accepted; separate role identities and cookie jars. |
| Admin assignment and tenant scope | PASS — assigned Cisaat scope HTTP 200; unassigned Cibadak search returned no fixture; foreign transaction HTTP 403. |
| Admin Owner-only API and escalation | PASS — both HTTP 403; no account created. |
| Partner tenant scope | PASS — own Cisaat data HTTP 200; foreign Cibadak transaction HTTP 403. |
| Partner Owner/Admin-only APIs | PASS — both HTTP 403. |
| Partner read-only mutation | PASS — HTTP 403 and order count unchanged. |
| Session independence | PASS — separate Admin/Partner jars remained independently authenticated during simultaneous requests. |
| Remote cookie attributes | PASS — Secure, HttpOnly, SameSite=Strict, Path=/, HTTPS. |
| Foreign credentialed Origin | PASS — foreign origin was not allowed; preflight HTTP 403. |
| Denial-response sanitization | PASS — no password hash, database URL, stack trace, or filesystem path. |
| Partner logout and revocation | PASS — logout HTTP 200; old Partner session HTTP 401; Admin session remained active and Cisaat-scoped. |

**Automated REMOTE WEB SECURITY GATE: PASS.** The prior NOT READY conclusions caused only by missing request-level API authorization, cookie-header, logout/revocation, and independent Admin/Partner session evidence are superseded. Historical attempts and their actual limitations remain documented above. Current classification: **READY FOR CONTROLLED CLIENT PREVIEW — PHYSICAL DEVICE QA PENDING**. This does not mean production-ready.

Founder physical QA results are recorded in [CLIENT_PREVIEW_DEVICE_CHECKLIST.md](CLIENT_PREVIEW_DEVICE_CHECKLIST.md): Android/Chrome PASS; iPhone/Safari PASS; Windows laptop Chrome PASS; Windows laptop Edge PASS; physical QR camera detection/decode of a synthetic voucher PASS with no payment/account URL. These results apply only to the tested scope; unreported physical-device flows remain unverified. D1–D7 remain **OPEN**. Mayar/payment provider, MikroTik/RADIUS, real captive networking, WhatsApp, telemetry/usage, real SSID/device context, and production voucher inventory remain simulated or unavailable. No production readiness claim is made.

**Presentation freeze:** Treat the current tested Vercel Preview as the presentation candidate for PT. SSS. Do not add features or perform speculative refactors before the presentation; reopen implementation only for a presentation-blocking defect.
