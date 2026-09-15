# Tahap 3 — Pembelian dan aktivasi customer

Tahap ini memakai service domain dan satu store server yang sudah tersedia. Login staf, portal offline, UI glassmorphism, hero, SVG dan footer tetap dipertahankan. Dashboard tahap 4–5 serta integrasi produksi belum dikerjakan.

## Cara mencoba

1. Jalankan `npm run dev` dari root repository; buka `http://127.0.0.1:5173/`. Tidak perlu login staf.
2. Pilih nama mitra secara manual, misalnya **Mitra Cisaat**, kemudian paket reguler atau bulanan. Jumlah perangkat berasal dari paket, bukan angka bebas. Semua harga/aturan contoh diberi label.
3. Isi nama dan nomor contoh `081234567890`, pilih QRIS atau e-wallet simulasi, lalu **Review pesanan**. Nomor tampil sebagai `+6281234567890`. Periksa mitra, SSID, harga, satu lokasi, durasi sejak login pertama, dan batas perangkat.
4. Tekan **Buat pesanan simulasi**. Halaman `/pesanan/:token` menggunakan token acak; status awal pending. Ilustrasi metode bukan QR dan tidak mengandung payload pembayaran.
5. **Simulasikan pembayaran sukses** menjalankan mock payment → provisioning → notifikasi sesuai pilihan kontrol transaksi. Voucher yang terbit masih belum aktif, tanpa countdown/expiry sebelum login pertama.
6. Salin tautan pesanan untuk kembali setelah menutup halaman. Detail `/voucher/:token` memakai token yang sama, bukan pencarian nomor WhatsApp. Tautan memberi akses ke data pesanan: simpan secara pribadi.
7. Tekan **Sambungkan WiFi simulasi** sebelum memilih jaringan mock: petunjuk memilih SSID melalui pengaturan perangkat tampil. Pilih jaringan mock mitra lain untuk menguji salah lokasi; pilih `SSS-DEMO-CISAAT` untuk simulasi sudah tiba.
8. Login berhasil menampilkan waktu kedaluwarsa dalam WIB dan sisa menit berdasarkan clock demo manual. Refresh, reconnect, atau logout tidak memperpanjangnya. Tidak ada koneksi internet nyata.

## Skenario gagal dan pemulihan

Di halaman pesanan, buka **Kontrol simulasi transaksi**. Panel ini hanya mengubah order pada token tersebut, bukan memberi akses owner atau mengubah skenario global.

| Skenario | Perilaku |
|---|---|
| Pending/gagal/timeout | Order tetap sama. Simulasikan hasil baru pada transaksi tersebut; tidak membuat order baru |
| Paid + penerbitan tertunda | Tampil sedang diproses, tanpa tombol membayar lagi |
| Paid + penerbitan gagal | Tampil perlu bantuan/coba penerbitan; payment tetap paid |
| WhatsApp gagal | Kode dan detail voucher tetap terlihat. Ubah hasil WhatsApp menjadi terkirim lalu ulangi notifikasi; voucher tidak digandakan |
| Salah mitra/belum di lokasi | Ditolak tanpa mulai timer; petunjuk SSID dan pengaturan perangkat tersedia |
| Perangkat reguler kedua | Buka tautan di profil/jendela privat lain; perangkat yang berbeda ditolak setelah perangkat pertama mengaktifkan |
| Slot bulanan penuh | Bulanan 2: dua profil dapat aktif, profil ketiga ditolak. Logout satu profil membebaskan slot; expiry tetap sama |
| Respons checkout terputus | Draft menyimpan key yang sama. Refresh/retry mengembalikan order yang sudah diterima, termasuk jika paket kemudian dinonaktifkan |
| Disk gagal ditulis | API 503, perubahan tidak diterbitkan ke store. Perbaiki disk lalu ulangi dengan key/order yang sama |
| Tautan salah/reset demo | Detail tidak ditemukan. Tidak ada pencarian publik berdasarkan WhatsApp |

