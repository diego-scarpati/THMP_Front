// src/lib/env.ts
// Single source of truth for environment config.
// Mirrors backend src/config/env.ts in shape and intent.

export type AppEnv = 'development' | 'preview' | 'production'

export const appEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? 'development') as AppEnv
export const isPreview = appEnv === 'preview'
export const isProduction = appEnv === 'production'
export const isDevelopment = appEnv === 'development'

// Only populated in preview. NEXT_PUBLIC_ vars are visible in the browser bundle,
// which is intentional — preview credentials are shared by design.
export const previewCredentials = isPreview
  ? {
      email: process.env.NEXT_PUBLIC_PREVIEW_EMAIL ?? '',
      password: process.env.NEXT_PUBLIC_PREVIEW_PASSWORD ?? '',
    }
  : null
