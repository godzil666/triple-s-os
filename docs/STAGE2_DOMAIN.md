# Tahap 2 — Model dan mesin simulasi

> Pembaruan setelah tahap 2: runtime aplikasi kini memakai backend lokal dan proyeksi API sesuai akun, bukan store localStorage browser. Mesin domain/fixture deterministik tetap dipakai untuk pengujian; kode offline pada runtime server diacak. Lihat [AUTH_LOCAL.md](AUTH_LOCAL.md) untuk persistensi, akun, serta batas portal terbaru. Bagian berikut menyimpan dokumentasi baseline tahap 2.

Implementasi ini adalah fondasi demo lokal. Halaman checkout, detail customer, dashboard transaksi/monitoring, dan pengelolaan operasional tetap untuk tahap 3–5. UI hero, SVG, footer, dan glassmorphism yang disetujui dipertahankan.

## Sumber data dan kontrak

- `src/domain/models.ts`: model terpisah Partner, Site, Package, PartnerPackage, Order, Payment, Voucher, OfflineBatch, Session, CommissionEntry, NotificationAttempt, AuditEvent, MonitoringSnapshot, konteks, dan skenario.
- `src/domain/config.ts` dan `fixtures.ts`: konfigurasi serta fixture deterministik. Tidak memakai waktu mesin, random ID, kontak nyata, atau pembacaan perangkat/jaringan.
- `src/domain/store.ts`: satu state sintetis, snapshot beku, subscription React, transaksi sinkron atomik, versioned persistence, expiry, dan reset.
- `src/domain/selectors.ts`: sumber perhitungan ringkasan terfilter mitra serta status monitoring. Jangan menambahkan angka dashboard terpisah pada tahap berikutnya.
- `src/services/contracts.ts`: PaymentService, VoucherService, NotificationService, MonitoringService, PartnerService, CommissionService; tambahan OrderService dan DemoService. Semua metode mengembalikan Promise.
- `src/services/mock.ts`: implementasi tanpa I/O jaringan. Setiap mutasi diselesaikan atomik sebelum Promise resolve; hasil query/mutasi berupa salinan. Duplikasi paralel dalam satu store tidak menerbitkan artefak ganda.
- `src/demo/DemoContext.tsx`: instance store/services tunggal per aplikasi. Pilihan mitra dashboard dan kontrol skenario memakai konteks yang sama.
- `src/demo/ScenarioPanel.tsx`: alat presentasi engine yang dibuka dari banner **Kontrol demo**. Bukan checkout atau autentikasi. Form halaman tahap berikutnya tetap placeholder.

Halaman customer menampilkan enam kartu pratinjau yang sudah disetujui sebagai proyeksi dari store 50 mitra. Panel dan pemilih mitra dashboard menyediakan semua 50 mitra. Penyajian direktori customer lengkap dilanjutkan pada tahap 3.

## Fixture dan asumsi

| Data | Isi awal |
|---|---|
| Mitra/site | 50 mitra fiktif, masing-masing satu Site terpisah. Enam nama/SSID pratinjau lama dipertahankan. |
| Katalog | 5 paket; 250 penawaran PartnerPackage yang memodelkan harga, ketersediaan, dan rate per mitra. |
| Reguler | 3 jam Rp5.000; 5 jam Rp7.000; 24 jam Rp10.000; satu perangkat pertama, 10 Mbps contoh. |
| Bulanan | 30 hari: dua perangkat Rp150.000 atau empat perangkat Rp250.000, 10 Mbps contoh. Harga/durasi adalah asumsi, bukan tarif disetujui. |
| Offline | 6 batch × 5 voucher. Grosir Rp3.500, retail contoh Rp5.000. Referensi pembayaran stok null; tidak ada ledger penjualan retail. |
| Order | 8 order sintetis: pending/failed/expired; paid dengan provisioning pending/failed/issued. 5 paid memiliki tepat 5 komisi; 3 voucher online terbit. |
| Sesi | 3 sesi aktif awal dari voucher fixture; angka bukan 500 pengguna harian dan bukan telemetri router. |
| Monitoring | 50 snapshot: 48 online, 1 offline, 1 unknown. Ambang basi >5 menit adalah asumsi konfigurasi. |
| Clock | Mulai 10 September 2026 09.00 WIB (02.00 UTC). Manual/berhenti; tombol +6 menit, +1 jam, +31 hari. Refresh/waktu dinding tidak memajukan clock. |

Nama customer sintetis dan kontak `DEMO-WA-*` sengaja bukan nomor telepon yang bisa dikirimi pesan. Token/kode `DEMO-*` deterministik, bukan token akses rahasia. Validasi/normalisasi form customer serta token acak adalah pekerjaan tahap 3; kontrak mock saat ini hanya menerima kontak sintetis.

## Transisi dan invariannya

