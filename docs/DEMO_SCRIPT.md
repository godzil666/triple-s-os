# Demo Script Triple S OS (5–7 menit)

## Persiapan

1. Jalankan `npm run dev`, buka `http://127.0.0.1:5173/`, dan pastikan banner **Mode demo** terlihat.
2. Login owner/admin/mitra memakai akun lokal pada `docs/AUTH_LOCAL.md`. Gunakan data sintetis; reset melalui **Kontrol demo → reset → konfirmasi** bila perlu. Siapkan tab customer, mitra Cisaat, dan owner/admin.

## Alur

### Menit 0–1 — Konteks

Jelaskan pemisahan customer, operasional mitra, dan pengelolaan owner. Pembayaran, WhatsApp, monitoring, dan koneksi pada sesi ini adalah simulasi.

### Menit 1–2 — Customer

Pilih mitra Cisaat secara manual, pilih paket reguler/bulanan, isi nama dan WhatsApp, review, buat pesanan, lalu simulasikan pembayaran sukses. Tunjukkan status provisioning, kode voucher, preview WhatsApp, dan tombol **Sambungkan WiFi**. Jelaskan browser tidak memilih SSID otomatis.

### Menit 2–3 — Failure states

Dengan panel skenario, tunjukkan pending/gagal, provisioning tertunda, dan WhatsApp gagal. Tegaskan status terpisah, voucher tidak hilang saat WhatsApp gagal, dan voucher sebelum tiba belum memiliki countdown. Timer dimulai saat login simulasi pertama yang benar.

### Menit 3–4 — Mitra

Login mitra Cisaat. Tunjukkan observedAt, sesi online sintetis, status site, stok read-only, penjualan, dan bagi hasil. Buka detail order untuk menunjukkan masking WhatsApp dan snapshot harga/rate. Coba URL/order lintas mitra dan tunjukkan akses ditolak. Maju-kan clock atau putus polling untuk menunjukkan `unknown`.

### Menit 4–6 — Owner/admin

Tunjukkan 50 titik dan filter status. Ubah harga katalog/rate, buat pembelian baru, dan tunjukkan komisi memakai snapshot. Ubah lagi harga/rate lalu buka transaksi lama. Peragakan tambah/edit mitra, arsip paket, offer per mitra, alokasi batch sintetis, transaksi, dan audit. Tekankan alokasi stok bukan bukti penjualan/penerimaan uang.

### Menit 6–7 — Penutup

Tunjukkan acceptance checklist dan ulangi bahwa semua status sukses/gagal adalah simulasi. Tutup dengan langkah berikutnya: keputusan bisnis, survei satu router, backend produksi, sandbox provider, dan pilot satu mitra. Jangan menyebut demo siap produksi.
