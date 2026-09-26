# Triple S OS — Progress

Pembaruan: 13 September 2026. Status: **tahap 0–6 selesai sebagai demo lokal; login staf lokal, portal voucher offline, UI hero video/glassmorphism, dan logo SVG dipertahankan; integrasi produksi belum dikerjakan**.

Hasil tahap 4: [bukti verifikasi dashboard mitra](verification/stage4/RESULTS.md); hasil dan review manual terdapat pada bagian tahap 3–4 di akhir dokumen. Catatan tahap sebelumnya merupakan riwayat.

Hasil tambahan login: [panduan login dan portal](AUTH_LOCAL.md), [keputusan lingkup](AUTH_CAPTIVE_PORTAL_PLAN.md), dan [verifikasi auth/portal](verification/auth-hotspot/RESULTS.md). Catatan tahap 2 di bawah merupakan riwayat: role switch bebas dan persistensi hanya-browser telah diganti pada runtime aplikasi.

Hasil terbaru: [tahap 2](#tahap-2--domain-dan-mesin-simulasi), [model dan batas simulasi](STAGE2_DOMAIN.md), serta [bukti verifikasi tahap 2](verification/stage2/RESULTS.md). [Refinement UI](#refinement-ui--10-september-2026), [keputusan desain](UI_REFINEMENT.md), dan [bukti visual sebelumnya](verification/glass/RESULTS.md) dipertahankan sebagai riwayat, termasuk kondisi logo sebelum user menyetujui SVG.

## Arsip lingkup tahap 0

Inspeksi repository dan dokumentasi saja, sesuai permintaan tahap 0. Brief dibaca seluruhnya, termasuk prompt 1–6 dan urutan pilot sebagai bahan rencana. Tidak mengimplementasikan prompt lanjutan.

## Baseline yang diperiksa

| Pemeriksaan | Hasil nyata |
|---|---|
| Lokasi proyek | `C:\Users\zil\Documents\Triple_S_OS`, sesuai path brief user; bukan direktori awal `C:\Users\zil\Documents\Project PT. Triple S`. |
| Inventaris awal | `docs/PROJECT_BRIEF.md` (24.716 byte), `public/logo SSS.svg` (1.930 byte). Belum ada source aplikasi. |
| Instruksi | Tidak ditemukan AGENTS.md pada proyek/subfolder dan rantai direktori induk; inventaris proyek tidak memuat file instruksi lain. Permintaan user mengendalikan batas tahap. |
| Git | `git -C <proyek> rev-parse --show-toplevel` gagal karena bukan repository Git; tidak diinisialisasi. |
| Stack/package manager | Tidak ada package.json/lockfile/config aplikasi. Rencanakan React + TypeScript + Vite dan npm; belum memasang dependency. |
| Runtime | `node --version`: v24.20.0; `npm --version`: 11.19.0. Perintah pnpm ditemukan pada PATH, versi belum diuji; yarn/bun tidak ditemukan pada PATH. |
| Logo JPG | `public/brand/triple-s-logo.jpg` tidak tersedia. |
| Aset lain | `public/logo SSS.svg` terbaca sebagai SVG empat path/gradient; belum diverifikasi secara visual atau sebagai logo resmi. Tetap dipertahankan. |

## Dokumen tahap 0

- [x] [DECISIONS.md](DECISIONS.md): keputusan user, asumsi demo, pertanyaan produksi, inspeksi dan batas simulasi.
- [x] [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md): tahap 1–6 sesuai brief, file rencana, dependensi tahap, aktivitas dan kriteria selesai.
- [x] [PROGRESS.md](PROGRESS.md): baseline, status awal, hasil pemeriksaan dan langkah review.

| Tahap | Status | Bukti / gerbang |
|---|---|---|
| 0 — Konteks dan rencana | Selesai | Tiga dokumen dibuat; brief dan aset awal dipertahankan. |
| 1 — Fondasi responsif | Selesai | Tiga layout, routing, komponen, pilih mitra, review visual, build dan 7/7 tes browser lulus. |
| 2 — Domain dan simulasi | Selesai | 18 tes domain; store/services async mock; 16 tes browser; persistensi, reset, clock dan skenario. |
| 3 — Customer | Belum dimulai | Pembelian sampai aktivasi simulasi dan kegagalan utama. |
| 4 — Mitra | Belum dimulai | Data scoped, stok read-only, transaksi dan bagi hasil konsisten. |
| 5 — Owner/admin | Belum dimulai | Pengelolaan lintas peran, snapshot historis dan audit. |
| 6 — Verifikasi/presentasi | Belum dimulai | Browser semua ukuran, test/typecheck/build dan paket presentasi. |

## Verifikasi tahap 0

- Inspeksi menggunakan inventaris rekursif termasuk file tersembunyi, pembacaan brief/aset, pemeriksaan instruksi induk, Git dan runtime.
- Review dokumen terhadap brief mencakup mitra manual, voucher satu lokasi, timer sejak login pertama, binding/concurrency, idempotensi, snapshot historis, margin offline vs bagi hasil online, status monitoring, scoped access serta simulasi.
- Pemeriksaan setelah penulisan lulus: ketiga dokumen tidak kosong, tautan Markdown lokal valid, keenam bagian tahap tersedia, dan SHA-256 brief serta SVG sama dengan baseline. Inventaris akhir hanya dua file awal dan tiga dokumen baru.
- Build, typecheck, tes domain dan verifikasi browser **belum dijalankan**: aplikasi belum ada dan implementasi di luar tahap 0. Tidak ada klaim UI berfungsi atau siap produksi.
- Tidak ada scaffold, instalasi, layanan/dev server, integrasi, pesan, pembayaran, perubahan router, deploy, commit atau push.

Fingerprint baseline SHA-256 untuk pemeriksaan file lama tidak berubah:

| File | SHA-256 |
|---|---|
| `docs/PROJECT_BRIEF.md` | `45B5775239F98EB1562097AFE2D755CF5907D54A3AC4C201E0EE5AC02068AF1E` |
| `public/logo SSS.svg` | `F1FDB4F5BAC0F287847C712DE81A9550F46D61EBD603946A73849B66C7A7688C` |

## Hal terbuka dan review manual

1. Review pemisahan keputusan/asumsi/pertanyaan dalam DECISIONS. Rate demo 20%, basis bruto, pembulatan rupiah, 30 hari dan 2/4 perangkat bukan kebijakan resmi.
2. Periksa ketersediaan JPG asli atau status resmi SVG. Jika belum tersedia, tahap 1 tetap dapat memakai wordmark sementara tanpa mengubah aset lama.
3. Pertanyaan harga bulanan, aktivasi pralogin, refund/biaya/pajak/pencairan, topologi/uplink, provider, pemulihan voucher dan keamanan produksi tetap terbuka; tidak menghalangi demo berbasis asumsi berlabel.
4. Saat user meminta tahap 1, inspeksi ulang file dan pilih versi dependency kompatibel dari dokumentasi resmi. Lingkupnya hanya fondasi, tokens/komponen, tiga layout, routing placeholder dan satu halaman pilih mitra representatif, banner/pemilih peran, serta verifikasi 360/768/1440 px, keyboard dan build. Checkout dan mesin transaksi belum termasuk.

**Titik berhenti sesi tahap 0:** tahap 0; user kemudian secara eksplisit meminta tahap 1.

## Tahap 1 — Fondasi dan tampilan responsif

### Perubahan

- Aplikasi React + TypeScript + Vite dengan npm dan versi dependency terkunci di `package-lock.json`. Node lokal v24.20.0; syarat proyek `>=22.22.0` mengikuti kebutuhan dependency terketat yang dipilih.
- Versi: React/React DOM 19.2.8, React Router 8.3.1, Vite 8.2.2, plugin React 6.1.1, TypeScript 7.0.2, Playwright 1.63.0. Lucide 1.43.0 untuk ikon UI; Manrope Variable 5.3.0 dilayani dari file lokal paket Fontsource.
- Tokens palet brief, spacing/radius, warna semantik, fokus dan reduced motion pada `src/styles/tokens.css` serta styles responsif pada `src/styles/global.css`. Warna primer asli tetap `#0284C7`; tombol dengan teks putih memakai varian lebih gelap `#03699E` untuk keterbacaan.
- Komponen Button (variant/disabled/loading), Input dan Select (label/hint/error), Card, Badge, Table (caption/header/scroll container), Dialog (native modal, Escape, putaran fokus dan pemulihan fokus), serta EmptyState.
- Layout customer dengan navigasi dan panduan; layout mitra dan owner dengan sidebar desktop/tablet serta menu ringkas pada HP. Skip link, fokus setelah perubahan route, judul dokumen dinamis, pemilih peran yang berlabel bukan login, dan pemilih mitra fiktif pada portal mitra.
- Halaman `/` berisi enam mitra fiktif untuk evaluasi tampilan, pencarian nama/area/SSID, filter area, jumlah hasil, empty state dan penghapusan filter. Pilihan mitra selalu manual dan mengarah ke placeholder paket mitra yang sesuai.
- Keenam contoh disimpan dalam `src/demo/presentationPartners.ts`, bukan fixture/domain tahap 2. Tidak ada store transaksi, persistensi lokal, clock, layanan mock atau simulasi voucher pada tahap ini.
- Route customer `/mitra/:id/paket`, `/checkout`, `/pesanan/:token`, `/voucher/:token` tersedia sebagai placeholder tahap 3; tanpa input checkout, pembayaran, atau voucher aktif.
- Route `/mitra-dashboard` beserta stok, penjualan/detail, bagi hasil, pengguna; `/admin` beserta daftar/detail mitra, paket, stok, transaksi/detail dan aktivitas tersedia sebagai placeholder tahap 4/5. Alamat tak dikenal mempunyai halaman fallback dengan tautan kembali.
- Banner “Mode demo — transaksi dan koneksi disimulasikan” hadir di semua route. Dashboard tidak mengarang angka pendapatan/pengguna online. Contoh ilustrasi jaringan tidak merepresentasikan koneksi nyata.
- JPG `public/brand/triple-s-logo.jpg` tetap tidak tersedia; menggunakan **wordmark teks sementara**. `Brand.tsx` mendukung JPG pada path tersebut bila kelak disediakan dan memakai contain. `public/logo SSS.svg` tidak diubah atau digunakan sebagai pengganti logo asli tanpa persetujuan.

### File yang dibuat / diubah

Baru: `.gitignore`, `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/app/*`, `src/app/layouts/*`, `src/components/*`, `src/demo/*`, `src/features/PlaceholderPage.tsx`, `src/features/customer/PartnerPickerPage.tsx`, `src/styles/*`, `playwright.config.ts`, `tests/stage1.spec.ts`, serta bukti screenshot di `docs/verification/stage1/`.

Diubah: dokumen PROGRESS ini dan checklist tahap 1 IMPLEMENTATION_PLAN. PROJECT_BRIEF dan DECISIONS tahap 0 tetap sebagai sumber awal; status implementasi terkini ada di sini. Folder `dist`, `node_modules` dan `test-results` merupakan keluaran lokal yang diabaikan Git. Proyek belum diinisialisasi Git.

### Verifikasi yang dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` | Lulus setelah perbaikan akhir, termasuk `tsc --noEmit`; Vite menghasilkan bundle JS sekitar 263 kB / 83,51 kB gzip. |
| HTTP lokal | `http://127.0.0.1:5173/` merespons 200. Server hanya bind ke loopback. |
| Kontras token terpilih | Tombol utama putih/biru gelap 5,97:1; body 17,00:1; teks sekunder pada putih 6,06:1; info 7,86:1. Ini pemeriksaan pasangan token, bukan sertifikasi aksesibilitas menyeluruh. |
| Review visual | Screenshot Chromium customer, mitra, owner pada 360/768/1440 px diperiksa langsung. Layout tidak tumpang tindih; tabel membungkus di HP, sidebar tampil di tablet/desktop, menu HP membuka navigasi. |
| Pengujian browser akhir | **7/7 lulus**, 3,1 menit, Playwright 1.63.0 + Chrome for Testing 153.0.8010.12 (Chromium 1243). Run akhir memakai `PLAYWRIGHT_CHROMIUM_EXECUTABLE` yang menunjuk Chrome 1243; binary headless bawaan juga selesai dipasang. |
| Route dan overflow | 20 route × 360/768/1440 px = 60 pemeriksaan; tidak ada overflow halaman atau `pageerror`. |
| Interaksi | Search nama/SSID, filter area, empty recovery, pilihan mitra dan refresh detail lulus; tidak ada input checkout. |
| Keyboard dan dialog | Skip link, focus ring, Enter, Tab/Shift+Tab di dialog, Escape, pemulihan fokus dan fokus setelah pergantian route lulus. |
| Menu/peran/konteks | Menu HP membuka/menutup, link menuju halaman yang tepat, pilihan Customer/Mitra/Owner serta mitra demo lulus. |
| Label dan jaringan | Semua input/select pada tiga halaman utama memiliki label; browser tidak membuat request eksternal pada halaman tersebut. |
| Pelestarian file | SHA-256 PROJECT_BRIEF dan SVG sama dengan baseline tahap 0. |

Catatan masalah dan perbaikan: run browser pertama gagal sebelum membuka aplikasi karena binary Chromium 1243 belum tersedia. Browser yang sesuai kemudian diunduh; sementara itu pemeriksaan awal memakai Chromium yang sudah ada. Import subset font yang tidak disediakan paket dikembalikan ke entry resmi. Run awal menemukan timeout 30 detik untuk kelompok 20 navigasi (diubah menjadi 90 detik), dan putaran Shift+Tab pada native dialog yang kini ditangani eksplisit. Spasi judul panduan di tablet dirapikan. Tidak ada kegagalan yang disembunyikan sebagai hasil lulus.

### Cara menjalankan dan review manual

Dari folder `C:\Users\zil\Documents\Triple_S_OS`:

```powershell
npm ci
npm run dev -- --port 5173 --strictPort
```

Jika server sesi ini masih hidup, langsung buka [customer](http://127.0.0.1:5173/), [mitra](http://127.0.0.1:5173/mitra-dashboard), atau [owner](http://127.0.0.1:5173/admin); jangan menjalankan server kedua pada port yang sama.

```powershell
npm run typecheck
npm run build
npx playwright install chromium
npm run test:stage1
```

Konfigurasi tes juga menerima `PLAYWRIGHT_CHROMIUM_EXECUTABLE` bila perlu menunjuk binary Chromium lokal. Hasil terstruktur: `test-results/stage1-results.json`; screenshot: `docs/verification/stage1/`. Playwright menyalakan server otomatis jika port 5173 belum dipakai. Salinan ringkas bukti final ada di [verification/stage1/RESULTS.md](verification/stage1/RESULTS.md).

1. Buka `/` pada 360, 768, dan 1440 px. Review keterbacaan, warna, wordmark sementara, serta kartu mitra dan panduan satu lokasi.
2. Cari `SSS-DEMO-CISAAT`, lalu pilih filter area Cibadak untuk memunculkan empty state. Hapus filter; pilih Mitra Cisaat. Pastikan placeholder menampilkan mitra yang benar dan label tahap 3 belum tersedia.
3. Gunakan Tab dari awal halaman untuk skip link. Buka Panduan dengan keyboard, cek Tab/Shift+Tab berputar di dialog, Escape menutup dan fokus kembali ke tombol Panduan.
4. Beralih ke Mitra dan Owner. Pada HP, buka menu; kunjungi setiap halaman. Ganti mitra demo dan pastikan nama/SSID konteks berubah. Pemilih ini tidak memberi autentikasi atau perlindungan akses server.
5. Review desain fondasi sebelum meminta tahap 2. Belum ada checkout, pembayaran/WhatsApp/WiFi, data bisnis aktif, atau integrasi produksi untuk diuji. Safari/Firefox, gadget fisik dan pembaca layar belum diuji pada tahap ini.

Rujukan teknis yang diperiksa untuk fondasi: [Vite Getting Started](https://vite.dev/guide/), [React build from scratch](https://react.dev/learn/build-a-react-app-from-scratch), dan [React Router declarative installation](https://reactrouter.com/start/declarative/installation); versi/engines juga diperiksa lewat npm registry saat instalasi.

**Batas sesi:** hanya tahap 1. Tidak ada integrasi nyata, perubahan router, deploy, commit atau push; tahap 2–6 belum dimulai.

## Refinement UI — 10 September 2026

**Selesai sesuai pilihan user:** hero gelap + konten/dashboard terang; hero lebar penuh sekitar 78svh; glassmorphism lebih kuat pada header/hero dan lebih halus pada area kerja; SVG bersama teks SSS OS; footer lengkap dengan placeholder; teks hero dipertahankan. Persetujuan ini menggantikan wordmark sementara dan arah permukaan awal, bukan aturan bisnis.

### Perubahan dan aset

- Baru: `CustomerHero.tsx/.css`, `SiteFooter.tsx`, `src/styles/glass.css`, salinan SVG dalam `public/brand/`, dua versi video dan poster dalam `public/media/`, `tests/glass.spec.ts`, `docs/UI_REFINEMENT.md`, bukti dalam `docs/verification/glass/`.
- Diubah: Brand, layout customer/dashboard, PartnerPickerPage, main, tokens, `.gitignore`, tes regresi tahap 1, DECISIONS dan PROGRESS. Tidak ada dependency baru. Screenshot tahap 1 lama tidak ditimpa.
- Hero video: autoplay tanpa suara, loop, inline, kontrol jeda/putar; poster tetap tersedia. Reduced motion/save-data tidak memuat MP4. Video dijeda di luar viewport/tab tersembunyi. Kontrol manual dan skenario media gagal tetap dapat dipahami.
- Tema kaca: border berlapis, blur dan bayangan halus; konten dashboard tetap terang. Fallback opaque tersedia untuk reduced transparency dan browser tanpa backdrop-filter. Ikon pencarian ditempatkan di atas input kaca agar tidak tertutup stacking context.
- Footer customer lengkap: logo/nama perusahaan, navigasi, kontak, kantor/jam layanan, sosial dan kebijakan. Informasi yang belum ada diberi placeholder tanpa tautan kontak palsu. Footer dashboard memakai varian ringkas komponen yang sama.

| Aset | Ukuran dan spesifikasi |
|---|---|
| MP4 sumber user | 240.549.791 byte, 3840×2160, sekitar 30 detik; tetap utuh |
| Desktop | 9.235.379 byte (9,24 MB), 1600×900, H.264 24fps, 30 detik, tanpa audio |
| HP | 3.467.470 byte (3,47 MB), 960×540, H.264 24fps, 30 detik, tanpa audio |
| Poster | 280.012 byte, JPG 1600×900, frame detik 2 dari video sumber |
| Logo | SVG user disalin byte-identik; hash `F1FDB4F5BAC0F287847C712DE81A9550F46D61EBD603946A73849B66C7A7688C` |

### Hasil verifikasi terbaru

- `npm run build`: lulus, termasuk TypeScript. Bundle JS 267,55 kB / 84,73 kB gzip; CSS 47,90 kB / 12,97 kB gzip, di luar aset media.
- `npm run test:stage1`: **12 passed (2.9m)**, Chromium lokal. Lima tes baru mencakup playback muted/loop/inline, pause/resume/out-of-view, video HP dan SVG/footer, reduced motion tanpa request MP4, media gagal, serta reduced transparency.
- Tujuh tes regresi tetap lulus: 20 route × 360/768/1440 px tanpa overflow atau pageerror, pencarian/filter/empty state/pilihan mitra, keyboard/dialog, menu HP/peran/konteks, label field dan tidak ada request eksternal pada tiga halaman utama.
- Screenshot ketiga peran pada ketiga ukuran diperiksa langsung, termasuk hero desktop dan reduced motion. Ada penyesuaian spacing untuk desktop pendek agar header dan teks hero tetap terpisah.
- Run awal: 11 lulus dan satu tes scroll gagal karena `scrollIntoViewIfNeeded` masih meninggalkan hero dalam viewport. Tes diperbaiki agar menempatkan awal direktori di atas viewport; pengujian ulang pause/resume lulus. Tidak mengubah perilaku aplikasi untuk menyamarkan kegagalan.
- Pemeriksaan ffprobe memastikan video turunan hanya memiliki stream video; hash SVG salinan sama dengan sumber. Hash brief dan SVG lama tetap sama dengan baseline.
- Belum diuji: Safari/Firefox, perangkat fisik, pembaca layar, dan audit performa jaringan seluler. Efek kaca/fallback visual bukan sertifikasi aksesibilitas menyeluruh.

Demo lokal: [http://127.0.0.1:5173/](http://127.0.0.1:5173/). Server Vite dijalankan kembali pada loopback; log lokal di `.local/`. Cara install/run/build tetap sama. Kontak footer yang nyata dan konten kebijakan menunggu data resmi. **Berhenti pada refinement UI tahap 1; tidak melanjutkan tahap 2.**

## Tahap 2 — Domain dan mesin simulasi

Dilanjutkan atas permintaan user berikutnya, termasuk instruksi melanjutkan sesi terakhir. Tahap ini selesai pada 10 September 2026. Dokumen brief, decisions, implementation plan, progress, dan instruksi repository diperiksa kembali. Folder kerja tetap `C:\Users\zil\Documents\Triple_S_OS`; tidak ditemukan AGENTS.md yang berlaku. Tidak menginisialisasi Git atau menimpa aset sumber.

### Perubahan

- Membuat model, konfigurasi, fixture, store, expiry, dan selectors di `src/domain/`; kontrak service async dan implementasi mock di `src/services/`.
- Fixture deterministik: 50 mitra/site fiktif, 5 paket dan 250 penawaran, 6 batch offline/30 kode, 8 order beserta pembayaran, 3 voucher online terbit, 3 sesi aktif awal, 5 komisi, notifikasi dan audit, serta 50 snapshot monitoring. Harga/durasi/basis yang belum resmi diberi label asumsi.
- Memisahkan payment, provisioning, voucher, dan notifikasi. Membeli/paid/issued tidak memulai durasi. Login pertama sukses menetapkan expiry sekali; reconnect dan logout tidak meresetnya. Binding site, perangkat pertama reguler, dan concurrency 2/4 perangkat bulanan ditegakkan pada service.
- Callback pembayaran dan provisioning paralel idempoten per order; satu komisi per paid order. Snapshot harga, aturan paket, rate/basis komisi dan batch offline tetap historis setelah katalog berubah. Penolakan transaksi tidak meninggalkan perubahan parsial.
- Persistensi sintetis schema v1, checksum dan validasi pemulihan; snapshot beku dan subscription React. Reset wajib konfirmasi, hanya menulis key aplikasi. Data rusak/versi berbeda tidak ditimpa sampai reset; storage tidak tersedia/penuh memakai memori dengan pesan.
- Menambahkan `ScenarioPanel.tsx`/CSS dan tombol **Kontrol demo** di banner. Panel mengatur clock manual, mitra, situs/perangkat mock, hasil payment/provisioning/notifikasi, polling/offline/unknown, login/logout, serta reset. Pesan hasil tetap terlihat saat panel digulir.
- Menghubungkan DemoContext, daftar mitra dashboard, enam kartu pratinjau customer, dan identitas mitra pada placeholder ke store yang sama. Hero, logo SVG, footer, design tokens dan gaya kaca tetap. Konten bantuan menjelaskan mesin demo tersedia, sedangkan halaman tahap berikutnya tetap placeholder.
- Menambahkan `tests/domain/engine.test.mjs` dan `tests/stage2.spec.ts`; scripts `test:domain`/`test:browser`. Node test runner bawaan dipakai tanpa dependency baru. Playwright mengecualikan tes domain; bukti tahap 1/refinement tetap disimpan terpisah.
- Memperbarui decisions/plan dan menambahkan [STAGE2_DOMAIN.md](STAGE2_DOMAIN.md) sebagai peta kontrak, fixture, transisi, asumsi, dan keterbatasan.

### Verifikasi nyata

| Pemeriksaan | Hasil |
|---|---|
| `npm run typecheck` | Lulus; juga dijalankan oleh build terakhir. |
| `npm run test:domain` | **18/18 lulus**. Bukan tes yang hanya mencocokkan fixture statis. |
| `npm run build` | Lulus. Hasil terakhir: JS 296,03 kB / 93,23 kB gzip; CSS 49,65 kB / 13,39 kB gzip, di luar font/media. |
| `npm run test:browser` | **16/16 lulus** (Chromium lokal, 2,7 menit): 12 regresi UI lama + 4 tes tahap 2. |
| Panel setelah perapian pesan sticky | **4/4 tes panel diulang dan lulus**, termasuk refresh/reset dan keyboard di 360/768/1440 px. |
| Responsive/regresi | 20 route × 360/768/1440 px tanpa overflow halaman atau pageerror; keyboard/skip link/dialog, pencarian/filter, role switch, hero playback/fallback, logo/footer tetap lulus. |
| Pemulihan/reset | Browser membuktikan expiry dan perangkat bertahan setelah refresh; Batal reset mempertahankan order; konfirmasi mengembalikan fixture; key aplikasi lain tetap ada. |
| Konteks lintas peran | Pemeriksaan browser tambahan memilih Mitra Demo 50 di panel, berpindah ke portal mitra, lalu refresh: pilihan tetap sama, tanpa pageerror. |
| Visual | Screenshot panel pada tiga ukuran diperiksa langsung, termasuk bagian transaksi/reset tablet; hero customer mobile/desktop ikut diperiksa. Bukti di [verification/stage2](verification/stage2/RESULTS.md). |
| Aset | SHA256 brief tetap `45B5775239F98EB1562097AFE2D755CF5907D54A3AC4C201E0EE5AC02068AF1E`. SVG public sama dengan sumber user: `F1FDB4F5BAC0F287847C712DE81A9550F46D61EBD603946A73849B66C7A7688C`. |

Tes domain mencakup callback duplikat paralel/late failure, paid tanpa aktivasi, provisioning ditunda/gagal/retry, retry notifikasi, salah site/offline/unknown tanpa timer, reconnect tanpa reset, device kedua reguler ditolak, kapasitas bulanan 2/4 dan slot logout, tepat batas expiry, snapshot harga/durasi/rate, ketersediaan katalog tanpa membatalkan voucher lama, agregat/filter 50 mitra, offline bukan penjualan online, stale/poll gagal, persistensi/reset/kerusakan/quota, validasi input, serta snapshot beku/rollback. Tes pemulihan menemukan field nullable yang semula ditolak validator; diperbaiki dan tes refresh lulus. Tes browser sebelum panel tersedia gagal pada tombol yang belum ada, lalu lulus setelah implementasi.

### Review manual yang dapat diulang

1. Buka [demo lokal](http://127.0.0.1:5173/) → **Kontrol demo**. Gunakan satu tab untuk mengubah state.
2. Pilih Mitra Cisaat, situs `SSS-DEMO-CISAAT`, perangkat demo 1, paket reguler 3 jam. **Buat order sintetis**. Catat timer masih “Belum dimulai”.
3. Pilih hasil pembayaran paid lalu jalankan callback beberapa kali. Atur provisioning pending/failed lalu terbitkan; payment tetap paid. Kembalikan issued dan ulangi penerbitan: satu voucher unused.
4. Atur notifikasi failed lalu sent dan ulangi. Voucher tetap sama; notifikasi mempunyai catatan percobaan tersendiri.
5. Pilih situs Cibadak dan tekan **Login mock**: ditolak tanpa timer. Pilih Cisaat lalu login: timer mulai. Tekan +1 jam dan reconnect: expiry tetap. Ganti ke perangkat 2: ditolak, termasuk setelah perangkat 1 logout.
6. Buat order baru bulanan 2 perangkat; paid → issued. Login perangkat 1 dan 2, lalu 3: slot penuh. Logout satu sesi dan coba perangkat 3: berhasil, expiry tetap sama.
7. +31 hari lalu login: voucher expired. Untuk stale monitoring, polling sukses lalu +6 menit: unknown; gagal polling tetap unknown, bukan offline. Ketersediaan mock offline menolak login.
8. Pilih mitra lain di panel, tutup panel dan pindah peran Mitra/Owner. Konteks menggunakan store bersama. Refresh dan periksa expiry/perangkat/waktu tetap.
9. **Reset data demo** → **Batal reset** mempertahankan perubahan; ulangi → **Ya, reset data sintetis** untuk kembali ke awal. Reset tidak memerlukan reload dan tidak menghapus storage aplikasi lain.
10. Ulangi pada 360/768/1440 px, gunakan Tab/Shift+Tab dan Escape. Panel dapat digulir; fokus kembali ke tombol pemanggil setelah ditutup.

### Batas dan yang masih terbuka

Clock manual tidak mengikuti waktu nyata saat tab ditutup. Harga bulanan Rp150.000/Rp250.000, 30 hari, speed 10 Mbps, grosir/retail offline dan rate 20% adalah contoh. Tidak ada batas aktivasi pralogin resmi. Margin offline terealisasi, pembayaran stok, biaya, pajak, pencairan, dan kebijakan produksi tetap belum diketahui; null tidak disamarkan sebagai nol.

Persistensi mendukung demo satu tab, tidak mempunyai sinkronisasi/locking lintas tab, backend, autentikasi/otorisasi aman, atau proteksi manipulasi storage. Kode/token deterministik dan kontak `DEMO-WA-*` hanya untuk inspeksi mesin; form customer dan token acak belum dibangun. Monitoring/sesi adalah state mock, bukan pembacaan router. Tidak membaca MAC/SSID nyata, mengirim WhatsApp, memproses pembayaran, atau mengubah MikroTik. Belum diuji pada Safari/Firefox, perangkat fisik, pembaca layar, atau kondisi produksi.

**Berhenti setelah tahap 2 pada baseline ini.** Checkout/alur customer tahap 3, dashboard mitra/owner tahap 4–5, integrasi dan pilot tetap belum dikerjakan. Tidak deploy atau memasang integrasi produksi.

## Tambahan — login staf lokal dan portal voucher offline

User kemudian menyetujui backend lokal dengan login sungguhan, satu kode voucher offline, portal WiFi simulasi, serta akses owner/admin/mitra. Tambahan ini selesai pada lingkup tersebut; dashboard operasional lengkap dan checkout tetap tahap berikutnya.

### Perubahan

- `server/`: akun berpassword hash scrypt, sesi cookie HttpOnly, otorisasi per operasi/objek, proyeksi state publik/mitra, persistensi JSON lokal berversi, API voucher offline, cookie perangkat mock bertanda tangan. Sesi staf memakai waktu nyata, terpisah dari clock demo dan sesi hotspot.
- `src/auth/`: login/logout, guard route, akun staf khusus owner, aktivasi/nonaktivasi serta perubahan password yang mencabut sesi lama.
- `src/features/hotspot/` dan `OfflineStockPage.tsx`: pemilihan SSID/site sintetis manual, login satu kode, status/expiry/logout, serta stok baca/copy khusus staf untuk mencoba portal.
- `src/services/http.ts`, `DemoContext.tsx`, router/layout/banner: browser memakai API sesuai peran; role switch bebas dihapus. Owner `/owner`, admin `/admin`, mitra `/mitra-dashboard`. Customer tidak mendapat stok/order/komisi privat. Kontrol skenario/reset hanya owner.
- `scripts/dev.mjs`, Vite, manifest/config dan tests: backend+frontend lokal, penolakan file privat di dev server, pengujian server/domain/browser. Aset video/SVG dan desain utama dipertahankan. Tidak ada dependency baru, integrasi produksi, atau deploy.

### Verifikasi

| Pemeriksaan | Hasil |
|---|---|
| Typecheck dan build | Lulus; JS 299,07 kB / 93,82 kB gzip, CSS 53,76 kB / 14,23 kB gzip |
| Domain | 18/18 lulus |
| Server HTTP | 10/10 lulus, termasuk data rusak menolak startup, scope mitra, revokasi sesi, Origin/CSRF dan portal offline |
| Browser | 25 kasus unik mempunyai bukti lulus lintas run: 23 pada run utama, fallback glass yang diperbaiki serta akun baru pada run terarah 3/3 (satu kasus portal diulang). Pengulangan penuh berikutnya terhenti setelah dua timeout dalam kondisi memori rendah; kedua kasus diulang terpisah dengan timeout tes 90 detik dan **2/2 lulus**. Tidak diklaim sebagai satu full run 25/25 |
| Responsive/keyboard | 25 route × 360/768/1440 lulus tanpa overflow/pageerror pada run selesai; keyboard/login/dialog/menu/panel, hero/fallback/SVG ikut diuji |
| Visual | Screenshot portal, login, akun, stok, dashboard dan customer tersedia. Portal mobile/desktop/status, akun mobile, stok tablet dan owner desktop diperiksa langsung |
| Data publik | Tidak ditemukan password awal, hash/salt akun, stok offline aktual atau marker server/fixture di bundle JS; file privat Vite ditolak 403 |
| Aset dan brief | SHA256 brief dan SVG tetap sama dengan baseline |
| Aplikasi lokal | Frontend 5173 dan API 8787 berjalan; health dan `/login` memberikan HTTP 200 setelah restart dengan kode terbaru |

Review independen menemukan fallback data rusak yang dapat menghidupkan kode voucher fixture. Diperbaiki dengan startup fail-closed dan preservasi file. Tes logout jaringan juga menemukan penghapusan identitas client terlalu cepat; sekarang hanya dibersihkan setelah konfirmasi server. Detail hasil run dan batas bukti: [verification/auth-hotspot/RESULTS.md](verification/auth-hotspot/RESULTS.md).

### Review manual dan batas

Panduan lengkap: [AUTH_LOCAL.md](AUTH_LOCAL.md). Login di `/login`; password awal ada di `.local/server/INITIAL_ACCOUNTS.md` pada komputer ini, tidak dicantumkan dalam laporan. Owner buka `/owner/stok`, salin kode Cisaat, lalu buka jendela privat `/wifi/site-demo-cisaat/login`. Uji salah mitra, login benar, refresh, perangkat mock lain, logout serta akses URL dashboard tanpa sesi. Owner dapat membuat akun di `/owner/akun` dan mencoba pencabutan sesi dengan menonaktifkan akun tersebut.

Persistensi runtime baru berada di `.local/server`; localStorage lama tidak diimpor/ditimpa. Reset terkonfirmasi mengganti state/kode/sesi hotspot, bukan akun staf. Restart server mengakhiri sesi staf. Cookie perangkat adalah identitas profil browser, bukan MAC. Jam voucher tetap clock demo manual; jam sesi staf waktu nyata. Popup WiFi otomatis dan akses internet memerlukan integrasi HotSpot/router yang belum dilakukan. Harga/rate, pembayaran/provisioning, monitoring dan notifikasi tetap sintetis. Margin offline dan komisi online tidak disatukan. Tidak ada klaim siap produksi.

## Tahap 3 — Alur customer (penutupan verifikasi)

Alur manual pilih mitra → paket/perangkat → nama/WhatsApp → review → pembayaran QRIS/e-wallet simulasi → penerbitan → voucher/notifikasi → Sambungkan simulasi telah diimplementasikan. Nomor Indonesia dinormalisasi tanpa klaim terdaftar di WhatsApp. Customer tanpa akun; detail memakai token acak 32 byte, tanpa pencarian publik berdasarkan WA. Refresh/retry memakai checkout key yang sama. Pembayaran, penerbitan, notifikasi dan aktivasi terpisah; paid tidak meminta bayar ulang saat penerbitan gagal. Pembelian sebelum tiba belum menjalankan timer. Panduan: [STAGE3_CUSTOMER.md](STAGE3_CUSTOMER.md).

Backend lokal mempertahankan satu store. Commit disk gagal menolak operasi sebelum state dipublikasikan; reset inventory acak atomik. Link customer adalah bearer token demo, bukan login customer. SSID/perangkat/WhatsApp/pembayaran seluruhnya mock. Browser tidak memilih WiFi otomatis.

Run penuh sebelumnya: 28/32 lulus; dua kegagalan kesiapan keyboard, satu izin clipboard, satu timeout tampilan voucher. Tes keyboard kini menunggu form siap; tes salin memberi izin clipboard Chromium secara eksplisit. Hasil pengulangan terbaru dicatat pada bagian tahap 4, karena alur ini menjadi masukan dashboard.

## Tahap 4 — Dashboard mitra

Perubahan 11 September 2026. Mempertahankan glassmorphism, logo SVG asli, hero customer, komponen bersama, dan login staf lokal. Tidak menambah dependency.

### Implementasi

- `src/features/partner/PartnerPages.tsx` dan `partner.css`: ringkasan, stok, penjualan, detail transaksi, bagi hasil dan sesi aktif. Router menghubungkan keenam tampilan; sidebar mitra kini menjelaskan lingkup tahap 4.
- Semua agregat berasal dari store bersama. Perangkat online dihitung dari sesi aktif yang belum berakhir/kedaluwarsa, bukan pengguna harian. Angka ini sesi sintetis, bukan telemetri router.
- Filter tanggal inklusif menggunakan hari WIB; tersedia status pembayaran/paket, serta batch/paket/status voucher. Detail menyimpan harga, rate dan basis historis.
- `selectors.ts`: selector transaksi scoped dan masking WA. `server/authorization.ts` serta `application.ts`: respons mitra `/api/state` dan `orders.list` dimasking; token detail customer dan checkout key tidak dikirim kepada mitra.
- Akun mitra memakai partnerId akun, tidak dapat memilih mitra lain. Owner dapat melihat preview mitra aktif. URL transaksi milik mitra lain menampilkan **Akses ditolak**. Guard dan pemeriksaan objek backend lokal dipertahankan; ini **belum otorisasi server produksi**.
- Stok hanya baca/copy. Diserahkan, belum aktif, aktif dan kedaluwarsa dipisahkan. **Unused berarti belum aktif, bukan belum terjual.** Potensi margin offline = (retail contoh − grosir) × alokasi; bukan margin terealisasi atau bagi hasil online. Penerimaan pembayaran stok/margin nyata belum diketahui.
- Bagi hasil online berasal dari ledger paid satu kali per order. Jadwal pencairan **belum ditentukan**; tanpa pembelian stok/pencairan nyata.
- Status titik menampilkan observedAt asli. Snapshot lebih dari 5 menit clock demo, gagal polling atau tidak tersedia menjadi **unknown**. Kegagalan pembaruan API menampilkan peringatan data terakhir dan unknown.

### Review manual

1. Login akun mitra di `/login`, buka `/mitra-dashboard`. Periksa nama mitra, SSID sintetis, observedAt, ringkasan, stok dan sesi.
2. Pada jendela privat, beli paket Cisaat melalui alur customer. Selesaikan pembayaran simulasi. Refresh dashboard Cisaat: satu transaksi dan satu bagi hasil tambahan. Pembayaran duplikat tidak menggandakan keduanya.
3. Buka Penjualan, filter tanggal WIB/status/paket, lalu detail. Nomor customer dimasking; harga/rate historis tetap. Pilih rentang kosong atau terbalik untuk memeriksa empty/error state.
4. Login owner, pilih preview Cibadak. Order Cisaat tidak muncul; URL detail Cisaat ditolak. Akun mitra Cisaat tidak memiliki pemilih mitra.
5. Buka Stok: filter paket/batch/status. Tidak ada aksi beli/alokasi/pencairan. Cocokkan potensi margin offline dengan basis grosir/retail contoh, terpisah dari bagi hasil online.
6. Owner memakai Kontrol demo untuk menetapkan titik offline; overview menunjukkan offline. Maju clock lebih dari 5 menit tanpa polling: unknown, observedAt lama tetap terlihat. Gagal polling juga unknown.
7. Ulangi di 360/768/1440 px. Tabel lebar digulir di dalam region yang dapat difokuskan keyboard; halaman tidak overflow. Gunakan Tab, Enter, menu mobile, filter native dan link detail.

### Batas

Tidak ada integrasi router, payment gateway, WhatsApp, pembelian stok, pencairan, atau deploy. Harga/rate masih asumsi demo. Clock manual tidak bergerak mengikuti waktu nyata. Monitoring/sesi tidak membuktikan koneksi internet fisik. Backend lokal belum hardening/operasional produksi. Safari/Firefox, perangkat fisik dan pembaca layar belum diuji. Tahap 5–6 belum dikerjakan; berhenti setelah tahap 4.


### Hasil verifikasi tahap 4

| Pemeriksaan | Hasil |
|---|---|
| `npm run build` (termasuk typecheck) | Lulus; JS 336,54 kB / 103,30 kB gzip, CSS 60,82 kB / 15,77 kB gzip, di luar media/font |
| `npm run test:domain` | 19/19 lulus |
| `npm run test:server` | 15/15 lulus; sesudah menambah assertion masking kedua endpoint, tes scope HTTP diulang 1/1 lulus |
| Browser gabungan | `npx playwright test tests/stage4.spec.ts tests/stage3.spec.ts tests/auth-hotspot.spec.ts`: 21/21 lulus dalam 4,2 menit (5 tahap 4, 7 customer, 9 auth/portal) |
| Responsive | Lima halaman mitra pada 360/768/1440 px, tanpa pageerror atau overflow halaman. Regresi customer dan auth di ukuran sama juga lulus |
| Visual | Overview mobile, stok tablet, penjualan desktop serta voucher customer desktop diperiksa langsung. Bukti screenshot dan JSON tersedia di `docs/verification/stage4` |
| Data privat/aset | Tidak ada password awal, hash/salt akun atau kode stok aktual pada bundle publik. Hash brief/SVG tetap sama |
| Lokal | `/api/health` dan `/mitra-dashboard` pada 5173 HTTP 200; backend terbaru berjalan. Data user tidak direset |

Run tahap 4 awal 4/5 lulus; satu tes memiliki prasyarat paid yang salah sesudah reset. Setelah menyiapkan paid melalui service, run gabungan lulus seluruhnya. Tidak mengklaim seluruh suite proyek sebagai satu run; hasil di atas khusus command tercatat. Panduan bukti: [verification/stage4/RESULTS.md](verification/stage4/RESULTS.md).

Tambahan pengujian gagal refresh: `npx playwright test tests/stage4.spec.ts -g "failed monitoring refresh"` **1/1 lulus** (28,9 detik termasuk startup). Setelah respons `/api/state` diputus, overview menampilkan peringatan pembaruan gagal, status unknown, dan mempertahankan angka terakhir. Bukti JSON: `docs/verification/stage4/refresh/browser-results.json`. Total enam kasus tahap 4 mempunyai bukti lulus: lima pada run gabungan dan satu run tambahan.

## Tahap 5 — Pengelolaan owner/admin

Pembaruan 13 September 2026. UI glassmorphism, hero customer dan logo SVG tetap. Tanpa dependency baru. Tidak deploy atau memasang integrasi.

### Perubahan

- `src/services/management.ts`: operasi async profil mitra/rate, katalog, penawaran mitra, dan alokasi batch. Validasi panjang teks/SSID unik, rupiah integer, rate 0–100%, durasi/kecepatan/batas perangkat, quantity batch 1–500. Semua mutasi satu transaksi store; batch/kode tidak mempunyai operasi pemindahan.
- `src/domain/models.ts` dan `store.ts`: bidang opsional default rate/harga katalog/request key; state lama tetap terbaca. Validator menerima penambahan mitra dan memeriksa keunikan kode voucher. Tidak mereset data pengguna.
- Kontrak/http/mock dan server: service baru hanya admin/owner; aktor audit dari sesi server. Data publik tidak menyertakan default rate privat. Guard mitra/owner serta masking WA tetap.
- `src/features/owner/OwnerPages.tsx`, `ManagementForms.tsx`, `owner.css`: overview 50 titik awal; daftar/detail mitra dengan pencarian/status; tambah/edit; ketersediaan dan harga khusus; katalog/arsip; pemberian batch, daftar transaksi/detail snapshot, audit. `/admin` dan `/owner` memakai komponen sama; akun staf tetap khusus owner.
- Selector/picker customer menelusuri seluruh mitra termasuk yang baru dibuat, dengan enam kartu awal dan tombol tampilkan lagi. Mitra/paket nonaktif tidak menerima order baru, tanpa mengubah site router atau voucher lama.
- Batch request pending dipersist per tab sebelum kirim. Setelah respons hilang, form mengunci payload dan menawarkan **Pulihkan batch yang sama**. Server mengembalikan batch lama untuk key/payload sama, menolak key dengan payload berbeda.

### Semantik bisnis

Harga katalog berlaku ke seluruh offer saat disimpan, termasuk mengganti harga khusus; form menjelaskannya. Override harga/ketersediaan dapat diatur pada detail mitra. Rate profil berlaku pada semua paket mitra; paket baru mengikuti default ini. Offer mitra/paket baru belum tersedia sampai diaktifkan. Order, komisi, voucher dan batch historis menyimpan snapshot; tidak ikut ditulis ulang.

Perangkat online sekarang dihitung dari sesi sintetis aktif, bukan angka pengguna harian. Rekap memisahkan penjualan online paid, bagi hasil online, nilai alokasi grosir, dan potensi margin offline. Alokasi dengan referensi pembayaran ditampilkan sebagai nilai dengan referensi **belum terverifikasi**, bukan penerimaan uang. Tanpa referensi penerimaan belum diketahui. Unused berarti belum aktif, bukan belum terjual. Pencairan, margin terealisasi, biaya dan pajak belum ditentukan.

### Review manual

1. Login owner `/owner` atau admin `/admin`. Periksa 50 titik awal, status/observedAt dan metrik terpisah. Cari nama/area/SSID dan filter online/offline/unknown.
2. Kelola mitra: tambah nama/area/SSID unik, isi rate, simpan. Titik baru unknown. Buka detail, edit profil dan aktifkan offer; cari nama baru dari halaman customer.
3. Paket: edit harga katalog (perhatikan dampak ke semua mitra), durasi/kecepatan/perangkat. Tambah paket melalui pilihan **Tambah paket baru**. Aktifkan penawarannya di detail mitra bila ingin dijual. Arsipkan melalui status katalog.
4. Admin atur harga Reguler 3 jam Rp9.000 dan rate Cisaat 30%. Di jendela privat customer beli Cisaat dan simulasikan paid. Mitra melihat satu komisi Rp2.700. Ubah harga/rate lagi; detail transaksi owner tetap menunjukkan Rp9.000/30%/Rp2.700.
5. Nonaktifkan penjualan baru Cisaat atau arsipkan paket. Katalog menolak pembelian baru; voucher yang sudah diterbitkan masih dapat login pada site mock yang benar. Tindakan tidak mengubah status router.
6. Distribusi stok: pilih mitra/paket, jumlah, grosir/retail contoh dan referensi opsional. Berikan batch. Cek jumlah/kode di stok mitra. Tidak ada pemindahan batch. Pada jaringan gagal, refresh lalu pulihkan batch pending yang sama.
7. Transaksi: filter mitra/tanggal WIB/status; detail nomor dimasking dan snapshot historis. Log aktivitas: cari `admin: admin` atau nama akun pengubah; perubahan profil/paket/offer/stok tercatat.
8. Login mitra lalu buka `/admin` atau `/owner`: akses tidak tersedia. Mitra tetap hanya mendapat stok/transaksi sendiri.
9. Ulangi pada 360/768/1440 px, Tab antar input, menu mobile dan tabel scroll internal. Angka kosong/tidak diketahui tidak disamarkan sebagai penerimaan nol yang terverifikasi.

### Batas tahap 5

Seluruh data operasional sintetis, waktu domain manual, status router mock. Akun/sesi diperiksa backend lokal, belum otorisasi produksi. Audit lokal belum tamper-proof; form admin tidak memakai optimistic concurrency lintas editor. Referensi pembayaran bukan verifikasi bank. Tidak ada pembayaran/WhatsApp/router/pencairan nyata. Belum diuji Safari/Firefox, pembaca layar atau perangkat fisik.

## Tahap 6 — Verifikasi dan paket presentasi

Pembaruan 13 September 2026. Paket dokumentasi Tahap 6 tersedia: `README.md`, `docs/DEMO_SCRIPT.md`, `docs/ACCEPTANCE_CHECKLIST.md`, `docs/PRODUCTION_READINESS.md`, dan `docs/verification/stage6/RESULTS.md`.

### Verifikasi segar

- `npm run build`: **lulus** (typecheck + Vite build, exit 0).
- `npm run test:domain`: **21/21 lulus**.
- `npm run test:server`: **16/16 lulus**.
- `tests/stage5.spec.ts`: **6/6 lulus** pada rerun final; lintas peran, snapshot harga/rate, audit, batch recovery dan 360/768/1440. Run gabungan stage5 + auth sebelumnya: 15/15.
- `tests/stage6.spec.ts`: **2/2 lulus** pada 390/1024; keyboard focus, label, scoped access dan overflow.

### Status acceptance

Alur aturan bisnis, idempotensi, expiry, device binding, limit bulanan, scoped access, dan snapshot historis lulus pada domain/server/browser test. Audit kontras formal/pembaca layar, Safari/Firefox, perangkat fisik, load, deployment, dan router nyata **belum diuji**. Perbaikan tahap 6 menangani offer form saat proyeksi sesi berubah dan pemulihan batch dengan request key yang sama.

Kriteria Tahap 6 terpenuhi untuk demo lokal; tahap ini tidak menyatakan kesiapan produksi. Detail: `docs/verification/stage6/RESULTS.md` dan `docs/ACCEPTANCE_CHECKLIST.md`.
## Tahap 6 — Penyelesaian demo — 13 September 2026

Dokumen presentasi dan acceptance diperbarui. Tahap 6 tidak menambah fitur bisnis. Perbaikan verifikasi: offer form aman saat proyeksi sesi berubah; draft batch menyimpan request key dan payload sebelum request sehingga response hilang lalu refresh memulihkan batch yang sama; customer search menampilkan mitra baru tanpa mengubah enam kartu awal. Tidak ada integrasi nyata, deploy, atau push remote.

### Pemeriksaan dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `npm run typecheck` | Lulus, dijalankan sebagai bagian build final |
| `npm run build` | Lulus; JS 356,19 kB / 108,16 kB gzip, CSS 61,46 kB / 15,90 kB gzip |
| `npm run test:domain` | **21/21 lulus**; termasuk payment duplicate, salah site, timer/reconnect, device binding, monthly limit, expiry, snapshot, batch unik dan rollback |
| `npm run test:server` | **16/16 lulus**; auth/scope, masking publik, management actor, audit, batch idempoten, guest checkout dan portal |
| `tests/stage5.spec.ts` | **15/15 lulus** pada run final terkait owner/admin, customer, mitra, batch recovery dan 360/768/1440 |
| `tests/stage6.spec.ts` | **2/2 lulus** untuk 390/1024; keyboard focus, label, role scope dan overflow |
| Browser stage 3/4/auth | Bukti lulus tersimpan pada `docs/verification/stage3`, `stage4`, dan `auth-hotspot`; tidak digabungkan sebagai klaim satu run penuh |
| Visual | Screenshot owner/customer/mitra 360/768/1440 ditinjau; 390/1024 smoke struktural lulus. Kontras formal, Safari/Firefox, pembaca layar dan perangkat fisik belum diuji |
| Bundle/privacy | `.local/verify-artifacts.mjs` lulus: tidak ada password awal, hash/salt, kode stok aktual, atau marker server/fixture pada bundle publik |

### Skenario akhir dan batas

Reset demo → customer pilih mitra/paket → order sebelum tiba → paid/provisioning/WhatsApp → login jaringan benar/salah → perangkat reguler kedua → monthly slot → expiry → refresh → mitra scoped → owner/admin update harga/rate → order baru → snapshot transaksi lama → batch unik/recovery → audit. Pembayaran, WhatsApp, monitoring, SSID/WiFi, identitas perangkat dan router tetap simulasi. Alokasi stok tanpa referensi tidak dianggap penerimaan uang.

Status: **tahap 0–6 selesai sebagai demo lokal yang dapat diulang**. Tahap integrasi/pilot produksi belum dikerjakan dan membutuhkan keputusan serta akses pada [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md).

## Perbaikan portal WiFi online — 14 September 2026

Halaman login WiFi sekarang menerima dua sumber voucher: batch offline dan voucher online yang memenuhi seluruh syarat berikut: pembayaran `paid`, penerbitan `issued`, lokasi/site cocok, dan status voucher belum kedaluwarsa. Validasi device binding, batas sesi bulanan, ketersediaan site mock, dan timer sejak login pertama tetap memakai service voucher yang sama. Voucher online yang masih pending, gagal, atau belum diterbitkan tetap ditolak.

Ditambahkan pengujian server untuk alur checkout online → paid → issued → login melalui portal WiFi bersama, termasuk penolakan lokasi yang salah. Tidak ada integrasi router atau pembayaran nyata.

### Verifikasi perbaikan

- `npm run typecheck`: lulus.
- `node --version`: v24.20.0; `npm ls --depth=0`: seluruh dependency tersedia.
- `npm run test:domain`: **21/21 lulus**.
- `npm run test:server`: **17/17 lulus**, termasuk portal bersama untuk voucher online paid/issued dan penolakan site yang salah.
- `npm run build`: lulus.

## Latar video untuk login — 15 September 2026

Video `C:\Users\zil\Downloads\Telegram Desktop\video_2026-09-15_18-35-55.mp4` dipakai apa adanya sebagai backdrop bersama dan disalin ke `public/media/login-background.mp4` (H.264 1280×720, sekitar 10 detik). Komponen `VideoBackdrop` dipasang pada login staff, portal login voucher WiFi customer, dan shell dashboard mitra/admin/owner sehingga konteks akses tetap konsisten tanpa membuat login baru atau mengubah aturan otorisasi.

Overlay gelap menjaga kontras untuk judul dan form. Video berjalan muted/loop/inline dengan `preload="metadata"`; pada `prefers-reduced-motion` video disembunyikan dan warna latar tetap tersedia. Asset hero customer yang sudah ada tidak diubah.

### Pemeriksaan

- `npm run typecheck`: lulus setelah pemasangan backdrop.
- `npm run build`: lulus setelah pemasangan backdrop (Vite 8.2.2; JS 356,85 kB / 108,27 kB gzip; CSS 78,02 kB / 19,23 kB gzip).
- `npm run test:domain`: **21/21 lulus**.
- `npm run test:server`: **17/17 lulus**.
- `npx playwright test tests/editorial.spec.ts --grep "supplied video backdrop"`: **2/2 lulus** pada 390/1440 px untuk login staff, WiFi, owner, dan mitra.

Batas demo tetap berlaku: video hanya asset lokal, portal WiFi dan jaringan/perangkat tetap simulasi, dan tidak ada pemilihan WiFi otomatis, pembayaran, pengiriman WhatsApp, atau perubahan router nyata.

## Penyelarasan tipografi Creativeans — 15 September 2026

Deklarasi font aplikasi sekarang memakai **Roboto Variable** lokal melalui `@fontsource-variable/roboto`, mengikuti karakter sans yang dipakai halaman referensi. Font diterapkan sebagai default body, kontrol form, navigasi, dashboard, dan judul; bobot judul dibuat lebih ringan agar tetap terasa editorial tanpa mengambil font proprietary dari pihak lain. Manrope tidak lagi dimuat oleh entrypoint.

## Wordmark SSS dan CTA WhatsApp — 22 September 2026

Wordmark di samping logo kini menampilkan **S.S.S** dengan `Bodoni Moda Variable`, dipakai sebagai display serif high-contrast yang mendekati referensi gambar user. Logo SVG tidak diubah. Hero customer mendapat CTA kedua **Hubungi admin** di samping **Temukan mitra Anda**; link membawa pesan pembuka tentang kemitraan atau pemasangan WiFi. Karena nomor admin belum diberikan, fallback demo memakai halaman WhatsApp dengan pesan yang sudah diisi. Untuk tautan langsung ke admin, set `VITE_ADMIN_WHATSAPP_URL` ke URL `https://wa.me/<nomor>` milik SSS sebelum presentasi.

Link voucher dipindahkan ke baris terpisah dan layout CTA menjadi flex-wrap/stacked pada layar sempit, sehingga tidak lagi bertabrakan seperti pada gambar 4.

Favicon sekarang memakai salinan apa adanya dari `logo_SSS.svg` pada `public/favicon.svg`, lalu direferensikan dari `index.html` sebagai favicon SVG. Tidak ada perubahan pada path atau warna logo.

## Persiapan build production dan pembacaan checklist PT SSS — 23 September 2026

Runtime sekarang membedakan build production dari development. Pada production, banner/role switcher/kontrol skenario tidak dirender; checkout, detail order, dan portal hotspot menahan aksi yang masih memerlukan Mayar, WhatsApp, database bersama, atau adaptor MikroTik. Development tetap dapat memakai fixture untuk QA melalui `npm run dev`.

Checklist `Validasi dan Ceklis Prototype PT SSS.docx` dibaca seluruhnya. Poin yang perlu dibawa ke backlog client: pilot Girijaya/Sizinet, ekspor CSV, paket mingguan/OLT-rumahan, aturan binding provider/hotspot, ownership akun produksi, dan akses integrasi Mayar/MikroTik/WhatsApp. Tidak ada keputusan kosong yang diubah menjadi asumsi aplikasi.

## Persiapan MVP presentasi lokal — 25 September 2026

### Perubahan implementasi

- Aksi pembayaran, penerbitan voucher, dan status WhatsApp tidak lagi tersedia lewat capability link customer. Kontrol keberhasilan simulasi hanya bisa dijalankan melalui API staf yang tunduk pada session, CSRF, dan role authorization. Customer tetap bisa membaca status dan menjalankan aksi sambung/putus mock.
- Portal WiFi kini menerima dua jenis fixture: kode tunggal dan username/password. Kredensial username/password disimpan sebagai tipe domain tersendiri dan validasi keunikannya dibatasi per site. Proyeksi mitra menyamarkan kode/credential; halaman mitra tidak menerima secret stok.
- Halaman hasil order menampilkan bentuk voucher sesuai jenisnya. Owner/admin dapat meninjau fixture username/password dari stok sintetis untuk demo; teks menjelaskan bahwa data tersebut bukan kredensial pelanggan nyata.
- Alur customer memberi cara memperbarui status order setelah owner/admin memicu simulasi di **Kontrol demo**. README, panduan login lokal, demo script, checklist acceptance, dan laporan readiness diselaraskan dengan proses ini.

### Pemeriksaan yang benar-benar dijalankan

- `npm run typecheck`: lulus.
- `npm run test:domain`: 21/21 lulus.
- `npm run test:server`: 19/19 lulus, termasuk penolakan pemalsuan hasil bayar/issue/WhatsApp via customer link, login username/password, masking partner, dan binding site.
- `npm run build`: lulus.
- `npm run test:browser`: 53/55 lulus pada run penuh; 2 gagal adalah assertion test glass yang sudah usang (nama aksesibel CTA dan warna kartu fallback transparansi). Setelah test diperbarui, `npx playwright test tests/glass.spec.ts --reporter=list`: 5/5 lulus. Stage 2 + stage 4 yang sempat memberi 500 saat run sebelumnya lulus 10/10 saat dijalankan terpisah; run penuh berikutnya juga lulus kedua alur tersebut. Tidak ada kegagalan alur produk di 53 browser test yang lulus; satu run penuh pasca-perbaikan assertion belum diulang.
- Browser suite mencakup viewport 360, 390, 768, 1024, dan 1440 px, navigasi keyboard, label form, page overflow, customer/owner/admin/mitra, purchase dan reset. Bukti JSON: `docs/verification/conqueror/mvp-final-rerun/browser-results.json`; screenshot hasil penuh tersimpan di folder bukti terkait.
- `git diff --check`: lulus.

### Belum dapat atau belum dijalankan

- Tidak ada schema/migration PostgreSQL, layanan database, atau test integration PostgreSQL di repository ini; pemeriksaan database bukan lulus dan tidak tersedia untuk dijalankan.
- Tidak dilakukan audit screen reader/WCAG formal, uji Safari/Firefox/perangkat fisik, maupun tes router nyata.
- Pembayaran/provider voucher/WhatsApp/captive portal/router tetap tidak terhubung. D1–D7 pada `docs/conqueror/MVP_READINESS.md` tetap terbuka. Tidak ada deploy atau push remote.

Status yang didukung bukti: **layak untuk demo lokal dengan batasan yang dicatat; bukan siap produksi.** Laporan langkah run/reset dan script presentasi: `docs/conqueror/MVP_READINESS.md`, `docs/DEMO_SCRIPT.md`, dan `README.md`.

## MVP V2 — penyelesaian presentasi lokal — 26 September 2026

Gap analysis dibuat sebelum implementasi di `docs/conqueror/MVP_V2_GAP_ANALYSIS.md`. Repository aktif `main` berisi React/Vite dan Node API dengan JSON lokal berversi; pekerjaan PostgreSQL/Fastify M1.2/M1.3 berada pada worktree/branch yang divergen dan tidak digabungkan dalam batch ini. Pekerjaan MVP V1 yang belum di-commit serta catatan meeting user dipertahankan. Tidak ada deploy, push remote, integrasi pembayaran/WhatsApp/router nyata, atau data customer nyata.

Provider, Site sebagai Location, dan Hotspot sekarang eksplisit (50 mitra sintetis, 51 hotspot dengan dua di Cisaat). Order dan voucher terikat pada hotspot; pool inventori online berkurang sekali ketika voucher terbit. Migrasi state lokal V1→V2 mempertahankan order, voucher dan waktu aktivasi; server membuat backup V1 satu kali sebelum penulisan V2. Portal hotspot menampilkan Voucher, Member, QR kamera dengan fallback manual, serta pembelian yang membawa konteks hotspot hingga detail order. QR hanya memuat satu kode voucher. Token detail order tidak dapat mengaktifkan sesi tanpa kredensial.

Owner melihat operasi seluruh hotspot, assignment admin, health/usage sintetis, stok/alert, insiden, notifikasi dalam aplikasi, pencarian support, dan retry penerbitan yang idempoten. Admin dibatasi pada hotspot assignment di proyeksi dan API; mitra tetap hanya melihat data sendiri yang dimasking. Merchant pembayaran diberi label PT SSS, sedangkan penyelesaian pembayaran, provisioning, telemetri, SSID/perangkat dan WhatsApp masih simulasi. Semua keputusan integrasi D1–D7 tetap terbuka. Naskah presentasi 5–7 menit ada di `docs/DEMO_SCRIPT.md`; batas dan langkah reset ada di `docs/conqueror/MVP_V2_READINESS.md` serta README.

### Verifikasi akhir yang benar-benar dijalankan

| Pemeriksaan | Hasil |
|---|---|
| `npm run test:domain` | **25/25 lulus**: termasuk hotspot salah, inventori sekali, migrasi V1, idempotensi, durasi dan batas sesi |
| `npm run test:server` | **23/23 lulus**: termasuk assignment API, operasi, kredensial, order token ditolak untuk aktivasi, recovery dan rollback disk |
| `npm run build` | **Lulus**, termasuk `tsc --noEmit`; Vite menghasilkan bundle production |
| `npx playwright test --reporter=list` | **64/64 lulus dalam satu run final, 15,5 menit**; customer→mitra→owner/admin, QR, fallback kamera, alur gagal, refresh/reset, masking/scope, form dan snapshot historis |
| Viewport browser | **360/390/768/1024/1440 px lulus** pada pemeriksaan otomatis yang relevan; label input, fokus keyboard dan overflow halaman dicek |
| `git diff --check` | Lulus; hanya peringatan konversi LF/CRLF di Windows |
| `node .local/verify-artifacts.mjs` | Lulus; skrip tidak menemukan password awal, hash/salt akun, kode stok offline, atau marker server/fixture pada JS publik |

Run browser awal gagal pada timeout screenshot halaman operasi yang terlalu panjang dan satu assertion alur sesi lama. Tampilan operasi dibatasi empat hotspot awal dengan opsi menampilkan semua 51; tes diperbaiki sesuai alur logout yang berlaku. Run kedua menemukan error penyimpanan akun Windows saat mutasi owner; penulisan file mendapat retry untuk lock sementara dan daftar akun dimuat ulang setelah respons gagal. Kasus akun lulus saat diulang, kemudian seluruh suite final lulus. Tinjauan manual dilakukan pada screenshot panel 360 px; pemeriksaan viewport lain adalah otomatis. Belum ada audit kontras formal, screen reader, Safari/Firefox, perangkat fisik, kamera nyata, maupun tes PostgreSQL pada branch aktif. **Status: READY WITH NON-BLOCKING LIMITATIONS untuk presentasi lokal; bukan siap produksi.**
