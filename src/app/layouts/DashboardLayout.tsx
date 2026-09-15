import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { Activity, ArrowUpRight, Boxes, Building2, ChevronRight, CircleHelp, LayoutDashboard, Menu, Package, ReceiptText, Users, Wallet, X } from 'lucide-react'
import { Brand } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Badge } from '../../components/Badge'
import { Select } from '../../components/Select'
import { Dialog } from '../../components/Dialog'
import { SiteFooter } from '../../components/SiteFooter'
import { useDemoContext } from '../../demo/DemoContext'
import { useAuth } from '../../auth/AuthContext'
import { VideoBackdrop } from '../../components/VideoBackdrop'

const partnerItems = [
  { to: '/mitra-dashboard', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/mitra-dashboard/stok', label: 'Stok voucher', icon: Boxes },
  { to: '/mitra-dashboard/penjualan', label: 'Penjualan online', icon: ReceiptText },
  { to: '/mitra-dashboard/bagi-hasil', label: 'Bagi hasil', icon: Wallet },
  { to: '/mitra-dashboard/pengguna', label: 'Pengguna aktif', icon: Users },
]
const ownerItems = [
  { to: '/admin', label: 'Ringkasan', icon: LayoutDashboard },
  { to: '/admin/mitra', label: 'Kelola mitra', icon: Building2 },
  { to: '/admin/paket', label: 'Paket internet', icon: Package },
  { to: '/admin/stok', label: 'Distribusi stok', icon: Boxes },
  { to: '/admin/transaksi', label: 'Transaksi', icon: ReceiptText },
  { to: '/admin/aktivitas', label: 'Log aktivitas', icon: Activity },
]

export function DashboardLayout({ role }: { role: 'Mitra' | 'Admin' | 'Owner' }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const { partnerId, setPartnerId, state } = useDemoContext()
  const presentationPartners = state.partners.map(p => ({ ...p, ssid: state.sites.find(s => s.partnerId === p.id)!.ssid }))
  const {user}=useAuth()
  const items = role === 'Mitra' ? partnerItems : role==='Owner' ? [...ownerItems.map(item=>({...item,to:item.to.replace('/admin','/owner')})),{to:'/owner/akun',label:'Akun staf',icon:Users}] : ownerItems
  const partner = presentationPartners.find(item => item.id === partnerId)!
  return <div className="dashboard-shell"><VideoBackdrop />
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /><Button className="mobile-menu-button" variant="ghost" aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'} aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}</Button></div>
      <div id="dashboard-navigation" className={`sidebar-content ${menuOpen ? 'is-open' : ''}`}>
        <p className="eyebrow sidebar-label">Ruang {role.toLowerCase()}</p>
        <nav aria-label={`Navigasi ${role.toLowerCase()}`}>{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/admin' || to === '/owner' || to === '/mitra-dashboard'} onClick={() => setMenuOpen(false)}><Icon size={19} aria-hidden="true" />{label}<ChevronRight size={15} className="nav-chevron" aria-hidden="true" /></NavLink>)}</nav>
        <div className="sidebar-note"><div className="sidebar-note-icon"><CircleHelp size={21} aria-hidden="true" /></div><strong>Ruang kerja dalam demo</strong><p>{role === 'Mitra' ? 'Pantau transaksi, stok, dan sesi milik mitra. Semua data operasional masih simulasi.' : 'Kelola mitra, paket, stok dan transaksi sintetis. Perubahan tercatat di audit.'}</p><button className="text-button" onClick={() => setHelpOpen(true)}>Lihat batas demo <ArrowUpRight size={16} aria-hidden="true" /></button></div>
        <p className="sidebar-footer">Triple S OS <span>{role === 'Mitra' ? 'Dashboard · Tahap 4' : 'Pengelolaan · Tahap 5'}</span></p>
      </div>
    </aside>
    <div className="dashboard-body">
      <header className="dashboard-header"><div><span className="eyebrow">Workspace</span><p>Portal {role.toLowerCase()}</p></div><Badge tone="info">Akses {role}</Badge></header>
      <main id="main-content" className="dashboard-main" tabIndex={-1}>
        {role === 'Mitra' && <div className="partner-context"><div><span className="eyebrow">Konteks mitra fiktif</span><strong>{partner.name}</strong><span>{partner.ssid}</span></div>{user?.role==='owner'&&<Select label="Mitra demo" value={partnerId} onChange={event => setPartnerId(event.target.value)}>{presentationPartners.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}</div>}
        <Outlet />
      </main>
      <SiteFooter compact onHelp={() => setHelpOpen(true)} />
    </div>
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Tentang ruang kerja demo"><p>Akses staf diperiksa oleh backend lokal. Data operasional dan koneksi WiFi masih sintetis; pengelolaan tidak mengubah router atau memproses pembayaran nyata.</p><p>Mitra hanya menerima data miliknya. Pengelolaan akun dan kontrol skenario khusus owner. Login staf tidak memberikan akses internet melalui router.</p><Button onClick={() => setHelpOpen(false)}>Tutup panduan</Button></Dialog>
  </div>
}


