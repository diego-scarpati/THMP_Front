const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8888/api'

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
      
      throw new ApiError(response.status, response.statusText, errorMessage)
    }

    if (contentType?.includes('application/json')) {
      return response.json()
    } else {
      return response.text() as unknown as T
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })

    return this.handleResponse<T>(response)
  }
}

export const apiService = new ApiService()
