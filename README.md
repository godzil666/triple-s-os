# Triple S OS

Demo lokal untuk monitoring dan pengelolaan voucher WiFi PT. Sahabat Sinyal Sejahtera dengan sudut pandang customer, mitra, dan owner/admin.

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

## Reset, fixture aman, dan batas demo

Gunakan kontrol reset demo setelah konfirmasi. Data yang dipakai sintetis. Pembayaran, WhatsApp, monitoring, identitas perangkat, SSID, koneksi WiFi, dan MikroTik masih disimulasikan. JSON lokal bukan database produksi, autentikasi lokal belum di-hardening, dan demo tidak menjamin akses internet/captive portal nyata.

Reset: login sebagai owner, buka **Kontrol demo**, pilih reset, lalu konfirmasi. Reset hanya state sintetis; akun staf tidak dihapus. Fixture berisi 50 mitra fiktif, paket contoh, batch kode sintetis, order dan monitoring mock. Password awal ada di `.local/server/INITIAL_ACCOUNTS.md` dan tidak dimasukkan ke bundle atau dokumentasi presentasi.

Urutan menuju pilot ada di `docs/PRODUCTION_READINESS.md`. Demo tidak siap produksi dan tidak mengirim pesan, memproses pembayaran, memilih WiFi, membaca MAC/SSID, atau mengubah router.
