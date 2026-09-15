import { apiRequest } from './http'
import type { CustomerService } from './customer-contracts'
const path=(token:string)=>`/api/customer/orders/${encodeURIComponent(token)}`
export const customerService: CustomerService = {
  catalog:id=>apiRequest(`/api/customer/catalog/${encodeURIComponent(id)}`),
  checkout:input=>apiRequest('/api/customer/checkout',input),
  detail:token=>apiRequest(path(token)),
  pay:(token,status,provisioning,notification)=>apiRequest(`${path(token)}/pay`,{status,provisioning,notification}),
  issue:(token,status,notification)=>apiRequest(`${path(token)}/issue`,{status,notification}),
  notify:(token,status)=>apiRequest(`${path(token)}/notify`,{status}),
  connect:(token,siteId)=>apiRequest(`${path(token)}/connect`,{siteId}),
  disconnect:token=>apiRequest(`${path(token)}/disconnect`,{}),
}
