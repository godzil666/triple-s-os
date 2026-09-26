# Login lokal dan portal voucher WiFi

Tambahan yang disetujui setelah tahap 2, 10 September 2026. Login staf menggunakan backend lokal sungguhan; voucher, SSID, perangkat, monitoring, dan koneksi internet tetap simulasi. UI dan aset yang sudah disetujui dipertahankan.

> Pembaruan MVP V2: portal kini terikat hotspot, QR voucher memakai satu kode, dan token order hanya membaca detail. Aktivasi memerlukan kredensial melalui `/api/hotspot/login`. Admin dibatasi assignment hotspot; pengelolaan katalog global dan akun ada pada owner. Lihat [MVP_V2_READINESS.md](conqueror/MVP_V2_READINESS.md).

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
| Customer | `/wifi`, `/wifi/hotspot/:hotspotId/login`, alias lama `/wifi/:siteId/login`, tautan detail order acak | Login WiFi demo menerima kode tunggal/QR atau username/password untuk fixture yang sesuai; tidak mempunyai sesi staf atau daftar stok privat |
| Mitra | `/mitra-dashboard` | Data mitra pada akunnya; tidak bisa memilih identitas mitra lain |
| Admin | `/admin` | Operasi hanya pada hotspot yang ditugaskan owner; tidak mengelola akun, katalog global, atau masuk area owner |
| Owner | `/owner`, `/owner/akun` | Seluruh akses yang tersedia, akun staf, kontrol skenario/reset |

Login staf di `/login`. Peran berasal dari akun server; navigasi staf bukan role switch bebas. Halaman akun owner dapat membuat akun, mengganti password, mengaktifkan/menonaktifkan akun lain. Menonaktifkan diri sendiri atau owner aktif terakhir ditolak. Perubahan password/status membatalkan sesi lama. Identitas/peran akun yang sudah dibuat tidak dapat diedit; buat akun pengganti sesuai kebutuhan.

Dashboard owner, admin, dan mitra sudah memiliki alur operasional demo. Stok offline bersifat sintetis; hanya owner memiliki akses ke kredensial stok contoh. Admin melihat ringkasan stok yang ditugaskan, mitra melihat ringkasan tanpa secret. Alokasi batch bukan bukti pembayaran.

## Review manual

1. Untuk alur online, mulai dari captive hotspot atau beranda, buat order customer hingga selesai. Pembayaran hanya dapat disimulasikan dari **Kontrol demo** oleh owner; halaman customer memperbarui status dan menampilkan voucher sesudah provisioning.
2. Untuk voucher offline, buka `/wifi/hotspot/hotspot-site-demo-cisaat/login`, pilih Voucher atau Member, lalu gunakan fixture pada stok owner. Kredensial itu hanya contoh lokal.
3. Login voucher yang berhasil memulai timer domain; membeli/melihat kode tidak memulai timer. Refresh/reconnect mempertahankan expiry. Coba voucher di hotspot lain pada lokasi sama: harus ditolak. Token detail order tidak dapat mengaktifkan voucher.
4. Cookie perangkat mewakili satu profil browser. Profil lain dianggap perangkat berbeda; voucher reguler yang sudah terikat menolak perangkat kedua. Ini bukan pengenalan perangkat fisik.
5. Coba URL `/owner`, `/admin`, dan `/mitra-dashboard` tanpa sesi staf: diarahkan ke login. Login mitra lalu coba owner: akses ditolak. Login admin: pengelolaan akun ditolak.
6. Owner membuka **Akun staf**, menugaskan admin ke hotspot tertentu, lalu login admin di profil lain. Hotspot lain tidak muncul pada proyeksi/search; perubahan assignment mencabut sesi lama. Buat akun mitra lain dan verifikasi tenant tetap terpisah.
7. Coba logout staf; jika jaringan gagal, pesan kegagalan muncul dan UI tetap menunjukkan sesi. Ulangi setelah backend tersedia. Logout WiFi terpisah dari logout staf.
8. Owner dapat membuka **Kontrol demo** untuk memajukan clock dan menguji expiry. Reset meminta konfirmasi, mengganti data sintetis/kode offline dan menghapus sesi hotspot; akun/password/sesi staf tidak ikut direset.
9. Periksa pada lebar 360/768/1440 px dengan Tab, Shift+Tab, Enter, Escape. Pastikan form, pesan error, dialog password, menu mobile, fokus dan tabel dapat dipakai tanpa overflow halaman.

