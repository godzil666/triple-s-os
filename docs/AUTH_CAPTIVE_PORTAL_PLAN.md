# Login voucher offline dan akses staf — rancangan dan keputusan

Tanggal: 10 September 2026. Status: **lingkup disetujui dan diimplementasikan**: backend lokal, satu kode voucher, matriks owner/admin/mitra. Petunjuk aktual ada di [AUTH_LOCAL.md](AUTH_LOCAL.md); hasil verifikasi di [PROGRESS.md](PROGRESS.md). Ini permintaan tambahan setelah tahap 2, bukan penyelesaian tahap 3–6 atau izin deploy. Bagian audit dan opsi berikut merekam kondisi sebelum implementasi.

## Kebutuhan user

1. Customer yang membeli voucher offline dapat memasukkan voucher pada halaman login WiFi yang menampilkan SSID, sesudah perangkat terhubung otomatis atau dipilih manual melalui pengaturan WiFi.
2. Mitra, admin, dan owner mempunyai login sehingga customer tidak dapat mengakses dashboard mereka.
3. UI hero, logo, footer, dan glassmorphism yang telah disetujui dipertahankan.

## Arsip kondisi kode sebelum perubahan

- `src/app/router.tsx`: `/mitra-dashboard/*` dan `/admin/*` belum dilindungi. Owner/admin masih memakai satu layout dan kelompok route.
- `src/demo/RoleSwitcher.tsx`: tombol peran langsung melakukan navigasi; bukan autentikasi.
- `src/demo/DemoContext.tsx`: setiap browser memuat seluruh fixture dan menyimpan seluruh state di localStorage. Mengunci route saja tidak melindungi data ini.
- `src/services/mock.ts`: aturan voucher/site/device/expiry/concurrency sudah ada, tetapi login menerima ID voucher internal. Belum ada endpoint/form customer untuk menukarkan kode voucher offline.
- Stack saat ini React/TypeScript/Vite; belum ada backend autentikasi, akun staf, sesi server, atau adaptor router.

## Pilihan lingkup yang dikirim kepada user

| Pilihan | Hasil | Batas |
|---|---|---|
| Backend lokal + portal WiFi simulasi — rekomendasi | Login staf diperiksa server, data internal melalui API berizin, portal voucher lokal dapat diuji | Membuka captive portal dan memberikan akses internet pada router belum terintegrasi |
| Semua simulasi presentasi | Form login dan pembatasan tampilan demonstratif | Tidak memenuhi keamanan data/akses produksi; harus tetap diberi label simulasi |
| Backend + integrasi satu router uji | Login staf dan pilot captive portal dengan perangkat nyata | Membutuhkan model/versi RouterOS, konfigurasi HotSpot, cara penyimpanan voucher dan akses teknisi; tidak mengubah router sebelum konfigurasi spesifik direview |

Keputusan user: **backend lokal + portal WiFi simulasi**, **satu kode voucher**, dan pembagian owner/admin/mitra di bawah. Tidak meminta password akun/router melalui percakapan.

## Alur customer yang diusulkan

1. Customer terhubung ke SSID mitra lewat perangkatnya, secara otomatis karena jaringan tersimpan atau melalui pengaturan WiFi manual.
2. Jika autentikasi HotSpot masih diperlukan, perangkat menerima informasi captive portal/redirect dari router. Halaman portal yang ringan menampilkan logo asli, nama mitra, dan SSID yang dikonfigurasi untuk site tersebut. SSID tidak dibaca melalui browser atau ditebak dari URL yang belum diverifikasi.
3. Customer memasukkan kode voucher atau username/password sesuai format yang dikonfirmasi. Halaman tidak meminta akun staf. Bila jaringan memakai WPA/WPA2, password jaringan dan voucher HotSpot merupakan dua hal berbeda.
4. Server/router memvalidasi voucher dan site, kemudian menerapkan binding perangkat, kapasitas sesi, dan expiry. Membuka halaman atau mengirim kode yang salah tidak memulai timer.
5. Berhasil login menampilkan status voucher serta waktu berakhir. Reconnect tidak memperpanjang durasi. Voucher salah/site salah/expired/device terikat/slot penuh mempunyai pesan yang jelas.
6. Sediakan alamat portal yang bisa dibuka manual jika popup tidak muncul. Login otomatis/cookie yang masih sah dapat membuat perangkat tidak meminta form lagi; jangan menjanjikan popup pada setiap reconnect.

