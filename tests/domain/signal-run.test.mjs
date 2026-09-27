import { test } from 'node:test'
import assert from 'node:assert/strict'
import { advanceGame, BEST_SCORE_KEY, createGame, GROUND_Y, jumpGame, readBestScore, saveBestScore, scoreGame } from '../../src/components/signal-run/engine.ts'

test('Signal Run distance scores deterministically and speed rises with an upper bound', () => {
  const start = { ...createGame(600), phase: 'playing', spawnIn: 100 }
  const first = advanceGame(start, .05)
  assert.equal(first.distance, 10.21)
  assert.equal(scoreGame(first), 0)
  let progressed = start
  for (let i = 0; i < 20; i++) progressed = advanceGame(progressed, .05)
  assert.ok(scoreGame(progressed) > 0)
  const later = advanceGame({ ...start, elapsed: 100 }, .05)
  assert.equal(later.distance, 18)
})

test('jump clears one dead zone, but ground collision ends the run', () => {
  const base = { ...createGame(600), phase: 'playing', spawnIn: 100 }
  const obstacle = { x: base.playerX + 9, width: 34, height: 39 }
  const lost = advanceGame({ ...base, obstacles: [obstacle] }, .02)
  assert.equal(lost.phase, 'gameover')
  assert.equal(advanceGame(lost, .05), lost)
  let airborne = { ...jumpGame(base), obstacles: [{ ...obstacle, x: base.playerX + 65 }] }
  for (let i = 0; i < 12; i++) {
    airborne = advanceGame(airborne, .05)
    assert.equal(airborne.phase, 'playing')
  }
  assert.ok(airborne.playerY < GROUND_Y - 34)
  assert.ok(airborne.obstacles[0].x + obstacle.width < base.playerX)
})

test('collecting a signal adds bonus score and removes it once', () => {
  const base = { ...createGame(600), phase: 'playing', spawnIn: 100 }
  const picked = advanceGame({ ...base, signals: [{ x: base.playerX + 17, y: base.playerY + 15 }] }, .02)
  assert.equal(picked.collected, 1)
  assert.equal(picked.signals.length, 0)
  assert.equal(scoreGame(picked), 25)
  assert.equal(advanceGame(picked, .02).collected, 1)
})

test('best score remains device local and malformed or blocked storage fails safely', () => {
  const values = new Map()
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
  assert.equal(readBestScore(storage), 0)
  saveBestScore(storage, 87.9)
  assert.equal(values.get(BEST_SCORE_KEY), '87')
  assert.equal(readBestScore(storage), 87)
  values.set(BEST_SCORE_KEY, '{broken')
  assert.equal(readBestScore(storage), 0)
  assert.equal(readBestScore({ getItem() { throw Error('blocked') } }), 0)
  assert.doesNotThrow(() => saveBestScore({ setItem() { throw Error('blocked') } }, 10))
})
