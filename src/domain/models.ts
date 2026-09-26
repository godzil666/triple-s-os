export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired'
export type ProvisioningStatus = 'pending' | 'issued' | 'failed'
export type VoucherStatus = 'unused' | 'active' | 'expired'
export type SiteStatus = 'online' | 'offline' | 'unknown'
export interface Partner { defaultRatePercent?: number; id: string; name: string; area: string; note: string; initials: string; active: boolean; fictional: true }
export interface Provider { id: string; partnerId: string; name: string; fictional: true }
/** Site is the one demo Location belonging to a Provider. */
export interface Site { id: string; partnerId: string; providerId: string; ssid: string; mockAvailability: SiteStatus }
export interface Hotspot { id: string; siteId: string; name: string; ssid: string; active: boolean }
export interface InventoryPool { id: string; hotspotId: string; packageId: string; available: number; lowThreshold: number }
export type HotspotHealth = 'online' | 'degraded' | 'offline' | 'unknown'
export interface UsageCounts { gaming: number; social: number; streaming: number; other: number }
export interface TelemetrySnapshot { hotspotId: string; status: HotspotHealth; users: number; latencyMs: number | null; usage: UsageCounts; observedAt: string; pollFailed: boolean; source: 'demo' }
export interface OperationalAlert { id: string; type: 'low_stock' | 'hotspot_offline' | 'hotspot_degraded' | 'high_latency' | 'allocation_failed' | 'delivery_failed'; hotspotId: string; packageId: string | null; orderId: string | null; severity: 'warning' | 'critical'; status: 'open' | 'acknowledged' | 'resolved'; createdAt: string; updatedAt: string; message: string }
export interface IncidentEntry { at: string; actorId: string; action: string }
export interface Incident { id: string; alertId: string; hotspotId: string; assigneeId: string | null; status: 'open' | 'acknowledged' | 'investigating' | 'resolved'; createdAt: string; updatedAt: string; timeline: IncidentEntry[] }
export interface Package { catalogPriceRp?: number; id: string; name: string; kind: 'regular' | 'monthly'; durationSeconds: number; maxConcurrentDevices: number; speedMbps: number; archived: boolean; assumptionLabel: string }
export interface PartnerPackage { partnerId: string; packageId: string; priceRp: number; commissionRatePercent: number; available: boolean }
export interface RateSnapshot { ratePercent: number; basisRp: number; basis: 'gross-before-fees'; rounding: 'nearest-rupiah'; assumptionLabel: string }
export interface Order { checkoutKey?: string; id: string; token: string; partnerId: string; siteId: string; hotspotId: string; packageSnapshot: Package; rateSnapshot: RateSnapshot; customerName: string; customerWhatsapp: string; amountRp: number; channel: 'qris' | 'ewallet'; status: 'created' | 'confirmed'; provisioningStatus: ProvisioningStatus; createdAt: string }
export interface Payment { id: string; orderId: string; status: PaymentStatus; paidAt: string | null; provider: 'mock'; merchant: 'PT_SSS' }
export type VoucherCredential = { type: 'single_code'; code: string } | { type: 'username_password'; username: string; password: string }
export interface Voucher { credential?: VoucherCredential; id: string; code: string; partnerId: string; siteId: string; hotspotId: string; orderId: string | null; batchId: string | null; kind: Package['kind']; durationSeconds: number; maxConcurrentDevices: number; status: VoucherStatus; firstActivatedAt: string | null; expiresAt: string | null; deviceBinding: string | null }
export interface OfflineBatch { requestKey?: string; id: string; partnerId: string; siteId: string; hotspotId: string; packageSnapshot: Package; quantity: number; wholesaleUnitRp: number; exampleRetailUnitRp: number; codeSource: 'generated-demo'; stockPaymentReference: string | null; allocatedAt: string; assumptionLabel: string }
export interface Session { id: string; voucherId: string; partnerId: string; siteId: string; hotspotId: string; deviceId: string; startedAt: string; lastSeenAt: string; endedAt: string | null; endReason: 'logout' | 'expired' | null }
export interface CommissionEntry { id: string; orderId: string; partnerId: string; ratePercent: number; basisRp: number; amountRp: number; basis: RateSnapshot['basis']; rounding: RateSnapshot['rounding']; createdAt: string; assumptionLabel: string }
export interface NotificationAttempt { id: string; orderId: string; status: 'sent' | 'failed'; attemptedAt: string; provider: 'mock'; error: string | null }
export interface AuditEvent { id: string; at: string; action: string; entityId: string; detail: string; actorId?: string; result?: 'success' | 'denied' | 'failed' }
export interface MonitoringSnapshot { siteId: string; status: SiteStatus; observedAt: string; pollFailed: boolean }
export interface DemoContext { partnerId: string; deviceId: string; siteId: string }
export interface DemoScenarios { payment: PaymentStatus; provisioning: ProvisioningStatus; notification: 'sent' | 'failed' }
export interface DemoState {
  synthetic: true; sequence: number; revision: number; clockNow: string; persistenceNotice: string | null;
  context: DemoContext; scenarios: DemoScenarios;
  partners: Partner[]; providers: Provider[]; sites: Site[]; hotspots: Hotspot[]; packages: Package[]; partnerPackages: PartnerPackage[];
  inventoryPools: InventoryPool[]; telemetry: TelemetrySnapshot[]; alerts: OperationalAlert[]; incidents: Incident[];
  orders: Order[]; payments: Payment[]; vouchers: Voucher[]; offlineBatches: OfflineBatch[];
  sessions: Session[]; commissions: CommissionEntry[]; notifications: NotificationAttempt[];
  auditEvents: AuditEvent[]; monitoring: MonitoringSnapshot[];
}
export interface CreateOrderInput { partnerId: string; packageId: string; hotspotId?: string; customerName: string; customerWhatsapp: string; channel: Order['channel']; checkoutKey?: string }
export interface LoginInput { voucherId: string; siteId: string; hotspotId?: string; deviceId: string }

