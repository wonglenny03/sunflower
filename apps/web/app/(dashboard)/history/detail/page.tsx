'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { searchHistoryApi } from '@/lib/api/search-history'
import { emailApi } from '@/lib/api/email'
import { Company } from '@company-search/types'
import { Loading } from '@/components/common/Loading'
import { COUNTRIES } from '@company-search/types'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function HistoryDetailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const keywords = searchParams?.get('keywords') || ''
  const countryFilter = searchParams?.get('country') || ''

  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>(countryFilter)
  const [availableCountries, setAvailableCountries] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    if (keywords) {
      loadCompanies()
      loadAvailableCountries()
    }
  }, [keywords, selectedCountry, pagination.page])

  const loadAvailableCountries = async () => {
    if (!keywords) return
    try {
      // Get all companies for this keyword to extract unique countries
      const result = await searchHistoryApi.getCompaniesByKeywords(keywords, 1, 1000)
      const countries = Array.from(
        new Set((result.data || []).map((c: Company) => c.country)),
      ) as string[]
      setAvailableCountries(countries)
    } catch (error) {
      console.error('Failed to load countries:', error)
    }
  }

  const loadCompanies = async () => {
    if (!keywords) return

    try {
      setLoading(true)
      const result = await searchHistoryApi.getCompaniesByKeywords(
        keywords,
        pagination.page,
        pagination.limit,
        selectedCountry || undefined,
      )
      setCompanies(result.data || [])
      setPagination((prev) => ({
        ...prev,
        total: result.total || 0,
        totalPages: result.totalPages || 0,
      }))
    } catch (error) {
      console.error('Failed to load companies:', error)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (companyId: string) => {
    try {
      setSending(true)
      await emailApi.send({ companyId })
      alert(t('companies.emailSent'))
      loadCompanies()
    } catch (error) {
      alert(t('companies.emailFailed'))
    } finally {
      setSending(false)
    }
  }

  const handleBatchSendEmail = async () => {
    if (selectedIds.length === 0) {
      alert(t('companies.noSelection'))
      return
    }

    try {
      setSending(true)
      await emailApi.batchSend({ companyIds: selectedIds })
      alert(t('companies.emailsSent'))
      setSelectedIds([])
      loadCompanies()
    } catch (error) {
      alert(t('companies.emailFailed'))
    } finally {
      setSending(false)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const toggleSelectAll = () => {
    const notSentCompanies = companies.filter((c) => c.emailStatus !== 'sent')
    if (selectedIds.length === notSentCompanies.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(notSentCompanies.map((c) => c.id))
    }
  }

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

  if (!keywords) {
    return (
      <main className="px-4 sm:px-6 md:px-10 py-8">
        <div className="bg-card-light rounded-xl p-12 text-center shadow-sm">
          <p className="text-lg text-text-secondary-light">{t('history.detail.notFound')}</p>
          <button
            onClick={() => router.push('/history')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
          >
            {t('common.back')} {t('nav.history')}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/history')}
              className="p-2 rounded-lg hover:bg-hover-light transition-all"
            >
              <span className="material-symbols-outlined text-text-secondary-light">
                arrow_back
              </span>
            </button>
            <p className="text-text-light text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
              {t('history.detail.title')}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-secondary-light">
                {t('history.detail.keywords')}:
              </span>
              <span className="inline-block bg-primary/10 text-primary rounded-full px-3 py-1.5 text-sm font-semibold">
                {keywords}
              </span>
            </div>
            {pagination.total > 0 && (
              <div className="text-sm text-text-secondary-light">
                {t('history.detail.resultsFound')}:{' '}
                <span className="font-semibold text-text-light">{pagination.total}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-text-secondary-light mt-1">
            {t('history.detail.description')}
          </p>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBatchSendEmail}
            disabled={sending}
            className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            <span>
              {t('companies.sendEmailSelected')} ({selectedIds.length})
            </span>
          </button>
        )}
      </div>

      {/* Country Filter */}
      {availableCountries.length > 0 && (
        <div className="bg-card-light rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-text-light">
              {t('history.detail.filterByCountry')}:
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
              className="form-select h-10 border border-border-light rounded-lg bg-card-light text-sm text-text-light focus:ring-2 focus:ring-primary/50 focus:outline-none px-3"
            >
              <option value="">{t('companies.allCountries')}</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>
                  {COUNTRIES[country as keyof typeof COUNTRIES] || country}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Companies Table */}
      <div className="bg-card-light rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-secondary-light">{t('search.noResults')}</p>
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
                        checked={
                          companies.filter((c) => c.emailStatus !== 'sent').length > 0 &&
                          selectedIds.length ===
                            companies.filter((c) => c.emailStatus !== 'sent').length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-border-light text-primary focus:ring-primary"
                      />
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('search.table.companyName')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('search.table.phone')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('search.table.email')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('search.table.website')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.country')}
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
                          disabled={company.emailStatus === 'sent'}
                          className="rounded border-border-light text-primary focus:ring-primary disabled:opacity-50"
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
                      <td className="px-6 py-4">{getStatusBadge(company.emailStatus)}</td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {company.emailStatus !== 'sent' ? (
                          <button
                            onClick={() => handleSendEmail(company.id)}
                            disabled={sending}
                            aria-label="Send Email"
                            className="p-2 rounded-full hover:bg-primary/10 text-text-secondary-light hover:text-primary disabled:opacity-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-base">mail</span>
                          </button>
                        ) : (
                          <span className="text-text-secondary-light text-xs">
                            {t('companies.status.sent')}
                          </span>
                        )}
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
                    {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  {t('companies.of')}{' '}
                  <span className="font-semibold text-text-light">{pagination.total}</span>
                </span>
                <ul className="inline-flex items-center -space-x-px">
                  <li>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                      }
                      disabled={pagination.page === 1}
                      className="flex items-center justify-center h-9 px-3 ml-0 leading-tight text-text-secondary-light bg-card-light border border-border-light rounded-l-lg hover:bg-hover-light hover:text-text-light disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                  </li>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    return (
                      <li key={pageNum}>
                        <button
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page: pageNum }))
                          }
                          className={`flex items-center justify-center h-9 px-3 leading-tight border ${
                            pagination.page === pageNum
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
                      onClick={() =>
                        setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                      }
                      disabled={pagination.page >= pagination.totalPages}
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
