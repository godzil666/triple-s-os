# Triple S OS — Keputusan dan batas demo

> Tahap 3 diminta user: pembelian customer tanpa akun melalui layanan yang ada, token detail acak, dan seluruh pembayaran/WhatsApp/koneksi tetap simulasi. Detail perilaku dan pemulihan: [STAGE3_CUSTOMER.md](STAGE3_CUSTOMER.md). Bagian tahap 0–2 di bawah adalah riwayat keputusan pada waktunya.

> Tambahan 10 September 2026: user menyetujui backend autentikasi lokal sungguhan, portal WiFi simulasi dengan satu kode voucher, serta pemisahan owner/admin/mitra. Keputusan ini menggantikan role switch bebas dan runtime yang hanya memakai localStorage. Tidak mengubah aturan domain atau mengizinkan integrasi/deploy. Detail terbaru: [AUTH_LOCAL.md](AUTH_LOCAL.md).

> Pembaruan UI 10 September 2026: keputusan user di bagian tambahan paling bawah menggantikan arahan awal tentang wordmark/JPG dan gaya permukaan. Aturan bisnis serta batas tahap 1 tetap berlaku.

Tanggal pencatatan: 9 September 2026. Sumber kebutuhan: [PROJECT_BRIEF.md](PROJECT_BRIEF.md), versi 1, 8 September 2026, dibaca seluruhnya.

## Otoritas dan hasil inspeksi tahap 0

Permintaan user pada sesi ini mengizinkan inspeksi dan tiga dokumen tahap 0 saja. Prompt tahap 1–6 serta pilot di dalam brief adalah rujukan rencana, bukan izin menjalankannya sekarang. Tidak ada implementasi UI, instalasi dependency, integrasi nyata, deploy, atau push.

