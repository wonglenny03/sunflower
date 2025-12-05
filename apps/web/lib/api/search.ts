import { apiClient } from './client'
import { SearchCompanyDto, CompanySearchResult } from '@company-search/types'

export const searchApi = {
  searchCompanies: async (data: SearchCompanyDto): Promise<CompanySearchResult> => {
    // The interceptor already unwraps response.data, so we access .data directly
    const response = await apiClient.instance.post('/search/companies', data)
    return response.data || response
  },
}

