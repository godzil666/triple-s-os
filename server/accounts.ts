import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { join } from 'node:path'
import type { StaffRole, StaffUser } from '../src/auth/types.ts'
import { readJson, writeJson } from './files.ts'

interface Account extends StaffUser { salt: string; passwordHash: string; version: number }
export interface AccountInput { username: string; password: string; role: StaffRole; partnerId?: string | null; assignedHotspotIds?: string[] }
const hash = (password: string, salt: string) => scryptSync(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }).toString('hex')
export const publicUser = ({ id, username, role, partnerId, assignedHotspotIds, active }: StaffUser): StaffUser => ({ id, username, role, partnerId, assignedHotspotIds: assignedHotspotIds ?? [], active })
export function createAccounts(directory: string) {
  const path = join(directory, 'accounts.json')
  // Existing local admin accounts had global visibility; migrate them to one explicit synthetic hotspot.
  let accounts = readJson<Account[]>(path, []).map(account => ({ ...account, assignedHotspotIds: account.assignedHotspotIds ?? (account.role === 'admin' ? ['hotspot-site-demo-cisaat'] : []) }))
  const dummySalt = randomBytes(16).toString('hex')
  const dummyHash = hash(randomBytes(24).toString('hex'), dummySalt)
  function persist(next: Account[]) { writeJson(path, next); accounts = next }
  function checkPassword(password: unknown): asserts password is string {
    if (typeof password !== 'string' || password.length < 12 || password.length > 128) throw new Error('PASSWORD_LENGTH')
  }
  return {
    list: () => accounts.map(publicUser),
    find: (id: string) => accounts.find(a => a.id === id),
    verify(username: string, password: string) {
      const account = accounts.find(a => a.username === username.trim().toLowerCase())
      const result = hash(password, account?.salt ?? dummySalt)
      if (!timingSafeEqual(Buffer.from(result, 'hex'), Buffer.from(account?.passwordHash ?? dummyHash, 'hex')) || !account?.active) return null
      return account
    },
    create(input: AccountInput) {
      checkPassword(input.password)
      const username = typeof input.username === 'string' ? input.username.trim().toLowerCase() : ''
      if (!/^[a-z0-9][a-z0-9._@-]{2,79}$/.test(username) || !['owner', 'admin', 'partner'].includes(input.role)) throw new Error('INVALID_ACCOUNT')
      if (accounts.some(a => a.username === username)) throw new Error('USERNAME_EXISTS')
      if (input.role === 'partner' && !input.partnerId) throw new Error('PARTNER_REQUIRED')
      if (input.assignedHotspotIds !== undefined && (!Array.isArray(input.assignedHotspotIds) || input.assignedHotspotIds.some(id => typeof id !== 'string') || new Set(input.assignedHotspotIds).size !== input.assignedHotspotIds.length)) throw new Error('INVALID_ASSIGNMENT')
      const salt = randomBytes(16).toString('hex')
      const account: Account = { id: randomUUID(), username, role: input.role, partnerId: input.role === 'partner' ? input.partnerId! : null, assignedHotspotIds: input.role === 'admin' ? input.assignedHotspotIds ?? [] : [], active: true, salt, passwordHash: hash(input.password, salt), version: 1 }
      persist([...accounts, account])
      return publicUser(account)
    },
    update(id: string, patch: { active?: boolean; password?: string; assignedHotspotIds?: string[] }, actorId: string) {
      const next = structuredClone(accounts)
      const account = next.find(a => a.id === id)
      if (!account) throw new Error('ACCOUNT_NOT_FOUND')
      if (patch.active === false && id === actorId) throw new Error('CANNOT_DISABLE_SELF')
      if (patch.active === false && account.role === 'owner' && next.filter(a => a.role === 'owner' && a.active).length <= 1) throw new Error('LAST_OWNER_REQUIRED')
      if (patch.active !== undefined) { if (typeof patch.active !== 'boolean') throw new Error('INVALID_ACCOUNT'); account.active = patch.active }
      if (patch.password !== undefined) { checkPassword(patch.password); account.salt = randomBytes(16).toString('hex'); account.passwordHash = hash(patch.password, account.salt) }
      if (patch.assignedHotspotIds !== undefined) { if (account.role !== 'admin' || !Array.isArray(patch.assignedHotspotIds) || patch.assignedHotspotIds.some(id => typeof id !== 'string') || new Set(patch.assignedHotspotIds).size !== patch.assignedHotspotIds.length) throw new Error('INVALID_ASSIGNMENT'); account.assignedHotspotIds = patch.assignedHotspotIds }
      account.version++
      persist(next)
      return publicUser(account)
    },
  }
}
