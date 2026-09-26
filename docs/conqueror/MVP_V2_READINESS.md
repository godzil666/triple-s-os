# MVP V2 Readiness — PT. Sahabat Sinyal Sejahtera

## MVP V2 status

**READY WITH NON-BLOCKING LIMITATIONS untuk presentasi lokal.** Satu suite browser penuh telah lulus 64/64 setelah perbaikan regresi. Kesiapan presentasi MVP V2 tidak sama dengan kesiapan produksi.

## Repository identity

Root `C:\Users\zil\Documents\Triple_S_OS`; branch `main`; base revision `c020e7b5d2c5decff8a2b92c76939088fb2875a2` plus working tree yang belum di-commit. Lineage **C — diverged branch/worktree**: accepted M1.2 `314ba5c` dan M1.3 `505900d` adalah Git objects pada worktree lain. Migrasi PostgreSQL/Fastify M1.3 tidak ada di `main`; active app memakai Node API lokal dan JSON berversi. Tidak ada merge/cherry-pick atau backend produksi kedua pada batch ini. Lihat [gap analysis](MVP_V2_GAP_ANALYSIS.md).

## Gap analysis summary

Sebelum V2 telah ada guest checkout, payment/provisioning/voucher terpisah, timer login pertama, 50 mitra sintetis, owner/admin/mitra dan persistensi lokal. Yang parsial: Site merangkap hotspot, admin global, inventori/ops belum lengkap. Yang hilang: Provider/Hotspot eksplisit, QR, assignment, health, alert, incident, recovery, search. Payment, WiFi/router, monitoring dan WhatsApp masih simulasi. D1–D7 tetap membutuhkan keputusan dan akses eksternal.

## Customer features

`/wifi/hotspot/:hotspotId/login` menampilkan mitra, Provider, Hotspot dan SSID; `/wifi` untuk pemilihan manual. Voucher satu kode, Member username/password, scan QR dengan izin kamera/fallback manual, dan Buy Voucher dari captive memakai endpoint login/katalog yang sama. QR hanya berisi kode voucher, tidak memuat password, ID internal atau QR pembayaran. Server mengunci quote/order/voucher ke hotspot dan menolak hotspot salah pada lokasi sama. Token detail order hanya untuk membaca detail; aktivasi memerlukan kredensial dan mulai timer saat login pertama.

## Owner features

Owner memiliki 50 mitra, paket/offer/stok/transaksi/akun/audit serta pusat operasi global untuk 51 hotspot sintetis (dua di Cisaat): stok online, health, pengguna/latensi/observedAt, kategori penggunaan demo, alert, incident, notifikasi dalam aplikasi, support search dan recovery. Owner mengelola assignment admin dan skenario telemetri demo.

## Staff features

Admin hanya melihat hotspot yang ditugaskan owner. State projection, daftar transaksi/voucher/komisi, search, recovery, alert dan incident dicek pada API. Admin tidak mengubah katalog/mitra/stok global atau akun owner. Admin lama tanpa field assignment dimigrasikan ke Cisaat 1 saja, bukan akses global; perubahan assignment mencabut sesi lama.

## Partner features

Mitra tetap tenant read-only. Ringkasan Provider/Hotspot serta angka stok aman dapat dibaca; kode voucher diproyeksikan sebagai tersamarkan. Nomor customer termasking, URL mitra lain dan operasi staf ditolak. Potensi margin offline tidak disamakan dengan komisi online atau penerimaan kas.

## Backend/domain work

State V2 menambah Provider, Site sebagai Location, Hotspot, inventory pool, DemoTelemetry, alert, incident. Migrasi V1→V2 mempertahankan order, voucher, credential dan waktu aktivasi lama. Merchant payment diberi label PT SSS tetapi provider tetap `mock`. Alokasi online menurunkan stok sekali saat issued; retry idempoten. Alert stok rendah dan gagal delivery/alokasi berasal dari event store. Telemetri eksternal adalah `DEMO TELEMETRY`. Search dibatasi assignment dan memasking nomor. Audit baru menyimpan aktor, aksi, resource, hasil tanpa password/kode voucher.

## Real functionality / simulated functionality / deferred

**Logika aplikasi lokal yang benar-benar berjalan:** sesi staf, RBAC/assignment, order/quote, inventory sintetis berversi, idempotensi, aturan voucher, alert/incident, search, audit dan reset. **Simulasi sistem eksternal:** callback payment/QRIS/e-wallet, WiFi/MikroTik/RADIUS, SSID/perangkat, kesehatan jaringan dan klasifikasi trafik, WhatsApp. **Ditunda:** live Mayar, QRIS yang dapat dibayar, impor kode resmi, captive router, telemetri nyata, WhatsApp produksi, database/identity produksi, payout/refund, Residential/OLT, deploy dan push remote.

## QA results

