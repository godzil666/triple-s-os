# Triple S OS — Spesifikasi dan Prompt Codex Bertahap

Versi 1 · 8 September 2026 · Target: demo presentasi lokal, bukan layanan produksi.

## 1. Cara menggunakan

1. Buat atau buka repository `triple-s-os` di laptop melalui Codex.
2. Simpan dokumen ini sebagai `docs/PROJECT_BRIEF.md` dan foto logo asli sebagai `public/brand/triple-s-logo.jpg`. Jangan membuat SVG palsu dengan mengganti ekstensi JPG. Gunakan gambar asli secara proporsional.
3. Kirim Prompt 0. Setelah dokumen hasilnya diperiksa, lanjutkan satu prompt per tahap, berurutan.
4. Periksa hasil nyata di browser sebelum mengirim prompt berikutnya. Jika ada masalah, gunakan prompt perbaikan di akhir dokumen.
5. Semua tahapan memakai repository dan konteks proyek yang sama. Saat pindah sesi, gunakan prompt melanjutkan sesi.

## 2. Fakta bisnis yang sudah disepakati

- Perusahaan: PT. Sahabat Sinyal Sejahtera, Kabupaten Sukabumi.
- Nama produk: Triple S OS.
- Satu main server PT. SSS, 50 area/titik mitra, sekitar 500 pengguna aktif harian secara keseluruhan. Angka harian bukan bukti 500 perangkat online bersamaan.
- Perangkat MikroTik; aplikasi pengelolaan/monitoring sekarang Mikhmon. Hubungan teknis main server dengan router tiap mitra belum diverifikasi.
- PT. SSS menyediakan sistem dan perangkat server. Mitra mengoperasikan layanan lokal dan menjual voucher. Kepemilikan uplink/biaya internet masih perlu dikonfirmasi.
- Perusahaan juga menjual pemasangan internet rumah, tetapi fitur tersebut di luar demo ini.
- Customer memilih nama mitra secara manual, termasuk ketika sudah berada di jaringan mitra. Tidak ada pemilihan lokasi otomatis.
- Voucher hanya berlaku pada satu mitra. Boleh dibeli sebelum customer tiba/terhubung.
- Tanpa akun customer; nama dan nomor WhatsApp wajib diisi.
- Pembayaran QRIS/e-wallet masuk ke PT. SSS. Penyedia layanan pembayaran belum dipilih dan akun bisnis belum tersedia.
- Detail voucher dikirim melalui WhatsApp; provider belum dipilih.
- Setelah pembayaran dan penerbitan voucher berhasil, customer dapat memakai tombol Sambungkan WiFi tanpa mengetik ulang kode, saat sudah tersambung ke WiFi mitra yang benar. Ini target integrasi, bukan fitur jaringan yang sudah terverifikasi.
- Waktu voucher dimulai sejak login pertama yang berhasil dan terus berjalan saat logout. Pembayaran dan penerbitan tidak memulai durasi.
- Voucher reguler terkunci pada perangkat pertama. Voucher bulanan membatasi perangkat online bersamaan sesuai pilihan paket.
- Mitra membeli stok offline terlebih dahulu dari PT. SSS. Contoh: harga beli Rp4.000, jual Rp5.000, selisih Rp1.000. Selisih ini margin offline, bukan komisi online yang harus dibayarkan PT. SSS.
- Online menggunakan persentase bagi hasil mitra. Nilai persentase dan mekanisme pencairan belum diketahui.
- Pada tahap pertama, admin memberikan stok offline; mitra hanya melihatnya, tidak membeli stok melalui aplikasi.
- User memiliki akses ke teknisi dan bisa menyiapkan satu titik untuk pengujian selanjutnya.
- Aplikasi responsif untuk HP, tablet, dan desktop. Tiga sudut pandang: customer, mitra, owner/admin.

## 3. Data contoh dan keputusan terbuka