Route aktual: `/wifi` untuk memilih mitra dan `/wifi/:siteId/login` untuk form sekaligus status sesi. Link **Masuk WiFi** tersedia pada area customer. Integrasi nyata harus menyajikan aset/endpoint yang diperlukan sebelum internet dibuka, tanpa memperluas walled garden ke dashboard internal.

Untuk pilot, tampilan portal sebaiknya tidak bergantung pada hero video, font eksternal, atau aplikasi dashboard penuh. Konteks site/SSID berasal dari konfigurasi router/server yang dikenal; parameter redirect tidak boleh menjadi bukti autentikasi atau tujuan pengiriman kredensial yang bebas ditentukan pemanggil.

## Akses staf yang diusulkan

| Kemampuan | Customer | Mitra | Admin | Owner |
|---|---|---|---|---|
| Portal voucher/pilih mitra | Ya | Ya | Ya | Ya |
| Dashboard/data mitra | Tidak | Hanya mitra miliknya | Lintas mitra sesuai operasional | Seluruhnya |
| Kelola paket/stok/transaksi | Tidak | Sesuai hak mitra pada brief | Ya | Ya |
| Kelola akun/hak akses | Tidak | Tidak | Tidak secara default | Ya |
| Kelola akun owner/kebijakan akses | Tidak | Tidak | Tidak | Ya |

Matriks pemisahan akses **disetujui user**. Implementasi mitra saat ini hanya baca data/stok miliknya; admin mempunyai operasi domain yang diizinkan, sedangkan pengelolaan akun dan kontrol demo khusus owner. Dashboard operasional lengkap tetap tahap berikutnya. Detail hak yang tersedia dicatat di `server/authorization.ts` dan AUTH_LOCAL.md.

Login staf memakai halaman tersendiri, misalnya `/login`; dashboard mitra tetap `/mitra-dashboard`, admin `/admin`, dan owner `/owner`. Role dan partnerId ditetapkan oleh server dari akun, bukan pilihan pengguna pada form login. Link langsung ke route terlindungi memerlukan sesi sah; return URL dibatasi ke path lokal yang diizinkan.

Untuk opsi backend:

- Simpan hash password dan sesi pada server; cookie sesi HttpOnly, masa berlaku, logout/revokasi, rotasi sesi saat login, serta perlindungan percobaan login dan CSRF sesuai lingkungan. HTTPS diperlukan sebelum penggunaan di jaringan/deployment nyata.
- Periksa hak pada **setiap API**, termasuk akses detail objek, bukan hanya router React. Mitra tidak bisa mengganti partnerId/URL untuk membaca milik mitra lain.
- Pisahkan respons publik (identitas mitra/SSID/katalog publik) dari state internal. Customer tidak menerima seluruh voucher offline, order, komisi, akun, audit, atau monitoring privat.
- Pisahkan sesi internet customer dari sesi staf. Sesi voucher tidak dapat dipakai sebagai sesi dashboard.
- Hapus jalan masuk bebas melalui role switch; panel reset/clock/skenario tidak tersedia untuk customer. Akun tidak didaftarkan sendiri sebagai owner/admin dari halaman publik.
- Pertahankan data sintetis tahap 2 sebagai baseline, tanpa menimpa/mengimpor localStorage pengguna secara diam-diam. Bila dipindah ke server, prosedur persistensi/reset perlu disesuaikan dan diuji.