## Data, sesi, dan pemulihan

- `.local/server/accounts.json`: hash scrypt, identitas dan assignment akun. `.local/server/demo-state.json`: envelope sintetis berversi/checksum. Migrasi V1 membuat salinan satu kali `demo-state.v1.backup.json` sebelum write V2. `.local/server/device-secret.json`: kunci tanda tangan cookie perangkat. `.local/server/hotspot-sessions.json`: sesi portal per perangkat mock. Semua di luar bundle, juga ditolak oleh server file Vite.
- Browser membaca proyeksi API sesuai sesi. Customer tidak menerima stok, voucher lain, order, komisi, atau audit privat. Semua angka domain tetap berasal dari satu store server. localStorage tahap 2 lama tidak diimpor, ditimpa, atau dijadikan otoritas.
- Cookie staf HttpOnly/SameSite=Strict. Sesi disimpan di memori server, idle 30 menit berdasarkan permintaan dan maksimum 8 jam, memakai waktu nyata. Polling tab aktif memperpanjang idle; clock demo tidak memperpanjang sesi staf. Restart backend mengakhiri sesi staf.
- API memeriksa izin per operasi/objek, Origin, CSRF untuk mutasi staf, pembatasan percobaan login, serta versi akun. Cookie Secure disiapkan sebagai opsi server, tidak digunakan pada HTTP loopback ini.
- Sesi hotspot dan identitas perangkat mock bertahan setelah restart selama file lokal dan cookie dipertahankan. Menghapus cookie/profil baru membuat perangkat mock baru; reguler lama tetap terikat pada identitas sebelumnya.
- Envelope state yang tidak valid menghentikan startup dengan `DEMO_STATE_INVALID`. File tidak dihapus/diganti otomatis dan kode fixture tidak disajikan. Hentikan proses, buat backup folder, lalu pulihkan backup yang valid. Jika sengaja ingin mulai demo baru, arsipkan `demo-state.json` DAN `hotspot-sessions.json` secara manual sebelum restart; kode lama tidak berlaku pada demo baru. Jangan menghapus akun atau kunci tanpa tujuan yang jelas.
- Sejak tahap 3, kegagalan penyimpanan state menolak operasi dengan `PERSISTENCE_UNAVAILABLE` sebelum perubahan dipublikasikan. UI customer meminta perbaikan penyimpanan lalu retry pada transaksi yang sama. JSON lokal tetap bukan database transaksional multiproses.

## Batas yang tetap berlaku

Tidak membaca SSID/MAC browser, mengubah WiFi perangkat, memasang captive portal/router, atau membuka internet. Hotspot dipilih manual atau dari link konfigurasi mock. Popup otomatis sesudah memilih WiFi membutuhkan konfigurasi HotSpot/router serta pengujian Android/iOS/laptop; tidak dijanjikan pada setiap reconnect.

Pembayaran, provisioning, WhatsApp, monitoring, harga/rate dan data pelanggan tetap sintetis. Kontrol pembayaran demo ada pada owner dan recovery scoped pada admin, bukan customer capability link; tautan customer hanya membaca status. Login/putus sesi WiFi dilakukan melalui portal voucher, bukan token order. Margin offline tidak menjadi komisi online; snapshot harga/rate dan aturan expiry/device/concurrency tetap dipakai. Clock domain manual tidak berjalan seperti jam internet nyata. Tautan order customer memakai token acak, bukan pencarian berdasarkan nomor WA.

Autentikasi lokal ini bukan klaim kesiapan produksi. Penggunaan jaringan memerlukan HTTPS, database/persistensi dan sesi yang sesuai, pengelolaan rahasia, audit operasional, backup, kebijakan akun/password, dan validasi integrasi router. Tidak ada reset password email, MFA, SSO, atau self-registration. Pemilik akses filesystem lokal dapat membaca rahasia/data lokal. Belum diuji di Safari/Firefox, perangkat fisik atau pembaca layar.

## Verifikasi otomatis

`npm run typecheck`, `npm run test:domain`, `npm run test:server`, `npm run build`, `npm run test:browser`.

Playwright memakai backend terpisah 8788, frontend 5174, direktori `.local/auth-browser-tests`; reset pengujian tidak menyentuh `.local/server`. Hasil dan screenshot ada di [verification/auth-hotspot](verification/auth-hotspot/RESULTS.md).
