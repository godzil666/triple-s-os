import type { ManagementService } from './management.ts'
import type { CreateOrderInput, DemoContext, DemoScenarios, LoginInput, MonitoringSnapshot, Order, Package, Partner, PartnerPackage, Payment, PaymentStatus, ProvisioningStatus, Session, SiteStatus, Voucher, NotificationAttempt, CommissionEntry } from '../domain/models.ts'

export interface OrderService { create(input: CreateOrderInput): Promise<Order>; list(partnerId?: string): Promise<Order[]> }
export interface PaymentService { settle(orderId: string, status?: PaymentStatus): Promise<Payment> }
export interface VoucherService { issue(orderId: string, status?: ProvisioningStatus): Promise<Voucher | null>; login(input: LoginInput): Promise<Session>; logout(sessionId: string): Promise<void>; list(partnerId?: string): Promise<Voucher[]> }
export interface NotificationService { send(orderId: string, status?: 'sent' | 'failed'): Promise<NotificationAttempt> }
export interface MonitoringService { poll(siteId: string, fail?: boolean): Promise<MonitoringSnapshot>; setSite(siteId: string, status: SiteStatus): Promise<void> }
export interface PartnerService {
  list(): Promise<Partner[]>; setActive(partnerId: string, active: boolean): Promise<void>;
  updateOffer(partnerId: string, packageId: string, patch: Partial<Pick<PartnerPackage, 'priceRp' | 'commissionRatePercent' | 'available'>>): Promise<void>;
  updatePackage(packageId: string, patch: Partial<Pick<Package, 'durationSeconds' | 'archived'>>): Promise<void>;
}
export interface CommissionService { list(partnerId?: string): Promise<CommissionEntry[]> }
export interface DemoService { advance(milliseconds: number): Promise<void>; setContext(patch: Partial<DemoContext>): Promise<void>; configure(patch: Partial<DemoScenarios>): Promise<void>; reset(confirmed: boolean): Promise<void> }
export interface Services { management: ManagementService; orders: OrderService; payments: PaymentService; vouchers: VoucherService; notifications: NotificationService; monitoring: MonitoringService; partners: PartnerService; commissions: CommissionService; demo: DemoService }