Pada 26 September 2026, `npm run test:domain`: **25/25 lulus**; `npm run test:server`: **23/23 lulus**; `npm run build` (termasuk `tsc --noEmit`): **lulus**; `npx playwright test --reporter=list`: **64/64 lulus dalam satu run (15,5 menit)**; `git diff --check`: **lulus** (hanya peringatan konversi LF/CRLF); `node .local/verify-artifacts.mjs`: **lulus** untuk pemeriksaan password awal, hash/salt akun, kode stok offline, serta marker server/fixture pada JS publik. Migrasi V1→V2, reload aktivasi, idempotensi, rollback disk dan perubahan akun owner masuk dalam verifikasi terkait. Suite browser memeriksa alur customer→mitra→owner/admin, assignment, QR deterministik, penolakan izin kamera, refresh/reset, label/fokus/overflow, dan viewport **360/390/768/1024/1440 px**. Pemeriksaan viewport ini otomatis; tinjauan visual manual yang dilakukan terbatas pada panel 360 px. Run browser awal sempat gagal pada timeout tangkapan layar halaman operasi yang terlalu panjang dan assertion alur sesi lama; keduanya diperbaiki lalu lulus. Run kedua terhenti pada error penyimpanan akun Windows; retry penyimpanan dan penyelarasan tampilan akun diperbaiki, kasus itu lulus terpisah lalu suite final lulus penuh. Jalur retry lock Windows tidak diuji dengan fault injection. Tidak ada kegagalan tersisa pada run final. Tes PostgreSQL/database tidak tersedia di active `main`; hasil worktree M1.3 tidak diklaim. Audit kontras formal, screen reader, Safari/Firefox, perangkat fisik dan kamera nyata belum dijalankan.

## Security verification

Tes API menolak token order sebagai otoritas aktivasi, customer memalsukan paid/issued, login hotspot salah, search/recovery/incident di luar assignment, dan operasi staf oleh mitra. QR hasil scan tetap melewati validasi kredensial server. Sesi staf, CSRF dan origin check tetap berlaku. Audit lokal bukan audit tahan manipulasi produksi.

## Known limitations

JSON satu proses bukan database bersama. Browser tidak membaca SSID/MAC atau mengubah router; kamera/BarcodeDetector bergantung dukungan dan izin. Captive popup otomatis membutuhkan integrasi router. Harga, stok, trafik, lokasi dan nomor adalah contoh sintetis. Rumus komisi, pajak/biaya dan jadwal payout belum diputuskan.

## D1–D7 status

| Gate | Status dan kebutuhan produksi |
|---|---|
| D1 Komersial | **Terbuka:** harga/rate resmi, basis, biaya, pajak, refund, pencairan |
| D2 Kode voucher | **Terbuka:** sumber/import, format, audit dan rekonsiliasi stok nyata |
| D3 Mayar | **Terbuka:** kontrak API, sandbox, webhook dan rekonsiliasi |
| D4 MikroTik/RADIUS/captive | **Terbuka:** survei router, topologi, login, walled garden, uji perangkat |
| D5 Identitas produksi | **Terbuka:** MFA, recovery dan kebijakan akun/assignment |
| D6 WhatsApp | **Terbuka:** provider, template, consent, retry dan retensi |
| D7 Hosting/ops | **Terbuka:** domain/TLS, secrets, backup, observability, rollback |

## Demo start and reset

Node `>=22.22.0`; dari root jalankan `npm install` lalu `npm run dev`; buka `http://127.0.0.1:5173/`. Password awal lokal ada di `.local/server/INITIAL_ACCOUNTS.md`, tidak dicetak di sini. Owner membuka **Kontrol demo → Reset data demo → Ya, reset data sintetis**. Reset domain tidak menghapus akun. Jalankan hanya satu API terhadap data directory yang sama. Naskah 5–7 menit ada di [DEMO_SCRIPT.md](../DEMO_SCRIPT.md).

**MVP V2 presentation readiness DOES NOT equal production readiness.**

## Local presentation baseline freeze

Baseline commit: commit lokal yang memuat dokumen ini (`git rev-parse HEAD` pada checkout beku). SHA final dicatat dalam laporan freeze; SHA commit tidak dapat ditanam secara literal ke dalam commit yang sama.

QA date: 26 September 2026.

Browser result: **64/64 lulus** dalam satu run penuh (12,6 menit) dengan `EVIDENCE_DIR=.local/freeze-evidence`, sehingga screenshot hasil run tidak masuk Git. Run awal gagal saat Windows membuka file screenshot pada lokasi bukti lama; kasus 768 px lulus saat output dipindah ke `.local`, kemudian run penuh lulus.

Domain result: **25/25 lulus** melalui `npm run test:domain`.

Server result: **23/23 lulus** melalui `npm run test:server`.

Build result: **lulus** melalui `npm run build`, termasuk typecheck. `git diff --check` dan `node .local/verify-artifacts.mjs` juga lulus sebelum commit. Artefak runtime, kredensial lokal, dan bukti browser baru diabaikan Git; screenshot QA lama yang sudah terlacak tetap pada revisi sebelumnya tanpa perubahan di commit baseline.
