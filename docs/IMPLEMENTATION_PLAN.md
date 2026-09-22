# Triple S OS — Implementation Plan

Status 13 September 2026: tahap 0–6 selesai sebagai demo lokal. Verifikasi formal kontras/pembaca layar, Safari/Firefox, perangkat fisik, load, deployment, dan router nyata tetap terbuka. Hasil aktual dan batas verifikasi: [PROGRESS.md](PROGRESS.md) serta [verification/stage6/RESULTS.md](verification/stage6/RESULTS.md).

**Tujuan:** demo presentasi lokal lintas customer, mitra, dan owner/admin sesuai [PROJECT_BRIEF.md](PROJECT_BRIEF.md).

**Arsitektur:** React + TypeScript + Vite karena folder belum memiliki aplikasi. Pisahkan domain, layanan async mock, konfigurasi/fixture demo, fitur per peran, komponen bersama, dan dokumentasi; satu store sintetis menjadi sumber seluruh tampilan.

**Stack rencana:** npm dengan `package-lock.json`, routing client dan CSS responsif. Versi dependency serta library routing/test baru dipilih setelah verifikasi runtime dan dokumentasi resmi pada tahap 1/2; tahap 0 tidak memasang paket.

**Rujukan:** [DECISIONS.md](DECISIONS.md) membedakan keputusan user, asumsi demo, pertanyaan produksi dan batas simulasi. [PROGRESS.md](PROGRESS.md) menyimpan hasil nyata.

## Kendali tahap

Tahap 0 hanya inspeksi dan dokumentasi, selesai sebelum implementasi. Tahap 1 **selesai pada 9 September 2026**; bukti ada di PROGRESS.md. Tahap 2 **selesai pada 10 September 2026**; tahap 3–6 **belum dijalankan**. Checklist tahap 1 di bawah mencatat hasil, bukan izin melanjutkan. Jalankan hanya tahap yang diminta user, periksa hasil, perbarui PROGRESS dengan pemeriksaan yang benar-benar dilakukan, lalu berhenti. Review browser dilakukan sebelum user mengirim prompt tahap berikutnya. Jika browser tidak tersedia, catat visual belum diperiksa. Jangan mengubah pekerjaan/desain yang telah disetujui atau melakukan migrasi tanpa kebutuhan.

## Kontrak global

- Selalu pemilihan mitra manual; voucher terikat satu mitra/site, boleh dibeli sebelum tiba. Nama dan WA wajib, tanpa akun customer.
- Timer baru mulai setelah login pertama berhasil, berjalan saat logout, tidak reset saat reconnect. Reguler terikat perangkat pertama; bulanan membatasi sesi bersamaan dengan timer bersama sebagai asumsi demo.
- Payment, provisioning, voucher dan notifikasi mempunyai status terpisah. Idempotensi mencegah voucher/komisi/sesi ganda. Riwayat harga/aturan/rate/basis memakai snapshot.
- Margin offline bukan bagi hasil online. Alokasi stok bukan penjualan/uang diterima; unused bukan belum terjual. Unknown tidak disamarkan sebagai online/offline.
- Semua asumsi dan angka fixture berlabel contoh; nominal belum diketahui bukan nol resmi. Gunakan pembulatan bagi hasil demo dalam DECISIONS.
- Banner mode demo, tanpa integrasi nyata/credential/data pribadi nyata, tanpa QR pembayaran aktif, tanpa deploy/push atau klaim siap produksi.
- Bahasa Indonesia, rupiah, zona Asia/Jakarta; simpan timestamp ISO/UTC. Input berlabel, fokus terlihat, status tidak hanya warna, tombol sentuh nyaman, loading/error/empty state.

## Peta file yang direncanakan

Path berikut adalah usulan pekerjaan mendatang, bukan file yang telah dibuat. Periksa ulang inventaris sebelum tiap tahap dan pertahankan file baru milik user.