- Folder proyek: `C:\Users\zil\Documents\Triple_S_OS`, ditentukan dari lokasi brief yang diberikan user. Direktori awal sesi `C:\Users\zil\Documents\Project PT. Triple S` adalah folder berbeda dan tidak diubah.
- Sebelum tahap 0, file proyek hanya `docs/PROJECT_BRIEF.md` dan `public/logo SSS.svg`. Tidak ada kode aplikasi, manifest, lockfile, README, atau konfigurasi build/test.
- Tidak ditemukan `AGENTS.md` pada folder proyek/subfolder maupun rantai induk `C:\`, `C:\Users`, `C:\Users\zil`, dan `C:\Users\zil\Documents`. Tidak ada file instruksi repository lain di inventaris proyek.
- `git rev-parse --show-toplevel` menyatakan bukan repository Git. Tidak dilakukan inisialisasi Git.
- Runtime teramati: Node.js `v24.20.0`, npm `11.19.0`; perintah pnpm tersedia pada PATH tetapi belum dijalankan/diverifikasi versinya. Yarn dan Bun tidak ditemukan pada PATH. Belum ada package manager yang ditetapkan oleh repository.
- `public/brand/triple-s-logo.jpg` **tidak tersedia**. `public/logo SSS.svg` berukuran 1.930 byte, berisi SVG dengan empat path dan gradient; kemiripan visual dan statusnya sebagai aset asli belum diverifikasi. Jangan otomatis menjadikannya pengganti JPG resmi atau mengubah ekstensi aset.

## A. Keputusan user / kebutuhan yang dinyatakan dalam brief

### Bisnis dan alur

- Produk Triple S OS untuk demo lokal PT. Sahabat Sinyal Sejahtera, Kabupaten Sukabumi; responsif untuk customer, mitra, dan owner/admin.
- Konteks bisnis: satu main server, 50 area/titik mitra, sekitar 500 pengguna aktif harian keseluruhan. Angka 500 bukan jumlah perangkat online serentak atau hasil pengukuran demo.
- Perangkat MikroTik dan pengelolaan saat ini Mikhmon. PT. SSS menyediakan sistem/perangkat server; mitra mengoperasikan layanan lokal dan menjual voucher. Pemasangan internet rumah di luar lingkup.
- Customer selalu memilih nama mitra **secara manual**, termasuk saat sudah di jaringan mitra. Area dan SSID contoh hanya membantu identifikasi; tidak ada deteksi/pemilihan lokasi otomatis.
- Voucher berlaku hanya pada satu mitra/site dan boleh dibeli sebelum tiba. Customer tanpa akun; nama dan WhatsApp wajib. Tidak boleh ada pencarian publik seluruh transaksi berdasarkan nomor WhatsApp.
- Target bisnis pembayaran QRIS/e-wallet masuk PT. SSS dan detail voucher melalui WhatsApp. Pada demo, keduanya simulasi; provider belum dipilih.
- Target Sambungkan WiFi setelah pembayaran dan penerbitan berhasil adalah login tanpa mengetik ulang kode saat di WiFi mitra yang benar. Alur jaringan nyata belum terverifikasi; browser tidak memilih SSID otomatis.

### Voucher dan konsistensi

1. Pisahkan payment `pending/paid/failed/expired`, provisioning `pending/issued/failed`, dan voucher `unused/active/expired`. Paid tidak berarti internet aktif.
2. Waktu mulai hanya pada **login pertama yang berhasil**: `expiresAt = firstActivatedAt + duration`. Pembelian, pembayaran, dan penerbitan tidak memulai timer. Belum aktif tidak memiliki countdown berjalan.
3. Timer terus berjalan saat logout; reconnect tidak mengubah awal/akhir. Jangan menambahkan batas kedaluwarsa pralogin tanpa keputusan user.
4. Voucher reguler terkunci pada perangkat pertama. Paket bulanan membatasi jumlah perangkat online bersamaan sesuai paket; logout membebaskan slot.
5. Salah mitra, titik tidak tersedia, perangkat terlarang, slot penuh, atau voucher kedaluwarsa harus ditolak tanpa mengubah timer. Sambungkan berulang pada perangkat yang sama memakai/memperbarui sesi yang sama.
6. Konfirmasi paid berulang tidak menggandakan voucher atau bagi hasil. Retry WhatsApp tidak menerbitkan voucher baru. Paid tetapi penerbitan gagal perlu status proses/bantuan, bukan bayar ulang.
7. Snapshot harga, aturan paket, dan rate/basis bagi hasil pada transaksi menjaga riwayat ketika katalog/rate berubah. `CommissionEntry.orderId` unik.

### Offline dan online harus dipisahkan

| Jalur | Makna dan pencatatan |
|---|---|
| Stok offline | Mitra membeli stok terlebih dahulu dari PT. SSS. Admin memberikan batch dalam demo; mitra hanya melihat stok, tanpa pembelian stok melalui aplikasi. Catat harga grosir, harga jual contoh, sumber kode, serta referensi pembayaran jika tersedia. |
| Margin offline | Contoh user: beli Rp4.000, jual Rp5.000, selisih Rp1.000. Ini margin mitra, bukan komisi yang harus dibayar PT. SSS. Tanpa bukti penjualan eceran, tampilkan **potensi margin**, bukan margin terealisasi. |
| Status stok | Alokasi bukan bukti terjual maupun uang diterima; `unused` bukan bukti belum terjual. Pisahkan jumlah diserahkan, belum aktif, aktif, dan kedaluwarsa. Harga retail total bukan pendapatan PT. SSS. |
| Online | Menggunakan persentase bagi hasil mitra; satu order paid menghasilkan satu entri, pending/failed tidak. Pisahkan penjualan online, bagi hasil online, penerimaan stok grosir, dan potensi margin offline. |
| Pencairan | Rate resmi, jadwal, dan mekanisme belum ditentukan. Tampilkan belum dikonfigurasi, tanpa tombol yang berpura-pura membayar. |

### Operasional dan akses

- Semua tampilan memakai sumber data bersama. Dashboard menampilkan `observedAt`, status online/offline/unknown; polling gagal atau data basi bukan bukti router offline.
- Mitra hanya melihat datanya sendiri, termasuk akses URL detail; nomor customer dimasking dan data pribadi ditampilkan seperlunya. Pembatasan ini hanya simulasi sampai tersedia otorisasi server.
- Admin dapat mengelola mitra, katalog/ketersediaan per mitra, batch offline, rate per mitra, dan audit log. Nonaktif mitra hanya menghentikan penjualan baru, tidak mematikan router atau membatalkan voucher lama.
- Arsip paket mempertahankan riwayat. Kode stok tidak boleh duplikat dan voucher teralokasi tidak dipindahkan ke mitra lain.

## B. Asumsi dan pilihan teknis demo — bukan aturan produksi

| Item | Pilihan demo dan status |
|---|---|
| Stack | Karena belum ada aplikasi: rencanakan React + TypeScript + Vite, routing dan CSS responsif. Belum di-scaffold. |
| Package manager | Rekomendasi tahap 0: npm karena tersedia dan belum ada lockfile lain. Saat tahap 1, verifikasi kompatibilitas versi melalui dokumentasi resmi dan simpan `package-lock.json`; versi dependency belum dipilih. |
| Paket reguler | Contoh user: 3 jam/Rp5.000/10 Mbps, 5 jam/Rp7.000/10 Mbps, 1 hari/Rp10.000/10 Mbps. Tafsir demo 1 hari = 24 jam, bukan kepastian kebijakan produksi. |
| Bulanan | Fixture usulan 2 dan 4 perangkat; 30 hari sejak login pertama; timer bersama mulai dari perangkat pertama. Harga belum diketahui; nominal fixture kelak harus berlabel harga contoh. |
| Bagi hasil | Contoh 20% dari bruto voucher sebelum biaya provider. Pilihan pembulatan demo: `Math.round(basisRupiah * ratePercent / 100)` untuk nominal nonnegatif, sekali per order; simpan nominal hasilnya. Rp5.000 menghasilkan Rp1.000; Rp5.003 menghasilkan Rp1.001. Bukan keputusan akuntansi resmi. |
| Mitra/site | Fixture deterministik 50 mitra fiktif, satu site per mitra; model Partner dan Site tetap terpisah. Katalog/ketersediaan per mitra didukung, tanpa menganggap harga resmi seragam. |
| Monitoring | Perangkat online dihitung dari sesi fixture. Ambang basi harus berupa konfigurasi demo yang berlabel; nilai belum ditetapkan pada tahap 0. |
| State | Store terpusat, service async mock, persistensi lokal berversi untuk data sintetis, clock yang dapat dimajukan, mock device ID dan mock network/site context. |
| Akses detail | Token acak dan halaman transaksi/tautan pemulihan simulasi; bukan mekanisme keamanan produksi. |
| Visual | Palet usulan: background `#F5FAFF`, surface `#FFFFFF`, utama `#0284C7`, cyan `#06B6D4`, turquoise `#00DCCB`, magenta `#E600B8`, teks `#0F172A`. Bukan ekstraksi logo presisi; kontras tetap diperiksa. |
| Logo | Jika JPG tetap belum ada saat tahap 1, gunakan wordmark sementara sesuai brief dan catat kebutuhan penggantian. Aset SVG yang ada tetap dipertahankan. |
| Locale | Bahasa Indonesia, rupiah, tampilan waktu Asia/Jakarta; timestamp disimpan ISO/UTC. |

