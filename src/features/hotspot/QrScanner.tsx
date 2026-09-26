import { useEffect, useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { parseVoucherQr } from './qr'

interface Detector { detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]> }
type DetectorConstructor = new (options: { formats: string[] }) => Detector

export function QrScanner({ onCode }: { onCode: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (!running) return
    const Constructor = (window as Window & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector
    if (!Constructor || !navigator.mediaDevices?.getUserMedia) { setMessage('Pemindai kamera tidak tersedia di browser ini. Masukkan kode voucher secara manual.'); setRunning(false); return }
    let active = true, stream: MediaStream | null = null, timer = 0, scanning = false
    const detector = new Constructor({ formats: ['qr_code'] })
    void navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(async value => {
      if (!active) { value.getTracks().forEach(track => track.stop()); return }
      stream = value
      if (!video.current) return
      video.current.srcObject = value
      await video.current.play()
      timer = window.setInterval(async () => {
        if (!active || scanning || !video.current || video.current.readyState < 2) return
        scanning = true
        try {
          const results = await detector.detect(video.current)
          if (!active || !results.length) return
          const code = parseVoucherQr(results[0].rawValue)
          if (code) { onCode(code); setMessage('Kode dari QR terisi. Periksa lalu tekan Masuk dengan voucher.'); setRunning(false) }
          else setMessage('QR ini bukan satu kode voucher SSS. Masukkan kode secara manual.')
        } catch { if (active) setMessage('QR belum dapat dibaca. Arahkan kamera kembali atau masukkan kode manual.') }
        finally { scanning = false }
      }, 450)
    }).catch(() => { if (active) { setMessage('Izin kamera ditolak atau kamera tidak tersedia. Masukkan kode voucher secara manual.'); setRunning(false) } })
    return () => { active = false; window.clearInterval(timer); stream?.getTracks().forEach(track => track.stop()); if (video.current) video.current.srcObject = null }
  }, [running, onCode])
  return <div className="qr-scanner"><Button type="button" variant="secondary" onClick={() => { setMessage(''); setRunning(value => !value) }}>{running ? 'Tutup kamera' : 'Scan QR voucher'}</Button>{running && <video ref={video} muted playsInline aria-label="Pratinjau kamera pemindai QR" style={{ width: '100%', maxWidth: 320, display: 'block', marginBlock: 12, borderRadius: 14 }} />}{message && <p role="status">{message}</p>}<p className="assumption-note">Kamera hanya membaca QR setelah izin diberikan. Kode tetap diverifikasi server sesuai hotspot; input manual selalu tersedia.</p></div>
}