| Path | Tanggung jawab / tahap |
|---|---|
| `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig*.json` | Fondasi, scripts dan versi terkunci — 1 |
| `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx` | Entrypoint, routing, komposisi peran — 1 |
| `src/styles/tokens.css`, `src/styles/global.css` | Palet, typography, spacing, fokus, responsif — 1 |
| `src/components/{Button,Input,Select,Card,Badge,Table,Dialog,EmptyState}.tsx` | Komponen bersama — 1 |
| `src/app/layouts/{CustomerLayout,PartnerLayout,OwnerLayout}.tsx` | Tiga layout, navigasi responsif — 1 |
| `src/demo/DemoBanner.tsx`, `src/demo/RoleSwitcher.tsx` | Penanda dan pemilih konteks demo — 1 |
| `src/features/customer/PartnerPickerPage.tsx` | Halaman pilih mitra representatif — 1 |
| `src/domain/models.ts`, `src/domain/rules.ts`, `src/domain/rules.test.ts` | Model, transisi/aturan, tes perilaku — 2 |
| `src/services/contracts.ts`, `src/services/mockServices.ts` | Kontrak async dan implementasi mock — 2 |
| `src/demo/{config,fixtures,store,persistence,clock,context}.ts`, `src/demo/ScenarioPanel.tsx` | Konfigurasi asumsi, state, skenario dan reset — 2 |
| `src/features/customer/{PackagesPage,CheckoutPage,OrderPage,VoucherPage}.tsx` | Alur customer melalui service — 3 |
| `src/features/partner/{DashboardPage,StockPage,SalesPage,CommissionPage,SessionsPage}.tsx` | Dashboard scoped mitra — 4 |
| `src/features/owner/{OverviewPage,PartnersPage,PackagesPage,StockPage,TransactionsPage,AuditPage}.tsx` | Pengelolaan owner dan rate mitra — 5 |
| `README.md`, `docs/DEMO_SCRIPT.md`, `docs/ACCEPTANCE_CHECKLIST.md`, `docs/PRODUCTION_READINESS.md` | Paket presentasi dan hasil penerimaan — 6 |
| `docs/PROGRESS.md`, `docs/DECISIONS.md` | Hasil setiap tahap; keputusan baru hanya diberi label sesuai sumber |

Logo yang dituju tetap `public/brand/triple-s-logo.jpg`; saat ini tidak ada. Jangan menimpa `public/logo SSS.svg`. Gunakan wordmark sementara bila JPG belum tersedia.

## Tahap 1 — Fondasi dan tampilan responsif

**Masukan:** brief, keputusan tahap 0, inspeksi ulang file/runtime. **Keluaran:** shell navigasi tiga peran dan halaman pemilihan mitra untuk review desain.

- [x] Periksa perubahan sejak tahap 0, pilih versi kompatibel dari dokumentasi resmi, siapkan React/TypeScript/Vite tanpa menimpa docs/aset. Buat scripts dev, typecheck dan build serta lockfile npm.
- [x] Buat tokens sesuai palet brief; pisahkan warna dekoratif dari teks/status agar kontras terbaca. Implementasikan delapan komponen pada peta file dan layout customer/mitra/owner.
- [x] Buat banner persis sesuai DECISIONS, pemilih peran dan mitra demo; jelaskan bukan login aman. Gunakan logo asli dengan contain/ruang putih bila tersedia, atau wordmark sementara.
- [x] Daftarkan `/`, `/mitra/:id/paket`, `/checkout`, `/pesanan/:token`, `/voucher/:token`, `/mitra-dashboard`, `/admin`. Usulan subroute: `/mitra-dashboard/stok`, `/mitra-dashboard/penjualan`, `/mitra-dashboard/bagi-hasil`, `/mitra-dashboard/pengguna`, `/admin/mitra`, `/admin/mitra/:id`, `/admin/paket`, `/admin/stok`, `/admin/transaksi`, `/admin/aktivitas`. Halaman tahap berikutnya diberi placeholder jelas.
- [x] Buat pilih/cari mitra representatif dengan nama, area, SSID contoh dan pilihan manual. Belum membuat checkout atau mesin transaksi.
- [x] Jalankan build, buka ketiga layout di 360/768/1440 px, periksa keyboard, fokus, navigasi dan overflow halaman. Catat command dan hasil, keterbatasan browser serta langkah review manual di PROGRESS.

**Kriteria selesai:** tiga layout dapat dibuka, logo/wordmark dan warna konsisten, navigasi responsif berfungsi, pilih mitra layak direview, build berhasil. Berhenti setelah tahap 1.

## Tahap 2 — Domain dan mesin simulasi

**Masukan:** fondasi yang direview. **Keluaran:** store bersama dan layanan mock untuk seluruh fitur berikutnya.