Semua nilai asumsi kelak ditempatkan pada konfigurasi demo dan ditandai data contoh. Nilai yang belum diketahui tidak ditampilkan sebagai nol yang disepakati.

## C. Pertanyaan produksi yang masih terbuka

| Topik | Keputusan atau bukti yang diperlukan |
|---|---|
| Aset merek | Ketersediaan JPG asli pada path brief; apakah SVG yang ada disetujui sebagai aset resmi? Tidak menghalangi tahap 1 dengan wordmark. |
| Katalog | Harga bulanan, durasi resmi, jumlah perangkat, keseragaman harga antar mitra, ketersediaan paket, dan batas aktivasi voucher pralogin. |
| Keuangan | Rate/basis bagi hasil, pembulatan resmi, biaya provider, pajak, refund, jadwal/mekanisme pencairan, serta pencatatan penjualan offline agar margin terealisasi dapat dibuktikan. |
| Jaringan | Hubungan main server/router tiap mitra, kepemilikan uplink dan biaya internet; versi RouterOS, profil hotspot, login flow, binding perangkat, concurrency dan sumber monitoring. Jangan mengasumsikan API publik Mikhmon. |
| Sambungkan | Bukti alur login satu titik, penanganan MAC privat/acak dan penggantian perangkat, akses checkout serta payment/e-wallet sebelum login hotspot di perangkat yang sama. |
| Pembayaran | Provider dan akun bisnis, sandbox, callback server terverifikasi, idempotensi, rekonsiliasi paid tetapi voucher belum issued. |
| WhatsApp | Provider, retry terpisah, nomor salah/pesan hilang, dukungan dan pemulihan voucher. Validasi format nomor tidak membuktikan akun WhatsApp terdaftar. |
| Keamanan/data | Backend/database, autentikasi owner/mitra, otorisasi server per mitra, akses aman order tamu, secret, audit, retensi dan perlindungan data pribadi. |
| Pilot | User memiliki akses teknisi dan dapat menyiapkan satu titik. Perlu hasil uji, observabilitas, backup, rollback dan rekonsiliasi sebelum perluasan; fixture 50 titik bukan bukti kapasitas produksi. |

