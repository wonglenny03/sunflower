'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { searchApi } from '@/lib/api/search'
import { companiesApi } from '@/lib/api/companies'
import { emailApi } from '@/lib/api/email'
import { Loading } from '@/components/common/Loading'
import { ProgressBar } from '@/components/common/ProgressBar'
import { COUNTRIES, Company, CompanySearchResult } from '@company-search/types'
import { useTranslation } from '@/lib/i18n/useTranslation'

type SearchFormData = {
  country: 'singapore' | 'malaysia'
  keywords: string
  limit: number
}

export default function SearchPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [searchResult, setSearchResult] = useState<CompanySearchResult | null>(null)
  const [currentKeywords, setCurrentKeywords] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    defaultValues: {
      country: 'singapore',
      limit: 10,
    },
  })

  // Simulate progress for better UX
  const startProgress = () => {
    setProgress(0)
    setProgressLabel(t('search.progress.initializing'))

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    let currentProgress = 0
    const steps = [
      { progress: 20, label: t('search.progress.connecting') },
      { progress: 40, label: t('search.progress.searching') },
      { progress: 60, label: t('search.progress.processing') },
      { progress: 80, label: t('search.progress.filtering') },
      { progress: 95, label: t('search.progress.finalizing') },
    ]

    let stepIndex = 0
    progressIntervalRef.current = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex]
        currentProgress = step.progress
        setProgress(currentProgress)
        setProgressLabel(step.label)
        stepIndex++
      } else {
        if (currentProgress < 95) {
          currentProgress = Math.min(95, currentProgress + 1)
          setProgress(currentProgress)
        }
      }
    }, 500)
  }

  const stopProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setProgress(100)
    setProgressLabel(t('search.progress.complete'))
    setTimeout(() => {
      setProgress(0)
      setProgressLabel('')
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  const onSubmit = async (data: SearchFormData) => {
    if (!data.keywords || data.keywords.trim() === '') {
      setError(t('search.keywords') + ' ' + t('common.error'))
      return
    }

    try {
      setLoading(true)
      setError('')
      setSearchResult(null)
      startProgress()

      const result = await searchApi.searchCompanies(data)
      stopProgress()
      setSearchResult(result)
      setCurrentKeywords(data.keywords)

      await companiesApi.getAll()
    } catch (err: any) {
      stopProgress()
      const errorMessage = err.response?.data?.message || err.message || t('search.error')
      setError(errorMessage)
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = async () => {
    const currentData = watch()
    try {
      setLoading(true)
      const result = await searchApi.searchCompanies(currentData)
      setSearchResult(prev => ({
        ...result,
        companies: [...(prev?.companies || []), ...result.companies],
      }))
    } catch (err: any) {
      setError(err.response?.data?.message || t('search.loadMoreError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmail = async (companyId: string) => {
    try {
      setSendingEmail(companyId)
      await emailApi.send({ companyId })
      alert(t('companies.emailSent'))
      // Refresh search result to update email status
      if (searchResult) {
        const updatedCompanies = searchResult.companies.map((c: Company) =>
          c.id === companyId
            ? { ...c, emailSent: true, emailStatus: 'sent' as const, emailSentAt: new Date() }
            : c,
        )
        setSearchResult({ ...searchResult, companies: updatedCompanies })
      }
    } catch (error) {
      alert(t('companies.emailFailed'))
    } finally {
      setSendingEmail(null)
    }
  }

  const handleBatchSendEmail = async () => {
    if (selectedIds.length === 0) {
      alert(t('companies.noSelection'))
      return
    }
    try {
      setSendingEmail('batch')
      await emailApi.batchSend({ companyIds: selectedIds })
      alert(t('companies.emailsSent'))
      setSelectedIds([])
      // Refresh search result to update email status
      if (searchResult) {
        const updatedCompanies = searchResult.companies.map((c: Company) =>
          selectedIds.includes(c.id)
            ? { ...c, emailSent: true, emailStatus: 'sent' as const, emailSentAt: new Date() }
            : c,
        )
        setSearchResult({ ...searchResult, companies: updatedCompanies })
      }
    } catch (error) {
      alert(t('companies.emailFailed'))
    } finally {
      setSendingEmail(null)
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (!searchResult?.companies) return
    if (selectedIds.length === searchResult.companies.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(searchResult.companies.map((c: Company) => c.id))
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

  const countryOptions = Object.entries(COUNTRIES).map(([value, label]) => ({
    value,
    label,
  }))

  return (
    <main className="px-4 sm:px-6 md:px-10 py-8 flex flex-col gap-8">
      {/* Page Heading */}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex min-w-72 flex-col gap-2">
          <p className="text-text-light text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">
            {t('search.pageTitle')}
          </p>
          <p className="text-text-secondary-light text-base font-normal leading-normal">
            {t('search.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* Search & Control Panel */}
      <div className="bg-card-light rounded-xl p-4 md:p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <label className="flex flex-col w-full">
              <p className="text-text-light text-base font-medium leading-normal pb-2">
                {t('search.keywords')}
              </p>
              <input
                {...register('keywords')}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light bg-card-light h-14 placeholder:text-text-secondary-light p-[15px] text-base font-normal leading-normal"
                placeholder="e.g., AI, Fintech, SaaS"
                type="text"
              />
              {errors.keywords && (
                <p className="mt-1 text-red-500 text-xs">{errors.keywords.message}</p>
              )}
            </label>

            <label className="flex flex-col w-full">
              <p className="text-text-light text-base font-medium leading-normal pb-2">
                {t('search.country')}
              </p>
              <select
                {...register('country')}
                className="form-select flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light bg-card-light h-14 placeholder:text-text-secondary-light p-[15px] text-base font-normal leading-normal"
              >
                {countryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col w-full">
              <p className="text-text-light text-base font-medium leading-normal pb-2">
                {t('search.quantity')}
              </p>
              <input
                {...register('limit', { valueAsNumber: true })}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-light focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border-light bg-card-light h-14 placeholder:text-text-secondary-light p-[15px] text-base font-normal leading-normal"
                placeholder="e.g., 50"
                type="number"
                min={1}
                max={50}
              />
              {errors.limit && <p className="mt-1 text-red-500 text-xs">{errors.limit.message}</p>}
            </label>

            <div className="flex gap-3 w-full">
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
              >
                <span aria-hidden="true" className="material-symbols-outlined mr-2">
                  search
                </span>
                <span className="truncate">
                  {loading ? t('search.searching') : t('search.submit')}
                </span>
              </button>
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loading || !searchResult?.hasMore}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-4 bg-hover-light text-text-light text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hover-light/80 transition-all"
              >
                <span className="truncate">{t('search.more')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Progress Bar */}
      {loading && !searchResult && (
        <div className="bg-card-light rounded-xl p-6 shadow-sm space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-text-light mb-2">{t('search.searching')}</h3>
            {progressLabel && (
              <p className="text-sm text-text-secondary-light mb-4">{progressLabel}</p>
            )}
          </div>
          <ProgressBar progress={progress} showPercentage={true} />
          <div className="flex justify-center pt-2">
            <Loading />
          </div>
        </div>
      )}

      {/* Results Section */}
      {searchResult && (
        <div className="bg-card-light rounded-xl shadow-sm overflow-hidden">
          {/* Info Messages */}
          {(searchResult.hasHistory ||
            (searchResult.duplicatesRemoved && searchResult.duplicatesRemoved > 0)) && (
            <div className="p-4 border-b border-border-light space-y-2">
              {searchResult.hasHistory && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">
                    info
                  </span>
                  <span className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                    {t('search.hasHistoryMessage')}
                  </span>
                  <button
                    onClick={() => router.push(`/history/${encodeURIComponent(currentKeywords)}`)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('search.viewHistory')} →
                  </button>
                </div>
              )}
              {searchResult.duplicatesRemoved && searchResult.duplicatesRemoved > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm">
                    filter_alt
                  </span>
                  <span className="text-sm text-amber-800 dark:text-amber-200 flex-1">
                    {t('search.duplicatesRemovedMessage', {
                      count: searchResult.duplicatesRemoved,
                    })}
                  </span>
                  {searchResult.hasHistory && (
                    <button
                      onClick={() => router.push(`/history/${encodeURIComponent(currentKeywords)}`)}
                      className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      {t('search.viewHistory')} →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Header */}
          <div className="p-4 border-b border-border-light flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-text-light text-base font-medium">
                {t('search.results')} ({searchResult.total} {t('search.companiesFound')})
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-secondary-light">
                    {selectedIds.length} {t('common.items')} {t('common.selected')}
                  </span>
                  <button
                    onClick={handleBatchSendEmail}
                    disabled={sendingEmail === 'batch'}
                    className="flex items-center justify-center gap-2 h-8 px-3 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-50 hover:bg-primary/90 transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">email</span>
                    <span>{t('companies.sendEmailSelected')}</span>
                  </button>
                </div>
              )}
            </div>
            {searchResult.hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-primary/10 text-primary text-sm font-bold disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>{t('search.loadMore')}</span>
              </button>
            )}
          </div>

          {/* Results Table */}
          {searchResult.companies.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-text-secondary-light">{t('search.noResults')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-hover-light text-text-secondary-light uppercase tracking-wider font-medium text-xs">
                  <tr>
                    <th className="px-6 py-3" scope="col">
                      <input
                        type="checkbox"
                        checked={
                          searchResult.companies.length > 0 &&
                          selectedIds.length === searchResult.companies.length
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-border-light text-primary focus:ring-primary/50"
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
                      {t('companies.table.status')}
                    </th>
                    <th className="px-6 py-3" scope="col">
                      {t('companies.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {searchResult.companies.map((company: Company, index: number) => (
                    <tr key={company.id || index} className="hover:bg-hover-light">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(company.id)}
                          onChange={() => toggleSelect(company.id)}
                          className="rounded border-border-light text-primary focus:ring-primary/50"
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(company.emailStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.email ? (
                          <button
                            onClick={() => handleSendEmail(company.id)}
                            disabled={sendingEmail === company.id || company.emailStatus === 'sent'}
                            className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/20 transition-all"
                          >
                            {sendingEmail === company.id ? (
                              <>
                                <Loading />
                                <span>{t('search.loading')}</span>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-sm">email</span>
                                <span>{t('common.sendEmail')}</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-text-secondary-light text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
