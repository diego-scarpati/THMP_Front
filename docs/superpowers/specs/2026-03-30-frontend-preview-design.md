# Frontend Preview Environment Design

**Date:** 2026-03-30
**Status:** Approved

## Summary

Add a `preview` environment to the frontend that mirrors the backend's preview strategy: one codebase, typed env config, centralized feature flags, auto-bootstrapped auth as a shared preview user, and capability-gated UI. No login or register flows exist in preview — the app auto-authenticates on load.

---

## Environment Config

### New env vars

| Variable | Values | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development` \| `preview` \| `production` | Mirrors backend `APP_ENV` |
| `NEXT_PUBLIC_PREVIEW_EMAIL` | string | Shared preview account email. Only required when `APP_ENV=preview` |
| `NEXT_PUBLIC_PREVIEW_PASSWORD` | string | Shared preview account password. Only required when `APP_ENV=preview` |

Credentials are `NEXT_PUBLIC_` because preview credentials are intentionally shared — every tester uses them, so there is no secret to protect. Blast radius is limited to the preview environment which has no live integrations or real data.

### `src/lib/env.ts` (new)

Typed, validated module — the single place that reads env vars. Parallel to backend's `src/config/env.ts`.

```ts
export const appEnv = (process.env.NEXT_PUBLIC_APP_ENV ?? 'development') as 'development' | 'preview' | 'production'
export const isPreview = appEnv === 'preview'
export const isProduction = appEnv === 'production'
export const isDevelopment = appEnv === 'development'

export const previewCredentials = isPreview ? {
  email: process.env.NEXT_PUBLIC_PREVIEW_EMAIL!,
  password: process.env.NEXT_PUBLIC_PREVIEW_PASSWORD!,
} : null
```

---

## Feature Flags

### `src/lib/feature-flags.ts` (new)

Capability booleans derived from env. Parallel to backend's `src/config/featureFlags.ts`. This is the single source of truth for what the frontend UI enables or disables per environment.

```ts
import { isPreview } from './env'

export const capabilities = {
  canLogin: !isPreview,
  canRegister: !isPreview,
  canRunLiveScraping: !isPreview,
  canRunJobEvaluation: !isPreview,
  canRunAiJobScoring: !isPreview,
  canRunAiResumeParsing: !isPreview,
  canEditProfile: true,
  canUploadResume: true,
}
```

Default preview posture (mirrors backend capability matrix defaults):

| Capability | Preview default |
|---|---|
| Login / Register | disabled |
| Live scraping (seek/indeed) | disabled |
| Job formula evaluation | disabled |
| AI job scoring (LLM) | disabled |
| AI resume parsing | disabled |
| Profile edits | enabled |
| Resume upload/save | enabled |
| Keyword / inclusion / exclusion edits | enabled |
| Job state writes (seen, saved, applied) | enabled |

---

## Auth Bootstrap

### Strategy

In preview mode, `ProtectedApp` auto-authenticates as the shared preview user using `NEXT_PUBLIC_PREVIEW_EMAIL` / `NEXT_PUBLIC_PREVIEW_PASSWORD`. No login screen is shown. The existing token lifecycle (storage, validity check, expiry) works unchanged after bootstrap.

### `ProtectedApp` changes

- `PUBLIC_ROUTES` (`/login`, `/register`) are removed from the pass-through list in preview — these routes are unreachable via middleware anyway, but `ProtectedApp` must not redirect to them either.
- When `isPreview` and no valid token exists: fire the login mutation with `previewCredentials`, render `null` while pending.
- On bootstrap success: token is stored and the normal validity flow takes over.
- On bootstrap failure (bad credentials, backend unreachable): render an error message in place of the app. No redirect — there is nowhere to redirect to in preview.
- The existing redirect-to-login logic is suppressed when `isPreview`.

### Preview load state machine

```
App loads (APP_ENV=preview)
  └─ No token
       └─ ProtectedApp triggers bootstrap → renders null
            └─ Login mutation fires with previewCredentials
                 └─ Token stored
                      └─ tokenValidity confirms valid
                           └─ Render children (jobs / profile)
```

---

## Routing

### `middleware.ts` (new, project root)

Redirects `/login` and `/register` to `/jobs` when `APP_ENV=preview`. Runs at the edge before any page renders. This is the single place that makes auth routes unreachable in preview.

| Route | `development` / `production` | `preview` |
|---|---|---|
| `/login` | rendered normally | → `/jobs` |
| `/register` | rendered normally | → `/jobs` |
| `/jobs` | requires valid token | accessible (auto-bootstrapped) |
| `/profile` | requires valid token | accessible (auto-bootstrapped) |

The login and register page files remain in the codebase unchanged — one codebase, same as the backend philosophy. They are unreachable in preview, not deleted.

---

## Capability Gating

### `src/hooks/use-capabilities.ts` (new)

```ts
import { capabilities } from '@/lib/feature-flags'
export const useCapabilities = () => capabilities
```

No state, no API call. Returns the static capability object from `feature-flags.ts`.

### Gating pattern

Capability-gated actions are **disabled with a tooltip** rather than hidden. This gives preview users feedback that a feature exists but is off in this environment.

```tsx
const { canRunAiJobScoring } = useCapabilities()
<button
  disabled={!canRunAiJobScoring}
  title={!canRunAiJobScoring ? 'Not available in preview' : undefined}
>
  Run AI Scoring
</button>
```

### Gated UI elements

| UI element | Capability flag |
|---|---|
| AI job scoring / LLM approval buttons | `canRunAiJobScoring` |
| Formula evaluation buttons | `canRunJobEvaluation` |
| Seek / Indeed scrape buttons | `canRunLiveScraping` |
| Resume AI parse button | `canRunAiResumeParsing` |

Gating is applied directly at call sites using `useCapabilities()`. No wrapper component abstraction.

---

## What Is Not Changing

- Page files for `/login` and `/register` — unchanged, just unreachable in preview
- `apiService` and all endpoint functions — unchanged
- React Query configuration — unchanged
- All query hooks — unchanged
- Profile and jobs UI — unchanged except for capability-gated buttons

---

## Assumptions

- The backend preview environment is deployed and accessible before this frontend preview is tested.
- The shared preview account exists in the preview DB and its credentials are available as env vars.
- The backend's `APP_ENV=preview` disables arbitrary account creation, so the shared credentials are the only way to authenticate.
- `GET /api/users/context` (backend Phase 1) is not required for this frontend implementation. Capability flags are derived from `NEXT_PUBLIC_APP_ENV` alone. Consuming the context endpoint can be added in a later phase if the capability matrix becomes dynamic.

---

## Future Phases

- **Phase 2:** Consume `GET /api/users/context` to sync capability flags dynamically with backend runtime state (e.g., per-deploy overrides).
- **Phase 3:** Add a visible "Preview environment" banner so testers know they're in preview.
