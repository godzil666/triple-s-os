# Local authentication and voucher portal implementation plan

**Goal:** login staf yang ditegakkan server dan portal satu kode voucher offline dengan koneksi WiFi tetap simulasi.
**Architecture:** backend Node lokal menjadi otoritas akun/sesi/data sintetis; React memakai proyeksi API sesuai peran. Domain voucher tahap 2 dipakai ulang. Tidak menghubungkan router/deploy.
**Stack:** React/TypeScript/Vite/npm yang ada; Node http/crypto/fs, tanpa SDK integrasi.
**Spec:** `docs/AUTH_CAPTIVE_PORTAL_PLAN.md`, pilihan backend lokal, satu kode, matriks owner/admin/mitra telah disetujui user.

## Urutan pelaksanaan

1. [x] Tulis tes HTTP nyata untuk login/cookie/logout, akses anonim, scope mitra, admin vs owner, anti-CSRF/rate limit, dan portal voucher/expiry. `tests/server/auth.test.mjs`.
2. [x] Implementasikan `server/accounts.ts`, `server/application.ts`, `server/authorization.ts`, `server/runtime.ts` dan persistensi lokal. Akun awal berpassword acak disimpan dalam file lokal, bukan bundle/browser. Sesi tidak mengikuti clock demo.
3. [x] Implementasikan adapter HTTP dan AuthProvider, guard route, login/logout, pemisahan admin/owner, serta halaman akun owner. Data anonim tidak memuat stok/order/komisi. Putus role switch bebas dan akses customer ke kontrol simulasi.
4. [x] Buat portal `/wifi` dan `/wifi/:siteId/login`: pilih mitra manual, satu kode, status/expiry/logout; cookie sesi hotspot terpisah. Tidak membaca MAC/SSID nyata. Server mengembalikan satu hasil voucher yang telah dibuktikan kepemilikannya lewat kode.
5. [x] Sesuaikan tooling dev backend+Vite, build/typecheck, tes lama yang sengaja berubah akibat autentikasi, dan tes browser auth/portal pada 360/768/1440.
6. [x] Jalankan tes domain lama, tes server dan browser, inspeksi screenshot, cek kebocoran data/bundle. Perbarui PROGRESS dan petunjuk akun/start/reset. Berhenti pada lingkup tambahan ini. Hasil lintas run dan timeout pengulangan penuh dicatat transparan di `docs/verification/auth-hotspot/RESULTS.md`.

## Ketentuan

- Simpan data sintetis baru di `.local/server/`, jangan impor/menimpa localStorage lama diam-diam.
- Backend hanya bind loopback. Cookie HttpOnly + SameSite, pemeriksaan Origin/CSRF, password hash, expiry sesi, rate limit, penolakan izin default. Penggunaan jaringan/produksi memerlukan HTTPS dan verifikasi tambahan.
- Customer tidak mendapat daftar voucher/order. Mitra tidak bisa memilih scope milik mitra lain. Admin tidak mengelola akun atau menaikkan role sendiri.
- UI/gaya dan aset asli tetap; redirect otomatis captive portal hanya simulasi sampai uji router diminta.
- Tidak membuat checkout/integrasi pembayaran/WhatsApp atau mengonfigurasi router.