## Batas simulasi yang wajib terlihat

Banner konsisten: **“Mode demo — transaksi dan koneksi disimulasikan”**. Pemilih Customer/Mitra/Owner dan mitra demo bukan autentikasi aman. localStorage hanya untuk demo satu browser, bukan database aman atau sinkronisasi multiuser.

Tidak ada pembayaran/QR yang dapat ditransaksikan, pengiriman WhatsApp, koneksi WiFi otomatis, deteksi MAC/SSID nyata, fingerprint untuk membuktikan device locking, panggilan MikroTik langsung dari browser, reboot/hapus pengguna/perubahan konfigurasi router, data pelanggan nyata, kredensial atau SDK integrasi produksi. Reset berkonfirmasi hanya menghapus data sintetis demo. Tidak ada deploy/push remote; kesiapan produksi tidak diklaim.

## Tambahan keputusan user — refinement UI, 10 September 2026

- User memilih kombinasi hero customer gelap berbasis video, konten dan dashboard terang.
- Hero lebar penuh sekitar 70–80% layar; efek glassmorphism lebih kuat pada hero/header dan lebih halus pada kartu, form, serta tabel semua peran.
- Teks hero tetap “Koneksi baik, mulai dari sini.” dan CTA “Temukan mitra Anda”.
- Aset resmi untuk perubahan ini adalah `C:\Users\zil\Documents\Triple_S_OS\logo_SSS.svg`, yang user minta dipakai langsung. Salinan byte-identik di `public/brand/triple-s-logo.svg`; bentuk, viewBox dan warna tidak diubah. SVG berdampingan dengan tulisan Triple S OS dan digunakan di footer. Keputusan ini menggantikan kebutuhan wordmark sementara karena JPG belum tersedia.
- Video sumber user: `C:\Users\zil\Documents\Project PT. Triple S\hero SSS.mp4`. Gunakan versi web terkompresi tanpa audio, autoplay muted/loop/playsInline, kontrol jeda dan poster dari sumber yang sama. Sumber asli tetap utuh.
- User menyetujui fallback reduced motion. Pilihan teknis tambahan: tidak memuat video pada preferensi reduce/save-data; jeda saat tab tersembunyi atau hero keluar dari viewport; poster tetap tersedia saat media gagal. Transparansi memiliki fallback padat.
- Footer customer lengkap dengan logo, navigasi, kontak, kantor, jam layanan, sosial dan kebijakan. Data yang belum ada diberi placeholder, bukan kontak/tautan/kebijakan rekaan. Footer dashboard menggunakan varian ringkas dari komponen yang sama.
- Perubahan hanya refinement visual tahap 1, bukan permintaan menjalankan tahap 2 atau integrasi nyata.

## Pembaruan tahap 2 — 10 September 2026

User mengizinkan tahap 2 saja dengan UI yang disetujui tetap dipertahankan. Model, service async mock, fixture, persistensi, clock, dan panel skenario telah diimplementasikan; rincian ada di [STAGE2_DOMAIN.md](STAGE2_DOMAIN.md).

Asumsi implementasi demo: bulanan 2 perangkat Rp150.000 / 4 perangkat Rp250.000 untuk 30 hari; 10 Mbps contoh; rate awal online 20% gross sebelum biaya; stok reguler grosir Rp3.500 vs retail contoh Rp5.000; snapshot monitoring basi setelah lebih dari 5 menit. Semua bukan tarif/kebijakan produksi. Nilai yang belum diketahui tetap null, termasuk margin terealisasi, penerimaan pembayaran stok, dan biaya.

