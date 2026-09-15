# Verifikasi login lokal dan portal offline

10 September 2026. Chromium lokal, Node 24.20.0, Windows. Pengujian memakai frontend 5174/API 8788 dan `.local/auth-browser-tests`; data aplikasi user pada 5173/8787 tidak direset.

## Pemeriksaan yang lulus

- `npm run build`: typecheck TypeScript dan build lulus. JS 299,07 kB / 93,82 kB gzip; CSS 53,76 kB / 14,23 kB gzip, di luar media/font.
- `npm run test:domain`: **18/18**. Callback duplikat, harga/rate historis, timer sejak login, reconnect, site/device binding, kapasitas bulanan, margin offline dan komisi online tetap terpisah.
- `npm run test:server`: **10/10**. HTTP nyata untuk anonimitas, proyeksi mitra, role spoofing, admin/owner, cookie/logout/expiry, rotasi password, CSRF/Origin/rate limit, single-code hotspot, serta penolakan startup dengan data rusak.
- Bundle JS diperiksa terhadap password bootstrap aktual, hash/salt akun, kode stok offline server, dan marker implementasi server/fixture: tidak ditemukan. File privat dan fixture melalui Vite ditolak HTTP 403.
- SHA256 brief tetap `45B5775239F98EB1562097AFE2D755CF5907D54A3AC4C201E0EE5AC02068AF1E`. SVG public dan sumber user sama: `F1FDB4F5BAC0F287847C712DE81A9550F46D61EBD603946A73849B66C7A7688C`.

## Browser dan visual

Putaran 24 tes menghasilkan **23 lulus**, dengan satu tes fallback glass lama gagal karena `/admin` kini membutuhkan autentikasi. Tes tersebut diperbaiki dengan login admin sebelum memeriksa CSS; tidak melonggarkan guard aplikasi. Run terarah berikutnya **3/3 lulus**: fallback glass, login voucher/refresh/expiry, serta tes baru pembuatan akun mitra oleh owner dan pencabutan sesi saat dinonaktifkan. Artinya 25 kasus unik mempunyai bukti lulus lintas run, bukan klaim satu run 25/25.

Pengulangan penuh selanjutnya dihentikan setelah dua timeout saat navigasi/login dan satu tes logout lulus. Pada saat itu memori bebas mesin sekitar 250 MB dari 8 GB; setelah penghentian sekitar 747 MB. Ini indikasi tekanan sumber daya, bukan bukti bahwa semua timeout pasti berasal dari memori. Dua kasus tersebut diuji ulang terpisah dengan batas waktu tes 90 detik: **2/2 lulus** dalam 2,3 menit, tanpa perubahan aplikasi. Hasilnya di `resource-rerun/browser-results.json`. Laporan JSON utama dapat memuat run terinterupsi/gagal, sehingga jangan menafsirkannya sebagai full-suite green.

Pemeriksaan browser mencakup 25 route pada 360/768/1440 px tanpa overflow halaman/pageerror pada run yang selesai, keyboard/skip link/dialog/Escape, akses langsung dashboard, customer tanpa data privat, mitra/admin, offline voucher salah site lalu berhasil, refresh mempertahankan expiry, logout gagal jaringan, panel clock/reset, pencarian mitra, hero playback/fallback/reduced motion dan SVG/footer.

Screenshot login, pemilih site, portal, customer, mitra, admin, owner dan panel tersedia pada tiga ukuran. Tambahan `accounts-{width}.png` dan `stock-{width}.png` diambil pada 360/768/1440 dengan cek overflow. Screenshot portal mobile/desktop/status, owner desktop, akun mobile dan stok tablet telah dibuka dan diperiksa langsung. Kode dalam screenshot stok adalah data sintetis backend pengujian, bukan data user.

## Temuan yang diperbaiki

1. Logout gagal jaringan semula menghapus identitas client sebelum server mengonfirmasi. Sekarang sesi tetap terlihat dan pesan kegagalan muncul; tes regresi lulus.
2. Review independen menemukan envelope server rusak bisa jatuh ke kode fixture deterministik. Startup kini menolak data invalid dan mempertahankan file lama. Tes gagal sebelum fix dan lulus sesudahnya. Peringatan persistensi tetap terlihat untuk owner/admin.
3. Tes glass lama belum memperhitungkan autentikasi `/admin`; prasyarat tes disesuaikan.

## Batas bukti

Ini verifikasi demo lokal, bukan audit keamanan produksi. Tidak menguji router, popup captive portal OS, internet nyata, Safari/Firefox, perangkat fisik, pembaca layar, beban produksi atau deployment. Panduan review manual dan pemulihan: [AUTH_LOCAL.md](../../AUTH_LOCAL.md).
