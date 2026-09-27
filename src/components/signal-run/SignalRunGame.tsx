import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { ArrowUp, Play, RotateCcw, X } from 'lucide-react'
import { advanceGame, createGame, GAME_HEIGHT, jumpGame, readBestScore, saveBestScore, scoreGame, type GamePhase, type GameState } from './engine'
import { drawGame } from './draw'
import './signal-run.css'

export default function SignalRunGame({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const frameRef = useRef<number | null>(null)
  const gameRef = useRef<GameState>(createGame(600))
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => readBestScore(window.localStorage))
  const reducedMotion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const titleId = useId()
  const helpId = useId()

  const render = useCallback(() => {
    if (canvasRef.current) drawGame(canvasRef.current, gameRef.current, reducedMotion.current)
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      dialog.close()
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = Math.max(240, Math.round(canvas.getBoundingClientRect().width))
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(GAME_HEIGHT * dpr)
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0)
      gameRef.current = { ...gameRef.current, width, playerX: Math.min(76, width * .2) }
      render()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()
    return () => observer.disconnect()
  }, [render])

  useEffect(() => {
    if (phase !== 'playing') return
    let last = 0
    const tick = (time: number) => {
      if (!last) last = time
      gameRef.current = advanceGame(gameRef.current, (time - last) / 1000)
      last = time
      render()
      const nextScore = scoreGame(gameRef.current)
      setScore(old => old === nextScore ? old : nextScore)
      if (gameRef.current.phase === 'gameover') {
        const nextBest = Math.max(best, nextScore)
        if (nextBest > best) { saveBestScore(window.localStorage, nextBest); setBest(nextBest) }
        setPhase('gameover')
        frameRef.current = null
        return
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    const hide = () => {
      if (document.hidden) {
        gameRef.current = { ...gameRef.current, phase: 'paused' }
        setPhase('paused')
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      document.removeEventListener('visibilitychange', hide)
    }
  }, [phase, best, render])

  const start = () => {
    const width = gameRef.current.width
    gameRef.current = { ...createGame(width), phase: 'playing' }
    setScore(0)
    setPhase('playing')
    render()
    canvasRef.current?.focus()
  }
  const resume = () => {
    gameRef.current = { ...gameRef.current, phase: 'playing' }
    setPhase('playing')
    canvasRef.current?.focus()
  }
  const jump = () => {
    if (phase === 'ready' || phase === 'gameover') { start(); return }
    if (phase === 'paused') { resume(); return }
    gameRef.current = jumpGame(gameRef.current)
  }
  const onCanvasKeyDown = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === ' ' || event.key === 'ArrowUp') { event.preventDefault(); jump() }
  }

  return <dialog ref={dialogRef} className="signal-run-dialog" aria-labelledby={titleId} aria-describedby={helpId} onCancel={event => { event.preventDefault(); onClose() }}>
    <div className="signal-run-topline"><span>SSS / PLAYGROUND</span><button ref={closeRef} type="button" className="signal-run-close" onClick={onClose} aria-label="Tutup Signal Run"><X size={20} aria-hidden="true" /></button></div>
    <div className="signal-run-heading"><div><p className="signal-run-eyebrow">SATU SINYAL. BANYAK JALAN.</p><h2 id={titleId}>Signal <em>Run.</em></h2><p id={helpId}>Lompati zona mati dan kumpulkan sinyal. Tekan Spasi atau panah atas; di ponsel, ketuk arena.</p></div><div className="signal-run-scoreboard"><span>SKOR<strong data-testid="signal-score">{String(score).padStart(5, '0')}</strong></span><span>TERBAIK<strong data-testid="signal-best">{String(best).padStart(5, '0')}</strong></span></div></div>
    <div className="signal-run-stage">
      <canvas ref={canvasRef} className="signal-run-canvas" role="button" tabIndex={0} aria-label="Arena Signal Run. Tekan Spasi atau panah atas untuk melompat" aria-describedby={helpId} onKeyDown={onCanvasKeyDown} onPointerDown={event => { event.preventDefault(); jump() }} />
      {phase !== 'playing' && <div className="signal-run-screen" data-testid="signal-phase"><span className="signal-run-phase">{phase === 'gameover' ? 'KONEKSI TERPUTUS' : phase === 'paused' ? 'JEDA' : 'SIAP BERLARI'}</span><h3>{phase === 'gameover' ? 'Coba jalur lain?' : phase === 'paused' ? 'Sinyal menunggu.' : 'Jaga sinyal tetap kuat.'}</h3><p>{phase === 'gameover' ? `Skor ${score} · Terbaik ${best}` : phase === 'paused' ? 'Permainan dijeda saat tab tidak aktif.' : 'Satu lompatan untuk melewati zona mati.'}</p><button type="button" className="signal-run-action" onClick={phase === 'paused' ? resume : start}>{phase === 'gameover' ? <RotateCcw size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{phase === 'gameover' ? 'Main lagi' : phase === 'paused' ? 'Lanjutkan' : 'Mulai bermain'}</button></div>}
    </div>
    <div className="signal-run-bottom"><span><span className="signal-run-key">SPACE</span> / <span className="signal-run-key">↑</span> untuk lompat · Ketuk arena di ponsel</span><button type="button" className="signal-run-jump" onClick={jump} disabled={phase !== 'playing'}><ArrowUp size={17} aria-hidden="true" /> Lompat</button></div>
    <p className="signal-run-privacy">Skor terbaik disimpan hanya di perangkat ini. Tidak terkait voucher atau koneksi WiFi.</p>
    <span className="sr-only" aria-live="polite">{phase === 'gameover' ? `Permainan selesai. Skor ${score}. Skor terbaik ${best}.` : ''}</span>
  </dialog>
}
