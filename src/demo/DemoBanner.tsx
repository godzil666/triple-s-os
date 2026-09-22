import { FlaskConical } from 'lucide-react'
import { RoleSwitcher } from './RoleSwitcher'
import { useState } from 'react'
import { ScenarioPanel } from './ScenarioPanel'
import './ScenarioPanel.css'
import { useAuth } from '../auth/AuthContext'
import { isDemoMode } from '../config/runtime'

export function DemoBanner() {
  if (!isDemoMode) return null
  const [open, setOpen] = useState(false)
  const {user} = useAuth()
  return <><div className="demo-banner"><div className="demo-banner-inner">
    <p><FlaskConical size={16} aria-hidden="true" /><span><strong>Mode demo</strong> — transaksi dan koneksi disimulasikan</span></p>
    <div className="demo-role"><RoleSwitcher />{user?.role === 'owner' && <button className="demo-controls-trigger" onClick={() => setOpen(true)}>Kontrol demo</button>}</div>
  </div></div>{open && user?.role === 'owner' && <ScenarioPanel onClose={() => setOpen(false)} />}</>
}
