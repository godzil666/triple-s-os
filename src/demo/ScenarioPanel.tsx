import { useState } from 'react'
import { Button } from '../components/Button'
import { Dialog } from '../components/Dialog'
import { Select } from '../components/Select'
import { useDemoContext } from './DemoContext'
import { monitoringStatus, selectSummary } from '../domain/selectors'
import type { DemoScenarios, SiteStatus } from '../domain/models'

const time = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Asia/Jakarta' }).format(new Date(value))
const rupiah = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value)
const errors: Record<string, string> = {
  WRONG_SITE: 'Situs mock tidak sesuai mitra voucher. Pilih situs yang benar secara manual.',
  SITE_UNAVAILABLE: 'Situs mock sedang offline atau belum diketahui. Login ditolak.',
  DEVICE_BOUND: 'Voucher reguler terkunci pada perangkat pertama.',
  SESSION_LIMIT: 'Slot sesi bulanan penuh. Logout salah satu perangkat terlebih dahulu.',
  VOUCHER_EXPIRED: 'Voucher telah kedaluwarsa. Reconnect tidak memperpanjang durasi.',
  PAYMENT_NOT_PAID: 'Pembayaran belum paid; voucher belum dapat diterbitkan.',
  VOUCHER_NOT_ISSUED: 'Voucher belum terbit; notifikasi belum dapat dikirim.',
  PARTNER_INACTIVE: 'Mitra tidak menerima pembelian baru.',
  PACKAGE_UNAVAILABLE: 'Paket tidak tersedia pada mitra ini.',
}

