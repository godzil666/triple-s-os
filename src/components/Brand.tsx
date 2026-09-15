import { useState } from 'react'
import { Link } from 'react-router'

// User-selected SVG, copied without changing its paths, colors, or aspect ratio.
export function Brand() {
  const [imageAvailable, setImageAvailable] = useState(true)
  return <Link to="/" className="brand" aria-label="Triple S OS — halaman pilih mitra">
    {imageAvailable && <img src="/brand/triple-s-logo.svg" alt="" width="1199" height="1312" onError={() => setImageAvailable(false)} />}
    <span className="brand-copy"><span className="brand-wordmark">Triple S<span className="brand-os">OS</span></span>
    <span className="brand-subtitle">Sahabat Sinyal Sejahtera</span></span>
  </Link>
}
