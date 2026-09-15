# Login lokal dan portal voucher WiFi

Tambahan yang disetujui setelah tahap 2, 10 September 2026. Login staf menggunakan backend lokal sungguhan; voucher, SSID, perangkat, monitoring, dan koneksi internet tetap simulasi. UI dan aset yang sudah disetujui dipertahankan.

> Pembaruan tahap 3: pembelian customer tanpa akun, token order acak, preview WhatsApp dan aktivasi online simulasi kini tersedia. Lihat [STAGE3_CUSTOMER.md](STAGE3_CUSTOMER.md). Pernyataan batas checkout lama di bawah digantikan oleh pembaruan ini; seluruh integrasi tetap simulasi.

## Menjalankan aplikasi

Gunakan Node sesuai `package.json` (diverifikasi dengan Node 24.20.0), lalu dari root repository:

```powershell
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173/`. Backend hanya mendengarkan loopback `127.0.0.1:8787`. `npm run dev` menunggu backend siap sebelum membuka frontend. Jangan menjalankan dua backend terhadap direktori data yang sama. `npm run build` menghasilkan bundle; `npm run preview` menjalankan preview lokal pada port 4173 bersama backend. Tidak ada deploy.

## Akun awal dan akses

Bootstrap pertama membuat `owner`, `admin`, dan `mitra.cisaat`. Password acak masing-masing ada di [file akun awal](../.local/server/INITIAL_ACCOUNTS.md), hanya pada komputer lokal. File ini berisi rahasia bootstrap: jangan unggah atau bagikan folder `.local`. Password tidak ada dalam source/bundle frontend. File akun awal tidak diperbarui ketika password diganti; gunakan password terbaru sesudah perubahan.

| Peran | Halaman | Hak |
|---|---|---|
| Customer | `/wifi`, `/wifi/:siteId/login` | Satu kode voucher; tidak mempunyai sesi staf atau daftar stok privat |
| Mitra | `/mitra-dashboard` | Data mitra pada akunnya; tidak bisa memilih identitas mitra lain |
| Admin | `/admin` | Operasional lintas mitra; tidak mengelola akun atau masuk area owner |
| Owner | `/owner`, `/owner/akun` | Seluruh akses yang tersedia, akun staf, kontrol skenario/reset |

Login staf di `/login`. Peran berasal dari akun server; navigasi staf bukan role switch bebas. Halaman akun owner dapat membuat akun, mengganti password, mengaktifkan/menonaktifkan akun lain. Menonaktifkan diri sendiri atau owner aktif terakhir ditolak. Perubahan password/status membatalkan sesi lama. Identitas/peran akun yang sudah dibuat tidak dapat diedit; buat akun pengganti sesuai kebutuhan.

Dashboard operasional tahap berikutnya masih placeholder. Halaman stok offline hanya daftar/copy kode untuk pengujian portal, bukan implementasi lengkap alokasi atau penjualan stok. Owner dapat melihat stok di `/owner/stok`; admin di `/admin/stok`; mitra di `/mitra-dashboard/stok`.

## Review manual

1. Login owner. Buka stok offline, pilih Mitra Cisaat, salin kode berstatus belum dipakai. Kode baru acak, berbeda dari fixture deterministik pengujian domain.
2. Buka jendela privat sebagai customer. Pilih **Masuk WiFi** → mitra Cisaat, atau buka `/wifi/site-demo-cisaat/login`. Halaman menampilkan `SSS-DEMO-CISAAT` dari konfigurasi sintetis.
3. Masukkan satu kode. Login yang berhasil memulai timer domain; membeli/melihat kode tidak memulai timer. Refresh/reconnect mempertahankan expiry. Coba kode Cisaat pada Cibadak: harus ditolak.
4. Cookie perangkat mewakili satu profil browser. Profil lain dianggap perangkat berbeda; voucher reguler yang sudah terikat menolak perangkat kedua. Ini bukan pengenalan perangkat fisik.
5. Coba URL `/owner`, `/admin`, dan `/mitra-dashboard` tanpa sesi staf: diarahkan ke login. Login mitra lalu coba owner: akses ditolak. Login admin: pengelolaan akun ditolak.
6. Owner membuka **Akun staf**, membuat mitra untuk site lain, lalu login akun itu di profil lain. Nonaktifkan dari owner, refresh profil mitra: sesi harus tidak berlaku lagi.
7. Coba logout staf; jika jaringan gagal, pesan kegagalan muncul dan UI tetap menunjukkan sesi. Ulangi setelah backend tersedia. Logout WiFi terpisah dari logout staf.
8. Owner dapat membuka **Kontrol demo** untuk memajukan clock dan menguji expiry. Reset meminta konfirmasi, mengganti data sintetis/kode offline dan menghapus sesi hotspot; akun/password/sesi staf tidak ikut direset.
9. Periksa pada lebar 360/768/1440 px dengan Tab, Shift+Tab, Enter, Escape. Pastikan form, pesan error, dialog password, menu mobile, fokus dan tabel dapat dipakai tanpa overflow halaman.

