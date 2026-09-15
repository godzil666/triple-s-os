import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router'
import { CircleHelp } from 'lucide-react'
import { Brand } from '../../components/Brand'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { SiteFooter } from '../../components/SiteFooter'

export function CustomerLayout() {
  const [helpOpen, setHelpOpen] = useState(false)
  const isHome = useLocation().pathname === '/'
  return <div className={`customer-shell ${isHome ? 'customer-shell--home' : ''}`}>
    <header className="customer-header page-container"><Brand /><nav aria-label="Navigasi customer">
      <NavLink to="/" end>Temukan mitra</NavLink>
      <NavLink className="voucher-entry" to="/wifi">Masuk WiFi</NavLink>
      <Button variant="ghost" aria-label="Panduan" onClick={() => setHelpOpen(true)}><CircleHelp size={17} aria-hidden="true" /><span>Panduan</span></Button>
    </nav></header>
    <main id="main-content" tabIndex={-1}><Outlet /></main>
    <SiteFooter onHelp={() => setHelpOpen(true)} />
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Kenali mitra, lalu pilih paket">
      <p>Pilih nama mitra secara manual. Nama area dan SSID contoh membantu Anda mengenali lokasi; aplikasi tidak mendeteksi jaringan perangkat.</p>
      <ol className="help-steps"><li><strong>Pilih mitra.</strong> Voucher hanya berlaku pada mitra yang Anda pilih.</li><li><strong>Pilih paket dan bayar.</strong> Pembayaran memakai simulasi QRIS/e-wallet. Anda dapat membeli sebelum tiba di lokasi.</li><li><strong>Gunakan di WiFi mitra.</strong> Durasi baru dimulai sejak login pertama berhasil dan terus berjalan saat logout.</li></ol>
      <div className="notice">Login staf dilindungi backend lokal. Portal voucher WiFi tersedia sebagai simulasi, tanpa membuka koneksi internet nyata. Pembelian dan WhatsApp belum terintegrasi. Kontak footer masih placeholder.</div>
      <Button onClick={() => setHelpOpen(false)}>Saya mengerti</Button>
    </Dialog>
  </div>
}
