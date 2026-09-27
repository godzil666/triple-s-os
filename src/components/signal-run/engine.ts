export const GAME_HEIGHT = 280
export const GROUND_Y = 230
export const BEST_SCORE_KEY = 'triple-s.signal-run.best-score'

const PLAYER_WIDTH = 32
const PLAYER_HEIGHT = 34
const GRAVITY = 1200
const JUMP_VELOCITY = -480

export type GamePhase = 'ready' | 'playing' | 'paused' | 'gameover'
export type Obstacle = { x: number; width: number; height: number }
export type Signal = { x: number; y: number }
export type GameState = {
  phase: GamePhase
  width: number
  elapsed: number
  distance: number
  playerX: number
  playerY: number
  velocityY: number
  obstacles: Obstacle[]
  signals: Signal[]
  spawnIn: number
  waves: number
  collected: number
}

export function createGame(width: number): GameState {
  return {
    phase: 'ready', width, elapsed: 0, distance: 0,
    playerX: Math.min(76, width * .2), playerY: GROUND_Y - PLAYER_HEIGHT,
    velocityY: 0, obstacles: [], signals: [], spawnIn: 1.15,
    waves: 0, collected: 0,
  }
}

export function scoreGame(game: GameState): number {
  return Math.floor(game.distance / 20) + game.collected * 25
}

export function jumpGame(game: GameState): GameState {
  if (game.phase !== 'playing' || game.playerY < GROUND_Y - PLAYER_HEIGHT - 1) return game
  return { ...game, velocityY: JUMP_VELOCITY }
}

export function advanceGame(game: GameState, deltaSeconds: number): GameState {
  if (game.phase !== 'playing' || deltaSeconds <= 0) return game
  // Small steps preserve collisions while catching up when rendering misses a frame.
  let remaining = Math.min(deltaSeconds, .25)
  let next = game
  while (remaining > 0 && next.phase === 'playing') {
    const dt = Math.min(remaining, .05)
    next = advanceStep(next, dt)
    remaining -= dt
  }
  return next
}

function advanceStep(game: GameState, dt: number): GameState {
  const elapsed = game.elapsed + dt
  const speed = Math.min(360, Math.max(175, game.width * .34) + elapsed * 4)
  const velocityY = game.velocityY + GRAVITY * dt
  const playerY = Math.min(GROUND_Y - PLAYER_HEIGHT, game.playerY + velocityY * dt)
  const landed = playerY === GROUND_Y - PLAYER_HEIGHT
  let spawnIn = game.spawnIn - dt
  let waves = game.waves
  const obstacles = game.obstacles.map(item => ({ ...item, x: item.x - speed * dt })).filter(item => item.x + item.width > -5)
  const signals = game.signals.map(item => ({ ...item, x: item.x - speed * dt })).filter(item => item.x > -20)
  if (spawnIn <= 0) {
    // Alternating obstacle profiles keep the endless run readable but less repetitive.
    const profiles = [{ width: 34, height: 39 }, { width: 24, height: 51 }, { width: 45, height: 31 }]
    obstacles.push({ x: game.width + 20, ...profiles[waves % profiles.length] })
    signals.push({ x: game.width + 140, y: GROUND_Y - 95 })
    waves += 1
    spawnIn += Math.max(1.15, 1.85 - elapsed * .02)
  }
  const hitObstacle = obstacles.some(item =>
    game.playerX + PLAYER_WIDTH - 5 > item.x && game.playerX + 5 < item.x + item.width &&
    playerY + PLAYER_HEIGHT - 4 > GROUND_Y - item.height,
  )
  let collected = game.collected
  const remainingSignals = signals.filter(item => {
    const hit = item.x + 11 > game.playerX && item.x - 11 < game.playerX + PLAYER_WIDTH &&
      item.y + 11 > playerY && item.y - 11 < playerY + PLAYER_HEIGHT
    if (hit) collected += 1
    return !hit
  })
  return {
    ...game, phase: hitObstacle ? 'gameover' : 'playing', elapsed,
    distance: game.distance + speed * dt,
    playerY, velocityY: landed ? 0 : velocityY,
    obstacles, signals: remainingSignals, spawnIn, waves, collected,
  }
}

export function readBestScore(storage: Pick<Storage, 'getItem'>): number {
  try {
    const raw = storage.getItem(BEST_SCORE_KEY)
    if (!raw || !/^\d{1,7}$/.test(raw)) return 0
    return Number(raw)
  } catch { return 0 }
}

export function saveBestScore(storage: Pick<Storage, 'setItem'>, score: number): void {
  try { storage.setItem(BEST_SCORE_KEY, String(Math.max(0, Math.min(9_999_999, Math.floor(score))))) }
  catch { /* Private browsing or disabled storage must not break the game. */ }
}
