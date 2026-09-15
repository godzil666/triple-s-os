# Verifikasi tahap 4 — dashboard mitra

Tanggal: 11 September 2026. Windows/Chromium Playwright, backend tes 8788 dan frontend 5174, data terpisah di `.local/auth-browser-tests`. Data aplikasi user tidak direset.

## Cakupan

- Pembelian customer nyata melalui UI tahap 3 menghasilkan satu transaksi paid dan satu ledger bagi hasil pada Cisaat; pembayaran duplikat tidak menggandakan. Tes domain membandingkan agregat Cibadak sebelum/sesudah dan membuktikan tidak berubah.
- Detail URL lintas mitra ditolak pada owner preview maupun akun mitra. WA dimasking pada UI/API, bearer token customer tidak dikirim kepada mitra. Pengujian HTTP memeriksa `/api/state` dan `orders.list`, termasuk argumen mitra palsu.
- Filter tanggal inklusif WIB dan status, stok read-only, snapshot offline menjadi unknown sesudah 301 detik clock demo, observedAt tetap. Data gagal diperbarui tidak dianggap online.
- Lima halaman mitra diuji pada 360/768/1440 px tanpa overflow halaman atau pageerror. Screenshot overview HP, stok tablet dan penjualan desktop diperiksa langsung; tabel lebar memakai region scroll internal yang dapat difokuskan. Gaya glass, SVG dan footer dipertahankan.
- Regresi login/portal offline dan tujuh alur customer ikut diuji karena dashboard bergantung pada login dan transaksi tersebut.

## Temuan selama verifikasi

Tes filter pertama mengasumsikan fixture Cisaat sudah paid setelah reset, padahal pending. Persiapan tes diperbaiki dengan memanggil payment service agar ada transaksi paid; perilaku filter tidak diubah. Regresi salin kode customer kini meminta izin clipboard Chromium secara eksplisit. Dua tes keyboard lama menunggu form login siap sebelum menekan Tab. Timeout voucher pada run sebelumnya tidak berulang dalam run akhir; tidak ada perubahan aplikasi untuk menyembunyikan kegagalan.

Review kode independen tidak menemukan masalah material scope/perhitungan. Rekomendasi tes gagal refresh API ditambahkan. Hasil akhir command tercatat di [PROGRESS.md](../../PROGRESS.md).

## Batas

Bukan pengujian router/provider/produksi. Perangkat online berasal dari sesi sintetis; clock manual. Data finansial contoh, payout belum ditentukan. Tidak menambahkan pembelian stok, pencairan atau integrasi nyata. Browser lain, perangkat fisik dan pembaca layar belum diverifikasi.

## Hasil akhir

Build/typecheck lulus; domain 19/19; server 15/15 dengan scope/masking HTTP diulang 1/1 setelah assertion tambahan. Browser gabungan 21/21 (5 mitra, 7 customer, 9 auth/portal), tambahan gagal refresh 1/1. Enam kasus tahap 4 lulus lintas dua run; tidak diklaim satu run penuh seluruh suite. `browser-results.json` berisi run gabungan; `refresh/browser-results.json` berisi tes gagal pembaruan.
