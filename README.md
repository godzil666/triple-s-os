# Triple S OS

Aplikasi customer, mitra, dan owner/admin untuk pengelolaan layanan WiFi PT. Sahabat Sinyal Sejahtera. Build production menyembunyikan kontrol demo dan menahan transaksi, portal hotspot, serta notifikasi sampai provider dan infrastruktur produksi dikonfigurasi.

## Menjalankan

Prasyarat: Node.js 22 atau lebih baru.

```powershell
npm install
npm run dev
```

Buka `http://127.0.0.1:5173/`. Backend lokal berada di `127.0.0.1:8787`. Untuk build dan preview:

```powershell
npm run build
npm run preview
```

`npm run dev` memakai fixture lokal untuk QA dan presentasi internal. Build/deploy production menggunakan `VITE_APP_MODE=production` (mode ini otomatis aktif saat `vite build`) dan tidak menampilkan banner, role switcher, kontrol skenario, atau aksi pembayaran simulasi.

Akun demo dan cara login ada di `docs/AUTH_LOCAL.md`.

## Verifikasi

```powershell
npm run typecheck
npm run build
npm run test:domain
npm run test:server
npx playwright test tests/stage3.spec.ts tests/stage4.spec.ts tests/stage5.spec.ts tests/stage6.spec.ts tests/auth-hotspot.spec.ts
```

Bukti screenshot/JSON ada di `docs/verification/`. Hasil browser yang terhenti atau timeout harus dicatat sebagai inconclusive, bukan lulus.

## Reset, fixture aman, dan batas lingkungan

Gunakan kontrol reset demo setelah konfirmasi hanya pada development. Data yang dipakai sintetis. Pembayaran, WhatsApp, monitoring, identitas perangkat, SSID, koneksi WiFi, dan MikroTik belum terintegrasi. JSON lokal bukan database produksi, autentikasi lokal belum di-hardening, dan portal tidak menjamin akses internet/captive portal nyata.

Reset: login sebagai owner, buka **Kontrol demo**, pilih reset, lalu konfirmasi. Reset hanya state sintetis; akun staf tidak dihapus. Fixture berisi 50 mitra fiktif, paket contoh, batch kode sintetis, order dan monitoring mock. Password awal ada di `.local/server/INITIAL_ACCOUNTS.md` dan tidak dimasukkan ke bundle atau dokumentasi presentasi.

Checklist menuju pilot ada di `docs/PRODUCTION_READINESS.md`. Build production tetap memerlukan backend/database bersama, payment provider, WhatsApp queue, dan adaptor hotspot sebelum operasi nyata. Tidak ada secret provider di bundle.
