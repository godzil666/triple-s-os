import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { apiRequest } from '../../services/http'
import './operations.css'

type OperationsSummary = {
  hotspots: { id: string; name: string; partner: { name: string }; telemetry: { status: string; users: number; observedAt: string } | null }[]
  inventory: { id: string; available: number; lowThreshold: number }[]
  alerts: { id: string; status: string }[]
  incidents: { id: string; status: string }[]
  recovery: { orderId: string }[]
  source: string
  clockNow: string
}

export function AdminOverviewPage() {
  const [view, setView] = useState<OperationsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setView(await apiRequest<OperationsSummary>('/api/ops/overview'))
      setError('')
    } catch (cause) {
      setError(`Ringkasan tugas belum dapat dimuat: ${(cause as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [])
  useEffect(() => { void refresh() }, [refresh])

  if (loading) return <section className="partner-page operations-page"><h1>Memuat ringkasan tugas…</h1><p role="status">Mengambil penugasan dari server lokal.</p></section>
  if (!view) return <section className="partner-page operations-page"><h1>Ringkasan tugas belum tersedia</h1><p role="alert">{error}</p><Button onClick={() => void refresh()}>Coba lagi</Button></section>

  const openAlerts = view.alerts.filter(item => item.status === 'open').length
  const activeIncidents = view.incidents.filter(item => item.status !== 'resolved').length
  const lowStock = view.inventory.filter(item => item.available < item.lowThreshold).length
  const connected = view.hotspots.filter(item => item.telemetry?.status === 'online')
  const onlineUsers = connected.reduce((total, item) => total + (item.telemetry?.users ?? 0), 0)
  return <section className="partner-page operations-page admin-overview">
    <p className="eyebrow">RUANG ADMIN · {view.source}</p>
    <h1>Ringkasan tugas saya</h1>
    <p>Pantau hotspot yang ditugaskan kepada akun ini, lalu tindak lanjuti masalah melalui pusat operasi. Data jaringan masih telemetri simulasi; akses admin dibatasi oleh server.</p>
    {error && <p role="alert" className="flow-error">{error}</p>}
    <Button variant="secondary" onClick={() => void refresh()}>Perbarui ringkasan</Button>
    <div className="partner-metrics admin-overview-metrics">
      <Card><span>Hotspot ditugaskan</span><strong>{view.hotspots.length}</strong></Card>
      <Card><span>Perangkat online sekarang</span><strong>{onlineUsers}</strong></Card>
      <Card><span>Alert terbuka</span><strong>{openAlerts}</strong></Card>
      <Card><span>Pesanan perlu bantuan</span><strong>{view.recovery.length}</strong></Card>
    </div>
    <div className="admin-overview-grid">
      <Card className="admin-overview-panel"><span className="eyebrow">MONITORING</span><h2>Kesehatan hotspot</h2><p>{connected.length} online · {view.hotspots.length - connected.length} offline, menurun, atau belum diketahui.</p><div className="admin-overview-sites">{view.hotspots.length ? view.hotspots.map(item => <div key={item.id}><div><strong>{item.name}</strong><small>{item.partner.name}</small></div><Badge tone={item.telemetry?.status === 'online' ? 'success' : item.telemetry?.status === 'offline' ? 'error' : 'warning'}>{item.telemetry?.status ?? 'unknown'}</Badge></div>) : <p>Belum ada hotspot dalam penugasan Anda.</p>}</div><Link to="/admin/operasi#health">Lihat kesehatan dan waktu pantau <ArrowUpRight size={16} aria-hidden="true" /></Link></Card>
      <Card className="admin-overview-panel"><span className="eyebrow">PRIORITAS OPERASI</span><h2>Yang perlu ditangani</h2><div className="admin-overview-tasks"><Link to="/admin/operasi#alerts"><strong>{openAlerts}</strong><span>Alert terbuka</span><ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/admin/operasi#incidents"><strong>{activeIncidents}</strong><span>Insiden aktif</span><ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/admin/operasi#inventory"><strong>{lowStock}</strong><span>Stok di bawah ambang</span><ArrowUpRight size={17} aria-hidden="true" /></Link><Link to="/admin/operasi#recovery"><strong>{view.recovery.length}</strong><span>Pesanan perlu pemulihan</span><ArrowUpRight size={17} aria-hidden="true" /></Link></div></Card>
    </div>
    <p className="assumption-note">Ringkasan ini mengikuti penugasan akun admin. Pengelolaan mitra, katalog paket, distribusi stok, akun staf, dan konfigurasi global tetap khusus owner.</p>
  </section>
}
