/**
 * Runtime mode is intentionally build-time. Local development keeps the
 * fixture-backed QA path; production builds never expose demo controls.
 */
export type RuntimeMode = 'demo' | 'production'

export const runtimeMode: RuntimeMode = import.meta.env.VITE_APP_MODE === 'production' || import.meta.env.PROD
  ? 'production'
  : 'demo'

export const isProduction = runtimeMode === 'production'
export const isDemoMode = !isProduction
