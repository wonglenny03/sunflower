import { apiClient } from './client'
import { EmailTemplate } from '@company-search/types'

export interface CreateEmailTemplateDto {
  name: string
  subject: string
  content: string
  isDefault?: boolean
}

export interface UpdateEmailTemplateDto {
  name?: string
  subject?: string
  content?: string
  isDefault?: boolean
}

export const emailTemplatesApi = {
  getAll: async (): Promise<EmailTemplate[]> => {
    // apiClient 的响应拦截器已经返回了 response.data
    // 后端直接返回数组
    const response = await apiClient.instance.get('/email-templates')
    // 确保返回的是数组
    if (Array.isArray(response)) {
      return response
    }
    // 如果后端返回的是包装对象，尝试获取 data 字段
    if (response && typeof response === 'object' && 'data' in response) {
      return Array.isArray(response.data) ? response.data : []
    }
    return []
  },

  getById: async (id: string): Promise<EmailTemplate> => {
    // apiClient 的响应拦截器已经返回了 response.data
    const response = await apiClient.instance.get(`/email-templates/${id}`)
    return response
  },

  getDefault: async (): Promise<EmailTemplate | null> => {
    try {
      // apiClient 的响应拦截器已经返回了 response.data
      const response = await apiClient.instance.get('/email-templates/default')
      return response
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  create: async (data: CreateEmailTemplateDto): Promise<EmailTemplate> => {
    // apiClient 的响应拦截器已经返回了 response.data
    const response = await apiClient.instance.post('/email-templates', data)
    return response
  },

  update: async (
    id: string,
    data: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> => {
    // apiClient 的响应拦截器已经返回了 response.data
    const response = await apiClient.instance.put(`/email-templates/${id}`, data)
    return response
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.instance.delete(`/email-templates/${id}`)
  },

  setDefault: async (id: string): Promise<EmailTemplate> => {
    // apiClient 的响应拦截器已经返回了 response.data
    const response = await apiClient.instance.put(
      `/email-templates/${id}/set-default`,
    )
    return response
  },

  initDefaults: async (): Promise<void> => {
    await apiClient.instance.post('/email-templates/init-defaults')
  },
}