| Data | Status |
|---|---|
| 3 jam, Rp5.000, 10 Mbps | Contoh dari user |
| 5 jam, Rp7.000, 10 Mbps | Contoh dari user |
| 1 hari, Rp10.000, 10 Mbps | Contoh dari user; demo menafsirkan 24 jam |
| Paket bulanan 2 dan 4 perangkat | Usulan fixture demo, bukan paket resmi |
| Durasi bulanan 30 hari sejak login pertama | Asumsi demo; perlu keputusan resmi |
| Harga paket bulanan | Belum diketahui; gunakan label harga contoh |
| Bagi hasil online 20% | Asumsi demo untuk memperagakan perhitungan, bukan keputusan bisnis |
| Dasar bagi hasil: harga bruto voucher sebelum biaya provider | Asumsi demo, perlu konfirmasi |
| Harga dan paket seragam antar mitra | Belum diketahui; demo mendukung katalog serta ketersediaan per mitra |
| Batas waktu aktivasi voucher yang belum dipakai | Belum diketahui; jangan menambah kedaluwarsa pralogin diam-diam |
| Refund, biaya provider, pencairan, pajak | Belum diputuskan; jangan buat kebijakan produksi |
| Pemulihan voucher jika WhatsApp hilang/nomor salah | Perlu desain produksi; demo memakai halaman transaksi dan tautan simulasi |

Semua asumsi ditaruh di konfigurasi demo dan ditandai sebagai data contoh. Nilai yang belum ditentukan jangan disajikan sebagai nol yang sudah disepakati.

## 4. Lingkup dan halaman

### Customer

- `/`: pilih/cari nama mitra; tampilkan area dan nama SSID contoh untuk membantu mengenali lokasi.
- `/mitra/:id/paket`: paket tersedia, harga, durasi, kecepatan, batas perangkat, dan peringatan hanya berlaku pada mitra terpilih.
- `/checkout`: nama, nomor WhatsApp, ringkasan mitra/paket, metode bayar, konfirmasi sebelum membayar.
- `/pesanan/:token`: status bayar, penerbitan, detail voucher, status WhatsApp, salin kode, dan tombol Sambungkan WiFi.
- `/voucher/:token`: status belum aktif/aktif/kedaluwarsa, waktu berakhir dan sisa waktu bila sudah aktif; jangan tampilkan hitung mundur aktivasi sebelum login.
- Pembelian tanpa akun tidak berarti detail semua transaksi dapat dicari publik dengan nomor WhatsApp. Token demo acak; produksi membutuhkan perlindungan akses server yang terpisah.

### Mitra

- `/mitra-dashboard`: status titik, waktu pembaruan terakhir, jumlah online saat ini, ringkasan online dan stok offline.
- Halaman stok: batch, paket, jumlah diserahkan, belum aktif, aktif, kedaluwarsa. Belum aktif bukan bukti belum terjual.
- Penjualan online: transaksi paid/pending/failed, filter tanggal, paket, detail bagi hasil.
- Bagi hasil: perolehan online, riwayat, dan status pencairan belum dikonfigurasi. Tidak ada tombol cairkan yang berpura-pura melakukan pembayaran.
- Pengguna aktif: sesi/perangkat alias, paket, waktu mulai/akhir; data customer seperlunya dan nomor dimasking.
- Mitra hanya melihat datanya sendiri, termasuk saat membuka URL detail milik mitra lain.

### Owner/admin

- `/admin`: total titik menurut status online/offline/unknown, perangkat online saat ini, transaksi online dan bagi hasil.
- Daftar/detail mitra: cari/filter, tambah/edit, aktif/nonaktif untuk penjualan baru. Nonaktif dalam aplikasi tidak mematikan router.
- Paket: tambah/edit, durasi, kecepatan, harga, batas perangkat, ketersediaan per mitra. Arsipkan paket; transaksi lama tetap menyimpan harga/aturan saat dibeli.
- Stok: berikan batch voucher offline ke mitra; catat harga grosir, harga jual contoh, sumber kode dan referensi pembayaran stok bila tersedia. Tidak memungut pembayaran nyata.
- Transaksi: filter mitra/tanggal/status; bedakan penerimaan stok grosir, penjualan online, dan estimasi margin offline.
- Atur persentase bagi hasil per mitra dan simpan snapshot pada transaksi agar perubahan tidak mengubah sejarah.
- Log aktivitas untuk perubahan mitra, paket, stok, dan bagi hasil.
- Tidak menyediakan reboot router, hapus pengguna jaringan, atau perubahan konfigurasi MikroTik pada demo.

