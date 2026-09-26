import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Copy, CreditCard, MessageCircle, Ticket, Wifi } from 'lucide-react'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { customerService } from '../../services/customer-http'
import type { CustomerDetail } from '../../services/customer-contracts'
import type { PaymentStatus } from '../../domain/models'
import { Flow, Summary, errorMessage, jakarta, rupiah } from './purchase-shared'
import { isProduction } from '../../config/runtime'
import QRCode from 'qrcode'

function VoucherQr({code}:{code:string}) {
  const [image,setImage]=useState('')
  useEffect(()=>{let active=true;void QRCode.toDataURL(code,{errorCorrectionLevel:'M',margin:2,width:224}).then(value=>{if(active)setImage(value)});return()=>{active=false}},[code])
  return image?<figure><img src={image} alt="QR kode voucher; hanya memuat satu kode, bukan pembayaran" width="224" height="224"/><figcaption>QR voucher simulasi · pindai di portal WiFi. Bukan QR pembayaran.</figcaption></figure>:null
}

const paymentLabels:Record<PaymentStatus,string>={pending:'Menunggu pembayaran',paid:'Pembayaran berhasil',failed:'Pembayaran gagal',expired:'Pembayaran timeout'}
export function OrderPage({voucherOnly=false}:{voucherOnly?:boolean}) {
  const {token=''}=useParams()
  if (isProduction) return <Flow title="Pesanan belum tersedia" step={3}><Card className="provision-card"><h2>Integrasi transaksi belum aktif</h2><p>Detail order, pembayaran, penerbitan voucher, dan notifikasi WhatsApp akan tersedia setelah backend produksi PT. SSS dikonfigurasi.</p><a className="button button--primary" href={import.meta.env.VITE_ADMIN_WHATSAPP_URL || 'https://wa.me/?text=Halo%20Admin%20SSS%2C%20saya%20ingin%20menanyakan%20status%20voucher.'} target="_blank" rel="noreferrer">Hubungi admin SSS</a><Link className="flow-back" to="/">Kembali ke pilihan mitra</Link></Card></Flow>
  return <OrderDetail key={token} token={token} voucherOnly={voucherOnly}/>
}
function OrderDetail({token,voucherOnly}:{token:string;voucherOnly:boolean}) {
  const [detail,setDetail]=useState<CustomerDetail|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState('')
  const epoch=useRef(0),inFlight=useRef(false)
  const refresh=useCallback(async()=>{
    const version=epoch.current
    try{const value=await customerService.detail(token);if(version===epoch.current&&!inFlight.current)setDetail(value)}catch(e){if(version===epoch.current)setError(errorMessage(e))}
  },[token])
  useEffect(()=>{void refresh();const timer=window.setInterval(()=>{if(document.visibilityState==='visible'&&!inFlight.current)void refresh()},5000);return()=>{epoch.current++;clearInterval(timer)}},[refresh])
  async function copy(value:string){try{await navigator.clipboard.writeText(value);setNotice('Disalin. Simpan secara pribadi; tautan memberikan akses ke detail voucher.')}catch{setNotice('Penyalinan otomatis belum tersedia. Pilih teks yang tampil untuk menyalin manual.')}}
  if(!detail)return <Flow title={error?'Pesanan belum dapat dibuka':'Memuat pesanan…'} step={3}><p role="status">{error||'Memeriksa transaksi tersimpan.'}</p>{error&&<Button onClick={()=>void refresh()}>Coba lagi</Button>}<Link className="flow-back" to="/">Kembali ke pilihan mitra</Link></Flow>
  const {order,payment:paidState,voucher}=detail,isPaid=paidState.status==='paid'
  const credential=voucher?.credential??(voucher?{type:'single_code' as const,code:voucher.code}:null)
  const remaining=voucher?.expiresAt?Math.max(0,Math.ceil((Date.parse(voucher.expiresAt)-Date.parse(detail.clockNow))/60000)):null
  const provisionLabel=voucher?'Voucher siap digunakan':order.provisioningStatus==='failed'?'Pembayaran diterima. Voucher perlu bantuan.':'Voucher sedang diproses'
  return <Flow title={`${voucherOnly?'Detail voucher':'Pesanan Anda'} · ${detail.partner.name}`} step={3}>
    <p className="flow-lead">Simpan tautan ini untuk membuka kembali pesanan tanpa akun. Berlaku hanya di <strong>{detail.partner.name}</strong> · {detail.site.ssid}.</p>
    <div className="flow-actions"><Button variant="secondary" onClick={()=>void copy(`${location.origin}/pesanan/${token}`)}><Copy size={16} aria-hidden="true"/>Salin tautan pesanan</Button><Button variant="secondary" onClick={()=>void refresh()}>Perbarui status</Button>{voucherOnly?<Link to={`/pesanan/${token}`}>Kembali ke pesanan</Link>:voucher&&<Link to={`/voucher/${token}`}>Buka detail voucher</Link>}</div>
    {notice&&<p className="notice" role="status">{notice}</p>}{error&&<p className="flow-error" role="alert">{error}</p>}
    <div className="purchase-columns"><div className="purchase-main">
      <Card className="payment-card"><div className="section-icon"><CreditCard aria-hidden="true"/><h2 data-testid="payment-status">{paymentLabels[paidState.status]}</h2></div><p>{detail.partner.name} · {order.channel==='qris'?'QRIS':'E-wallet'} simulasi · {rupiah(order.amountRp)}</p>
        {!isPaid?<><div className="payment-illustration"><CreditCard size={48} aria-hidden="true"/><strong>SIMULASI SAJA</strong><span>Bukan QR pembayaran. Tidak dapat dipindai atau ditransaksikan.</span></div><p>{paidState.status==='pending'?'Pesanan tersimpan, belum ada pembayaran berhasil.':'Percobaan simulasi belum berhasil. Periksa kembali setelah owner memproses skenario demo.'}</p><p className="assumption-note">Untuk presentasi, owner menjalankan hasil pembayaran melalui Kontrol demo. Perbarui status pesanan ini setelahnya.</p></>:<><Badge tone="success">Paid · simulasi</Badge><p>Pembayaran sudah dicatat. Tidak perlu membayar ulang, termasuk saat penerbitan voucher belum selesai.</p></>}
      </Card>
      {isPaid&&<Card className="provision-card"><div className="section-icon"><Ticket aria-hidden="true"/><h2>{provisionLabel}</h2></div>{!voucher&&<p>{order.provisioningStatus==='failed'?'Penerbitan mock mengalami kendala. Hubungi admin; pembayaran Anda tetap tercatat.':'Penerbitan ditunda dalam skenario demo. Admin akan memperbarui status tanpa meminta pembayaran ulang.'}</p>}</Card>}
      {voucher&&<>
          <Card className="voucher-detail"><div className="section-icon"><Ticket aria-hidden="true"/><h2>Voucher {detail.partner.name}</h2></div><p>{credential?.type==='username_password'?'Kredensial voucher':'Kode voucher · satu kode'}</p><div className="voucher-code">{credential?.type==='username_password'?<div className="voucher-credentials"><span>Username <code data-testid="voucher-username">{credential.username}</code></span><span>Password <code data-testid="voucher-password">{credential.password}</code></span></div>:<code data-testid="voucher-code">{credential?.code}</code>}<Button variant="ghost" onClick={()=>void copy(credential?.type==='username_password'?`${credential.username}\n${credential.password}`:credential?.code??'')} aria-label="Salin kredensial voucher"><Copy size={19} aria-hidden="true"/></Button></div>
          {credential?.type==='single_code'&&<VoucherQr code={credential.code}/>}
          <div className="voucher-state" role="status"><Badge tone={voucher.status==='expired'?'error':voucher.status==='active'?'success':'info'}>{voucher.status==='unused'?'Belum aktif — durasi belum dimulai':voucher.status==='expired'?'Voucher kedaluwarsa':'Voucher aktif'}</Badge>{voucher.expiresAt?<dl className="purchase-data"><div><dt>Login pertama</dt><dd>{jakarta(voucher.firstActivatedAt!)}</dd></div><div><dt>Waktu kedaluwarsa</dt><dd data-testid="expires-at">{jakarta(voucher.expiresAt)}</dd></div><div><dt>Sisa waktu demo</dt><dd>{remaining} menit</dd></div></dl>:<p>Belum ada waktu kedaluwarsa. Membeli dan menerbitkan voucher tidak memulai durasi.</p>}</div>
          <p>Waktu menggunakan clock demo manual. Reconnect dan logout tidak mengubah waktu kedaluwarsa.</p>
          <div className="connect-block"><div className="section-icon"><Wifi aria-hidden="true"/><h3>Sambungkan di {detail.partner.name}</h3></div><p>Hotspot: <strong>{detail.hotspot.name}</strong> · SSID tujuan: <strong>{detail.hotspot.ssid}</strong>. Browser tidak memilih WiFi secara otomatis. Jika belum sesuai, pilih SSID melalui pengaturan WiFi perangkat.</p><p>Perangkat mock: profil browser ini. {detail.activeDevices}/{voucher.maxConcurrentDevices} slot aktif. Profil lain dianggap perangkat lain.</p>
          <Link className="button button--primary" to={`/wifi/hotspot/${encodeURIComponent(detail.hotspot.id)}/login`}>Buka portal login WiFi simulasi</Link><p>Masukkan kredensial voucher pada portal. Tautan pesanan saja tidak mengaktifkan WiFi.</p>
          <p className="assumption-note">Tidak membuka akses internet nyata, membaca SSID/MAC, atau mengubah router.</p></div>
        </Card>
        <Card className="whatsapp-preview"><div className="section-icon"><MessageCircle aria-hidden="true"/><h2>{detail.notification?.status==='failed'?'WhatsApp simulasi gagal':detail.notification?.status==='sent'?'WhatsApp simulasi terkirim':'Preview notifikasi WhatsApp'}</h2></div><p>{detail.notification?.status==='failed'?'Voucher tetap tersedia di halaman ini. Admin dapat mengulang notifikasi dalam skenario demo.':'Ini preview pesan, bukan bukti pesan dikirim atau nomor terdaftar di WhatsApp.'}</p><blockquote><p>Halo {order.customerName}, voucher {detail.partner.name} Anda tersedia.</p><p>Paket: {order.packageSnapshot.name}<br/>SSID: {detail.site.ssid}<br/>Kode: {voucher.code}</p><p>Durasi dimulai sejak login pertama. Batas {voucher.maxConcurrentDevices} perangkat{voucher.kind==='monthly'?' bersamaan':' pertama'}. Hanya untuk lokasi {detail.partner.name}.</p><Link to={`/voucher/${token}`}>Lihat detail voucher Anda</Link></blockquote><p>Nomor tujuan contoh: {order.customerWhatsapp}</p></Card>
      </>}
    </div><Summary catalog={detail} pkg={order.packageSnapshot} price={order.amountRp}/></div>
  </Flow>
}
