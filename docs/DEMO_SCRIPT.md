# Triple S OS MVP V2 — naskah presentasi 5–7 menit

Persiapan: dari root repo jalankan `npm install` dan `npm run dev`, buka `http://127.0.0.1:5173/`. Password lokal ada di `.local/server/INITIAL_ACCOUNTS.md`; jangan tampilkan atau bagikan. Login owner, buka **Kontrol demo → Reset data demo → Ya, reset data sintetis**. Siapkan tab customer, owner, admin, dan mitra. Semua data contoh bersifat fiktif.

## Menit 0–1 — Hotspot dan pilihan masuk

Buka `/wifi/hotspot/hotspot-site-demo-cisaat-2/login`. Tunjukkan Mitra Cisaat, Provider, Hotspot Cisaat 2 dan SSID tujuan. Ada Voucher (kode/QR), Member (username/password), dan **Beli voucher untuk hotspot ini**. Buka `/wifi` untuk fallback pilih hotspot manual. Browser tidak mendeteksi SSID/MAC, memindah WiFi, atau membuka captive portal router secara otomatis.

## Menit 1–2 — Beli sebelum tiba

Klik Beli voucher → Reguler 3 jam → isi nama dan WhatsApp sintetis → review → buat pesanan. Hotspot pilihan ikut hingga checkout/order. QRIS/e-wallet hanya simulasi dan bukan QR pembayaran nyata. Owner memberi status `paid` lalu `issued` melalui Kontrol demo; customer menekan **Perbarui status**. Tunjukkan kode voucher, QR yang hanya memuat kode, dan durasi yang masih **belum aktif**. Token detail order tidak bisa mengaktifkan WiFi.

## Menit 2–3 — Login dan pemulihan

Coba kode di Hotspot Cisaat 1: server menolak meski lokasi/mitra sama. Login pada Hotspot Cisaat 2 memakai kode atau scanner QR jika izin kamera/browser mendukung; input manual tetap ada. Login pertama memulai timer. Jelaskan satu perangkat reguler, slot bulanan bersama, dan reconnect tanpa reset expiry. Simulasikan paid + provisioning tertunda/gagal serta WhatsApp gagal. Voucher tetap ada saat WhatsApp gagal; pembayaran tidak diminta ulang. Tunjukkan recovery idempoten di Pusat operasi.

## Menit 3–4 — Mitra

Login mitra Cisaat. Tunjukkan Provider/Hotspot, stok offline read-only, transaksi online, nomor customer termasking dan bagi hasil dari snapshot order. `Unused` berarti belum aktif, bukan pasti belum terjual. Potensi margin offline berbeda dari bagi hasil online. URL mitra lain ditolak; mitra tidak bisa mengubah paket, pembayaran atau insiden.

## Menit 4–6 — Owner dan staf tugas

Owner melihat 50 mitra dan 51 hotspot sintetis (dua di Cisaat), paket/harga, stok, transaksi dan audit. Pada **Pusat operasi**, tunjukkan status online/degraded/offline/unknown, observedAt, pengguna, latensi, kategori Gaming/Sosial/Streaming/Lainnya berlabel **DEMO TELEMETRY**, filter Provider/Hotspot/Paket, stok rendah, alert, insiden open → acknowledged → investigating → resolved, notifikasi dalam aplikasi, pencarian termasking, dan retry. Owner menugaskan admin ke hotspot di **Akun staf**. Login admin: hanya hotspot tugasnya terlihat; katalog global dan akun owner tidak dapat diubah. Harga/rate baru tidak mengubah snapshot lama. Persentase komisi tetap asumsi demo, belum formula resmi.

## Menit 6–7 — Batas dan keputusan

Yang berjalan nyata di aplikasi lokal: sesi/role/assignment API, order, stok sintetis, binding voucher, expiry, alert/insiden, search dan audit. Yang masih simulasi: pembayaran, router/WiFi, telemetri jaringan/trafik dan WhatsApp. Minta keputusan D1–D7 tentang komersial, kode voucher, Mayar, MikroTik/RADIUS/captive, identitas produksi, WhatsApp, serta hosting/keamanan/backup. Jangan menyatakan siap produksi.