### Mode demo

- Banner konsisten: “Mode demo — transaksi dan koneksi disimulasikan”.
- Pemilih peran Customer/Mitra/Owner dan pilihan mitra demo. Bukan autentikasi produksi.
- Panel skenario: sukses/gagal/pending pembayaran, penerbitan tertunda, WhatsApp gagal, jaringan salah, titik offline, data monitoring basi, perangkat berbeda, batas perangkat penuh, waktu kedaluwarsa.
- Reset data demo dengan konfirmasi; menghapus data sintetis saja.
- Simulasi login tidak menyambungkan perangkat ke SSID secara otomatis. Tampilkan instruksi memilih WiFi melalui pengaturan perangkat bila belum sesuai.

## 5. Desain visual

- Biru muda dan putih dominan, cyan/turquoise serta magenta/ungu mengikuti karakter foto logo. Nilai berikut usulan desain, bukan hasil ekstraksi warna presisi.
- Background #F5FAFF, surface #FFFFFF, biru utama #0284C7, cyan #06B6D4, turquoise #00DCCB, magenta #E600B8, teks #0F172A.
- Aksen terang untuk dekorasi; tombol/teks harus tetap memiliki kontras terbaca. Jangan memakai magenta untuk semua status kesalahan karena juga warna merek.
- Logo asli contain, tidak diregangkan; gunakan ruang putih di sekelilingnya. Jika belum ada berkas, gunakan wordmark sementara dengan catatan penggantian.
- Bahasa Indonesia, rupiah, waktu tampilan Asia/Jakarta; simpan timestamp sebagai ISO/UTC.
- Customer: alur pembelian singkat dan ringkasan paket jelas. Dashboard: ringkasan angka, tabel yang berguna, status berlabel, bukan dekorasi grafik tanpa fungsi.
- Mobile: navigasi ringkas dan kartu/tabel yang dapat dibaca; desktop: sidebar. Uji 360, 390, 768, 1024, 1440 px. Tidak menjanjikan kompatibilitas semua gadget/browser lama.
- Semua input berlabel, fokus keyboard terlihat, tombol sentuh nyaman, loading/error/empty state, tidak mengandalkan warna saja.

## 6. Arsitektur demo yang diusulkan

Jika repository kosong: React + TypeScript + Vite, routing dan CSS responsif. Jika repository sudah berisi aplikasi, gunakan stack yang ada selama memadai; jangan migrasi tanpa kebutuhan.

Alasan pilihan: demo ini membutuhkan interaksi dan state lintas peran tetapi belum membutuhkan integrasi server nyata. Vite menyediakan template React/TypeScript; lihat https://vite.dev/guide/ dan https://react.dev/learn. Versi dependency ditentukan Codex setelah memeriksa runtime dan dokumentasi resmi; simpan lockfile.

- Pisahkan `domain`, `services`, `demo`, `features`, `components`, dan `docs`.
- UI memanggil antarmuka layanan async: PaymentService, VoucherService, NotificationService, MonitoringService, PartnerService, CommissionService.
- Implementasi awal semuanya mock, memakai store terpusat dan persistensi lokal berversi untuk data sintetis. Perubahan customer terlihat pada dashboard saat berganti peran.
- localStorage hanya untuk demo satu browser; bukan penyimpanan aman, bukan sinkronisasi banyak pengguna, dan bukan database produksi.
- Clock demo dapat dimajukan sehingga expiry bisa diuji tanpa menunggu berjam-jam.
- Fixture 50 mitra fiktif. Total perangkat online diturunkan dari sesi fixture; angka sekitar 500 pengguna harian disebut konteks bisnis, jangan dipalsukan sebagai metrik realtime.
- Mock device ID dan mock network context untuk skenario. Jangan memakai browser fingerprint sebagai bukti penguncian perangkat nyata.
- Jangan memasukkan credential router, data pelanggan nyata, SDK pembayaran/WhatsApp produksi, atau memanggil MikroTik langsung dari browser.

### Model domain minimum

