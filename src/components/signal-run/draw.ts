import { GAME_HEIGHT, GROUND_Y, type GameState } from './engine'

const mint = '#aaf1e3'
const cyan = '#50c8dc'
const magenta = '#ed72bd'

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

export function drawGame(canvas: HTMLCanvasElement, game: GameState, reducedMotion: boolean): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const width = game.width
  ctx.clearRect(0, 0, width, GAME_HEIGHT)
  ctx.fillStyle = '#0c1b26'
  ctx.fillRect(0, 0, width, GAME_HEIGHT)

  // Static signal map with a restrained moving accent during play.
  ctx.strokeStyle = '#244752'
  ctx.lineWidth = 1
  for (let x = 24; x < width; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, GROUND_Y - 16); ctx.stroke()
  }
  for (let y = 36; y < GROUND_Y; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }
  ctx.fillStyle = '#183a43'
  for (let x = 42; x < width; x += 144) {
    ctx.beginPath(); ctx.arc(x, 53, 4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + 55, 103, 3, 0, Math.PI * 2); ctx.fill()
  }
  ctx.fillStyle = '#183f48'
  roundedRect(ctx, 0, GROUND_Y, width, GAME_HEIGHT - GROUND_Y, 0)
  ctx.fillStyle = cyan
  ctx.fillRect(0, GROUND_Y, width, 3)
  if (!reducedMotion) {
    ctx.fillStyle = '#468f9c'
    const offset = game.distance % 58
    for (let x = -offset; x < width; x += 58) roundedRect(ctx, x, GROUND_Y + 23, 28, 3, 1)
  }

  for (const item of game.signals) {
    ctx.strokeStyle = mint
    ctx.lineWidth = 3
    for (const radius of [6, 11]) {
      ctx.beginPath(); ctx.arc(item.x, item.y, radius, Math.PI * 1.18, Math.PI * 1.82); ctx.stroke()
    }
    ctx.fillStyle = mint
    ctx.beginPath(); ctx.arc(item.x, item.y + 4, 2.5, 0, Math.PI * 2); ctx.fill()
  }
  for (const item of game.obstacles) {
    ctx.fillStyle = '#472a49'
    roundedRect(ctx, item.x, GROUND_Y - item.height, item.width, item.height, 6)
    ctx.strokeStyle = magenta
    ctx.lineWidth = 2
    ctx.strokeRect(item.x + 4, GROUND_Y - item.height + 4, item.width - 8, item.height - 8)
    ctx.beginPath()
    ctx.moveTo(item.x + 11, GROUND_Y - item.height + 13)
    ctx.lineTo(item.x + item.width - 11, GROUND_Y - 13)
    ctx.stroke()
  }

  // Original network packet: a device tile with signal traces, not a borrowed mascot.
  ctx.fillStyle = '#aaf1e3'
  roundedRect(ctx, game.playerX, game.playerY, 32, 34, 8)
  ctx.fillStyle = '#0b3540'
  roundedRect(ctx, game.playerX + 7, game.playerY + 7, 18, 17, 4)
  ctx.fillStyle = '#aaf1e3'
  ctx.beginPath(); ctx.arc(game.playerX + 16, game.playerY + 16, 3, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = cyan
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(game.playerX + 9, game.playerY + 29); ctx.lineTo(game.playerX + 23, game.playerY + 29); ctx.stroke()
}