Clock manual mulai 10 September 2026 09.00 WIB dan hanya bergerak lewat kontrol demo, termasuk saat menguji logout/expiry. Refresh mempertahankan waktu terakhir, tanpa mengejar waktu dinding. Provisioning delay dan hasil provider dipilih eksplisit; late paid boleh memulihkan failed/expired mock, paid tidak boleh diturunkan oleh callback susulan.

State schema v1 pada baseline tahap 2 hanya untuk satu tab/browser, tanpa sinkronisasi lintas tab. Versi/data rusak dipertahankan sampai reset dikonfirmasi. Kontak `DEMO-WA-*` dan token deterministik sengaja sintetis; validasi form customer dan token acak tetap tahap 3. Enam kartu customer tetap proyeksi pratinjau dari 50 mitra pada store, bukan fixture kedua. Tidak ada izin melanjutkan tahap 3–6, integrasi nyata, atau deploy dari penyelesaian ini.

## Tambahan login staf dan voucher offline — 10 September 2026

### Keputusan user

- Backend lokal dengan login sungguhan; portal WiFi masih simulasi.
- Customer menggunakan satu kode voucher offline. Akun staf terpisah dari sesi voucher.
- Owner mengelola seluruh akses/akun; admin operasional tanpa pengelolaan akun owner; mitra hanya data miliknya. Implementasi sekarang membatasi seluruh pengelolaan akun kepada owner.
- Pertahankan UI yang disetujui. Permintaan tambahan ini tidak menyelesaikan dashboard/checkout tahap 3–6 dan tidak mengizinkan integrasi router atau deploy.

### Asumsi dan pilihan implementasi lokal

- Node HTTP lokal, data JSON satu proses di `.local/server`, scrypt password, sesi cookie HttpOnly dengan idle 30 menit/maksimum 8 jam. Tidak menambahkan dependency produksi atau mengubah stack React/Vite.
- Semua state domain runtime berasal dari server. localStorage lama tidak diimpor/ditimpa. Reset data sintetis meminta konfirmasi; akun staf tidak ikut direset.
- Kode offline server acak. Fixture deterministik tetap untuk pengujian domain. Startup ditolak jika envelope server rusak agar kode fixture tidak menjadi voucher portal yang dapat dipakai.
- Cookie bertanda tangan mewakili perangkat mock; site/SSID dari konfigurasi sintetis yang dipilih manual/link. Tidak membaca MAC/SSID atau membuka internet. Timer domain tetap manual dan mulai pada login pertama; expiry tidak reset saat reconnect.
- Stok offline hanya baca/copy untuk mencoba portal. Margin offline, bagi hasil online, idempotensi dan snapshot harga/rate tetap aturan tahap 2.

### Pertanyaan produksi

Belum ditetapkan: perangkat/RouterOS dan topologi HotSpot, RADIUS atau penyimpanan voucher router, domain/HTTPS dan walled garden, perilaku popup pada Android/iOS/laptop, identitas perangkat produksi, peran operasional yang lebih rinci, kebijakan password/MFA/recovery, database/sesi bersama, audit dan backup. Harga bulanan/rate/margin demo tetap asumsi, bukan keputusan komersial baru.

Petunjuk aktual: [AUTH_LOCAL.md](AUTH_LOCAL.md). Rancangan dan referensi teknis: [AUTH_CAPTIVE_PORTAL_PLAN.md](AUTH_CAPTIVE_PORTAL_PLAN.md).

## Tahap 3 — 10 September 2026

**Keputusan user:** bangun hanya alur customer, tanpa akun, nama dan WhatsApp wajib; pemilihan mitra manual; perangkat mengikuti paket; pembayaran QRIS/e-wallet dan notifikasi tetap simulasi; token acak tanpa pencarian nomor publik; paid tidak dibayar ulang ketika penerbitan gagal; pembelian sebelum tiba dan login kemudian; site/device/concurrency tetap aturan domain.

