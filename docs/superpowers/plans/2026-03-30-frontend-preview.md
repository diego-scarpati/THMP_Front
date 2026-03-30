# Frontend Preview Environment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `preview` environment to the frontend that auto-authenticates as a shared preview user, disables login/register routes, and capability-gates risky UI actions — mirroring the backend's preview strategy.

**Architecture:** One codebase, one `NEXT_PUBLIC_APP_ENV` env var. A typed `env.ts` derives `isPreview`. A `feature-flags.ts` derives capability booleans from `isPreview`. `ProtectedApp` auto-bootstraps the shared preview account on load instead of redirecting to `/login`. Next.js middleware redirects `/login` and `/register` to `/jobs` in preview. A `useCapabilities()` hook exposes the flags to components that gate risky actions.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TanStack React Query v5, Tailwind CSS v4

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/lib/env.ts` | Typed env module — single source for `NEXT_PUBLIC_APP_ENV` and preview credentials |
| Create | `src/lib/feature-flags.ts` | Capability booleans derived from `isPreview` |
| Create | `src/hooks/use-capabilities.ts` | React hook wrapping the capability object |
| Create | `src/middleware.ts` | Edge middleware redirecting `/login`+`/register` → `/jobs` in preview |
| Modify | `src/components/auth/protected-app.tsx` | Add preview auto-bootstrap; suppress redirect-to-login |
| Modify | `src/hooks/index.ts` | Export `useCapabilities` |
| Modify | `src/components/searchBar/search-bar.tsx` | Gate scraping search button with `canRunLiveScraping` |
| Modify | `src/components/profile/resume-form.tsx` | Gate "Autocomplete with AI" button with `canRunAiResumeParsing` |
| Modify | `.env.local` | Add `NEXT_PUBLIC_APP_ENV=development` |

---

## Task 1: Create `src/lib/env.ts` and add env vars

**Files:**
- Create: `src/lib/env.ts`
- Modify: `.env.local`

- [ ] **Step 1: Add `NEXT_PUBLIC_APP_ENV` to `.env.local`**

Open `.env.local`. It currently contains:
```
# Frontend environment variables
NEXT_PUBLIC_BACKEND_URL=http://localhost:8888/api
# NEXT_PUBLIC_BACKEND_URL=https://thmp-api.onrender.com/api
```

Add these lines at the end:
```
NEXT_PUBLIC_APP_ENV=development
# NEXT_PUBLIC_PREVIEW_EMAIL=preview@example.com
# NEXT_PUBLIC_PREVIEW_PASSWORD=preview-password
```

The preview credentials are commented out — they only need to be set in the actual preview deployment environment.

- [ ] **Step 2: Create `src/lib/env.ts`**

```ts
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors. If you see errors about `NEXT_PUBLIC_APP_ENV` not being in `ProcessEnv`, that is fine — Next.js inlines these at build time and TypeScript's `ProcessEnv` doesn't always know about them.

- [ ] **Step 4: Commit**

```bash
git add src/lib/env.ts .env.local
git commit -m "feat: add typed env module and NEXT_PUBLIC_APP_ENV"
```

---

## Task 2: Create `src/lib/feature-flags.ts`

**Files:**
- Create: `src/lib/feature-flags.ts`

- [ ] **Step 1: Create `src/lib/feature-flags.ts`**

```ts
// src/lib/feature-flags.ts
// Capability booleans derived from the current environment.
// Mirrors backend src/config/featureFlags.ts.
// The backend enforces these rules server-side; these flags are UI-only guards
// that disable buttons for actions that would return 403 FEATURE_DISABLED anyway.

import { isPreview } from './env'

export const capabilities = {
  // Auth
  canLogin: !isPreview,
  canRegister: !isPreview,

  // Live data fetching
  canRunLiveScraping: !isPreview,

  // AI / evaluation
  canRunJobEvaluation: !isPreview,
  canRunAiJobScoring: !isPreview,
  canRunAiResumeParsing: !isPreview,

  // Profile and data writes — allowed in preview by default
  canEditProfile: true,
  canUploadResume: true,
} as const

export type Capabilities = typeof capabilities
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/feature-flags.ts
git commit -m "feat: add centralized feature flags derived from APP_ENV"
```

---

## Task 3: Create `src/hooks/use-capabilities.ts` and export it

**Files:**
- Create: `src/hooks/use-capabilities.ts`
- Modify: `src/hooks/index.ts`

- [ ] **Step 1: Create `src/hooks/use-capabilities.ts`**

```ts
// src/hooks/use-capabilities.ts
import { capabilities } from '@/lib/feature-flags'
import type { Capabilities } from '@/lib/feature-flags'

// Returns the static capability object for the current environment.
// No state, no API calls — reads directly from feature-flags.ts.
export const useCapabilities = (): Capabilities => capabilities
```

- [ ] **Step 2: Add export to `src/hooks/index.ts`**

Open `src/hooks/index.ts`. At the end of the file, after the last export block, add:

```ts
// Capability hooks
export { useCapabilities } from './use-capabilities'
```

