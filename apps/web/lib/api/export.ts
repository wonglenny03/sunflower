import { apiClient } from './client'
import { GetCompaniesDto } from '@company-search/types'

export const exportApi = {
  exportExcel: async (params?: GetCompaniesDto): Promise<Blob> => {
    const response = await apiClient.instance.get('/export/excel', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}

