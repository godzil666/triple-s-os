import { useState } from 'react'
import { Link } from 'react-router'
import { useDemoContext } from '../demo/DemoContext'
import { useAuth } from '../auth/AuthContext'
import { Select } from '../components/Select'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Table } from '../components/Table'
export function OfflineStockPage({embedded=false}:{embedded?:boolean}) {
  const {state}=useDemoContext();const {user}=useAuth();const [filter,setFilter]=useState(user?.partnerId??state.partners[0].id);const [message,setMessage]=useState('')
  const id=user?.role==='partner'?user.partnerId:filter
  const vouchers=state.vouchers.filter(v=>v.batchId&&v.partnerId===id)
  return <div><p className="eyebrow">DATA SINTETIS · AKSES STAF</p>{embedded?<h2>Stok voucher offline</h2>:<h1>Stok voucher offline</h1>}<p>Kode untuk mencoba portal WiFi simulasi. Alokasi bukan bukti penjualan. Jangan bagikan daftar ini kepada customer.</p>{user?.role!=='partner'&&<Select label="Filter mitra stok" value={filter} onChange={e=>setFilter(e.target.value)}>{state.partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>}{message&&<p role="status">{message}</p>}<Card className="foundation-table"><Table caption="Voucher offline milik mitra pilihan" columns={['Kode voucher','Status','Tindakan']} rows={vouchers.map(v=>({id:v.id,cells:[v.code,v.status,<Button variant="ghost" onClick={async()=>{try{await navigator.clipboard.writeText(v.code);setMessage('Kode voucher disalin.')}catch{setMessage('Salin manual kode yang tampil pada tabel.')}}}>Salin kode</Button>]}))} /></Card>{!vouchers.length&&<p>Belum ada batch voucher untuk mitra ini.</p>}<Link className="button button--secondary" to={`/wifi/${state.sites.find(s=>s.partnerId===id)?.id}/login`}>Buka portal voucher mitra</Link><p>Untuk menguji sebagai customer, gunakan jendela privat atau browser lain. Reset demo menghasilkan kode offline baru.</p></div>
}