Partner; Site (demo satu site per mitra, model tetap terpisah); Package; PartnerPackage; Order; Payment; Voucher; OfflineBatch; Session; CommissionEntry; NotificationAttempt; AuditEvent.

Order menyimpan partnerId/siteId/package snapshot/nama/WA/jumlah rupiah/channel/status. Voucher menyimpan order atau batch source, siteId, duration, maxConcurrentDevices, firstActivatedAt, expiresAt, deviceBinding reguler. CommissionEntry menyimpan orderId unik, rate snapshot, basis dan nominal. Monitoring snapshot memiliki observedAt dan status unknown jika sudah basi.

### Aturan konsistensi

1. Payment pending/paid/failed/expired terpisah dari provisioning pending/issued/failed dan voucher unused/active/expired.
2. Payment sukses tidak otomatis berarti internet aktif. Voucher harus issued dan login hotspot berhasil dahulu.
3. Konfirmasi pembayaran berulang tidak menerbitkan voucher atau komisi ganda. Percobaan ulang notifikasi tidak membuat voucher baru.
4. Login pertama berhasil menetapkan expiresAt = firstActivatedAt + duration sekali saja. Reconnect tidak memperpanjangnya.
5. Salah mitra, titik tidak tersedia, perangkat terlarang, limit sesi, atau voucher expired harus ditolak tanpa memulai/mengubah timer.
6. Klik sambungkan berulang di perangkat sama memperbarui/memakai sesi yang sama, tidak menambah jumlah perangkat.
7. Paket bulanan memeriksa jumlah sesi aktif; perangkat yang logout membebaskan slot. Demo mengasumsikan timer bersama mulai dari perangkat pertama.
8. Online: satu order paid menghasilkan satu entri bagi hasil, dibulatkan ke rupiah menurut aturan demo yang didokumentasikan. Failed/pending tidak mendapat bagi hasil.
9. Offline: stok dialokasikan bukan bukti terjual ke customer. Jangan menyebut gross retail sebagai pendapatan PT. SSS. Margin terealisasi butuh data penjualan; jika tidak tersedia, tampilkan potensi margin.
10. Dashboard memakai sumber data yang sama, filter mitra konsisten, dan waktu update ditampilkan. Kegagalan polling tidak otomatis membuktikan router offline: gunakan unknown/stale.

## 7. Prompt 0 — Kunci konteks dan rencana kerja

```text
Baca docs/PROJECT_BRIEF.md seluruhnya dan instruksi repository yang berlaku. Kita membangun Triple S OS untuk demo presentasi PT. Sahabat Sinyal Sejahtera secara bertahap.

Tahap ini hanya dokumentasi dan inspeksi repository, belum implementasi UI. Periksa stack, package manager, file yang sudah ada, serta ketersediaan public/brand/triple-s-logo.jpg. Jangan menimpa pekerjaan yang ada.

Buat docs/DECISIONS.md yang membedakan keputusan user, asumsi demo, dan pertanyaan produksi; docs/IMPLEMENTATION_PLAN.md berisi tahap 1–6 sesuai brief beserta kriteria selesai; serta docs/PROGRESS.md dengan status awal. Catat aturan voucher, pemilihan mitra manual, perbedaan margin offline dan bagi hasil online, serta batas simulasi.

Jika repo kosong, rencanakan React + TypeScript + Vite. Jika sudah berisi stack memadai, pertahankan. Jangan menambahkan integrasi nyata atau deploy. Laporkan dokumen yang dibuat, hal yang masih terbuka, dan lingkup tahap 1. Berhenti setelah tahap 0 selesai.
```

Selesai bila dokumen mencerminkan seluruh keputusan, tidak ada asumsi demo yang disajikan sebagai aturan resmi.

## 8. Prompt 1 — Fondasi dan tampilan responsif

