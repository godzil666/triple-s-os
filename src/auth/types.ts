export type StaffRole = 'owner' | 'admin' | 'partner'
export interface StaffUser { id: string; username: string; role: StaffRole; partnerId: string | null; assignedHotspotIds: string[]; active: boolean }
export interface AuthSession { user: StaffUser | null; csrfToken: string }
