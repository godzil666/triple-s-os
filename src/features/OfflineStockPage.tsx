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
  const credentialLabel=(v:typeof vouchers[number])=>v.credential?.type==='username_password'?`Username: ${v.credential.username} · Password: ${v.credential.password}`:v.credential?.type==='single_code'?v.credential.code:v.code
  return <div><p className="eyebrow">DATA SINTETIS · AKSES STAF</p>{embedded?<h2>Stok voucher offline</h2>:<h1>Stok voucher offline</h1>}<p>Kredensial hanya tersedia untuk owner/admin dalam fixture lokal. Mitra melihat jumlah/status stok tanpa rahasia voucher.</p>{user?.role!=='partner'&&<Select label="Filter mitra stok" value={filter} onChange={e=>setFilter(e.target.value)}>{state.partners.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>}{message&&<p role="status">{message}</p>}<Card className="foundation-table"><Table caption="Voucher offline milik mitra pilihan" columns={['Kredensial voucher','Status','Tindakan']} rows={vouchers.map(v=>({id:v.id,cells:[user?.role==='partner'?'Kredensial disamarkan':credentialLabel(v),v.status,user?.role==='partner'?'Tidak ditampilkan':<Button variant="ghost" onClick={async()=>{try{await navigator.clipboard.writeText(credentialLabel(v));setMessage('Kredensial sintetis disalin.')}catch{setMessage('Salin manual kredensial yang tampil pada tabel.')}}}>Salin kredensial</Button>]}))} /></Card>{!vouchers.length&&<p>Belum ada batch voucher untuk mitra ini.</p>}{user?.role!=='partner'&&<Link className="button button--secondary" to={`/wifi/${state.sites.find(s=>s.partnerId===id)?.id}/login`}>Buka portal voucher mitra</Link>}<p>Data ini sintetis untuk simulasi lokal. Reset demo menghasilkan kredensial offline baru.</p></div>
}

