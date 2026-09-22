# Refinement UI — hero video dan glassmorphism

10 September 2026. Mengikuti jawaban user: 1 kombinasi, 2A, 3C, 4A dengan footer lengkap berisi placeholder, 5 pertahankan teks.

## Desain yang diterapkan

Customer memakai hero video lebar penuh, tinggi 78svh dengan batas minimum untuk menghindari tumpang tindih teks dan kontrol di layar pendek. Header kaca gelap mengambang di atas video. Teks di kiri menggunakan overlay navy; sisi kanan mempertahankan visual globe digital dari video user. Tidak ada ilustrasi jaringan pengganti di hero.

Area pilih mitra dan dashboard memakai latar terang dengan warna cyan dan magenta lembut di belakang panel kaca. Transparansi dan blur kartu lebih rendah dibanding hero/header. Warna teks, isi tabel, outline input dan fokus keyboard tetap jelas. Gaya dibangun dengan CSS sendiri; tidak mengklaim sebagai implementasi resmi Apple Liquid Glass.

SVG user disalin tanpa perubahan dan ditampilkan dengan object-fit contain bersama nama Triple S OS di header/sidebar/footer. Footer customer memiliki empat kelompok; footer dashboard ringkas. Placeholder kontak/kebijakan berupa teks, bukan tautan tel/mail/WhatsApp palsu.

## Media dan perilaku

- Sumber: MP4 user 3840×2160, sekitar 30 detik, H.264 + AAC; file asli tidak disentuh.
- Salinan desktop: H.264 1600×900 / 24fps, CRF 28, maxrate 2400k, bufsize 4800k, faststart, tanpa audio.
- Salinan HP: H.264 960×540 / 24fps, CRF 28, maxrate 900k, bufsize 1800k, faststart, tanpa audio. Dipilih saat halaman dibuka pada lebar ≤600px, tanpa mengganti download saat resize.
- Poster JPG 1600×900 diambil pada detik 2 dari video sumber. Selalu berada di belakang video sehingga fallback tidak kosong.
- Video dimulai secara muted dan inline; pengguna dapat jeda/putar. Browser yang menolak autoplay tetap menyediakan kontrol putar.
- Reduced motion/save-data: tidak memasang src MP4; menampilkan poster dan keterangan tampilan statis. Media error: poster dan keterangan video tidak tersedia. Video otomatis dijeda di luar viewport atau saat tab tidak aktif; jeda manual tetap dihormati.
- CSS menyediakan latar padat jika backdrop-filter tidak didukung atau pengguna meminta reduced transparency.

## File utama

- `src/features/customer/CustomerHero.tsx` dan `.css`: video, kontrol, poster dan komposisi hero.
- `src/components/Brand.tsx`, `SiteFooter.tsx`: aset merek dan footer bersama.
- `src/styles/glass.css`, `tokens.css`: tema global dan fallback.
- Layout customer/dashboard, PartnerPickerPage dan main.tsx menghubungkan komponen/style.
- `tests/glass.spec.ts`: media, logo/footer dan fallback. `tests/stage1.spec.ts`: regresi seluruh route/interaksi; screenshot baru diarahkan ke `docs/verification/glass/`, bukti tahap 1 lama tetap dipertahankan.

## Cara review

1. Buka `/` di 360/768/1440 px. Pastikan teks lama, video user, logo proporsional dan CTA ke pencarian mitra.
2. Jeda dan putar video, scroll keluar hero, lalu kembali. Aktifkan reduced motion untuk melihat poster tanpa request MP4.
3. Periksa footer: bagian yang belum diisi dilabeli placeholder, bukan data bisnis final.
4. Beralih ke Mitra/Owner, buka navigasi dan placeholder halaman. Periksa tema kartu, tabel, dropdown dan dialog, termasuk keyboard dan menu HP.
5. Jalankan `npm run build` dan `npm run test:stage1`. Hasil final dicatat di PROGRESS dan folder verifikasi glass.

Tidak ada perubahan aturan voucher, transaksi, autentikasi, atau lingkup tahap 2–6.
