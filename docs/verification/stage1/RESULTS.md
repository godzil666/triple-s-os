# Bukti verifikasi tahap 1

9 September 2026 · Triple S OS · demo lokal.

- `npm run build`: exit 0; mencakup TypeScript dan Vite production build.
- `npm run test:stage1`: exit 0; **7 passed (3.1m)**.
- Run browser final: Playwright 1.63.0, Chrome for Testing 153.0.8010.12 / Chromium 1243, path executable diberikan melalui `PLAYWRIGHT_CHROMIUM_EXECUTABLE`. Pengujian memakai browser nyata dalam mode headless. Bukan pemeriksaan DOM tanpa render.
- 20 route diuji pada masing-masing 360, 768, 1440 px; tidak ada overflow horizontal halaman atau error JavaScript.
- Interaksi: pencarian, filter, empty recovery, pilihan mitra, refresh route, peran, konteks mitra, menu HP, keyboard, dialog/Escape dan pemulihan fokus lulus.
- Tidak ada field tanpa label atau request eksternal pada halaman utama customer/mitra/owner.
- Review visual langsung pada sembilan screenshot tiga layout × tiga viewport: tata letak, pemenggalan teks, sidebar/menu HP, tabel dan batas halaman.
- Safari/Firefox, perangkat fisik dan pembaca layar belum diuji. Snapshot bukan bukti koneksi atau transaksi produksi.

| Tampilan | 360 px | 768 px | 1440 px |
|---|---|---|---|
| Customer | [Screenshot](customer-360.png) | [Screenshot](customer-768.png) | [Screenshot](customer-1440.png) |
| Mitra | [Screenshot](mitra-dashboard-360.png) | [Screenshot](mitra-dashboard-768.png) | [Screenshot](mitra-dashboard-1440.png) |
| Owner | [Screenshot](admin-360.png) | [Screenshot](admin-768.png) | [Screenshot](admin-1440.png) |

[Fokus keyboard pada skip link](keyboard-focus.png). Screenshot disimpan ulang oleh tes final; data lokasi adalah fiktif.

Kendala awal dan perbaikan sebelum hasil akhir: binary browser belum terpasang, path subset font tidak tersedia, timeout tes 20 navigasi, putaran fokus dialog dan spasi heading tablet. Detail ada di [PROGRESS.md](../../PROGRESS.md). Tidak ada kegagalan tersisa pada pengujian tahap 1 yang dijalankan.
