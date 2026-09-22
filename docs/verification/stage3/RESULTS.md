# Verifikasi tahap 3 — alur customer

Lingkungan: Windows, Node 24.20.0, React/TypeScript/Vite, Chromium lokal melalui Playwright. Backend tes 8788/frontend 5174 memakai `.local/auth-browser-tests`, terpisah dari aplikasi user 8787/5173. Tidak reset data aplikasi user.

## Pemeriksaan otomatis

- Typecheck dan `npm run build` lulus. JS 322,98 kB / 100,02 kB gzip, CSS 58,99 kB / 15,42 kB gzip, di luar media/font. Tidak menambahkan dependency.
- `npm run test:domain`: **18/18 lulus**, termasuk idempotensi paid/komisi, timer belum mulai saat membeli, reconnect, device reguler, kapasitas bulanan, snapshot harga/rate, persistensi dan reset.
- `npm run test:server`: **15/15 lulus**. Sepuluh regresi autentikasi/portal offline serta lima pengujian guest checkout, pemisahan payment/provisioning/notifikasi, login kemudian, device/concurrency, persistensi ketat, dan reset atomik.
- Run terarah awal tahap 3: **7/7 browser lulus** dalam 51,2 detik, termasuk respons checkout terputus lalu paket dinonaktifkan dan pemulihan order sama. Run final diperluas dengan copy kode, ilustrasi pembayaran, e-wallet dan screenshot voucher di tiga ukuran; hasil final dicatat di PROGRESS.
- Pemeriksaan bundle terhadap password awal, hash/salt akun, kode stok offline aktual, dan marker server/fixture: tidak ditemukan. Header/meta referrer `no-referrer`; API publik tidak mengembalikan daftar order/stok.
- Brief tidak berubah: SHA256 `45B5775239F98EB1562097AFE2D755CF5907D54A3AC4C201E0EE5AC02068AF1E`. SVG public sama dengan sumber user: `F1FDB4F5BAC0F287847C712DE81A9550F46D61EBD603946A73849B66C7A7688C`.

## Bukti perilaku

1. Checkout paralel/retry menghasilkan satu order dan satu token acak; nama dirapikan dan nomor `0812-3456-7890` menjadi `+6281234567890`. Huruf dalam nomor ditolak. Quote lama ditolak untuk order baru. Key sama dengan input berbeda ditolak.
2. Snapshot server dapat dibuka kembali setelah membuat instance baru; endpoint token fixture/WA lookup tidak memberikan detail. Customer tidak mendapat akun/komisi/rate privat.
3. Paid + provisioning gagal tetap paid tanpa voucher; retry pending tetap belum terbit. Setelah issued, WhatsApp gagal tidak menghapus voucher. Retry notifikasi dan pembayaran duplikat tidak menggandakan voucher/komisi.
4. Pembelian sebelum tiba tetap unused tanpa expiry. Salah jaringan ditolak. Login setelah clock dimajukan satu hari baru memulai masa berlaku; reconnect tidak mereset expiry.
5. Profil browser kedua reguler ditolak. Bulanan 2 menerima dua profil, menolak ketiga, lalu menerima setelah satu logout dengan expiry tetap.
6. Respons checkout sengaja diputus setelah server menerima order. Paket kemudian dinonaktifkan. Refresh/retry membuka token order yang sama, bukan membuat order tambahan.
7. Pengujian disk membuat penghalang pada path temporary write. Checkout ditolak 503 sebelum store dipublikasikan; sesudah penghalang dilepas retry key sama sukses dan persist. Reset dengan write gagal mempertahankan state aktif/disk lama.

## Temuan dan perbaikan

- Implementasi awal belum mempunyai endpoint/UI customer; tes baru gagal 404/locator sebelum implementasi, kemudian lulus.
- Review independen menemukan disk write gagal masih dilaporkan sukses karena fallback memori baseline. Backend sekarang memakai strict persistence; mode standalone domain tetap mempertahankan perilaku baseline untuk tes.
- Review menemukan early return katalog memblokir pemulihan order accepted ketika paket dihapus dari katalog. Draft kini menyimpan snapshot review dan recovery token didahulukan.
- Reset semula menulis fixture lalu kode acak pada commit kedua. Kini inventory acak disiapkan sebelum satu commit, termasuk pemanggilan service reset langsung.
- Regresi keyboard portal lama sempat menekan Tab sebelum form login selesai dimuat. Prasyarat tes diperbaiki untuk menunggu heading login, tanpa mengubah perilaku aplikasi atau melemahkan pemeriksaan fokus.

## Visual dan batas

Screenshot paket, review, pembayaran, voucher tersedia pada 360/768/1440 px; status provisioning gagal, WhatsApp gagal dengan voucher tersimpan, serta voucher aktif juga direkam. Visual diperiksa langsung dan hasil final dirangkum di PROGRESS. Semua komponen baru memakai gaya glass dan SVG yang ada.

Ini bukan uji provider/router/perangkat fisik. Tidak ada QR pembayaran aktif, transaksi uang, pesan WhatsApp, pembacaan SSID/MAC atau jaringan otomatis. Belum diuji pada Safari/Firefox/pembaca layar/produksi. [Panduan review manual](../../STAGE3_CUSTOMER.md).

Pembaruan penutupan 11 September 2026: tujuh tes customer yang diperluas semuanya lulus dalam run gabungan 21/21 bersama auth dan tahap 4. Hasil JSON/screenshot terbaru berada di `../stage4`. Run sebelumnya 28/32 bukan bukti satu full run sukses; empat kasus gagal telah diulang dan lulus pada run gabungan tersebut. Detail angka terbaru ada pada PROGRESS tahap 4.
