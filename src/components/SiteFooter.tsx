import { lazy, Suspense, useState } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight, Gamepad2, MapPin, MessageCircle, Mail } from 'lucide-react'
import { Brand } from './Brand'
import { isDemoMode } from '../config/runtime'
import './signal-run/launcher.css'

const SignalRunGame = lazy(() => import('./signal-run/SignalRunGame'))

export function SiteFooter({ compact = false, onHelp }: { compact?: boolean; onHelp: () => void }) {
  const [gameOpen, setGameOpen] = useState(false)
  return <footer className={`site-footer ${compact ? 'site-footer--compact' : ''}`}>
    <div className="footer-inner">
      {!compact && <div className="footer-invitation"><div><p className="eyebrow">SATU KODE. SATU LOKASI PILIHAN.</p><h2>Lebih dekat.<br /><span>Lebih terhubung.</span></h2></div><Link to="/wifi" className="footer-connect">Masuk dengan voucher <ArrowUpRight size={24} aria-hidden="true" /></Link></div>}
      <div className="footer-main">
        <div className="footer-brand-column"><Brand /><p>PT. Sahabat Sinyal Sejahtera</p><span className="footer-location"><MapPin size={15} aria-hidden="true" />Kabupaten Sukabumi, Jawa Barat</span>{isDemoMode && <span className="footer-demo-tag">Demo lokal · Triple S OS</span>}</div>
        {!compact && <nav className="footer-column" aria-label="Jelajahi Triple S OS"><h2>Jelajahi</h2><Link to="/">Temukan mitra <ArrowUpRight size={14} aria-hidden="true" /></Link><button onClick={onHelp}>Panduan pembelian <ArrowUpRight size={14} aria-hidden="true" /></button><Link to="/mitra-dashboard">Portal mitra <ArrowUpRight size={14} aria-hidden="true" /></Link><Link to="/owner">Portal owner <ArrowUpRight size={14} aria-hidden="true" /></Link></nav>}
        <div className="footer-column footer-contact"><h2>Hubungi kami <span>Placeholder</span></h2><p><MessageCircle size={15} aria-hidden="true" /><span>WhatsApp<small>Nomor layanan belum diisi</small></span></p><p><Mail size={15} aria-hidden="true" /><span>Email<small>Alamat email belum diisi</small></span></p></div>
        {!compact && <div className="footer-column footer-office"><h2>Kantor & informasi</h2><p>Alamat lengkap<small>Placeholder · menunggu informasi resmi</small></p><p>Jam layanan<small>Placeholder · belum ditentukan</small></p><p>Media sosial<small>Placeholder · akun resmi belum diisi</small></p></div>}
      </div>
      <div className="footer-bottom"><span>{isDemoMode ? 'Mode demo — transaksi dan koneksi disimulasikan' : 'Triple S OS · layanan WiFi dan kemitraan'}</span><div>{!compact && <><span>Privasi · placeholder</span><span>Ketentuan · placeholder</span><button type="button" className="signal-run-launcher" onClick={() => setGameOpen(true)}><Gamepad2 size={16} aria-hidden="true" /> Signal Run</button></>}<button onClick={onHelp}>{isDemoMode ? 'Tentang demo ini' : 'Panduan layanan'} <ArrowUpRight size={14} aria-hidden="true" /></button></div></div>
    </div>
    {gameOpen && <Suspense fallback={<span role="status" className="sr-only">Menyiapkan Signal Run…</span>}><SignalRunGame onClose={() => setGameOpen(false)} /></Suspense>}
  </footer>
}
