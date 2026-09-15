import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowUpRight, Blocks, LayoutDashboard } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Card } from '../components/Card'
import { Table } from '../components/Table'
import { useDemoContext } from '../demo/DemoContext'

export function PlaceholderPage({ title, description, stage, dashboard = false }: { title: string; description: string; stage: number; dashboard?: boolean }) {
  const { id } = useParams()
  const { state } = useDemoContext()
  const partner = state.partners.map(p => ({ ...p, ssid: state.sites.find(s => s.partnerId === p.id)!.ssid })).find(item => item.id === id)
  const heading = title === 'Pilihan paket' && partner ? `Paket untuk ${partner.name}` : title
  return <div className={dashboard ? 'placeholder-page' : 'page-container customer-placeholder'}>
    <div className="page-breadcrumb">{dashboard ? 'Ruang kerja' : 'Customer'} <span>/</span> {title}</div>
    <div className="placeholder-heading"><div><p className="eyebrow">{dashboard ? 'FONDASI RUANG KERJA' : 'MITRA PILIHAN ANDA'}</p><h1>{heading}</h1><p>{description}</p></div><Badge tone="info">Tahap {stage} · belum tersedia</Badge></div>
    {partner && <div className="notice"><strong>{partner.name}</strong> · {partner.ssid} · Lokasi fiktif. Voucher hanya berlaku pada mitra ini.</div>}
    {title === 'Pilihan paket' && !partner && <div className="notice">Mitra pada URL ini tidak ditemukan dalam contoh tahap 1. Silakan pilih mitra dari halaman utama.</div>}
    <Card className="placeholder-card"><div className="placeholder-illustration" aria-hidden="true"><div className="placeholder-window"><div className="window-dots"><i /><i /><i /></div><div className="window-body"><LayoutDashboard size={32} strokeWidth={1.3} /><div><span /><span /><span /></div></div></div><span className="placeholder-cube"><Blocks size={22} /></span></div><Badge>Placeholder yang direncanakan</Badge><h2>Ruangnya siap.<br />Fungsinya menyusul.</h2><p>Halaman ini baru menampilkan fondasi navigasi. {dashboard ? 'Data dan tindakan pengelolaan akan dibangun' : 'Alur pembelian akan dibangun'} pada tahap {stage}.</p><Link className="button button--secondary" to="/"><ArrowLeft size={17} aria-hidden="true" />Kembali ke pilihan mitra</Link></Card>
    {dashboard && <Card className="foundation-table"><Table caption="Batas fungsi pada pratinjau ini" columns={['Bagian', 'Status saat ini']} rows={[
      { id: 'navigation', cells: ['Layout & navigasi', <Badge tone="success">Dapat dijelajahi</Badge>] },
      { id: 'data', cells: ['Data transaksi & monitoring', 'Mesin simulasi tersedia · tampilan dashboard tahap berikutnya'] },
      { id: 'security', cells: ['Autentikasi & otorisasi server', 'Login staf lokal · akses sesuai peran'] },
    ]} /><div className="table-footnote"><ArrowUpRight size={16} aria-hidden="true" />Tidak ada pembayaran, pengiriman pesan, atau perubahan router nyata.</div></Card>}
  </div>
}
