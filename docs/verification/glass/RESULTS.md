# Hasil verifikasi refinement glass

10 September 2026 · Triple S OS · hanya refinement UI tahap 1.

- `npm run build`: exit 0, TypeScript + Vite.
- `npm run test:stage1`: exit 0, **12 passed (2.9m)**. Hasil JSON lokal: `test-results/stage1-results.json`.
- 20 route × 360/768/1440 px: tidak ada overflow halaman atau pageerror.
- Video benar-benar dimainkan di browser, muted/loop/inline; jeda, putar, keluar viewport dan masuk kembali diuji. Versi HP dipilih pada 360px.
- Reduced motion: poster tampil dan tidak ada request MP4. Media gagal: poster, teks hero dan CTA tetap tersedia. Reduced transparency: backdrop-filter none dan kartu opaque.
- SVG di header/footer termuat, dimensi/aspect ratio sumber terjaga melalui contain; tidak ada tautan tel/mail/WhatsApp placeholder yang berpura-pura aktif.
- Keyboard, dialog/Escape/fokus, menu HP, peran, konteks mitra, pencarian/filter dan recovery empty state tetap lulus.
- Screenshot dirender di Chromium lokal dan ditinjau secara visual; berbeda dari pemeriksaan HTTP/DOM saja. Frame video dapat berbeda antarcapture karena playback aktif.

| Tampilan | 360 px | 768 px | 1440 px |
|---|---|---|---|
| Customer | [Screenshot](customer-360.png) | [Screenshot](customer-768.png) | [Screenshot](customer-1440.png) |
| Mitra | [Screenshot](mitra-dashboard-360.png) | [Screenshot](mitra-dashboard-768.png) | [Screenshot](mitra-dashboard-1440.png) |
| Owner | [Screenshot](admin-360.png) | [Screenshot](admin-768.png) | [Screenshot](admin-1440.png) |

[Hero desktop](hero-desktop.png) · [Reduced motion/poster](reduced-motion.png) · [Fokus keyboard](keyboard-focus.png).

Run pertama 11/12 lulus; langkah scroll tes meninggalkan sebagian video dalam viewport. Sesudah tes memastikan hero benar-benar keluar layar, run final 12/12 lulus. Penyesuaian visual akhir juga menjaga ikon pencarian di atas input kaca.

Sumber SVG dan MP4 tidak ditimpa. Video web desktop 9,24 MB, HP 3,47 MB; keduanya 30 detik tanpa audio. Rincian keputusan dan batas pemeriksaan ada di [PROGRESS.md](../../PROGRESS.md) dan [UI_REFINEMENT.md](../../UI_REFINEMENT.md). Tidak ada deploy atau integrasi produksi.
