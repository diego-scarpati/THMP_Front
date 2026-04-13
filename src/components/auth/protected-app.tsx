'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { useAccessToken, useTokenValidity, useLoginUser } from '@/hooks'
import {
  isAuthError,
  setStoredAccessToken,
  registerAuthErrorHandler,
  writePreviewTokenTimestamp,
  clearPreviewTokenTimestamp,
  isPreviewTokenExpired,
} from '@/services/api'
import { clearStoredCurrentUser } from '@/hooks/use-users'
import { queryKeys } from '@/lib/query-keys'
import { isPreview, previewCredentials } from '@/lib/env'

const PUBLIC_ROUTES = isPreview ? [] : ['/login', '/register']

function PreviewBootstrapError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800 max-w-md text-center">
        <p className="font-semibold">Preview bootstrap failed</p>
        <p className="mt-1 opacity-80">{message}</p>
      </div>
    </div>
  )
}

export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const loginMutation = useLoginUser()

  const accessToken = useAccessToken()
  const tokenValidity = useTokenValidity()
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const bootstrapAttemptedRef = useRef(false)

  const isPublicRoute = useMemo(() => PUBLIC_ROUTES.includes(pathname), [pathname])
  const hasToken = !!accessToken.data

  // Global 401 handler: any API call that returns an auth error triggers logout.
  useEffect(() => {
    if (isPreview) return
    return registerAuthErrorHandler(() => {
      setStoredAccessToken(null)
      queryClient.setQueryData<string | null>(queryKeys.auth.token(), null)
      queryClient.clear()
      router.replace('/login')
    })
  }, [queryClient, router])

  // Preview: clear all three tokens (access, currentUser, timestamp) when the
  // preview session is older than 15 minutes. Checked on mount and whenever the
  // tab becomes visible again (covers long-idle tab resumes).
  useEffect(() => {
    if (!isPreview) return

    function checkPreviewExpiry() {
      if (!isPreviewTokenExpired()) return
      setStoredAccessToken(null)
      clearStoredCurrentUser()
      clearPreviewTokenTimestamp()
      queryClient.setQueryData<string | null>(queryKeys.auth.token(), null)
      queryClient.clear()
      // Allow bootstrap to re-run
      bootstrapAttemptedRef.current = false
    }

    checkPreviewExpiry()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') checkPreviewExpiry()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
    // queryClient is stable; bootstrapAttemptedRef is a ref — no deps needed beyond those.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Preview: silently authenticate as the shared preview user.
  // Runs once when there is no token. If the token is later cleared
  // (e.g. expired), resets the attempt flag so it re-bootstraps.
  useEffect(() => {
    if (!isPreview) return
    if (hasToken) {
      bootstrapAttemptedRef.current = false
      return
    }
    if (bootstrapAttemptedRef.current) return

    if (!previewCredentials) {
      setBootstrapError('Preview credentials not configured (NEXT_PUBLIC_PREVIEW_EMAIL / NEXT_PUBLIC_PREVIEW_PASSWORD missing)')
      return
    }
    bootstrapAttemptedRef.current = true
    loginMutation.mutateAsync(previewCredentials)
      .then(() => { writePreviewTokenTimestamp() })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Preview bootstrap failed'
        setBootstrapError(message)
      })
    // loginMutation.mutateAsync is a stable React Query reference.
    // bootstrapAttemptedRef prevents re-runs; hasToken is the only trigger we need.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken])

  const shouldRedirectToLogin = useMemo(() => {
    if (isPreview) return false
    if (isPublicRoute) return false
    if (!hasToken) return true

    // While checking validity, don't redirect yet.
    if (tokenValidity.isLoading) return false
    // If token is known-valid, allow.
    if (tokenValidity.isSuccess && tokenValidity.data?.valid) return false
    // Token exists but isn't confirmed valid (auth error or other error) => treat as not valid.
    if (tokenValidity.isError) return true

    // Token exists but validity hasn't run (edge) => be conservative and redirect.
    return true
  }, [isPublicRoute, hasToken, tokenValidity.isLoading, tokenValidity.isSuccess, tokenValidity.data, tokenValidity.isError])

  const shouldClearToken = useMemo(() => {
    if (!hasToken) return false
    if (!tokenValidity.isError) return false
    return isAuthError(tokenValidity.error)
  }, [hasToken, tokenValidity.isError, tokenValidity.error])

  useEffect(() => {
    if (!shouldRedirectToLogin) return

    if (shouldClearToken) {
      setStoredAccessToken(null)
      queryClient.setQueryData<string | null>(queryKeys.auth.token(), null)
      queryClient.removeQueries({ queryKey: queryKeys.auth.validity(accessToken.data ?? '') })
    }

    router.replace('/login')
  }, [
    shouldRedirectToLogin,
    shouldClearToken,
    router,
    queryClient,
    accessToken.data,
  ])

  // Public routes pass through directly (empty in preview).
  if (isPublicRoute) return <>{children}</>

  // Preview bootstrap: show error or wait silently while authenticating.
  if (isPreview && !hasToken) {
    if (bootstrapError) return <PreviewBootstrapError message={bootstrapError} />
    return null
  }

  // Normal auth gate
  if (!hasToken) return null
  if (tokenValidity.isLoading) return null
  if (tokenValidity.isError) return null
  if (tokenValidity.isSuccess && tokenValidity.data?.valid) return <>{children}</>

  return null
}