1. `orders.create` menyimpan snapshot paket lengkap, harga, partner/site, rate dan basis sebelum pembayaran. Pembelian sebelum tiba di lokasi diperbolehkan; tidak memeriksa site online untuk membeli.
2. `payments.settle` mengubah Payment saja beserta status administratif Order/komisi. Paid bersifat terminal; callback duplikat atau failed setelah paid tidak mengubahnya. Late paid dapat merekonsiliasi failed/expired mock (asumsi demo, bukan kebijakan provider). Pending/failed/expired tidak membuat komisi.
3. Komisi satu per `orderId`, dari snapshot basis gross sebelum biaya. `Math.round(basisRp * ratePercent / 100)`: Rp5.000 ×20%=Rp1.000; Rp5.003 ×20%=Rp1.001. Biaya/pajak/pencairan tidak direka sebagai nol.
4. `vouchers.issue` harus melihat paid. Skenario provisioning pending/failed menghasilkan null tanpa voucher; dapat diulang. Issued menerbitkan satu voucher unused. Retry setelah issued selalu memakai voucher yang sama meskipun pilihan skenario kemudian diganti.
5. `notifications.send` hanya boleh setelah voucher terbit. Setiap retry mencatat NotificationAttempt sendiri, tanpa menerbitkan voucher/komisi. Tidak ada pesan yang dikirim keluar.
6. `vouchers.login` memeriksa expiry, site binding, ketersediaan mock, binding perangkat reguler, dan batas sesi. Penolakan tidak memulai atau mengubah timer. Site dipilih manual; tidak ada deteksi MAC/SSID, fingerprint, captive-portal login nyata, atau pemilihan WiFi otomatis.
7. Login sukses pertama menetapkan `firstActivatedAt` dan `expiresAt` sekali. Voucher reguler mengunci device pertama. Reconnect pada device sama memakai sesi aktif yang sama; setelah logout dapat membuat sesi baru dengan expiry tetap. Device reguler lain tetap ditolak setelah logout.
8. Paket bulanan membatasi 2/4 sesi aktif, bukan jumlah perangkat sepanjang umur voucher. Slot bebas saat logout; semua sesi berbagi expiry pertama. Logout tidak menghentikan timer: memajukan clock tetap mengurangi masa berlaku.
9. Advance clock mengakhiri semua sesi yang mencapai expiry dan mengubah voucher menjadi expired, tepat pada batas waktu. Clock tidak dapat mundur; reset berkonfirmasi mengembalikan fixture.
10. Deaktivasi mitra/ketersediaan penawaran/arsip paket membatasi pembelian baru saja. Tidak mengubah voucher, router, atau snapshot transaksi lama.

## Offline, monitoring, dan agregat

`selectSummary(state, partnerId?)` menurunkan paid count, gross online, komisi, perangkat/sesi aktif, stok dialokasikan/unused, dan potensi margin offline dari store yang sama. Perangkat dihitung unik per site/device dari sesi belum berakhir dan voucher belum expired. Ini keadaan sesi mock, bukan bukti perangkat benar-benar terhubung. Ketersediaan site/polling tidak diam-diam menghapus sesi.

Aktivasi voucher offline tidak membuat Order, Payment, atau CommissionEntry. Alokasi bukan uang diterima; unused bukan bukti belum terjual. `offlineRealizedMarginRp`, `stockPaymentsReceivedRp`, dan `feesRp` bernilai null karena bukti belum tersedia. Potensi margin memakai snapshot batch, bukan harga katalog terbaru.

`monitoringStatus` memberi unknown jika snapshot tidak ada, polling gagal, atau observedAt lebih tua dari ambang. Polling gagal mempertahankan waktu observasi terakhir, tanpa menyatakan offline. Status ketersediaan situs mock untuk login terpisah dari freshness monitoring; snapshot basi tidak membuktikan router mati.

## Persistensi dan batas teknis

- Key tunggal: `triple-s-os:synthetic-demo`; envelope `version: 1`, data sintetis, checksum, dan pemeriksaan bentuk/referensi/invarian dasar. Checksum mendeteksi kerusakan biasa, bukan tanda tangan keamanan.
- Setiap mutasi menyimpan state penuh. Refresh memulihkan clock, konteks, skenario, snapshot historis, pembayaran, voucher, serta sesi. Snapshot store dibekukan agar komponen tidak memutasinya langsung.
- Versi tidak dikenal/data rusak tidak dimigrasi atau ditimpa diam-diam. Aplikasi memakai fixture dalam memori dengan pesan penjelasan; data lama dipertahankan sampai reset disetujui.
- Reset membutuhkan `confirmed === true` di layanan dan konfirmasi dua langkah pada panel. Hanya menulis ulang key aplikasi; tidak memakai `localStorage.clear()`.
- localStorage diblokir/penuh menghasilkan pesan mode memori. Perubahan di memori tetap berfungsi, tetapi refresh dapat menghilangkannya jika belum berhasil disimpan.
- Batas dukungan: satu tab/browser untuk presentasi. Tidak ada sinkronisasi, lock transaksi lintas tab, otorisasi, database/server, callback bertanda tangan, rekonsiliasi provider, atau proteksi terhadap pengguna yang mengedit storage. Dua tab dapat menimpa snapshot; gunakan satu tab untuk mengubah demo.
- Clock manual tidak mengejar waktu saat aplikasi ditutup. Provisioning delay dan kegagalan adalah pilihan skenario eksplisit, tanpa timer acak/backoff otomatis.

## Pemeriksaan

Jalankan `npm run typecheck`, `npm run test:domain`, `npm run build`, serta `npm run test:browser`. Tes domain memakai `node:test` pada Node yang sudah tersedia; tidak menambah dependency atau SDK. Playwright mengecualikan direktori tes domain. Hasil aktual dan langkah review: [PROGRESS.md](PROGRESS.md).
