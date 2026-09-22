import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { DemoBanner } from '../demo/DemoBanner'
import { DemoProvider } from '../demo/DemoContext'
import { AppRoutes } from './router'
import { AuthProvider, useAuth } from '../auth/AuthContext'
import { isDemoMode } from '../config/runtime'
import '../auth/auth.css'

function RouteEffects() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)
  useEffect(() => {
    document.title = `${document.querySelector('h1')?.textContent ?? 'Pratinjau'} · Triple S OS`
    window.scrollTo(0, 0)
    if (previousPath.current !== pathname) document.getElementById('main-content')?.focus({ preventScroll: true })
    previousPath.current = pathname
  }, [pathname])
  return null
}
function AuthenticatedApp() {
  const {user,loading,error,refresh} = useAuth()
  if(loading) return <p className="page-container" role="status">Memeriksa layanan lokal…</p>
  if(error) return <main id="main-content" className="page-container access-denied"><h1>Layanan lokal belum tersedia</h1><p>{error}</p><button className="button button--primary" onClick={()=>void refresh()}>Coba lagi</button></main>
  return <DemoProvider key={user?.id ?? 'public'}><a className="skip-link" href="#main-content">Lewati ke konten utama</a>{isDemoMode && <DemoBanner />}<AppRoutes /><RouteEffects /></DemoProvider>
}
export function App() { return <AuthProvider><AuthenticatedApp /></AuthProvider> }
