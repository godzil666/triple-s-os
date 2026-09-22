# Tahap 3 — Alur customer

**Goal:** Pembelian voucher sampai aktivasi simulasi tanpa akun customer, memakai services/store yang ada.
**Architecture:** Adapter customer server memanggil service domain yang sama, mengekspor katalog tanpa rate privat dan satu detail berdasarkan token acak. Checkout idempoten di store; UI tidak membuat order dari effect/refresh. Site/perangkat tetap mock. Tidak mengubah dashboard tahap 4–5 atau integrasi.
**Stack:** React/TypeScript/Vite, Node lokal, npm, Chromium Playwright yang sudah tersedia.
**Spec:** PROJECT_BRIEF bagian 10 dan permintaan tahap 3 user; AUTH_LOCAL mempertahankan akses staf.

- [x] Tes HTTP: validasi/normalisasi, checkout paralel/retry/persistensi, token tidak dapat ditebak, anonimitas dan scope, paid/provisioning/WA terpisah, aktivasi kemudian/device/concurrency.
- [x] Domain: kontak Indonesia, optional kunci checkout dan token factory, override hasil mock per operasi tanpa mengubah skenario global.
- [x] Server/customer.ts dan kontrak customer: katalog, create, detail, pay/issue/notify/connect/disconnect; hanya order yang dibuktikan token, konteks perangkat cookie mock. Tidak ada pencarian WA.
- [x] UI paket/checkout dengan form-review-metode simulasi dan ringkasan syarat; persistensi draft/key/token per tab; UI detail status, preview WhatsApp, retry, koneksi mock, error dan expiry.
- [x] Browser: alur sukses, gagal/timeout, provisioning gagal/tertunda, WhatsApp gagal, refresh, pembelian sebelum tiba, site/device/slot; responsive dan keyboard.
- [x] Typecheck, domain/server tests, build; review keamanan guest endpoint, visual dan dokumentasi PROGRESS. Berhenti tahap 3.

Token adalah bearer link demo, bukan akun customer. Jangan kirim rahasia/nomor ke layanan eksternal. Metode pembayaran hanya ilustrasi non-QR, tanpa payload yang bisa ditransaksikan. Pilihan jumlah perangkat berasal dari paket, tidak bebas diketik. Harga dan aturan di-review kembali server sebelum membuat order; snapshot historis tetap.