## Data, sesi, dan pemulihan

- `.local/server/accounts.json`: hash scrypt dan identitas akun. `.local/server/demo-state.json`: envelope sintetis berversi/checksum. `.local/server/device-secret.json`: kunci tanda tangan cookie perangkat. `.local/server/hotspot-sessions.json`: sesi portal per perangkat mock. Semua di luar bundle, juga ditolak oleh server file Vite.
- Browser membaca proyeksi API sesuai sesi. Customer tidak menerima stok, voucher lain, order, komisi, atau audit privat. Semua angka domain tetap berasal dari satu store server. localStorage tahap 2 lama tidak diimpor, ditimpa, atau dijadikan otoritas.
- Cookie staf HttpOnly/SameSite=Strict. Sesi disimpan di memori server, idle 30 menit berdasarkan permintaan dan maksimum 8 jam, memakai waktu nyata. Polling tab aktif memperpanjang idle; clock demo tidak memperpanjang sesi staf. Restart backend mengakhiri sesi staf.
- API memeriksa izin per operasi/objek, Origin, CSRF untuk mutasi staf, pembatasan percobaan login, serta versi akun. Cookie Secure disiapkan sebagai opsi server, tidak digunakan pada HTTP loopback ini.
- Sesi hotspot dan identitas perangkat mock bertahan setelah restart selama file lokal dan cookie dipertahankan. Menghapus cookie/profil baru membuat perangkat mock baru; reguler lama tetap terikat pada identitas sebelumnya.
- Envelope state yang tidak valid menghentikan startup dengan `DEMO_STATE_INVALID`. File tidak dihapus/diganti otomatis dan kode fixture tidak disajikan. Hentikan proses, buat backup folder, lalu pulihkan backup yang valid. Jika sengaja ingin mulai demo baru, arsipkan `demo-state.json` DAN `hotspot-sessions.json` secara manual sebelum restart; kode lama tidak berlaku pada demo baru. Jangan menghapus akun atau kunci tanpa tujuan yang jelas.
- Sejak tahap 3, kegagalan penyimpanan state menolak operasi dengan `PERSISTENCE_UNAVAILABLE` sebelum perubahan dipublikasikan. UI customer meminta perbaikan penyimpanan lalu retry pada transaksi yang sama. JSON lokal tetap bukan database transaksional multiproses.

## Batas yang tetap berlaku

Tidak membaca SSID/MAC browser, mengubah WiFi perangkat, memasang captive portal/router, atau membuka internet. Site dipilih manual atau dari link konfigurasi mock. Popup otomatis sesudah memilih WiFi membutuhkan konfigurasi HotSpot/router serta pengujian Android/iOS/laptop; tidak dijanjikan pada setiap reconnect.

Pembayaran, provisioning, WhatsApp, monitoring, harga/rate dan data pelanggan tetap sintetis. Margin offline tidak menjadi komisi online; snapshot harga/rate dan aturan expiry/device/concurrency tahap 2 tetap dipakai. Clock domain manual tidak berjalan seperti jam internet nyata. Login kode pada `/wifi` dibatasi voucher offline; voucher online tahap 3 disambungkan dari tautan detail pesanan tanpa mengetik ulang kode.

Autentikasi lokal ini bukan klaim kesiapan produksi. Penggunaan jaringan memerlukan HTTPS, database/persistensi dan sesi yang sesuai, pengelolaan rahasia, audit operasional, backup, kebijakan akun/password, dan validasi integrasi router. Tidak ada reset password email, MFA, SSO, atau self-registration. Pemilik akses filesystem lokal dapat membaca rahasia/data lokal. Belum diuji di Safari/Firefox, perangkat fisik atau pembaca layar.

## Verifikasi otomatis

`npm run typecheck`, `npm run test:domain`, `npm run test:server`, `npm run build`, `npm run test:browser`.

Playwright memakai backend terpisah 8788, frontend 5174, direktori `.local/auth-browser-tests`; reset pengujian tidak menyentuh `.local/server`. Hasil dan screenshot ada di [verification/auth-hotspot](verification/auth-hotspot/RESULTS.md).
