import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

      // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        // Handle network errors
        if (!error.response) {
          console.error('Network Error:', error.message)
          const networkError = new Error(
            'Network Error: Cannot connect to server. Please make sure the backend is running on http://localhost:3001'
          )
          return Promise.reject(networkError)
        }

        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            // Clear auth store
            const authStorage = localStorage.getItem('auth-storage')
            if (authStorage) {
              try {
                const auth = JSON.parse(authStorage)
                if (auth.state) {
                  auth.state.user = null
                  auth.state.token = null
                  auth.state.isAuthenticated = false
                  localStorage.setItem('auth-storage', JSON.stringify(auth))
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
            // Only redirect if not already on login/register page
            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
              window.location.href = '/login'
            }
          }
        }
        // Preserve error response data for better error handling
        return Promise.reject(error)
      },
    )
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem('token', token)
  }

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem('token')
  }

  get instance(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()