export function ScenarioPanel({ onClose }: { onClose: () => void }) {
  const { state, services } = useDemoContext()
  const [orderId, setOrderId] = useState(state.orders.at(-1)?.id ?? '')
  const [packageId, setPackageId] = useState('regular-3h')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('Pilih contoh atau buat order sintetis untuk mencoba aturan domain.')
  const [confirmReset, setConfirmReset] = useState(false)
  const order = state.orders.find(o => o.id === orderId)
  const payment = state.payments.find(p => p.orderId === orderId)
  const voucher = state.vouchers.find(v => v.orderId === orderId)
  const sessions = state.sessions.filter(s => s.voucherId === voucher?.id && s.endedAt === null)
  const site = state.sites.find(s => s.id === state.context.siteId)!
  const summary = selectSummary(state, state.context.partnerId)
  const offer = state.partnerPackages.find(p => p.partnerId === state.context.partnerId && p.packageId === packageId)
  const pkg = state.packages.find(p => p.id === packageId)!
  async function run(action: () => Promise<unknown>, success = 'Skenario dijalankan. Data sintetis diperbarui.') {
    setBusy(true)
    try { await action(); setMessage(success) } catch (error) { setMessage(errors[(error as Error).message] ?? `Simulasi gagal: ${(error as Error).message}`) }
    finally { setBusy(false) }
  }
  return <Dialog open onClose={onClose} title="Kontrol simulasi">
    <div className="scenario-panel">
      <p className="scenario-intro">Panel khusus owner. Login staf diperiksa backend lokal; transaksi dan koneksi WiFi di panel ini tetap simulasi. Identitas dan kontak customer seluruhnya sintetis.</p>
      {state.persistenceNotice && <p className="scenario-warning">{state.persistenceNotice}</p>}
      <p role="status" className="scenario-message">{message}</p>
      <fieldset disabled={busy}>
        <legend>Waktu & konteks manual</legend>
        <p><strong>{time(state.clockNow)} WIB</strong><br /><small>Clock berhenti sampai dimajukan; waktu dan konteks bertahan setelah refresh.</small></p>
        <div className="scenario-actions"><Button variant="secondary" onClick={() => void run(() => services.demo.advance(6 * 60_000))}>+6 menit</Button><Button variant="secondary" onClick={() => void run(() => services.demo.advance(3600_000))}>+1 jam</Button><Button variant="secondary" onClick={() => void run(() => services.demo.advance(31 * 86400_000))}>+31 hari</Button></div>
        <Select label="Mitra order baru / ringkasan" value={state.context.partnerId} onChange={e => void run(() => services.demo.setContext({ partnerId: e.target.value }))}>{state.partners.map(p => <option value={p.id} key={p.id}>{p.name} · fiktif</option>)}</Select>
        <Select label="Situs mock untuk login" hint="Dipilih manual. Tidak membaca SSID atau MAC perangkat Anda." value={state.context.siteId} onChange={e => void run(() => services.demo.setContext({ siteId: e.target.value }))}>{state.sites.map(s => <option key={s.id} value={s.id}>{s.ssid}</option>)}</Select>
        <Select label="Perangkat mock" value={state.context.deviceId} onChange={e => void run(() => services.demo.setContext({ deviceId: e.target.value }))}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={`device-demo-${i + 1}`}>Perangkat demo {i + 1}</option>)}</Select>
        <Select label="Ketersediaan situs mock" value={site.mockAvailability} onChange={e => void run(() => services.monitoring.setSite(site.id, e.target.value as SiteStatus))}><option value="online">Online (simulasi)</option><option value="offline">Offline (simulasi)</option><option value="unknown">Belum diketahui</option></Select>
        <p>Monitoring: <strong>{monitoringStatus(state, site.id)}</strong>. Basi setelah 5 menit (asumsi). Ketersediaan mock dan hasil polling terpisah.</p>
        <div className="scenario-actions"><Button variant="secondary" onClick={() => void run(() => services.monitoring.poll(site.id))}>Polling mock</Button><Button variant="secondary" onClick={() => void run(() => services.monitoring.poll(site.id, true))}>Gagalkan polling</Button></div>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Transaksi contoh</legend>
        <Select label="Paket contoh" value={packageId} onChange={e => setPackageId(e.target.value)}>{state.packages.map(p => <option key={p.id} value={p.id}>{p.name} · asumsi</option>)}</Select>
        <p>{offer ? rupiah(offer.priceRp) : 'Harga belum tersedia'} · harga contoh. {pkg.assumptionLabel}</p>
        <Button onClick={() => void run(async () => { const created = await services.orders.create({ partnerId: state.context.partnerId, packageId, customerName: 'Pelanggan Sintetis', customerWhatsapp: 'DEMO-WA-PANEL', channel: 'qris' }); setOrderId(created.id) }, 'Order sintetis dibuat. Timer belum dimulai.')}>Buat order sintetis</Button>
        <Select label="Order sintetis" value={orderId} onChange={e => setOrderId(e.target.value)}>{[...state.orders].reverse().map(o => <option key={o.id} value={o.id}>{o.id} · {state.partners.find(p => p.id === o.partnerId)?.name} · {o.packageSnapshot.name}</option>)}</Select>
        <div className="scenario-grid">
          <Select label="Hasil pembayaran" value={state.scenarios.payment} onChange={e => void run(() => services.demo.configure({ payment: e.target.value as DemoScenarios['payment'] }))}><option value="paid">Berhasil · paid</option><option value="pending">Menunggu · pending</option><option value="failed">Gagal · failed</option><option value="expired">Timeout · expired</option></Select>
          <Select label="Hasil provisioning" value={state.scenarios.provisioning} onChange={e => void run(() => services.demo.configure({ provisioning: e.target.value as DemoScenarios['provisioning'] }))}><option value="issued">Terbit · issued</option><option value="pending">Ditunda · pending</option><option value="failed">Gagal · failed</option></Select>
        </div>
        <div className="scenario-actions"><Button disabled={!order} variant="secondary" onClick={() => void run(() => services.payments.settle(orderId))}>Jalankan callback pembayaran</Button><Button disabled={!order} variant="secondary" onClick={() => void run(() => services.vouchers.issue(orderId))}>Terbitkan / ulangi voucher</Button></div>
        <dl className="scenario-states"><div><dt>Payment</dt><dd>{payment?.status ?? '—'}</dd></div><div><dt>Provisioning</dt><dd>{order?.provisioningStatus ?? '—'}</dd></div><div><dt>Voucher</dt><dd data-testid="voucher-status">{voucher?.status ?? 'Belum terbit'}</dd></div><div><dt>Kedaluwarsa (WIB)</dt><dd data-testid="voucher-expiry">{voucher?.expiresAt ? time(voucher.expiresAt) : 'Belum dimulai'}</dd></div></dl>
        {order && <p>Snapshot order: {rupiah(order.amountRp)} · bagi hasil {order.rateSnapshot.ratePercent}% gross sebelum biaya (asumsi). Voucher berlaku di {state.sites.find(s => s.id === order.siteId)?.ssid}.</p>}
        <Select label="Hasil notifikasi WhatsApp mock" value={state.scenarios.notification} onChange={e => void run(() => services.demo.configure({ notification: e.target.value as DemoScenarios['notification'] }))}><option value="sent">Terkirim (simulasi)</option><option value="failed">Gagal (simulasi)</option></Select>
        <Button variant="secondary" disabled={!order} onClick={() => void run(() => services.notifications.send(orderId))}>Kirim / ulangi notifikasi mock</Button>
        <p>Notifikasi terakhir: {state.notifications.filter(n => n.orderId === orderId).at(-1)?.status ?? 'Belum dicoba'}. Callback ulang tidak menggandakan komisi/voucher.</p>
      </fieldset>
      <fieldset disabled={busy}>
        <legend>Aktivasi & sesi</legend>
        <p>Login mock baru memulai durasi. Ganti perangkat untuk menguji penguncian reguler atau slot bulanan; logout membebaskan slot, bukan menghentikan waktu.</p>
        <Button disabled={!voucher} onClick={() => void run(() => services.vouchers.login({ voucherId: voucher!.id, siteId: state.context.siteId, deviceId: state.context.deviceId }))}>Login mock</Button>
        <p>Sesi order terpilih: {sessions.length} / {voucher?.maxConcurrentDevices ?? '—'} slot.</p>
        {sessions.map(s => <div className="scenario-session" key={s.id}><span>{s.deviceId}</span><Button variant="secondary" onClick={() => void run(() => services.vouchers.logout(s.id))}>Logout {s.deviceId}</Button></div>)}
      </fieldset>
      <div className="scenario-summary"><strong>Ringkasan store · mitra pilihan</strong><p>{summary.onlineDevices} perangkat online · {summary.paidOrders} order paid · gross online {rupiah(summary.onlineGrossRp)} · bagi hasil online {rupiah(summary.onlineCommissionRp)}.</p><p>{summary.allocatedOfflineVouchers} stok dialokasikan. Potensi margin offline {rupiah(summary.offlinePotentialMarginRp)}; margin terealisasi dan pembayaran stok belum diketahui. Unused bukan bukti belum terjual.</p><small>Waktu data: {time(summary.observedAt)} WIB. Dashboard lengkap tetap tahap berikutnya.</small></div>
      <div className="scenario-reset">{confirmReset ? <><p><strong>Reset semua data sintetis Triple S OS?</strong> Order, sesi, perubahan skenario, dan clock lokal kembali ke fixture awal. Data aplikasi lain tetap ada.</p><div className="scenario-actions"><Button variant="secondary" disabled={busy} onClick={() => setConfirmReset(false)}>Batal reset</Button><Button disabled={busy} onClick={() => void run(async () => { await services.demo.reset(true); setOrderId('seed-order-8'); setPackageId('regular-3h'); setConfirmReset(false) }, 'Data sintetis dikembalikan ke fixture awal.')}>Ya, reset data sintetis</Button></div></> : <Button variant="secondary" disabled={busy} onClick={() => setConfirmReset(true)}>Reset data demo</Button>}</div>
    </div>
  </Dialog>
}
