import { useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, MapPin, MessageCircle, Pause, Play } from 'lucide-react'
import { Link } from 'react-router'
import './CustomerHero.css'

const motionQuery = '(prefers-reduced-motion: reduce)'
type ConnectionNavigator = Navigator & { connection?: { saveData?: boolean } }
const adminWhatsAppUrl = import.meta.env.VITE_ADMIN_WHATSAPP_URL || 'https://wa.me/?text=Halo%20Admin%20SSS%2C%20saya%20ingin%20menanyakan%20kemitraan%20atau%20pemasangan%20WiFi.'

export function CustomerHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia(motionQuery).matches)
  const [saveData] = useState(() => (navigator as ConnectionNavigator).connection?.saveData === true)
  const [mobile] = useState(() => window.matchMedia('(max-width: 600px)').matches)
  const [userPaused, setUserPaused] = useState(false)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)
  const [playing, setPlaying] = useState(false)
  const [hasFrame, setHasFrame] = useState(false)
  const [failed, setFailed] = useState(false)
  const allowVideo = !reducedMotion && !saveData && !failed

  useEffect(() => {
    const preference = window.matchMedia(motionQuery)
    const onPreference = () => setReducedMotion(preference.matches)
    const onVisibility = () => setPageVisible(!document.hidden)
    preference.addEventListener('change', onPreference)
    document.addEventListener('visibilitychange', onVisibility)
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 })
    if (videoRef.current) observer.observe(videoRef.current)
    return () => { preference.removeEventListener('change', onPreference); document.removeEventListener('visibilitychange', onVisibility); observer.disconnect() }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (allowVideo && inView && pageVisible && !userPaused) {
      // Muted inline playback; a blocked autoplay keeps the poster and a manual play control.
      void video.play().catch(() => setPlaying(false))
    } else video.pause()
  }, [allowVideo, inView, pageVisible, userPaused])

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) { setUserPaused(false); void video.play().catch(() => setFailed(true)) }
    else { setUserPaused(true); video.pause() }
  }

  return <section className="customer-hero" aria-labelledby="welcome-title">
    <img className="hero-poster" src="/media/hero-sss-poster.jpg" alt="" fetchPriority="high" width="1600" height="900" />
    <video ref={videoRef} className={`hero-video ${hasFrame && allowVideo ? 'has-frame' : ''}`} src={allowVideo ? `/media/hero-sss-${mobile ? 'mobile' : 'desktop'}.mp4` : undefined} poster="/media/hero-sss-poster.jpg" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onLoadedData={() => setHasFrame(true)} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => { setFailed(true); setPlaying(false) }} />
    <div className="hero-shade" aria-hidden="true" />
    <div className="hero-inner page-container">
      <div className="hero-copy">
        <div className="hero-title-group"><p className="hero-eyebrow"><span /> TERHUBUNG DI SUKABUMI</p><h1 id="welcome-title">Koneksi baik,<br /><span className="hero-decoder-line"><span className="hero-decoder-real">mulai dari <em>sini.</em></span><span className="hero-decoder-cipher" aria-hidden="true" /></span></h1></div>
        <div className="hero-intro"><p className="hero-description">Temukan mitra WiFi pilihan Anda.<br />Pilih lokasinya, lalu temukan paket yang sesuai.</p><div className="hero-actions"><a href="#pilih-mitra" className="hero-cta">Temukan mitra Anda <ArrowUpRight size={20} aria-hidden="true" /></a><a href={adminWhatsAppUrl} className="hero-cta hero-cta--whatsapp" target="_blank" rel="noreferrer" aria-label="Hubungi admin SSS melalui WhatsApp"><MessageCircle size={18} aria-hidden="true" />Hubungi admin <ArrowUpRight size={18} aria-hidden="true" /></a></div><Link to="/wifi" className="hero-voucher-link">Sudah punya voucher? Masuk WiFi <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </div>
      <div className="hero-bottom"><div className="hero-context"><MapPin size={18} aria-hidden="true" /><div><strong>Sukabumi, Jawa Barat</strong><span>Pilih mitra secara manual, sesuai tujuan Anda.</span></div></div><div className="hero-media-controls">{allowVideo ? <button type="button" onClick={togglePlayback} aria-label={playing ? 'Jeda video hero' : 'Putar video hero'}>{playing ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}<span>{playing ? 'Jeda video' : 'Putar video'}</span></button> : <span className="hero-video-status">{failed ? 'Video tidak tersedia · gambar ditampilkan' : 'Tampilan statis · preferensi perangkat'}</span>}<span className="hero-media-caption">Visual ilustrasi · bukan status jaringan</span></div></div>
    </div>
    <span className="hero-scroll-mark" aria-hidden="true"><ArrowDown size={15} /> JELAJAHI MITRA</span>
  </section>
}