```text
Baca docs/PROJECT_BRIEF.md, DECISIONS.md, IMPLEMENTATION_PLAN.md, dan PROGRESS.md. Kerjakan hanya tahap 1: fondasi Triple S OS.

Siapkan aplikasi sesuai stack yang diputuskan. Buat design tokens sesuai brief, komponen Button/Input/Select/Card/Badge/Table/Dialog/EmptyState, layout customer, layout mitra, layout owner, routing halaman yang tercantum, banner mode demo, dan pemilih peran demo. Gunakan logo asli jika tersedia, jangan mengubah bentuknya atau membuat SVG palsu. Gunakan wordmark sementara jika berkas tidak ada dan laporkan.

Halaman tahap berikutnya boleh berupa placeholder yang jelas. Buat satu halaman pilih mitra yang representatif untuk mengevaluasi desain. Jangan membuat checkout atau integrasi produksi dulu. Jangan menyajikan role switch sebagai login aman.

Verifikasi tampilan 360/768/1440 px, navigasi keyboard, tidak ada overflow halaman, dan build. Jika browser tidak tersedia, katakan pemeriksaan visual belum dilakukan. Perbarui PROGRESS.md dengan perubahan, verifikasi, dan langkah review manual. Berhenti setelah tahap 1.
```

Selesai bila ketiga layout bisa dibuka, logo dan warna konsisten, navigasi responsif berfungsi, build berhasil.

## 9. Prompt 2 — Domain dan mesin simulasi

```text
Baca dokumen proyek dan lanjutkan hanya tahap 2. Pertahankan UI yang sudah disetujui.

Implementasikan model domain, service interfaces async dan implementasi mock sesuai brief. Buat fixture deterministik 50 mitra fiktif, paket contoh reguler serta bulanan yang berlabel asumsi, batch offline, order, sesi dan monitoring snapshot. Semua angka dashboard nantinya harus diturunkan dari store yang sama.

Tambahkan persistensi lokal berversi untuk data sintetis, reset demo berkonfirmasi, clock demo, mock device ID, mock site context dan kontrol skenario. Implementasikan payment/provisioning/voucher state terpisah, expiry sejak login pertama, site binding, device binding reguler, concurrency paket bulanan, idempotensi pembayaran/komisi, dan rate snapshot. Jangan mendeteksi MAC atau SSID nyata melalui browser.

Tambahkan pengujian bermakna untuk pembayaran duplikat, login salah mitra, timer tidak mulai saat membeli, timer tidak reset saat reconnect, perangkat reguler kedua ditolak, sesi bulanan penuh, dan harga/rate historis tetap. Jangan menulis test yang hanya memeriksa fixture statis.

Jalankan pemeriksaan tipe, pengujian domain, dan build. Dokumentasikan batas demo serta hasil dalam PROGRESS.md. Berhenti setelah tahap 2.
```

Selesai bila aturan bisnis lulus pengujian dan state tetap konsisten setelah refresh/reset.

## 10. Prompt 3 — Alur customer lengkap

```text
Baca dokumen proyek dan kerjakan hanya tahap 3 memakai services yang sudah dibuat.

Bangun alur pilih nama mitra manual -> pilih paket/jumlah perangkat dari paket -> nama dan WhatsApp -> review -> QRIS/e-wallet simulasi -> status pembayaran -> status penerbitan voucher -> detail voucher dan preview notifikasi WhatsApp -> Sambungkan WiFi simulasi.

Tampilkan nama mitra secara konsisten di seluruh alur, syarat satu lokasi, durasi sejak login pertama, dan batas perangkat sebelum bayar. Validasi input dan normalisasi nomor Indonesia secara wajar; validasi format tidak membuktikan nomor terdaftar di WhatsApp. Tidak ada akun customer. Gunakan token acak untuk navigasi detail demo; jangan sediakan pencarian publik berdasarkan nomor WA.

Pembayaran simulasi tidak boleh memakai QR pembayaran yang bisa ditransaksikan. Kontrol demo dapat memicu pending, sukses, gagal, timeout, provisioning tertunda dan WhatsApp gagal. Setelah paid, penerbitan gagal harus menunjukkan sedang diproses/perlu bantuan, bukan meminta bayar ulang. WhatsApp gagal tidak menghilangkan voucher; tampilkan voucher dan retry simulasi. Simpan transaksi agar refresh tidak membuat order ganda.

Saat Sambungkan ditekan, gunakan konteks jaringan/perangkat mock. Jika belum di WiFi yang benar, tampilkan petunjuk memilih SSID lewat pengaturan perangkat. Jangan mengklaim browser bisa memilih WiFi otomatis. Belum aktif tidak memiliki countdown berjalan; setelah login pertama tampilkan waktu kedaluwarsa. Tangani salah mitra, device terkunci dan slot bulanan penuh.

Uji alur sukses serta gagal utama di browser, termasuk pembelian sebelum tiba dan aktivasi kemudian. Perbarui PROGRESS.md dan berhenti setelah tahap 3.
```

