# Triple S OS

Aplikasi customer, mitra, dan owner/admin untuk pengelolaan layanan WiFi PT. Sahabat Sinyal Sejahtera. Build production menyembunyikan kontrol demo dan menahan transaksi, portal hotspot, serta notifikasi sampai provider dan infrastruktur produksi dikonfigurasi.

## Menjalankan demo lokal

Prasyarat: Node.js 22.22.0 atau lebih baru (sesuai `engines` di `package.json`).

```powershell
npm install
npm run dev
```

Buka `http://127.0.0.1:5173/`. Backend lokal berada di `127.0.0.1:8787`. Untuk build dan preview:

```powershell
npm run build
npm run preview
```

`npm run dev` memakai fixture lokal untuk QA dan presentasi MVP V2. Pemilik dapat memakai **Kontrol demo** untuk mensimulasikan pembayaran, penerbitan voucher, dan notifikasi. Customer membeli dari hotspot pilihan, memperoleh kode/QR voucher, lalu login melalui portal hotspot; token pesanan tidak mengaktifkan voucher. Admin hanya melihat hotspot yang ditugaskan owner. Build production menyembunyikan kontrol demo dan menahan alur yang masih memerlukan Mayar, WhatsApp, database bersama, atau adaptor MikroTik. Build itu belum menjadi sistem produksi yang beroperasi.

Akun staf lokal dibuat otomatis saat pertama kali server menyala. Password awal acak tersimpan di `.local/server/INITIAL_ACCOUNTS.md`; file ini privat dan tidak boleh dibagikan. Alur presentasi ada di [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) dan instruksi akun ada di [docs/AUTH_LOCAL.md](docs/AUTH_LOCAL.md).

## Verifikasi

```powershell
npm run typecheck
npm run build
npm run test:domain
npm run test:server
npm run test:browser
```

Bukti screenshot/JSON ada di `docs/verification/`. Hasil browser yang terhenti atau timeout harus dicatat sebagai inconclusive, bukan lulus.

## Reset, fixture aman, dan batas lingkungan

Gunakan kontrol reset demo setelah konfirmasi hanya pada development. Data yang dipakai sintetis. Pembayaran, WhatsApp, monitoring, identitas perangkat, SSID, koneksi WiFi, dan MikroTik belum terintegrasi. JSON lokal bukan database produksi, autentikasi lokal belum di-hardening, dan portal tidak menjamin akses internet/captive portal nyata.

Reset: login sebagai owner, buka **Kontrol demo**, pilih reset, lalu konfirmasi. Reset hanya state sintetis; akun staf/assignment tidak dihapus. Fixture berisi 50 mitra fiktif, 51 hotspot sintetis (dua di Cisaat), paket contoh, batch voucher sintetis (kode tunggal serta satu contoh username/password), order dan telemetri demo. Password awal tidak dimasukkan ke bundle atau dokumentasi presentasi.

Checklist menuju pilot ada di [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md) dan [docs/conqueror/MVP_V2_READINESS.md](docs/conqueror/MVP_V2_READINESS.md). Aplikasi ini adalah demo lokal: tidak mengirim pesan atau pembayaran, tidak mengubah router, dan tidak memproses data pelanggan nyata. Tidak ada secret provider di bundle.
