'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { searchHistoryApi, GroupedSearchHistory } from '@/lib/api/search-history'
import { SearchHistoryStatistics } from '@company-search/types'
import { Loading } from '@/components/common/Loading'
import { COUNTRIES } from '@company-search/types'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function HistoryPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [histories, setHistories] = useState<GroupedSearchHistory[]>([])
  const [statistics, setStatistics] = useState<SearchHistoryStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadHistories()
    loadStatistics()
  }, [filters])

  const loadHistories = async () => {
    try {
      setLoading(true)
      const result = await searchHistoryApi.getAll(filters)
      const historiesList = Array.isArray(result?.data) ? result.data : []

      setHistories(historiesList)
      setPagination({
        total: result?.total || 0,
        totalPages: result?.totalPages || 0,
      })
    } catch (error) {
      console.error('Failed to load history:', error)
      setHistories([])
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await searchHistoryApi.getStatistics()
      if (stats && !stats.topKeywords) {
        stats.topKeywords = []
      }
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load statistics:', error)
      setStatistics(null)
    }
  }

  const handleDelete = async (keywords: string) => {
    if (!confirm(t('history.deleteKeywordConfirm'))) return
    try {
      await searchHistoryApi.deleteByKeywords(keywords)
      loadHistories()
      loadStatistics()
    } catch (error) {
      console.error('Failed to delete history:', error)
      alert(t('history.deleteFailed'))
    }
  }

  const handleClearAll = async () => {
    if (!confirm(t('history.clearAllConfirm'))) return
    try {
      await searchHistoryApi.clearAll()
      loadHistories()
      loadStatistics()
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  const handleViewDetail = (keywords: string) => {
    router.push(`/history/${encodeURIComponent(keywords)}`)
  }

  return (
    <main className="px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-text-light text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            {t('history.title')}
          </p>
          <p className="text-text-secondary-light text-base font-normal leading-normal">
            {t('history.subtitle')}
          </p>
        </div>
        {histories.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-error/10 text-error text-sm font-bold hover:bg-error/20 transition-all"
          >
            <span className="material-symbols-outlined text-base">delete_sweep</span>
            <span>{t('history.clearAll')}</span>
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card-light rounded-xl p-6 shadow-sm">
            <div className="text-sm font-medium text-text-secondary-light">
              {t('history.statistics.totalSearches')}
            </div>
            <div className="mt-2 text-3xl font-bold text-text-light">
              {statistics.totalSearches}
            </div>
          </div>
          <div className="bg-card-light rounded-xl p-6 shadow-sm">
            <div className="text-sm font-medium text-text-secondary-light">
              {t('history.statistics.totalCompanies')}
            </div>
            <div className="mt-2 text-3xl font-bold text-text-light">
              {statistics.totalCompanies}
            </div>
          </div>
          <div className="bg-card-light rounded-xl p-6 shadow-sm">
            <div className="text-sm font-medium text-text-secondary-light">
              {t('history.statistics.lastSearch')}
            </div>
            <div className="mt-2 text-sm text-text-light">
              {statistics.lastSearchTime
                ? new Date(statistics.lastSearchTime).toLocaleDateString()
                : '-'}
            </div>
          </div>
          <div className="bg-card-light rounded-xl p-6 shadow-sm">
            <div className="text-sm font-medium text-text-secondary-light">
              {t('history.statistics.topKeywords')}
            </div>
            <div className="mt-2 space-y-1">
              {statistics.topKeywords && statistics.topKeywords.length > 0 ? (
                statistics.topKeywords.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm text-text-light">
                    {item.keyword} ({item.count})
                  </div>
                ))
              ) : (
                <div className="text-sm text-text-secondary-light">-</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-card-light rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : histories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary-light">{t('history.noHistory')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-hover-light text-text-secondary-light uppercase tracking-wider font-medium text-xs">
                  <tr>
                    <th className="px-6 py-3" scope="col">
                      {t('history.table.keywords')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('history.table.countries')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('history.table.searches')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('history.table.companies')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('history.table.lastSearch')}
                    </th>
                    <th className="px-6 py-3 text-right" scope="col">
                      {t('history.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {histories.map(history => (
                    <tr
                      key={history.keywords}
                      className="hover:bg-hover-light cursor-pointer"
                      onClick={() => handleViewDetail(history.keywords)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-semibold">
                            {history.keywords}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {history.countries && history.countries.length > 0 ? (
                            history.countries.map((country, idx) => (
                              <span
                                key={idx}
                                className="inline-block bg-hover-light text-text-secondary-light rounded-full px-2 py-1 text-xs"
                              >
                                {COUNTRIES[country as keyof typeof COUNTRIES] || country}
                              </span>
                            ))
                          ) : (
                            <span className="text-text-secondary-light text-sm">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-text-light font-medium">{history.totalSearches}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-text-light font-medium">{history.totalCompanies}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary-light text-sm">
                        {new Date(history.lastSearchTime).toLocaleString()}
                      </td>
                      <td
                        className="px-6 py-4 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetail(history.keywords)}
                            aria-label="View Details"
                            className="p-2 rounded-full hover:bg-primary/10 text-text-secondary-light hover:text-primary transition-all"
                            title={t('common.view')}
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                          </button>
                          <button
                            onClick={() => handleDelete(history.keywords)}
                            aria-label="Delete"
                            className="p-2 rounded-full hover:bg-error/10 text-text-secondary-light hover:text-error transition-all"
                            title={t('common.delete')}
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <nav
                aria-label="Table navigation"
                className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-t border-border-light"
              >
                <span className="text-sm font-normal text-text-secondary-light">
                  {t('companies.showing')}{' '}
                  <span className="font-semibold text-text-light">
                    {(filters.page - 1) * filters.limit + 1}-
                    {Math.min(filters.page * filters.limit, pagination.total)}
                  </span>{' '}
                  {t('companies.of')}{' '}
                  <span className="font-semibold text-text-light">{pagination.total}</span>
                </span>
                <ul className="inline-flex items-center -space-x-px">
                  <li>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                      disabled={filters.page === 1}
                      className="flex items-center justify-center h-9 px-3 ml-0 leading-tight text-text-secondary-light bg-card-light border border-border-light rounded-l-lg hover:bg-hover-light hover:text-text-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                  </li>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum: number
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (filters.page <= 3) {
                      pageNum = i + 1
                    } else if (filters.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = filters.page - 2 + i
                    }
                    return (
                      <li key={pageNum}>
                        <button
                          onClick={() => setFilters({ ...filters, page: pageNum })}
                          className={`flex items-center justify-center h-9 px-3 leading-tight border ${
                            filters.page === pageNum
                              ? 'text-primary bg-primary/10 border-primary'
                              : 'text-text-secondary-light bg-card-light border-border-light hover:bg-hover-light hover:text-text-light'
                          } transition-all`}
                        >
                          {pageNum}
                        </button>
                      </li>
                    )
                  })}
                  <li>
                    <button
                      onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                      disabled={filters.page >= pagination.totalPages}
                      className="flex items-center justify-center h-9 px-3 leading-tight text-text-secondary-light bg-card-light border border-border-light rounded-r-lg hover:bg-hover-light hover:text-text-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  )
}
