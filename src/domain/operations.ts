import type { DemoState, OperationalAlert, TelemetrySnapshot } from './models.ts'

export function upsertAlert(state: DemoState, input: Pick<OperationalAlert, 'type'|'hotspotId'|'packageId'|'orderId'|'severity'|'message'>): OperationalAlert {
  const old = state.alerts.find(alert => alert.type === input.type && alert.hotspotId === input.hotspotId && alert.packageId === input.packageId && alert.orderId === input.orderId)
  if (old) { if (old.status === 'resolved') old.status = 'open'; old.updatedAt = state.clockNow; old.message = input.message; old.severity = input.severity; return old }
  const alert: OperationalAlert = { id: `alert-${++state.sequence}`, ...input, status: 'open', createdAt: state.clockNow, updatedAt: state.clockNow }
  state.alerts.push(alert)
  return alert
}

export function checkLowStock(state: DemoState, hotspotId: string, packageId: string) {
  const pool = state.inventoryPools.find(item => item.hotspotId === hotspotId && item.packageId === packageId)
  if (!pool) throw new Error('INVENTORY_NOT_FOUND')
  if (pool.available < pool.lowThreshold) upsertAlert(state, { type: 'low_stock', hotspotId, packageId, orderId: null, severity: pool.available === 0 ? 'critical' : 'warning', message: `Stok voucher sintetis ${state.packages.find(p => p.id === packageId)?.name ?? packageId}: ${pool.available} tersisa (ambang ${pool.lowThreshold}).` })
  else { const alert = state.alerts.find(a => a.type === 'low_stock' && a.hotspotId === hotspotId && a.packageId === packageId && a.status !== 'resolved'); if (alert) { alert.status = 'resolved'; alert.updatedAt = state.clockNow } }
}

export function effectiveTelemetry(snapshot: TelemetrySnapshot, clockNow: string): TelemetrySnapshot {
  if (snapshot.pollFailed || Date.parse(clockNow) - Date.parse(snapshot.observedAt) > 5 * 60_000) return { ...snapshot, status: 'unknown', users: 0, latencyMs: null, usage: { gaming: 0, social: 0, streaming: 0, other: 0 } }
  return snapshot
}
