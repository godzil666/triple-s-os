import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2, Copy, CreditCard, MessageCircle, Ticket, Wifi } from 'lucide-react'
import { Card } from '../../components/Card'
import { Badge } from '../../components/Badge'
import { Button } from '../../components/Button'
import { Select } from '../../components/Select'
import { useDemoContext } from '../../demo/DemoContext'
import { customerService } from '../../services/customer-http'
import type { CustomerDetail } from '../../services/customer-contracts'
import type { PaymentStatus, ProvisioningStatus } from '../../domain/models'
import { Flow, Summary, errorMessage, jakarta, rupiah } from './purchase-shared'

const paymentLabels:Record<PaymentStatus,string>={pending:'Menunggu pembayaran',paid:'Pembayaran berhasil',failed:'Pembayaran gagal',expired:'Pembayaran timeout'}
function readNetwork(){try{return sessionStorage.getItem('triple-s:mock-network')??''}catch{return ''}}
export function OrderPage({voucherOnly=false}:{voucherOnly?:boolean}) {
  const {token=''}=useParams()
  return <OrderDetail key={token} token={token} voucherOnly={voucherOnly}/>
}
function OrderDetail({token,voucherOnly}:{token:string;voucherOnly:boolean}) {
  const {state}=useDemoContext()
  const [detail,setDetail]=useState<CustomerDetail|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
  const [payment,setPayment]=useState<PaymentStatus>('pending'),[provisioning,setProvisioning]=useState<ProvisioningStatus>('issued'),[notification,setNotification]=useState<'sent'|'failed'>('sent'),[network,setNetwork]=useState(readNetwork)
  const epoch=useRef(0),inFlight=useRef(false)
  const refresh=useCallback(async()=>{
    const version=epoch.current
    try{const value=await customerService.detail(token);if(version===epoch.current&&!inFlight.current)setDetail(value)}catch(e){if(version===epoch.current)setError(errorMessage(e))}
  },[token])
  useEffect(()=>{void refresh();const timer=window.setInterval(()=>{if(document.visibilityState==='visible'&&!inFlight.current)void refresh()},5000);return()=>{epoch.current++;clearInterval(timer)}},[refresh])
  async function action(run:()=>Promise<CustomerDetail>){if(inFlight.current)return;inFlight.current=true;epoch.current++;setBusy(true);setError('');setNotice('');try{setDetail(await run())}catch(e){setError(errorMessage(e))}finally{epoch.current++;inFlight.current=false;setBusy(false)}}
  async function copy(value:string){try{await navigator.clipboard.writeText(value);setNotice('Disalin. Simpan secara pribadi; tautan memberikan akses ke detail voucher.')}catch{setNotice('Penyalinan otomatis belum tersedia. Pilih teks yang tampil untuk menyalin manual.')}}
  if(!detail)return <Flow title={error?'Pesanan belum dapat dibuka':'Memuat pesanan…'} step={3}><p role="status">{error||'Memeriksa transaksi tersimpan.'}</p>{error&&<Button onClick={()=>void refresh()}>Coba lagi</Button>}<Link className="flow-back" to="/">Kembali ke pilihan mitra</Link></Flow>
  const {order,payment:paidState,voucher}=detail,isPaid=paidState.status==='paid'
  const remaining=voucher?.expiresAt?Math.max(0,Math.ceil((Date.parse(voucher.expiresAt)-Date.parse(detail.clockNow))/60000)):null
  const provisionLabel=voucher?'Voucher siap digunakan':order.provisioningStatus==='failed'?'Pembayaran diterima. Voucher perlu bantuan.':'Voucher sedang diproses'
  return <Flow title={`${voucherOnly?'Detail voucher':'Pesanan Anda'} · ${detail.partner.name}`} step={3}>
    <p className="flow-lead">Simpan tautan ini untuk membuka kembali pesanan tanpa akun. Berlaku hanya di <strong>{detail.partner.name}</strong> · {detail.site.ssid}.</p>
    <div className="flow-actions"><Button variant="secondary" onClick={()=>void copy(`${location.origin}/pesanan/${token}`)}><Copy size={16} aria-hidden="true"/>Salin tautan pesanan</Button>{voucherOnly?<Link to={`/pesanan/${token}`}>Kembali ke pesanan</Link>:voucher&&<Link to={`/voucher/${token}`}>Buka detail voucher</Link>}</div>
    {notice&&<p className="notice" role="status">{notice}</p>}{error&&<p className="flow-error" role="alert">{error}</p>}
    <div className="purchase-columns"><div className="purchase-main">
      <Card className="payment-card"><div className="section-icon"><CreditCard aria-hidden="true"/><h2 data-testid="payment-status">{paymentLabels[paidState.status]}</h2></div><p>{detail.partner.name} · {order.channel==='qris'?'QRIS':'E-wallet'} simulasi · {rupiah(order.amountRp)}</p>
        {!isPaid?<><div className="payment-illustration"><CreditCard size={48} aria-hidden="true"/><strong>SIMULASI SAJA</strong><span>Bukan QR pembayaran. Tidak dapat dipindai atau ditransaksikan.</span></div><p>{paidState.status==='pending'?'Pesanan tersimpan, belum ada pembayaran berhasil.':'Percobaan simulasi belum berhasil. Gunakan transaksi yang sama untuk mencoba kembali.'}</p><Button loading={busy} onClick={()=>void action(()=>customerService.pay(token,'paid',provisioning,notification))}>Simulasikan pembayaran sukses</Button></>:<><Badge tone="success">Paid · simulasi</Badge><p>Pembayaran sudah dicatat. Tidak perlu membayar ulang, termasuk saat penerbitan voucher belum selesai.</p></>}
      </Card>
      {isPaid&&<Card className="provision-card"><div className="section-icon"><Ticket aria-hidden="true"/><h2>{provisionLabel}</h2></div>{!voucher&&<><p>{order.provisioningStatus==='failed'?'Penerbitan mock mengalami kendala. Coba proses ulang atau minta bantuan mitra; pembayaran Anda tetap tercatat.':'Penerbitan ditunda dalam skenario demo. Voucher akan muncul setelah proses simulasi berhasil.'}</p><Button variant="secondary" loading={busy} onClick={()=>void action(()=>customerService.issue(token,provisioning,notification))}>Coba penerbitan simulasi</Button></>}</Card>}
      {voucher&&<>
        <Card className="voucher-detail"><div className="section-icon"><Ticket aria-hidden="true"/><h2>Voucher {detail.partner.name}</h2></div><p>Kode voucher</p><div className="voucher-code"><code data-testid="voucher-code">{voucher.code}</code><Button variant="ghost" onClick={()=>void copy(voucher.code)} aria-label="Salin kode voucher"><Copy size={19} aria-hidden="true"/></Button></div>
          <div className="voucher-state" role="status"><Badge tone={voucher.status==='expired'?'error':voucher.status==='active'?'success':'info'}>{voucher.status==='unused'?'Belum aktif — durasi belum dimulai':voucher.status==='expired'?'Voucher kedaluwarsa':'Voucher aktif'}</Badge>{voucher.expiresAt?<dl className="purchase-data"><div><dt>Login pertama</dt><dd>{jakarta(voucher.firstActivatedAt!)}</dd></div><div><dt>Waktu kedaluwarsa</dt><dd data-testid="expires-at">{jakarta(voucher.expiresAt)}</dd></div><div><dt>Sisa waktu demo</dt><dd>{remaining} menit</dd></div></dl>:<p>Belum ada waktu kedaluwarsa. Membeli dan menerbitkan voucher tidak memulai durasi.</p>}</div>
          <p>Waktu menggunakan clock demo manual. Reconnect dan logout tidak mengubah waktu kedaluwarsa.</p>
          <div className="connect-block"><div className="section-icon"><Wifi aria-hidden="true"/><h3>Sambungkan di {detail.partner.name}</h3></div><p>SSID tujuan: <strong>{detail.site.ssid}</strong>. Browser tidak memilih WiFi secara otomatis. Jika belum sesuai, pilih SSID melalui pengaturan WiFi perangkat.</p><Select label="Jaringan perangkat mock" value={network} onChange={e=>{setNetwork(e.target.value);try{sessionStorage.setItem('triple-s:mock-network',e.target.value)}catch{/* In-memory context remains explicit. */}}} hint="Pilihan ini hanya mensimulasikan jaringan, bukan mengganti WiFi perangkat."><option value="">Belum di WiFi mitra</option>{state.sites.map(s=><option key={s.id} value={s.id}>{state.partners.find(p=>p.id===s.partnerId)?.name} · {s.ssid}</option>)}</Select><p>Perangkat mock: profil browser ini. {detail.activeDevices}/{voucher.maxConcurrentDevices} slot aktif. Profil lain dianggap perangkat lain.</p>
          {detail.connected?<><p className="connection-success" role="status"><CheckCircle2 size={18} aria-hidden="true"/>Sesi WiFi simulasi aktif</p><Button variant="secondary" loading={busy} onClick={()=>void action(()=>customerService.disconnect(token))}>Keluar dari sesi simulasi</Button></>:<Button loading={busy} disabled={voucher.status==='expired'} onClick={()=>void action(()=>customerService.connect(token,network))}>Sambungkan WiFi simulasi</Button>}
          <p className="assumption-note">Tidak membuka akses internet nyata, membaca SSID/MAC, atau mengubah router.</p></div>
        </Card>
        <Card className="whatsapp-preview"><div className="section-icon"><MessageCircle aria-hidden="true"/><h2>{detail.notification?.status==='failed'?'WhatsApp simulasi gagal':detail.notification?.status==='sent'?'WhatsApp simulasi terkirim':'Notifikasi belum dicoba'}</h2></div><p>{detail.notification?.status==='failed'?'Voucher tetap tersedia di halaman ini. Periksa nomor dan coba notifikasi simulasi kembali.':'Ini preview pesan, bukan bukti pesan dikirim atau nomor terdaftar di WhatsApp.'}</p><blockquote><p>Halo {order.customerName}, voucher {detail.partner.name} Anda tersedia.</p><p>Paket: {order.packageSnapshot.name}<br/>SSID: {detail.site.ssid}<br/>Kode: {voucher.code}</p><p>Durasi dimulai sejak login pertama. Batas {voucher.maxConcurrentDevices} perangkat{voucher.kind==='monthly'?' bersamaan':' pertama'}. Hanya untuk lokasi {detail.partner.name}.</p><Link to={`/voucher/${token}`}>Lihat detail voucher Anda</Link></blockquote><p>Nomor tujuan contoh: {order.customerWhatsapp}</p><Button variant="secondary" loading={busy} onClick={()=>void action(()=>customerService.notify(token,notification))}>Ulangi notifikasi simulasi</Button></Card>
      </>}
      <details className="transaction-controls"><summary>Kontrol simulasi transaksi</summary><p>Hanya mengubah transaksi pada tautan ini. Tidak memproses pembayaran atau mengirim WhatsApp nyata.</p>{!isPaid&&<><Select label="Hasil pembayaran demo" value={payment} onChange={e=>setPayment(e.target.value as PaymentStatus)}><option value="pending">Pending</option><option value="paid">Sukses</option><option value="failed">Gagal</option><option value="expired">Timeout</option></Select><Button variant="secondary" loading={busy} onClick={()=>void action(()=>customerService.pay(token,payment,provisioning,notification))}>Jalankan hasil pembayaran</Button></>}<Select label="Hasil penerbitan demo" value={provisioning} onChange={e=>setProvisioning(e.target.value as ProvisioningStatus)}><option value="issued">Berhasil</option><option value="pending">Tertunda</option><option value="failed">Gagal / perlu bantuan</option></Select><Select label="Hasil WhatsApp demo" value={notification} onChange={e=>setNotification(e.target.value as 'sent'|'failed')}><option value="sent">Terkirim simulasi</option><option value="failed">Gagal simulasi</option></Select><p>Perubahan pilihan berlaku saat tombol pembayaran, penerbitan atau retry notifikasi ditekan. Clock/availability global tetap dikelola owner.</p></details>
    </div><Summary catalog={detail} pkg={order.packageSnapshot} price={order.amountRp}/></div>
  </Flow>
}
