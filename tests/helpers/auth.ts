import { readFileSync } from 'node:fs'
import type { Browser, Page } from '@playwright/test'
import { expect } from '@playwright/test'
export const testOrigin = 'http://127.0.0.1:5174'
export function credentials(username='owner') {
  const text=readFileSync('.local/auth-browser-tests/INITIAL_ACCOUNTS.md','utf8')
  const line=text.split('\n').find(line=>line.startsWith(`| ${username} |`))!
  return {username,password:line.split('|')[2].trim()}
}
export async function loginAs(page: Page, username='owner') {
  const response=await page.request.post('/api/auth/login',{data:credentials(username),headers:{origin:testOrigin}})
  expect(response.status()).toBe(200)
  return await response.json()
}
export async function resetDemo(page: Page) {
  const session=await (await page.request.get('/api/auth/session')).json()
  const response=await page.request.post('/api/service',{data:{service:'demo',method:'reset',args:[true]},headers:{origin:testOrigin,'x-csrf-token':session.csrfToken}})
  expect(response.status()).toBe(200)
}
export async function ownerController(browser: Browser) {
  const context=await browser.newContext({baseURL:testOrigin}),page=await context.newPage()
  const auth=await loginAs(page)
  return {
    call:async(service:string,method:string,args:unknown[])=>{
      const response=await page.request.post('/api/service',{headers:{origin:testOrigin,'x-csrf-token':auth.csrfToken},data:{service,method,args}})
      expect(response.status()).toBe(200)
      return response.json()
    },
    close:()=>context.close(),
  }
}
