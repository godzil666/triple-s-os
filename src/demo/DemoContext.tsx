import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { DemoState } from '../domain/models'
import { apiRequest, createHttpServices } from '../services/http'
import type { Services } from '../services/contracts'
import { Button } from '../components/Button'

const Context = createContext<{ state: DemoState; services: Services; partnerId: string; dataUnavailable:boolean; setPartnerId: (id: string) => Promise<void> } | null>(null)
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState | null>(null)
  const [error,setError] = useState(false)
  const services = useMemo(() => createHttpServices(setState),[])
  useEffect(() => {
    let mounted = true
    const refresh = async () => { try { const data = await apiRequest<DemoState>('/api/state'); if(mounted) { setState(data); setError(false) } } catch { if(mounted) setError(true) } }
    void refresh()
    const interval = window.setInterval(() => { if(document.visibilityState==='visible') void refresh() },10_000)
    return () => { mounted=false; clearInterval(interval) }
  },[])
  if(!state) return <main className="page-container access-denied" id="main-content"><h1>Triple S OS</h1><p role="status">{error ? 'Backend lokal belum tersedia. Jalankan npm run dev untuk memulai aplikasi dan server.' : 'Menyiapkan layanan lokal…'}</p>{error&&<Button onClick={()=>window.location.reload()}>Coba lagi</Button>}</main>
  return <Context.Provider value={{ state, services, dataUnavailable:error, partnerId: state.context.partnerId, setPartnerId: id => services.demo.setContext({ partnerId: id }) }}>{children}</Context.Provider>
}
export function useDemoContext() {
  const context = useContext(Context)
  if (!context) throw new Error('DemoProvider is required')
  return context
}
