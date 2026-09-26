import type { Order, Package, Partner, Site, Provider, Hotspot, Payment, Voucher, NotificationAttempt } from '../domain/models'
export interface Offer { package: Package; priceRp: number; quote: string }
export interface Catalog { partner: Partner; provider: Provider; site: Pick<Site, 'id'|'ssid'|'partnerId'|'providerId'>; hotspot: Hotspot; offers: Offer[] }
export interface CheckoutInput { partnerId: string; hotspotId?: string; packageId: string; quote: string; customerName: string; customerWhatsapp: string; channel: Order['channel']; requestKey: string }
export interface CustomerDetail {
  order: Omit<Order, 'rateSnapshot'|'checkoutKey'>; partner: Partner; provider: Provider; site: Catalog['site']; hotspot: Hotspot; payment: Payment;
  voucher: Omit<Voucher,'deviceBinding'|'batchId'> | null; notification: NotificationAttempt | null;
  clockNow: string; connected: boolean; activeDevices: number;
}
export interface CustomerService {
  catalog(partnerId: string): Promise<Catalog>;
  catalogByHotspot(hotspotId: string): Promise<Catalog>;
  checkout(input: CheckoutInput): Promise<CustomerDetail>;
  detail(token: string): Promise<CustomerDetail>;
}
