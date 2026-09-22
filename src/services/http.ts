import type { Services } from './contracts'
import type { DemoState } from '../domain/models'
let csrfToken = ''
export function setCsrf(value: string) { csrfToken = value }
export async function apiRequest<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, { credentials: 'same-origin', method: body === undefined ? 'GET' : 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, body: body === undefined ? undefined : JSON.stringify(body) })
  const data = await response.json()
  if (!response.ok) {
    if (response.status === 401 && data.error === 'UNAUTHENTICATED') window.dispatchEvent(new Event('sss:unauthorized'))
    throw new Error(data.error ?? 'REQUEST_FAILED')
  }
  return data as T
}
export function createHttpServices(onState: (state: DemoState) => void): Services {
  const call = async <T>(service: string, method: string, args: unknown[]): Promise<T> => {
    const response = await apiRequest<{ result: T; state: DemoState }>('/api/service', { service, method, args })
    onState(response.state)
    return response.result
  }
  return {
    management: {savePartner:(id,input)=>call('management','savePartner',[id,input]),savePackage:(id,input)=>call('management','savePackage',[id,input]),saveOffer:(id,pkg,input)=>call('management','saveOffer',[id,pkg,input]),allocate:input=>call('management','allocate',[input])},
    orders: { create: input => call('orders','create',[input]), list: id => call('orders','list',id ? [id] : []) },
    payments: { settle: (id,status) => call('payments','settle',status ? [id,status] : [id]) },
    vouchers: { issue: (id,status) => call('vouchers','issue',status ? [id,status] : [id]), login: input => call('vouchers','login',[input]), logout: id => call('vouchers','logout',[id]), list: id => call('vouchers','list',id ? [id] : []) },
    notifications: { send: (id,status) => call('notifications','send',status ? [id,status] : [id]) },
    monitoring: { poll: (id,fail) => call('monitoring','poll',[id,fail ?? false]), setSite: (id,status) => call('monitoring','setSite',[id,status]) },
    partners: { list: () => call('partners','list',[]), setActive: (id,active) => call('partners','setActive',[id,active]), updateOffer: (id,pkg,patch) => call('partners','updateOffer',[id,pkg,patch]), updatePackage: (id,patch) => call('partners','updatePackage',[id,patch]) },
    commissions: { list: id => call('commissions','list',id ? [id] : []) },
    demo: { advance: ms => call('demo','advance',[ms]), setContext: patch => call('demo','setContext',[patch]), configure: patch => call('demo','configure',[patch]), reset: confirmed => call('demo','reset',[confirmed]) },
  }
}

