import { apiClient } from './client'
import { Company, GetCompaniesDto, PaginatedResult } from '@company-search/types'

export const companiesApi = {
  getAll: async (params?: GetCompaniesDto): Promise<PaginatedResult<Company>> => {
    const response = await apiClient.instance.get('/companies', { params })
    return response.data.data
  },

  getById: async (id: string): Promise<Company> => {
    const response = await apiClient.instance.get(`/companies/${id}`)
    return response.data.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.instance.delete(`/companies/${id}`)
  },

  deleteMany: async (ids: string[]): Promise<void> => {
    await apiClient.instance.delete('/companies/batch', { data: { ids } })
  },
}