- [x] Definisikan Partner, Site, Package, PartnerPackage, Order, Payment, Voucher, OfflineBatch, Session, CommissionEntry, NotificationAttempt, AuditEvent serta monitoring snapshot `observedAt`. Order menyimpan partner/site, snapshot paket, nama/WA, nominal rupiah, channel/status; Voucher menyimpan sumber order/batch, site, duration, maxConcurrentDevices, firstActivatedAt/expiresAt dan binding reguler. CommissionEntry menyimpan orderId unik, rate snapshot, basis/nominal.
- [x] Definisikan PaymentService, VoucherService, NotificationService, MonitoringService, PartnerService, CommissionService di kontrak async. UI hanya memanggil layanan; mutasi layanan memperbarui satu store. Pisahkan transisi payment/provisioning/voucher dan retry notifikasi.
- [x] Buat fixture deterministik 50 mitra fiktif, paket contoh reguler/bulanan, stok batch, order, sesi dan monitoring. Tetapkan nilai konfigurasi fixture yang masih terbuka dengan label asumsi, termasuk harga bulanan dan ambang basi. Perangkat online diturunkan dari sesi, bukan angka 500 harian.
- [x] Implementasikan persistensi berversi, refresh, reset berkonfirmasi yang hanya membersihkan state demo, clock yang dapat dimajukan, device/site context mock dan panel skenario. Tidak membaca MAC/SSID asli.
- [x] Implementasikan site/device binding, login pertama, expiry, concurrency bulanan, sesi perangkat sama yang idempoten, snapshot historis serta bagi hasil paid satu kali dengan pembulatan terdokumentasi.
- [x] Uji perilaku: paid duplikat menghasilkan satu voucher/satu komisi; membeli/issued belum memulai timer; login salah mitra tidak mengubah timer; reconnect tidak memperpanjang expiry; perangkat reguler kedua ditolak; slot bulanan penuh ditolak dan logout membebaskan slot; retry notifikasi tidak menggandakan voucher; expired ditolak; perubahan harga/rate tidak mengubah riwayat. Gunakan clock terkendali, bukan menunggu waktu nyata.
- [x] Jalankan typecheck, tes domain dan build. Verifikasi state bertahan setelah refresh, reset mengembalikan fixture dan tidak menyentuh penyimpanan di luar demo. Catat hasil.

**Kriteria selesai:** aturan bisnis lulus tes bermakna dan state konsisten setelah refresh/reset. Berhenti setelah tahap 2.

## Tahap 3 — Alur customer lengkap

**Masukan:** mock services dan store tahap 2. **Keluaran:** pembelian sampai aktivasi simulasi di route customer.

- [x] Implementasikan pilih mitra manual → paket/pilihan perangkat sesuai paket → nama/WA → review → QRIS/e-wallet simulasi → pembayaran → penerbitan → detail voucher/preview WhatsApp → Sambungkan simulasi.
- [x] Tampilkan mitra, syarat satu lokasi, durasi sejak login pertama dan batas perangkat sebelum bayar. Validasi nama/WA dan normalisasi nomor Indonesia; jangan mengklaim format valid berarti terdaftar di WhatsApp. Token acak untuk detail, tanpa pencarian publik via WA.
- [x] Tambahkan pending, sukses, gagal, timeout, provisioning tertunda/gagal dan WhatsApp gagal. QR hanya ilustrasi tidak dapat ditransaksikan. Paid tetapi belum issued menampilkan proses/bantuan tanpa bayar ulang; WA gagal tetap menampilkan voucher dengan retry terpisah. Refresh tidak membuat order baru.
- [x] Sambungkan memakai mock site/device; jaringan salah/belum sesuai memberi instruksi memilih WiFi pada pengaturan perangkat. Tampilkan unused tanpa countdown, lalu expiry/sisa waktu setelah login berhasil. Tangani site offline, binding perangkat dan slot penuh.
- [x] Uji browser sukses serta kegagalan utama, termasuk membeli sebelum tiba lalu aktivasi kemudian, salin kode, refresh, retry WA dan timer. Catat hasil di PROGRESS.

**Kriteria selesai:** customer menyelesaikan pembelian dan aktivasi simulasi tanpa mengetik ulang voucher; semua status gagal dapat dipahami tanpa klaim koneksi nyata. Berhenti setelah tahap 3.

## Tahap 4 — Dashboard mitra

**Masukan:** transaksi customer pada store bersama. **Keluaran:** dashboard dan detail milik mitra demo aktif saja.

- [x] Buat status titik/observedAt, jumlah perangkat online, batch stok per paket/status, penjualan online, filter tanggal/status/paket, detail transaksi, perolehan/riwayat bagi hasil dan sesi aktif alias beserta waktu mulai/akhir. Masking WA secara default.
- [x] Scope semua query dan route detail ke mitra aktif; URL milik mitra lain menampilkan akses ditolak dalam simulasi. Dokumentasikan bahwa ini belum otorisasi server produksi; pemeriksaan backend lokal dipertahankan.
- [x] Stok read-only; tampilkan jumlah diserahkan/unused/aktif/expired tanpa menyamakan unused dan belum terjual. Pisahkan potensi margin offline dan bagi hasil online. Status/jadwal pencairan belum dikonfigurasi, tanpa pembelian stok atau pencairan nyata.
- [x] Monitoring basi menjadi unknown, dengan waktu pembaruan terlihat. Verifikasi offline berbeda dari gagal polling.
- [x] Uji pembelian customer menambah tepat satu transaksi/satu bagi hasil pada mitra yang benar; mitra lain dan URL lintas mitra tidak membocorkan data. Periksa HP/tablet/desktop dan catat hasil.

