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
