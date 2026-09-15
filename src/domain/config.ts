export const DEMO_CONFIG = {
  initialTime: '2026-09-10T02:00:00.000Z',
  monitoringStaleAfterMs: 5 * 60_000,
  commissionRatePercent: 20,
  examplePricesRp: [5000, 7000, 10000, 150000, 250000],
  offlineWholesaleUnitRp: 3500,
  rateAssumption: 'Asumsi demo: 20% dari gross sebelum biaya; pembulatan ke rupiah terdekat. Bukan kebijakan produksi.',
  packageAssumption: 'Asumsi demo: harga contoh, 10 Mbps; 1 hari = 24 jam, bulanan = 30 hari, timer bersama.',
  offlineAssumption: 'Harga grosir/retail contoh. Alokasi bukan penjualan; margin hanya potensi. Pembayaran stok belum diketahui.',
} as const
