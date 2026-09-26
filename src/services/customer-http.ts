import { apiRequest } from './http'
import type { CustomerService } from './customer-contracts'
const path=(token:string)=>`/api/customer/orders/${encodeURIComponent(token)}`
export const customerService: CustomerService = {
  catalog:id=>apiRequest(`/api/customer/catalog/${encodeURIComponent(id)}`),
  catalogByHotspot:id=>apiRequest(`/api/customer/hotspots/${encodeURIComponent(id)}/catalog`),
  checkout:input=>apiRequest('/api/customer/checkout',input),
  detail:token=>apiRequest(path(token)),
}
