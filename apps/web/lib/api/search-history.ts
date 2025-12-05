import { apiClient } from './client'
import {
  SearchHistory,
  GetSearchHistoryDto,
  PaginatedResult,
  SearchHistoryStatistics,
  Company,
} from '@company-search/types'

export interface GroupedSearchHistory {
  keywords: string
  totalSearches: number
  totalCompanies: number
  countries: string[]
  lastSearchTime: Date
  firstSearchTime: Date
  searchHistoryIds: string[]
}

export const searchHistoryApi = {
  getAll: async (params?: GetSearchHistoryDto): Promise<PaginatedResult<GroupedSearchHistory>> => {
    const response = (await apiClient.instance.get('/search-history', { params })) as any
    // Backend returns: { success: true, data: { data: [...], total, ... } }
    // Interceptor returns response.data, so we get: { success: true, data: { data: [...], total, ... } }
    // We need to return the inner data object: { data: [...], total, ... }
    if (response?.success && response?.data) {
      return response.data
    }
    return response
  },

  getCompaniesByKeywords: async (
    keywords: string,
    page: number = 1,
    limit: number = 10,
    country?: string,
  ): Promise<PaginatedResult<Company>> => {
    const response = (await apiClient.instance.get(
      `/search-history/keywords/${encodeURIComponent(keywords)}/companies`,
      {
        params: { page, limit, ...(country && { country }) },
      },
    )) as any
    if (response?.success && response?.data) {
      return response.data
    }
    return response
  },

  getById: async (id: string): Promise<SearchHistory> => {
    const response = (await apiClient.instance.get(`/search-history/${id}`)) as any
    if (response?.success && response?.data) {
      return response.data
    }
    return response
  },

  getStatistics: async (): Promise<SearchHistoryStatistics> => {
    const response = await apiClient.instance.get('/search-history/statistics')
    return response.data || response
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.instance.delete(`/search-history/${id}`)
  },

  deleteByKeywords: async (keywords: string): Promise<void> => {
    await apiClient.instance.delete(`/search-history/keywords/${encodeURIComponent(keywords)}`)
  },

  clearAll: async (): Promise<void> => {
    await apiClient.instance.delete('/search-history/clear/all')
  },
}