- [ ] **Step 3: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-capabilities.ts src/hooks/index.ts
git commit -m "feat: add useCapabilities hook"
```

---

## Task 4: Create `src/middleware.ts`

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create `src/middleware.ts`**

```ts
// src/middleware.ts
// Redirects /login and /register to /jobs when APP_ENV=preview.
// Runs at the edge before any page renders.

import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV

  if (appEnv !== 'preview') {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/jobs', request.url))
}

export const config = {
  matcher: ['/login', '/register'],
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors. The `next/server` types are available from the Next.js installation.

- [ ] **Step 3: Verify lint**

Run:
```bash
npm run lint
```

Expected: no errors or warnings related to `middleware.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add middleware to redirect login/register to jobs in preview"
```

---

## Task 5: Update `ProtectedApp` for preview bootstrap

**Files:**
- Modify: `src/components/auth/protected-app.tsx`

The current file is 76 lines. Replace it entirely with the version below which adds:
- `isPreview` check that suppresses redirect-to-login
- Auto-bootstrap via `loginMutation` using `previewCredentials`
- `PreviewBootstrapError` fallback shown when bootstrap fails
- `PUBLIC_ROUTES` becomes empty `[]` in preview (login/register unreachable anyway via middleware)

- [ ] **Step 1: Replace `src/components/auth/protected-app.tsx`**

```tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

import { useAccessToken, useTokenValidity, useLoginUser } from '@/hooks'
import { isAuthError, setStoredAccessToken } from '@/services/api'
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
    if (!previewCredentials) return

    bootstrapAttemptedRef.current = true
    loginMutation.mutateAsync(previewCredentials).catch((err: unknown) => {
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

    if (tokenValidity.isLoading) return false
    if (tokenValidity.isSuccess && tokenValidity.data?.valid) return false
    if (tokenValidity.isError) return true

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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify lint**

Run:
```bash
npm run lint
```

Expected: no errors. If ESLint reports the `eslint-disable-next-line` comment as unnecessary (only happens if the ESLint config doesn't enforce `react-hooks/exhaustive-deps`), remove the comment — the code is still correct.

- [ ] **Step 4: Commit**

```bash
git add src/components/auth/protected-app.tsx
git commit -m "feat: add preview auto-bootstrap in ProtectedApp"
```

---

## Task 6: Gate scraping in `src/components/searchBar/search-bar.tsx`

**Files:**
- Modify: `src/components/searchBar/search-bar.tsx`

The search button at the top of the file triggers live scraping (LinkedIn, Seek, All). The Enter key on the input also triggers it. Both must respect `canRunLiveScraping`.

- [ ] **Step 1: Add `useCapabilities` import**

In `src/components/searchBar/search-bar.tsx`, the current imports are:

```ts
import {
  useSearchAndCreateWithAllKeywords,
  useSeekAllKeywords,
  useIndeedAllKeywords,
} from "@/hooks";
```

Replace with:

```ts
import {
  useSearchAndCreateWithAllKeywords,
  useSeekAllKeywords,
  useIndeedAllKeywords,
  useCapabilities,
} from "@/hooks";
```

- [ ] **Step 2: Add capability check inside `SearchBar`**

Inside the `SearchBar` component, the existing hook calls are:
```ts
const searchAndCreateJobs = useSearchAndCreateWithAllKeywords();
const seekAllKeywords = useSeekAllKeywords();
const indeedAllKeywords = useIndeedAllKeywords();
```

Add one line directly after them:
```ts
const { canRunLiveScraping } = useCapabilities();
```

- [ ] **Step 3: Gate the Enter key handler on the input**

Find the `onKeyDown` handler on the `<input>` element (around line 128). It currently reads:

```tsx
onKeyDown={(e) => {
  if (
    e.key === "Enter" &&
    searchBarKeyword.trim().length > 1
  ) {
    e.preventDefault();
    const next = [...typedKeywords, searchBarKeyword.trim()];
    setTypedKeywords(next);
    setSearchBarKeyword("");
    handleSearchNewJobs(next);
  }
}}
```

Add `&& canRunLiveScraping` to the condition:

```tsx
onKeyDown={(e) => {
  if (
    e.key === "Enter" &&
    searchBarKeyword.trim().length > 1 &&
    canRunLiveScraping
  ) {
    e.preventDefault();
    const next = [...typedKeywords, searchBarKeyword.trim()];
    setTypedKeywords(next);
    setSearchBarKeyword("");
    handleSearchNewJobs(next);
  }
}}
```

- [ ] **Step 4: Gate the search button**

Find the search submit `<button>` (around line 170). It currently has:

```tsx
<button
  type="button"
  onClick={() => handleSearchNewJobs()}
  disabled={
    searchAndCreateJobs.isPending || seekAllKeywords.isPending
  }
  aria-busy={
    searchAndCreateJobs.isPending || seekAllKeywords.isPending
  }
```

Replace its `disabled` prop and add `title`:

```tsx
<button
  type="button"
  onClick={() => handleSearchNewJobs()}
  disabled={
    !canRunLiveScraping ||
    searchAndCreateJobs.isPending ||
    seekAllKeywords.isPending
  }
  aria-busy={
    searchAndCreateJobs.isPending || seekAllKeywords.isPending
  }
  title={!canRunLiveScraping ? 'Not available in preview' : undefined}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/searchBar/search-bar.tsx
git commit -m "feat: gate live scraping search button with canRunLiveScraping"
```

---

## Task 7: Gate AI parse in `src/components/profile/resume-form.tsx`

**Files:**
- Modify: `src/components/profile/resume-form.tsx`

The "Autocomplete with AI" button at line ~700 calls `analyseByAI` which internally calls `parseResume.mutateAsync`. It must be disabled with a tooltip when `canRunAiResumeParsing` is `false`.

- [ ] **Step 1: Add `useCapabilities` import**

In `src/components/profile/resume-form.tsx`, the current hook imports (lines 8–13) are:

```ts
import {
  useCreateResume,
  useDeleteResume,
  useResume,
  useUpdateResume,
  useParseResume,
} from "@/hooks";
```

Replace with:

```ts
import {
  useCreateResume,
  useDeleteResume,
  useResume,
  useUpdateResume,
  useParseResume,
  useCapabilities,
} from "@/hooks";
```

- [ ] **Step 2: Add capability check inside `ResumeForm`**

`ResumeForm` starts at line 225. The existing hook calls at the top of the component are:

```ts
const resumeQuery = useResume();
const createResume = useCreateResume();
const updateResume = useUpdateResume();
const deleteResume = useDeleteResume();
const parseResume = useParseResume();
```

Add one line directly after `parseResume`:

```ts
const { canRunAiResumeParsing } = useCapabilities();
```

- [ ] **Step 3: Gate the "Autocomplete with AI" button**

Find the button around line 699 (inside the block `{resumeFile ? ( ... ) : null}`). It currently reads:

```tsx
{resumeFile ? (
  <button
    type="button"
    disabled={busy}
    onClick={analyseByAI}
    className={cn(
      "rounded-full border border-congress-blue-900 bg-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-congress-blue-500 hover:border-congress-blue-500",
      busy && "opacity-60 cursor-not-allowed"
    )}
  >
    Autocomplete with AI
  </button>
) : null}
```

Replace with:

```tsx
{resumeFile ? (
  <button
    type="button"
    disabled={busy || !canRunAiResumeParsing}
    onClick={analyseByAI}
    title={!canRunAiResumeParsing ? 'Not available in preview' : undefined}
    className={cn(
      "rounded-full border border-congress-blue-900 bg-congress-blue-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-congress-blue-500 hover:border-congress-blue-500",
      (busy || !canRunAiResumeParsing) && "opacity-60 cursor-not-allowed"
    )}
  >
    Autocomplete with AI
  </button>
) : null}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/profile/resume-form.tsx
git commit -m "feat: gate AI resume parse button with canRunAiResumeParsing"
```

---

## Task 8: Full build verification

**Files:** none

- [ ] **Step 1: Run the full production build**

Run:
```bash
npm run build
```

Expected: build completes successfully with no TypeScript or compilation errors. Warnings about `console.log` statements in existing code are pre-existing and can be ignored.

- [ ] **Step 2: Run lint on the full codebase**

Run:
```bash
npm run lint
```

Expected: no new errors introduced by this work.

- [ ] **Step 3: Manual verification checklist (development mode)**

Run the dev server:
```bash
npm run dev
```

With `NEXT_PUBLIC_APP_ENV=development` (the default in `.env.local`):
- [ ] `/login` loads the login page normally
- [ ] `/register` loads the register page normally
- [ ] Search bar search button is enabled
- [ ] "Autocomplete with AI" button is enabled when a resume file is selected
- [ ] Logging in stores a token and redirects to `/jobs`

To test preview mode locally, temporarily set `NEXT_PUBLIC_APP_ENV=preview` and valid preview credentials in `.env.local`, then restart the dev server:
- [ ] Navigating to `/login` redirects immediately to `/jobs`
- [ ] Navigating to `/register` redirects immediately to `/jobs`
- [ ] App loads directly at `/jobs` without a login screen
- [ ] Search bar search button is disabled and shows "Not available in preview" tooltip
- [ ] "Autocomplete with AI" button is disabled and shows "Not available in preview" tooltip
- [ ] Profile page loads and profile edits work normally
- [ ] Resume upload (without AI parse) works normally

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify full build passes for frontend preview environment"
```

---

## Environment Setup Reference

For the actual preview deployment, set these env vars in the hosting platform (Vercel, etc.):

```
NEXT_PUBLIC_APP_ENV=preview
NEXT_PUBLIC_BACKEND_URL=https://<preview-backend-url>/api
NEXT_PUBLIC_PREVIEW_EMAIL=<shared preview account email>
NEXT_PUBLIC_PREVIEW_PASSWORD=<shared preview account password>
```

The preview backend must have `APP_ENV=preview` set and the shared preview user must exist in the preview DB before the frontend preview is tested.
