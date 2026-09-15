export function VideoBackdrop() {
  return <div className="video-backdrop" aria-hidden="true">
    <video src="/media/login-background.mp4" autoPlay muted loop playsInline preload="metadata" tabIndex={-1} />
    <div className="video-backdrop-scrim" />
  </div>
}