Selesai bila customer dapat menyelesaikan pembelian dan aktivasi simulasi tanpa mengetik voucher, dengan status gagal yang dapat dipahami.

## 11. Prompt 4 — Dashboard mitra

```text
Baca dokumen proyek dan kerjakan hanya tahap 4.

Bangun dashboard mitra dari store bersama: status titik dan observedAt, pengguna online saat ini, stok offline per batch/paket/status, penjualan online, dan rincian bagi hasil. Tambahkan filter tanggal/status dan detail transaksi. Masking nomor customer secara default.

Scope semua query dan detail menggunakan mitra demo aktif. URL milik mitra lain harus menampilkan akses ditolak dalam simulasi. Jelaskan di dokumentasi bahwa ini belum otorisasi server produksi.

Stok offline read-only bagi mitra. Jangan menambah pembelian stok atau pencairan nyata. Bedakan potensi margin offline dari bagi hasil online; jangan menyamakan unused dengan belum terjual. Jadwal pencairan tampil belum ditentukan. Monitoring basi tampil unknown, bukan online palsu.

Verifikasi pembelian tahap 3 menambah satu transaksi dan satu bagi hasil pada mitra yang tepat, tidak pada mitra lain. Verifikasi status offline/unknown dan tampilan HP/tablet/desktop. Perbarui PROGRESS.md; berhenti setelah tahap 4.
```

Selesai bila dashboard mitra benar-benar mencerminkan transaksi customer dan tidak menampilkan data mitra lain.

## 12. Prompt 5 — Dashboard owner dan pengelolaan

```text
Baca dokumen proyek dan kerjakan hanya tahap 5.

Bangun overview seluruh 50 titik dari store, daftar/detail mitra, filter status dan pencarian, tambah/edit mitra, aktif/nonaktif penjualan baru, pengelolaan paket beserta ketersediaan per mitra, pemberian batch stok offline, daftar transaksi dan konfigurasi persentase bagi hasil per mitra. Tambahkan audit log untuk tindakan admin.

Form harus berfungsi dan memvalidasi nilai. Arsipkan paket alih-alih menghapus riwayat. Mengubah harga atau persentase tidak boleh mengubah transaksi lama. Pembagian stok tidak boleh menghasilkan kode duplikat atau memindahkan voucher yang sudah dialokasikan ke mitra lain. Jangan menghitung alokasi stok sebagai uang diterima tanpa referensi pembayaran.

Bedakan jumlah perangkat online sekarang dari pengguna harian. Rekap keuangan memisahkan penjualan online, bagi hasil online, stok grosir dan potensi margin offline. Jangan menjumlahkan metrik yang berbeda menjadi pendapatan palsu. Nonaktif mitra tidak mengklaim mematikan router dan tidak membatalkan voucher lama.

Uji lintas peran: admin ubah paket -> customer melihat harga baru -> customer beli -> mitra mendapat bagi hasil sesuai snapshot -> owner melihat transaksi. Uji akses mitra tidak membuka halaman admin dalam mode demo. Jalankan build dan perbarui PROGRESS.md. Berhenti setelah tahap 5.
```

Selesai bila aksi admin mengubah data relevan lintas halaman, riwayat tetap utuh, dan angka rekap konsisten.

## 13. Prompt 6 — Verifikasi dan paket presentasi