**Pilihan implementasi demo:** token bearer 32 byte acak di server, snapshot review dan key idempotensi tersimpan per tab; order dan key otoritatif tetap di store server. Nomor `08`, `628`, atau `+628` dinormalisasi ke `+628…` dengan separator umum; format valid tidak membuktikan nomor aktif/terdaftar di WhatsApp. QRIS diwakili kartu ilustrasi non-QR, tanpa payload pembayaran. Kontrol pada halaman detail hanya memengaruhi order token itu. Data global/reset/clock masih khusus owner. Backend menolak commit jika disk gagal; reset mengacak kode sebelum satu commit. Tidak mengimpor localStorage tahap 2 lama.

**Pertanyaan produksi:** kebijakan bearer-link/retensi/expiry akses tamu, pemulihan nomor salah atau tautan hilang, verifikasi identitas/nomor, provider dan callback nyata, rekonsiliasi paid-but-not-issued, harga/rate/biaya/refund, serta integrasi router tetap belum ditetapkan. Tahap 3 tidak menambahkan keputusan komersial baru atau klaim siap produksi.

## Tahap 4 — 11 September 2026

**Keputusan user:** dashboard mitra memakai store bersama, scoped mitra aktif, WhatsApp dimasking; stok read-only; unused tidak disamakan dengan belum terjual; potensi margin offline dipisahkan dari bagi hasil online. Pencairan belum ditentukan. Monitoring basi unknown. Tidak mengerjakan tahap 5–6.

**Pilihan implementasi demo:** filter tanggal inklusif berdasarkan WIB; mitra login memakai partnerId akun, owner dapat preview mitra aktif. Backend lokal memfilter koleksi dan menghapus token customer/checkout key dari respons mitra. Nomor dimasking juga di respons API mitra. Refresh state setiap 10 detik saat tab terlihat; gagal refresh menandai data terakhir dan status unknown. Ambang basi tetap 5 menit clock demo dari tahap 2. Tidak menambah dependency.

**Pertanyaan produksi:** otorisasi terdistribusi, cakupan akses nomor customer, retensi data, monitoring router nyata, rekonsiliasi stok/penjualan offline, basis biaya/pajak dan jadwal/prosedur pencairan belum ditetapkan. Login/guard server lokal tidak menjadi klaim siap produksi.

## Tahap 5 — 13 September 2026

**Keputusan user:** pengelolaan owner/admin dari store bersama, 50 titik awal, tambah/edit mitra, nonaktif hanya penjualan baru, paket dan ketersediaan per mitra, rate bagi hasil, batch offline dan audit. Arsip tidak menghapus riwayat. Alokasi bukan penerimaan pembayaran. Tidak mengerjakan tahap 6.

**Pilihan implementasi demo:** layanan `management` async dengan validasi backend lokal; audit memakai role/nama akun sesi server. Rate pada profil mitra diterapkan ke semua offer mitra sekarang dan menjadi default paket baru. Harga katalog pada form paket secara eksplisit diterapkan ke seluruh offer (termasuk mengganti override); harga khusus dapat diatur lagi di detail mitra. Paket baru/mitra baru mulai dengan offer tidak tersedia. Satu site sintetis per mitra; site baru unknown sampai pengamatan mock tersedia. Pencarian customer mencakup seluruh mitra, tampilan awal tetap enam kartu dengan tombol tampilkan lagi.

Batch berisi 1–500 kode sintetis acak baru, dibuat atomik; tidak menyediakan impor kode atau perpindahan batch. Kunci permintaan dan payload pending disimpan per tab sebelum kirim untuk pemulihan respons terputus. Referensi pembayaran opsional hanya catatan; nilai alokasi dengan referensi tetap bukan uang terverifikasi. Bidang model baru opsional, envelope v1 lama tetap dibaca tanpa reset; validator tidak lagi membatasi tepat 50 mitra.

**Pertanyaan produksi:** pencatatan pembayaran stok terverifikasi, sumber voucher router/RADIUS, rekonsiliasi, audit yang tidak dapat dimanipulasi, kontrol konkurensi admin, retensi/backup, komisi/biaya/pajak dan jadwal pencairan belum ditetapkan. Backend lokal, clock/sesi/monitoring mock dan harga contoh bukan layanan produksi.
