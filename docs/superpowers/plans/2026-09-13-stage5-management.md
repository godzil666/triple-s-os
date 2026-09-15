# Tahap 5 — pengelolaan owner/admin

13 September 2026. Lingkup disetujui: prompt tahap 5 pada PROJECT_BRIEF dan permintaan user. UI glass, satu store dan autentikasi lokal dipertahankan.

1. Tambah `services/management.ts`, kontrak/adapter async: profil mitra + rate, paket + harga katalog, offer per mitra, batch atomik. Validasi server; audit aktor dari sesi, bukan input client. Snapshot transaksi tidak diedit. Tambah bidang opsional agar state lama tetap terbaca; validator menerima mitra baru.
2. Tambah `features/owner/OwnerPages.tsx`, `ManagementForms.tsx`, CSS. Overview seluruh titik, daftar/detail mitra, katalog, stok, transaksi/detail, audit; form menggunakan komponen existing. Hook/router admin dan owner sama dengan guard berbeda; akun owner tetap khusus owner.
3. Tes domain mutasi/snapshot/arsip/nonaktif/duplikat batch/persistensi. Tes HTTP izin mitra ditolak dan aktor audit benar. Tes browser admin edit -> customer beli -> mitra/owner melihat ledger; form tambah/edit/batch; 360/768/1440.
4. Typecheck, domain/server/browser dan build. Perbarui PROGRESS dan keputusan; berhenti tahap 5, tanpa deploy/integrasi.

Harga katalog yang diubah diterapkan ke offer seluruh mitra, dengan label jelas di form. Override harga/ketersediaan per mitra dilakukan di detail mitra. Rate mitra berlaku ke offer sekarang dan paket baru. Paket baru/mitra baru belum tersedia untuk dijual sampai offer diaktifkan. Stok hanya kode sintetis yang dibuat sistem; tidak menyediakan pemindahan batch. Referensi pembayaran hanya catatan, bukan verifikasi penerimaan uang. Model ledger pembayaran stok nyata tetap belum ada.