```text
Baca seluruh dokumen proyek. Kerjakan hanya tahap 6, penyelesaian demo Triple S OS.

Jalankan skenario lengkap customer -> mitra -> owner. Verifikasi pembayaran duplikat, salah lokasi, WhatsApp gagal, penerbitan tertunda, satu perangkat terkunci, paket bulanan limit sesi, expiry, refresh, reset, dan scoped access. Gunakan browser pada 360/390/768/1024/1440 px, periksa fokus keyboard, label input, kontras, error/empty/loading state dan overflow. Perbaiki bug yang ditemukan tanpa menambah fitur baru.

Jalankan test domain, typecheck dan production build yang tersedia. Catat pemeriksaan yang benar-benar dijalankan, yang gagal, dan yang belum bisa dijalankan. Jangan menyatakan siap produksi.

Buat README dengan langkah install/run/build dan batas demo; docs/DEMO_SCRIPT.md berisi presentasi 5–7 menit; docs/ACCEPTANCE_CHECKLIST.md dengan hasil nyata; docs/PRODUCTION_READINESS.md berisi keputusan dan akses yang diperlukan untuk tahap integrasi. Sertakan cara reset serta fixture contoh yang aman.

Pastikan semua integrasi berlabel simulasi dan tidak ada pengiriman pesan/pembayaran/perubahan router nyata. Jangan deploy atau push remote pada tahap ini. Laporkan cara menjalankan demo lokal, hasil verifikasi, serta keterbatasan tersisa. Berhenti setelah tahap 6.
```

Selesai bila demo lokal dapat diulang dari reset dan keseluruhan cerita bisnis dapat diperagakan tanpa manipulasi manual data.

## 14. Prompt perbaikan dan melanjutkan sesi

### Perbaikan

```text
Masih pada tahap [N] Triple S OS. Masalah: [jelaskan]. Langkah reproduksi: [langkah]. Hasil yang diharapkan: [hasil]. Screenshot/log: [lampirkan].
Baca dokumen proyek, temukan penyebab, perbaiki bagian terkait, dan verifikasi skenario yang gagal serta alur terkait yang berisiko terdampak. Pertahankan aturan bisnis dan desain yang sudah disepakati. Perbarui PROGRESS.md. Jangan lanjut ke tahap berikutnya.
```

### Sesi baru

```text
Lanjutkan Triple S OS di repository ini. Baca instruksi repository, docs/PROJECT_BRIEF.md, DECISIONS.md, IMPLEMENTATION_PLAN.md, dan PROGRESS.md. Periksa kode aktual agar tidak mengulang pekerjaan selesai. Tahap yang ingin dikerjakan sekarang: [N]. Kerjakan hanya tahap tersebut beserta verifikasinya. Jangan mengubah keputusan bisnis atau mengintegrasikan layanan nyata tanpa instruksi tahap integrasi.
```

## 15. Setelah demo: urutan menuju pilot, belum diimplementasikan

1. Review demo bersama PT. SSS, tetapkan harga, paket bulanan, komisi, basis biaya, refund, pencairan, dan pencatatan penjualan offline.
2. Survei teknisi satu titik: versi RouterOS, topologi, hotspot login flow, profil voucher, device binding, concurrency, akses terkelola ke router, dan sumber monitoring. Jangan menganggap Mikhmon menyediakan API publik tertentu.
3. Rancang backend/database, autentikasi owner/mitra, otorisasi per mitra di server, akses order tamu yang aman, audit dan pengelolaan secret. UI demo tidak menjadi pengamanan produksi.
4. Integrasi provider pembayaran dalam sandbox, verifikasi callback server, idempotensi, rekonsiliasi paid-but-not-issued, serta layanan WhatsApp dengan retry terpisah.
5. Implementasi adaptor MikroTik di backend setelah teknisi memverifikasi alur login. Konfirmasi device locking, private/randomized MAC, dan jalur dukungan penggantian perangkat. Jangan menjanjikan browser dapat membaca SSID/MAC atau menyambung WiFi sendiri.
6. Uji akses checkout sebelum login hotspot, termasuk halaman provider pembayaran dan e-wallet pada perangkat yang sama, bersama teknisi. Web app saja tidak menjamin akses pra-internet tersedia.
7. Pilot satu mitra dengan observabilitas, backup, prosedur rollback, dan rekonsiliasi; perluas bertahap setelah hasilnya terukur. Dukungan 50 area bukan cukup dibuktikan oleh fixture demo.

Tidak ada kredensial, data pribadi pelanggan nyata, atau konfigurasi main server yang diperlukan untuk membangun demo presentasi.
