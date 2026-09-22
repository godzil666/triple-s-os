import type { Order, Package, Partner, Site, Payment, Voucher, NotificationAttempt, PaymentStatus, ProvisioningStatus } from '../domain/models'
export interface Offer { package: Package; priceRp: number; quote: string }
export interface Catalog { partner: Partner; site: Pick<Site, 'id'|'ssid'|'partnerId'>; offers: Offer[] }
export interface CheckoutInput { partnerId: string; packageId: string; quote: string; customerName: string; customerWhatsapp: string; channel: Order['channel']; requestKey: string }
export interface CustomerDetail {
  order: Omit<Order, 'rateSnapshot'|'checkoutKey'>; partner: Partner; site: Catalog['site']; payment: Payment;
  voucher: Omit<Voucher,'deviceBinding'|'batchId'> | null; notification: NotificationAttempt | null;
  clockNow: string; connected: boolean; activeDevices: number;
}
export interface CustomerService {
  catalog(partnerId: string): Promise<Catalog>;
  checkout(input: CheckoutInput): Promise<CustomerDetail>;
  detail(token: string): Promise<CustomerDetail>;
  pay(token: string, status: PaymentStatus, provisioning: ProvisioningStatus, notification: 'sent'|'failed'): Promise<CustomerDetail>;
  issue(token: string, status: ProvisioningStatus, notification: 'sent'|'failed'): Promise<CustomerDetail>;
  notify(token: string, status: 'sent'|'failed'): Promise<CustomerDetail>;
  connect(token: string, siteId: string): Promise<CustomerDetail>;
  disconnect(token: string): Promise<CustomerDetail>;
}
