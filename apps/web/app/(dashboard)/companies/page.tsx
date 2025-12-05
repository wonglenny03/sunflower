'use client'

import { useState, useEffect } from 'react'
import { companiesApi } from '@/lib/api/companies'
import { emailApi } from '@/lib/api/email'
import { exportApi } from '@/lib/api/export'
import { Company } from '@company-search/types'
import { Loading } from '@/components/common/Loading'
import { COUNTRIES } from '@company-search/types'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function CompaniesPage() {
  const { t } = useTranslation()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [keywordFilter, setKeywordFilter] = useState('')
  const [filters, setFilters] = useState<{
    page: number
    limit: number
    country: string
    emailStatus?: 'not_sent' | 'sent' | 'failed'
  }>({
    page: 1,
    limit: 10,
    country: '',
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    loadCompanies()
  }, [filters])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const result = await companiesApi.getAll(filters)
      // Filter by keyword on client side if needed
      let filteredData = result.data
      if (keywordFilter) {
        filteredData = filteredData.filter(
          (c) =>
            c.companyName.toLowerCase().includes(keywordFilter.toLowerCase()) ||
            c.email?.toLowerCase().includes(keywordFilter.toLowerCase())
        )
      }
      setCompanies(filteredData)
      setPagination({
        total: result.total,
        totalPages: result.totalPages,
      })
    } catch (error) {
      console.error('Failed to load companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('companies.deleteConfirm'))) return
    try {
      await companiesApi.delete(id)
      loadCompanies()
    } catch (error) {
      console.error('Failed to delete company:', error)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(t('companies.batchDeleteConfirm', { count: selectedIds.length }))) return
    try {
      await companiesApi.deleteMany(selectedIds)
      setSelectedIds([])
      loadCompanies()
    } catch (error) {
      console.error('Failed to delete companies:', error)
    }
  }

  const handleSendEmail = async (companyId: string) => {
    try {
      await emailApi.send({ companyId })
      alert(t('companies.emailSent'))
      loadCompanies()
    } catch (error) {
      alert(t('companies.emailFailed'))
    }
  }

  const handleBatchSendEmail = async () => {
    if (selectedIds.length === 0) return
    try {
      await emailApi.batchSend({ companyIds: selectedIds })
      alert(t('companies.emailsSent'))
      setSelectedIds([])
      loadCompanies()
    } catch (error) {
      alert(t('companies.emailFailed'))
    }
  }

  const handleExport = async () => {
    try {
      const blob = await exportApi.exportExcel(filters)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `companies_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert(t('companies.exportFailed'))
    }
  }

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 10, country: '' })
    setKeywordFilter('')
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === companies.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(companies.map((c) => c.id))
    }
  }

  const countryOptions = [
    { value: '', label: t('companies.filterByCountry') },
    ...Object.entries(COUNTRIES).map(([value, label]) => ({ value, label })),
  ]

  const statusOptions = [
    { value: '', label: t('companies.filterByEmailStatus') },
    { value: 'not_sent', label: t('companies.status.notSent') },
    { value: 'sent', label: t('companies.status.sent') },
    { value: 'failed', label: t('companies.status.failed') },
    { value: 'bounced', label: t('companies.status.bounced') },
  ]

  const getStatusBadge = (status?: string) => {
    if (status === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
          <span className="size-1.5 rounded-full bg-success"></span>
          {t('companies.status.sent')}
        </span>
      )
    }
    if (status === 'failed') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-error/10 px-2 py-1 text-xs font-medium text-error">
          <span className="size-1.5 rounded-full bg-error"></span>
          {t('companies.status.failed')}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-text-secondary-light/10 px-2 py-1 text-xs font-medium text-text-secondary-light">
        <span className="size-1.5 rounded-full bg-text-secondary-light"></span>
        {t('companies.status.notSent')}
      </span>
    )
  }

  return (
    <main className="px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-text-light text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            {t('companies.title')}
          </p>
          <p className="text-text-secondary-light text-base font-normal leading-normal">
            {t('companies.subtitle') || 'Manage and export company information'}
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="bg-card-light rounded-xl shadow-sm overflow-hidden">
        {/* Filter & Actions Bar */}
        <div className="p-4 border-b border-border-light flex flex-wrap items-center gap-4">
          <div className="flex-1 flex flex-wrap gap-2 min-w-[200px]">
            <div className="relative">
              <input
                className="form-input w-full md:w-48 pl-10 pr-4 py-2 h-10 border border-border-light rounded-lg bg-card-light text-sm placeholder:text-text-secondary-light focus:ring-2 focus:ring-primary/50 focus:outline-none"
                placeholder={t('companies.filterByKeyword')}
                value={keywordFilter}
                onChange={(e) => setKeywordFilter(e.target.value)}
              />
              <span
                aria-hidden="true"
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary-light"
              >
                search
              </span>
            </div>
            <select
              className="form-select w-full md:w-auto h-10 border border-border-light rounded-lg bg-card-light text-sm text-text-secondary-light focus:ring-2 focus:ring-primary/50 focus:outline-none"
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value, page: 1 })}
            >
              {countryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className="form-select w-full md:w-auto h-10 border border-border-light rounded-lg bg-card-light text-sm text-text-secondary-light focus:ring-2 focus:ring-primary/50 focus:outline-none"
              value={filters.emailStatus || ''}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  emailStatus: e.target.value
                    ? (e.target.value as 'not_sent' | 'sent' | 'failed')
                    : undefined,
                  page: 1,
                })
              }
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleClearFilters}
              className="h-10 px-4 flex items-center gap-2 text-sm text-text-secondary-light hover:text-primary transition-all"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">
                cancel
              </span>
              <span>{t('companies.clearFilters')}</span>
            </button>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">
              download
            </span>
            <span>{t('companies.export')}</span>
          </button>
        </div>

        {/* Batch Actions */}
        {selectedIds.length > 0 && (
          <div className="p-4 border-b border-border-light flex gap-2">
            <button
              onClick={handleBatchDelete}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-error/10 text-error text-sm font-bold hover:bg-error/20 transition-all"
            >
              <span className="material-symbols-outlined text-base">delete</span>
              <span>
                {t('companies.deleteSelected')} ({selectedIds.length})
              </span>
            </button>
            <button
              onClick={handleBatchSendEmail}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all"
            >
              <span className="material-symbols-outlined text-base">mail</span>
              <span>
                {t('companies.sendEmailSelected')} ({selectedIds.length})
              </span>
            </button>
          </div>
        )}

        {/* Results Data Table */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary-light">{t('companies.noCompanies')}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-hover-light text-text-secondary-light uppercase tracking-wider font-medium text-xs">
                  <tr>
                    <th className="px-6 py-3" scope="col">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === companies.length && companies.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-border-light text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.companyName')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.phone')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.email')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.website')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.country')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.keywords')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.createdTime')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.status')}
                    </th>
                    <th className="px-6 py-3 text-right" scope="col">
                      {t('companies.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {companies.map((company) => (
                    <tr key={company.id} className="hover:bg-hover-light">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(company.id)}
                          onChange={() => toggleSelect(company.id)}
                          className="rounded border-border-light text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-text-light whitespace-nowrap">
                        {company.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary-light">
                        {company.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary-light">
                        {company.email || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {company.website}
                          </a>
                        ) : (
                          <span className="text-text-secondary-light">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary-light">
                        {COUNTRIES[company.country as keyof typeof COUNTRIES] || company.country}
                      </td>
                      <td className="px-6 py-4">
                        {company.keywords ? (
                          <span className="inline-block bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-semibold">
                            {company.keywords}
                          </span>
                        ) : (
                          <span className="text-text-secondary-light">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary-light">
                        {new Date(company.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(company.emailStatus)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendEmail(company.id)}
                            disabled={company.emailStatus === 'sent'}
                            aria-label="Send Email"
                            className="p-2 rounded-full hover:bg-primary/10 text-text-secondary-light hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          >
                            <span className="material-symbols-outlined text-base">mail</span>
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            aria-label="Delete"
                            className="p-2 rounded-full hover:bg-error/10 text-text-secondary-light hover:text-error transition-all"
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
            <nav
              aria-label="Table navigation"
              className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border-t border-border-light"
            >
              <span className="text-sm font-normal text-text-secondary-light">
                {t('companies.showing')}{' '}
                <span className="font-semibold text-text-light">
                  {companies.length > 0 ? (filters.page - 1) * filters.limit + 1 : 0}-
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
                  let pageNum
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
          </>
        )}
      </div>
    </main>
  )
}
