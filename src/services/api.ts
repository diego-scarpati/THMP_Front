const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8888/api'

const ACCESS_TOKEN_STORAGE_KEY = 'thmp.accessToken'
const PREVIEW_TOKEN_TIMESTAMP_KEY = 'thmp.previewTokenTimestamp'
const PREVIEW_TOKEN_TTL_MS = 15 * 60 * 1000 // 15 minutes

export function writePreviewTokenTimestamp(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PREVIEW_TOKEN_TIMESTAMP_KEY, Date.now().toString())
  } catch {
    // ignore storage failures
  }
}

export function clearPreviewTokenTimestamp(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(PREVIEW_TOKEN_TIMESTAMP_KEY)
  } catch {
    // ignore storage failures
  }
}

/** Returns true when a preview timestamp exists and is older than 15 minutes. */
export function isPreviewTokenExpired(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = window.localStorage.getItem(PREVIEW_TOKEN_TIMESTAMP_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return true
    return Date.now() - ts > PREVIEW_TOKEN_TTL_MS
  } catch {
    return false
  }
}

let inMemoryAccessToken: string | null = null

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
type ApiBeforeRequestHandler = (
  method: ApiMethod,
  endpoint: string
) => Promise<void> | void

const apiBeforeRequestHandlers = new Set<ApiBeforeRequestHandler>()

export function registerApiBeforeRequestHandler(handler: ApiBeforeRequestHandler): () => void {
  apiBeforeRequestHandlers.add(handler)

  return () => {
    apiBeforeRequestHandlers.delete(handler)
  }
}

type AuthErrorHandler = () => void

let globalAuthErrorHandler: AuthErrorHandler | null = null

export function registerAuthErrorHandler(handler: AuthErrorHandler): () => void {
  globalAuthErrorHandler = handler
  return () => {
    if (globalAuthErrorHandler === handler) {
      globalAuthErrorHandler = null
    }
  }
}

function readAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function getStoredAccessToken(): string | null {
  if (inMemoryAccessToken) return inMemoryAccessToken
  const fromStorage = readAccessTokenFromStorage()
  if (fromStorage) {
    inMemoryAccessToken = fromStorage
  }
  return fromStorage
}

export function setStoredAccessToken(token: string | null) {
  inMemoryAccessToken = token
  if (typeof window === 'undefined') return
  try {
    if (!token) {
      window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
      return
    }
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
  } catch {
    // ignore storage failures
  }
}

export class AuthError extends Error {
  constructor(message: string = 'Not authenticated') {
    super(message)
    this.name = 'AuthError'
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError || (error instanceof Error && error.name === 'AuthError')
}

export function requireStoredAccessToken(): string {
  const token = getStoredAccessToken()
  if (!token) {
    throw new AuthError()
  }
  return token
}

export class ApiError extends Error {
  status: number
  statusText: string

  constructor(status: number, statusText: string, message: string) {
    super(message)
    this.status = status
    this.statusText = statusText
    this.name = 'ApiError'
  }
}

export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

class ApiService {
  private baseURL: string

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL
  }

  private async runBeforeRequestHandlers(method: ApiMethod, endpoint: string): Promise<void> {
    if (apiBeforeRequestHandlers.size === 0) return

    for (const handler of Array.from(apiBeforeRequestHandlers)) {
      try {
        await handler(method, endpoint)
      } catch (error) {
        // A failed hook should not prevent the original request from continuing.
        console.error(`API before-request handler failed for ${method} ${endpoint}`, error)
      }
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type')
    
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`
      
      try {
        if (contentType?.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } else {
          errorMessage = await response.text() || errorMessage
        }
      } catch {
        // If we can't parse the error, use the default message
      }

      if (response.status === 401) {
        globalAuthErrorHandler?.()
        throw new AuthError(errorMessage)
      }
      
      throw new ApiError(response.status, response.statusText, errorMessage)
    }

    if (contentType?.includes('application/json')) {
      return response.json()
    } else {
      return response.text() as unknown as T
    }
  }

  private buildHeaders(options?: RequestInit, isFormData?: boolean): HeadersInit {
    const accessToken = getStoredAccessToken()
    const incoming = options?.headers ?? {}

    const base: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...incoming,
    }

    // Attach auth header if we have a token and caller didn't override it.
    if (accessToken) {
      const hasAuthorizationHeader =
        (typeof Headers !== 'undefined' && incoming instanceof Headers && incoming.has('Authorization')) ||
        (typeof incoming === 'object' &&
          incoming !== null &&
          ('Authorization' in (incoming as Record<string, unknown>) ||
            'authorization' in (incoming as Record<string, unknown>)))

      if (!hasAuthorizationHeader) {
        return { ...base, Authorization: `Bearer ${accessToken}` }
      }
    }

    return base
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    await this.runBeforeRequestHandlers('GET', endpoint)

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.buildHeaders(options, false),
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    await this.runBeforeRequestHandlers('POST', endpoint)

    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(options, isFormData),
      body: data ? (isFormData ? (data as FormData) : JSON.stringify(data)) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.buildHeaders(options, isFormData),
      body: data ? (isFormData ? (data as FormData) : JSON.stringify(data)) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.buildHeaders(options, false),
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.buildHeaders(options, isFormData),
      body: data ? (isFormData ? (data as FormData) : JSON.stringify(data)) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }
}

export const apiService = new ApiService()
