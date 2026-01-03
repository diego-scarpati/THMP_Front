'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { useAccessToken, useTokenValidity } from '@/hooks'
import { isAuthError, setStoredAccessToken } from '@/services/api'
import { queryKeys } from '@/lib/query-keys'

const PUBLIC_ROUTES = ['/login', '/register']

export function ProtectedApp({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()

  const accessToken = useAccessToken()
  const tokenValidity = useTokenValidity()

  const isPublicRoute = useMemo(() => PUBLIC_ROUTES.includes(pathname), [pathname])
  const hasToken = !!accessToken.data

  const shouldRedirectToLogin = useMemo(() => {
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

  // Render normally on public routes
  if (isPublicRoute) return <>{children}</>

  // For protected routes, avoid rendering content while redirecting or validating.
  if (!hasToken) return null
  if (tokenValidity.isLoading) return null
  if (tokenValidity.isError) return null
  if (tokenValidity.isSuccess && tokenValidity.data?.valid) return <>{children}</>

  return null

}
