# Acceptance Checklist — Tahap 6

Status: **LULUS** berarti bukti segar tersedia; **GAGAL** berarti ada kegagalan reproduktif; **BELUM TERUJI/INCONCLUSIVE** berarti bukti belum lengkap atau command terhenti.

## Otomatis

| Area | Status | Bukti |
|---|---|---|
| TypeScript/production build | LULUS | `npm run build`, exit 0 pada 13 September 2026 |
| Domain rules | LULUS | `npm run test:domain`, 21/21 |
| Server/auth/API | LULUS | `npm run test:server`, 16/16 |
| Browser customer → mitra → owner final | LULUS | `tests/stage5.spec.ts`: 6/6 pada rerun final; lintas peran, snapshot harga/rate, audit, batch dan scoped access. Run gabungan stage5 + auth: 15/15 |
| Browser regresi stage 3–4/auth | LULUS | Stage 3/4 dan auth punya bukti lulus pada `docs/verification/`; stage 6 smoke menambah 390/1024 |

## Fungsional

| Skenario | Status | Catatan |
|---|---|---|
| Reset/fixture sintetis | LULUS | Diuji domain/server |
| Pembayaran duplikat/idempotensi | LULUS | Satu voucher/komisi per order |
| Salah site/offline/unknown | LULUS | Timer tidak dimulai |
| WA gagal/provisioning tertunda | LULUS | Status tetap terpisah, voucher dipertahankan |
| Device binding reguler | LULUS | Perangkat kedua ditolak |
| Limit paket bulanan | LULUS | Logout membebaskan slot |
| Expiry/reconnect | LULUS | Timer mulai sekali dan tidak reset |
| Scoped access mitra | LULUS | Query/projection server menolak lintas mitra |
| Owner changes/snapshot | LULUS | Harga/rate historis tetap |

## Visual, accessibility, compatibility

| Pemeriksaan | Status | Catatan |
|---|---|---|
| Screenshot responsive 360/768/1440 | LULUS | Artefak tahap 3–5 tersedia; owner form dan dashboard diperiksa |
| Viewport 390/1024 | LULUS | `tests/stage6.spec.ts`, 2/2, tanpa overflow/pageerror |
| Overflow/tabel scroll | LULUS | Browser checks memakai scrollWidth dan tabel region scroll |
| Keyboard focus/label | LULUS sebagian | Label dan Tab diuji; audit pembaca layar belum dilakukan |
| Kontras formal/pembaca layar | BELUM TERUJI | Belum diaudit dengan assistive technology |
| Safari/Firefox/perangkat fisik | BELUM TERUJI | Bukti hanya Chromium lokal |

## Keamanan dan batas

- LULUS: tidak ada pembayaran/WhatsApp/router nyata pada demo.
- LULUS: server tests memeriksa projection dan access scope.
- BELUM TERUJI: hardening produksi, database multi-user, load, backup operasional, audit tamper-proof, dan deployment.