Pilihan hasil penerbitan/WhatsApp baru diterapkan ketika tombol aksi ditekan. Sukses pembayaran tidak otomatis berarti voucher aktif atau internet tersambung. Owner masih dapat menguji waktu/availability melalui kontrol demo global dengan akun staf.

## Implementasi dan penyimpanan

- `src/domain/customer.ts`: nama 2–80 karakter, minimal satu huruf, menolak markup/control non-whitespace; nomor menerima awalan `08`, `628`, `+628`, separator spasi/titik/kurung/hyphen, kemudian disimpan dalam format `+628…`. Rentang digit sengaja wajar untuk nomor mobile Indonesia, bukan validasi operator atau WhatsApp terdaftar.
- `server/customer.ts`: katalog publik hanya harga/aturan paket yang tersedia; tidak mengirim rate bagi hasil. Endpoint create/detail/pay/issue/notify/connect/disconnect menggunakan service domain yang sama dengan staf. Tidak ada endpoint mencari order lewat nomor telepon.
- `src/services/customer-contracts.ts` dan `customer-http.ts`: kontrak async khusus view customer. Detail hanya satu order, payment, voucher/notifikasi terkait, serta jumlah sesi dan status profil itu. Tidak mengirim daftar stok, audit, komisi atau binding perangkat lain.
- `orders.create` menerima kunci checkout opsional yang disimpan bersama order. Server mengikat hash key pada cookie perangkat mock; request yang sama menghasilkan order yang sama, input berbeda dengan key sama ditolak. Token baru 32 byte acak (`crypto.randomBytes`), bukan ID urut. Token fixture lama tidak dapat dipakai pada endpoint customer.
- Draft `sessionStorage` berversi menyimpan data review, quote, key, dan token hasil untuk satu tab. Order resmi tetap tersimpan di envelope server; UI tidak membuat order dari effect/refresh. Pemilihan paket untuk pembelian baru mengawali draft baru. Jangan menghapus storage/cookie sebelum memulihkan percobaan dengan respons terputus; simpan tautan hasil.
- Quote diperiksa saat order baru dibuat. Perubahan harga/aturan sebelum submit meminta review ulang. Order yang sudah dibuat menggunakan snapshot lama meskipun katalog berubah/dinonaktifkan. Rate historis dan komisi tetap mekanisme tahap 2.
- Backend memakai persistensi ketat: perubahan diterbitkan setelah tulis atomik berhasil. Reset menyiapkan kode offline acak sebelum satu commit; tidak menyimpan fixture kode yang dapat ditebak sebagai langkah antara. Mode fallback memori pada mesin domain standalone tetap ada untuk pengujian baseline, bukan runtime backend.
- Mutasi guest memerlukan Origin lokal dan JSON, mempunyai batas percobaan, dan dibatasi token order. Meta/header `no-referrer` membantu mencegah token URL terkirim sebagai referrer. Token adalah bearer link demo, bukan klaim desain akses tamu siap produksi.

## Batas

Tidak ada akun customer, OTP, pemeriksaan WhatsApp terdaftar, pesan nyata, SDK/payment provider, QR transaksi, pemilihan WiFi otomatis, deteksi SSID/MAC, atau integrasi router. Cookie mock mewakili profil browser, bukan perangkat fisik. Clock voucher tetap manual; nama/nomor yang dimasukkan harus data contoh. Margin offline tetap terpisah dari bagi hasil online.

Penyimpanan JSON satu proses di laptop bukan database produksi; bootstrap/login staf tetap mengikuti [AUTH_LOCAL.md](AUTH_LOCAL.md). Reset terkonfirmasi menghapus transaksi sintetis dan menginvalidasi tautan customer, bukan akun staf. Kebijakan akses/retensi token produksi, recovery nomor salah, provider, harga resmi, refund, dan biaya tetap terbuka.

Bukti verifikasi tersedia di [verification/stage3/RESULTS.md](verification/stage3/RESULTS.md). Tidak deploy atau melanjutkan tahap 4–6.