## Peta perubahan sebelum implementasi

| Area | File/usulan pekerjaan |
|---|---|
| Portal customer | Baru `src/features/hotspot/` untuk login/status; adapter validasi kode memakai aturan domain yang ada |
| Login dan sesi staf | Baru `src/auth/` untuk sesi, halaman login, dan route guard |
| Backend bila dipilih | Baru `server/` untuk API, akun, sesi, otorisasi, persistensi, dan bootstrap akun lokal |
| Client services | Tambah adapter HTTP di `src/services/`; batasi proyeksi data pada `DemoContext.tsx` |
| Routing/layout | Ubah `src/app/router.tsx`, `App.tsx`, layout dashboard; pisahkan admin/owner |
| Jalur masuk publik | Ubah `RoleSwitcher.tsx`, `DemoBanner.tsx`, navigasi customer/footer seperlunya, tanpa mengubah aset/gaya utama |
| Alat demo | Batasi `ScenarioPanel.tsx` menurut peran; login customer tidak dapat reset/advance clock |
| Tooling | Sesuaikan scripts/config dev agar backend dan Vite berjalan lokal; tidak deploy |
| Bukti | Tambah tes portal/auth/otorisasi; perbarui PROGRESS, DECISIONS dan dokumen batas demo setelah hasil nyata tersedia |

## Kriteria penerimaan

- Kode offline yang valid di site yang benar dapat login; salah kode/site/device, expired dan slot penuh ditolak tanpa mengubah timer. Reconnect/refresh tidak mereset expiry.
- Customer tanpa sesi staf yang membuka URL dashboard diarahkan ke login; permintaan API privat ditolak tanpa data bocor.
- Mitra tidak dapat membaca/mengubah data mitra lain dengan memanipulasi URL, body request, atau state browser. Admin tidak memperoleh hak owner melalui input client.
- Logout, sesi expired, password salah dan percobaan login berlebihan ditangani. Cookie sesi bukan kredensial yang disimpan di localStorage.
- Pelanggan tidak menerima fixture/stok voucher lengkap melalui bundle, API publik, atau panel demo pada opsi backend.
- Navigasi keyboard, responsive 360/768/1440 px, typecheck, domain/auth tests dan build lulus. Regresi UI yang disetujui diperiksa.
- Klaim captive portal otomatis hanya setelah uji router nyata. Bila belum ada router, hasil dilabeli simulasi dan tidak diklaim membuka akses internet.

## Informasi pilot yang belum ada

Model MikroTik dan versi RouterOS; lokasi fungsi HotSpot (router utama/per-mitra); status DHCP/DNS/HotSpot; SSID dan site uji; contoh format voucher yang sudah disamarkan; penyimpanan akun voucher lokal/RADIUS/Mikhmon; metode login yang dipakai; domain/sertifikat dan akses halaman sebelum internet; ketersediaan perangkat Android/iOS/laptop untuk pengujian. Jangan mengirim credential rahasia sebagai jawaban.

## Sumber teknis yang diperiksa

- [MikroTik HotSpot — Captive portal](https://help.mikrotik.com/docs/spaces/ROS/pages/56459266/HotSpot+-+Captive+portal): HotSpot, pemberitahuan captive portal, login/cookie dan akses sebelum autentikasi.
- [MikroTik Hotspot customisation](https://help.mikrotik.com/docs/spaces/ROS/pages/87162881/Hotspot+customisation): halaman login/status dan variabel yang diisi router.
- [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): pemeriksaan otorisasi server dan hak terhadap objek.
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html): manajemen sesi dan cookie.

Implementasi tambahan tersedia pada `server/`, `src/auth/`, `src/features/hotspot/`, adapter HTTP, guard route, dan halaman stok offline. Integrasi router pada alur pilot di atas belum dilakukan; portal saat ini hanya simulasi site/perangkat/internet.
