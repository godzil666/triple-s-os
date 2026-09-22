import { useState } from 'react'
import { CustomerHero } from './CustomerHero'
import { Link } from 'react-router'
import { ArrowRight, Check, ChevronRight, Info, MapPin, Search, ShieldCheck, Wifi } from 'lucide-react'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { usePresentationPartners } from '../../demo/presentationPartners'
import { isDemoMode } from '../../config/runtime'

export function PartnerPickerPage() {
  const presentationPartners = usePresentationPartners()
  const [search, setSearch] = useState('')
  const [limit,setLimit] = useState(6)
  const [area, setArea] = useState('all')
  const query = search.trim().toLocaleLowerCase('id-ID')
  const partners = presentationPartners.filter(partner => (area === 'all' || partner.area === area) && `${partner.name} ${partner.area} ${partner.ssid}`.toLocaleLowerCase('id-ID').includes(query))
  return <><CustomerHero /><div className="page-container customer-page">
    <ol className="purchase-steps" aria-label="Tahapan pembelian"><li aria-current="step"><span className="step-number">01</span><div><strong>Pilih mitra</strong><span>Tentukan lokasi WiFi</span></div><ChevronRight size={18} aria-hidden="true" /></li><li><span className="step-number">02</span><div><strong>Pilih paket</strong><span>Sesuaikan kebutuhan</span></div><ChevronRight size={18} aria-hidden="true" /></li><li><span className="step-number">03</span><div><strong>{isDemoMode ? 'Bayar & gunakan' : 'Lanjutkan layanan'}</strong><span>{isDemoMode ? 'Pembayaran & aktivasi simulasi' : 'Aktivasi setelah integrasi'}</span></div></li></ol>
    <section className="partner-directory" id="pilih-mitra" aria-labelledby="directory-title">
      <div className="directory-heading"><div><p className="eyebrow">JARINGAN MITRA</p><h2 id="directory-title">Mau terhubung di mana?</h2><p>Pilih nama mitra secara manual, sesuai lokasi WiFi yang akan digunakan.</p></div><Badge tone="info">{presentationPartners.length} lokasi contoh</Badge></div>
      <div className="directory-layout"><div className="directory-main">
        <div className="search-toolbar"><Input label="Cari mitra" type="search" placeholder="Cari nama mitra, area, atau SSID…" value={search} onChange={event => setSearch(event.target.value)} leading={<Search size={20} />} /><Select label="Filter area" value={area} onChange={event => setArea(event.target.value)}><option value="all">Semua area</option>{[...new Set(presentationPartners.map(p=>p.area))].map(area => <option key={area} value={area}>{area}</option>)}</Select></div>
        <p className="results-summary" role="status">Menampilkan <strong>{Math.min(partners.length,limit)} dari {partners.length} mitra</strong><span>Semua lokasi di bawah adalah mitra fiktif.</span></p>
        {partners.length ? <div className="partner-grid">{partners.slice(0,limit).map((partner, index) => <Card className="partner-card" key={partner.id}>
          <div className="partner-card-top"><span className="partner-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="partner-area"><MapPin size={13} aria-hidden="true" />{partner.area}</span></div>
          <h3>{partner.name}</h3><p className="partner-note">{partner.note}</p><div className="ssid-line"><Wifi size={15} aria-hidden="true" /><span>{partner.ssid}</span></div>
          <div className="partner-card-bottom"><span>Lokasi contoh</span><Link to={`/mitra/${partner.id}/paket`} aria-label={`Pilih ${partner.name}`}>Pilih mitra <ArrowRight size={17} aria-hidden="true" /></Link></div>
        </Card>)}</div> : <EmptyState title="Mitra belum ditemukan" description="Coba nama mitra, area, atau SSID lain. Anda juga bisa menghapus filter untuk melihat semua lokasi contoh." action={<Button variant="secondary" onClick={() => { setSearch(''); setArea('all') }}>Hapus pencarian & filter</Button>} />}
      {partners.length>limit&&<Button variant="secondary" onClick={()=>setLimit(limit+6)}>Tampilkan mitra lainnya</Button>}</div><aside className="directory-aside" aria-label="Panduan pemilihan mitra"><div className="location-guide"><div className="guide-icon"><MapPin size={23} aria-hidden="true" /></div><h3>Pastikan mitranya <br />sudah sesuai.</h3><p>Voucher hanya berlaku pada satu mitra yang Anda pilih.</p><div className="guide-rule" /><div className="guide-point"><Check size={17} aria-hidden="true" /><p>Boleh beli sebelum tiba di lokasi.</p></div><div className="guide-point"><Check size={17} aria-hidden="true" /><p>Cocokkan nama SSID dengan WiFi mitra.</p></div><div className="guide-point"><Check size={17} aria-hidden="true" /><p>Durasi dimulai saat login pertama berhasil.</p></div></div><div className="manual-note"><ShieldCheck size={20} aria-hidden="true" /><p>Lokasi dipilih oleh Anda. Tidak ada deteksi lokasi atau jaringan otomatis.</p></div></aside></div>
      <div className="phase-note"><Info size={18} aria-hidden="true" /><p>{isDemoMode ? <><strong>Pembelian simulasi.</strong> Pilih paket, review data, lalu coba pembayaran dan aktivasi. Nama mitra, SSID, transaksi, dan koneksi adalah contoh demo.</> : <><strong>Layanan sedang disiapkan.</strong> Pilih mitra dan paket untuk melihat katalog. Pembayaran, penerbitan voucher, dan koneksi hotspot diaktifkan setelah integrasi produksi selesai.</>}</p></div>
    </section>
  </div></>
}


