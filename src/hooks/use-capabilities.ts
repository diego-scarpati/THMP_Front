// src/hooks/use-capabilities.ts
import { capabilities } from '@/lib/feature-flags'
import type { Capabilities } from '@/lib/feature-flags'

// Returns the static capability object for the current environment.
// No state, no API calls — reads directly from feature-flags.ts.
export const useCapabilities = (): Capabilities => capabilities
