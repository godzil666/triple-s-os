# Production Readiness — Setelah Demo

Dokumen ini bukan klaim kesiapan produksi. Ini daftar gate yang masih diperlukan setelah demo tahap 6 (13 September 2026) dan setelah membaca `Validasi dan Ceklis Prototype PT SSS.docx`.

## Perubahan build production

`vite build` memakai mode production: banner, role switcher, kontrol skenario, dan kontrol transaksi demo tidak ditampilkan. Checkout, detail order, dan portal hotspot menampilkan status belum dikonfigurasi sampai backend/database, Mayar, WhatsApp, serta adaptor hotspot tersedia. Development tetap menyediakan fixture untuk QA melalui `npm run dev`; jangan memakai data fixture sebagai data operasional.

## Delta dari checklist PT SSS

- **Sudah tercatat:** pembayaran terpusat ke owner sebagai arah bisnis; 50 titik server; pilot awal Girijaya dengan SSID/server Sizinet dan paket uji Rp5.000; voucher customer tanpa akun; ekspor CSV disebut sebagai kebutuhan.
- **Masih terbuka:** pemilik dan kebijakan akun produksi, provider/hotspot per mitra, apakah satu provider memiliki banyak lokasi, aturan voucher lintas hotspot, expiry setelah pembelian, refund dan webhook Mayar, jumlah voucher pilot, detail akses teknis, serta keputusan white-label.
- **Belum diimplementasikan sebagai integrasi:** ekspor CSV operasional, provider Mayar, queue WhatsApp, captive portal/MikroTik, database bersama, backup/restore, dan observability. Poin ini membutuhkan keputusan/access client dan tidak boleh digantikan fixture lokal.

## Gate 1 — Bisnis

Tetapkan harga, paket bulanan, durasi/perangkat, basis dan rate bagi hasil, biaya provider, refund, pajak, pencairan, serta rekonsiliasi stok offline. Pisahkan margin offline dan komisi online; nilai saat ini adalah fixture/asumsi demo.

## Gate 2 — Survei satu titik

Dengan teknisi, catat model/RouterOS, topologi, lokasi HotSpot, sumber voucher (router/RADIUS/Mikhmon), format login, device binding, MAC privat/acak, concurrency, walled garden, akses checkout sebelum login, domain/HTTPS, dan perangkat uji. Jangan mengirim credential/secret ke chat.

## Gate 3 — Fondasi produksi

Rancang backend/database bersama, autentikasi owner/mitra, otorisasi server per mitra, guest order access, secret management, rate limiting, CSRF/session policy, audit tahan manipulasi, retention, backup/restore, observability, dan rollback. JSON lokal serta guard demo bukan pengganti rancangan ini.

## Gate 4 — Integrasi

Gunakan payment sandbox dengan callback tervalidasi, idempotensi, rekonsiliasi paid-but-not-issued, dan retry. Integrasikan WhatsApp dengan queue/retry. Bangun adaptor MikroTik di backend hanya setelah survei disetujui. Uji captive portal/pre-login pada perangkat nyata; browser tidak dapat memilih WiFi.

## Gate 5 — Pilot

Mulai satu site dengan observability, backup, rollback, dukungan insiden, rekonsiliasi, dan metrik. Verifikasi pembelian sebelum login hotspot, login pertama, reconnect, penggantian perangkat, expiry, dan recovery. Fixture 50 mitra bukan bukti kapasitas produksi.

## Larangan

Jangan memasukkan credential router, data customer nyata, secret provider, atau konfigurasi MikroTik ke demo. Jangan mengklaim pembayaran, WhatsApp, koneksi WiFi, monitoring, atau captive portal sudah nyata. Jangan deploy demo sebagai layanan produksi.