**Kriteria selesai:** dashboard mencerminkan transaksi customer dan tidak menampilkan data mitra lain. Berhenti setelah tahap 4.

## Tahap 5 — Dashboard owner dan pengelolaan

**Masukan:** layanan dan data bersama; transaksi historis dipertahankan. **Keluaran:** pengelolaan fungsional lintas peran dan audit log.

- [x] Buat overview seluruh 50 titik fixture menurut online/offline/unknown, perangkat online saat ini, transaksi/bagi hasil; daftar/detail mitra, pencarian/filter, tambah/edit dan aktif/nonaktif penjualan baru.
- [x] Buat form paket durasi/kecepatan/harga/batas perangkat, ketersediaan per mitra, arsip paket dan rate per mitra. Validasi nilai; perubahan hanya memengaruhi pembelian baru, riwayat memakai snapshot.
- [x] Buat pemberian batch offline dengan harga grosir/jual contoh, sumber kode dan referensi pembayaran jika tersedia. Tolak kode duplikat/pemindahan voucher yang sudah dialokasikan. Alokasi tanpa referensi tidak dihitung sebagai uang diterima.
- [x] Buat transaksi berfilter mitra/tanggal/status dan audit perubahan mitra/paket/stok/rate. Rekap memisahkan penjualan online, bagi hasil, stok grosir dan potensi margin offline. Tidak menjumlahkan metrik berbeda menjadi pendapatan palsu.
- [x] Uji admin ubah harga → customer melihat harga baru → membeli → mitra menerima bagi hasil snapshot → owner melihat transaksi. Pastikan riwayat harga/rate tetap, nonaktif tidak membatalkan voucher lama/mengklaim router mati, dan mitra tidak membuka halaman admin dalam simulasi.
- [x] Jalankan tes aturan yang terdampak dan build; catat hasil lintas peran di PROGRESS.

**Kriteria selesai:** aksi admin mengubah data relevan lintas halaman, riwayat utuh, rekap konsisten. Berhenti setelah tahap 5.

## Tahap 6 — Verifikasi dan paket presentasi

**Masukan:** demo tahap 1–5. **Keluaran:** demo lokal yang bisa diulang dan bukti penerimaan; bukan layanan produksi.

- [x] Jalankan customer → mitra → owner dari reset, termasuk paid duplikat, salah lokasi, WA gagal, penerbitan tertunda, perangkat terkunci, limit bulanan, expiry, refresh/reset dan scoped access. Perbaiki bug terkait tanpa fitur baru.
- [x] Periksa browser 360/390/768/1024/1440 px: fokus keyboard, label, kontras, error/empty/loading dan overflow. Pisahkan hasil browser nyata dari pemeriksaan struktural.
- [x] Jalankan domain tests, typecheck dan production build yang tersedia. Catat command, lulus/gagal/belum dapat diuji dan keterbatasan secara faktual.
- [x] Buat README berisi install/run/build, reset, fixture aman dan batas demo; DEMO_SCRIPT presentasi 5–7 menit; ACCEPTANCE_CHECKLIST hasil nyata; PRODUCTION_READINESS keputusan/akses yang dibutuhkan.
- [x] Di readiness, uraikan urutan sesudah demo: review bisnis → survei teknisi satu titik → backend/database/auth/otorisasi → payment sandbox dan WhatsApp → adaptor MikroTik backend tervalidasi → uji akses pra-internet → pilot dengan observabilitas/backup/rollback/rekonsiliasi. Semua hanya rencana, tanpa meminta kredensial untuk demo.
- [x] Pastikan tidak ada pesan/pembayaran/perubahan router nyata dan semua integrasi berlabel simulasi. Laporkan URL lokal/cara menjalankan, bukti verifikasi dan batas tersisa; tidak deploy/push remote.

**Kriteria selesai:** demo dapat diulang dari reset dan cerita bisnis lengkap dapat diperagakan tanpa manipulasi manual data. Berhenti setelah tahap 6; integrasi/pilot membutuhkan instruksi terpisah.

