import { Link, useParams, useSearchParams } from 'react-router'
import { ArrowRight, Smartphone, Clock3 } from 'lucide-react'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Flow, LoadState, useCatalog, duration, packageTitle, rupiah, startNewPurchase } from './purchase-shared'

export function PackagesPage() {
  const {id}=useParams(),[params]=useSearchParams(),hotspotId=params.get('hotspot')??undefined,{catalog,error,retry}=useCatalog(id,hotspotId)
  if(!catalog)return <LoadState error={error} retry={retry}/>
  return <Flow title={`Pilihan paket · ${catalog.partner.name}`} step={1}><p className="flow-lead">Satu lokasi, sesuai pilihan Anda. Voucher berlaku di <strong>{catalog.partner.name}</strong> · {catalog.hotspot.name} ({catalog.hotspot.ssid}). Boleh membeli sekarang dan login setelah tiba.</p><Link className="flow-back" to="/">Ubah pilihan mitra</Link>
    {!catalog.offers.length?<Card><h2>Belum ada paket tersedia</h2><p>Mitra atau katalog sedang tidak menerima pembelian baru.</p></Card>:<div className="package-grid">{catalog.offers.map(offer=><Card className="package-option" key={offer.package.id}><Badge tone="info">{offer.package.kind==='monthly'?'Bulanan · asumsi demo':'Reguler · harga contoh'}</Badge><h2>{packageTitle(offer.package)}</h2><p className="purchase-price">{rupiah(offer.priceRp)}</p><p><Clock3 size={17} aria-hidden="true"/>{duration(offer.package.durationSeconds)} sejak login pertama</p><p><Smartphone size={17} aria-hidden="true"/>{offer.package.kind==='regular'?'1 perangkat, terkunci saat aktivasi':`${offer.package.maxConcurrentDevices} perangkat bersamaan`}</p><p>{offer.package.speedMbps} Mbps · contoh kecepatan</p><p className="assumption-note">{offer.package.assumptionLabel}</p><Link onClick={startNewPurchase} className="button button--primary" aria-label={`Pilih ${packageTitle(offer.package)}`} to={`/checkout?mitra=${encodeURIComponent(catalog.partner.id)}&paket=${encodeURIComponent(offer.package.id)}&hotspot=${encodeURIComponent(catalog.hotspot.id)}`}>Pilih paket <ArrowRight size={17} aria-hidden="true"/></Link></Card>)}</div>}
    <p className="notice">Jumlah perangkat mengikuti paket yang dipilih. Durasi belum dimulai saat membeli. Paket bulanan memakai timer bersama; paket reguler terikat perangkat pertama.</p>
  </Flow>
}
