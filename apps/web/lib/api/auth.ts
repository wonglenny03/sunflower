import { apiClient } from './client'
import { RegisterDto, LoginDto, AuthResponse } from '@company-search/types'

export const authApi = {
  register: async (data: RegisterDto): Promise<AuthResponse> => {
    try {
      const response: any = await apiClient.instance.post('/auth/register', data)
      // Response interceptor already returns response.data
      if (response.success && response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken)
        return response.data
      }
      throw new Error(response.message || 'Registration failed')
    } catch (error: any) {
      // Re-throw with better error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    try {
      const response: any = await apiClient.instance.post('/auth/login', data)
      // Response interceptor already returns response.data
      if (response.success && response.data?.accessToken) {
        apiClient.setToken(response.data.accessToken)
        return response.data
      }
      throw new Error(response.message || 'Login failed')
    } catch (error: any) {
      // Re-throw with better error message
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  },

  logout: async () => {
    apiClient.removeToken()
    // Clear auth store will be handled by the component calling this
  },

  getProfile: async () => {
    const response = await apiClient.instance.get('/users/profile')
    return response.data.data
  },
}

