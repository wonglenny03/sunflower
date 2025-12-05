'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { authApi } from '@/lib/api/auth'
import { LanguageSwitcher } from '../common/LanguageSwitcher'
import { useTranslation } from '@/lib/i18n/useTranslation'

export function Header() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const { t } = useTranslation()

  const handleLogout = () => {
    authApi.logout()
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-light px-6 md:px-10 py-3 bg-card-light">
      <div className="flex items-center gap-4 text-text-light">
        <Link href="/search" className="flex items-center gap-3">
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#clip0_6_535)">
                <path
                  clipRule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill="currentColor"
                  fillRule="evenodd"
                ></path>
              </g>
              <defs>
                <clipPath id="clip0_6_535">
                  <rect fill="white" height="48" width="48"></rect>
                </clipPath>
              </defs>
            </svg>
          </div>
          <h2 className="text-text-light text-lg font-bold leading-tight tracking-[-0.015em]">
            {t('auth.brand.name')}
          </h2>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-8">
          <Link
            href="/search"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary-light hover:text-primary hover:bg-hover-light transition-all"
          >
            {t('nav.search')}
          </Link>
          {/* <Link
            href="/companies"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary-light hover:text-primary hover:bg-hover-light transition-all"
          >
            {t('nav.companies')}
          </Link> */}
          <Link
            href="/history"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary-light hover:text-primary hover:bg-hover-light transition-all"
          >
            {t('nav.history')}
          </Link>
          <Link
            href="/email-templates"
            className="px-4 py-2 rounded-lg text-sm font-medium text-text-secondary-light hover:text-primary hover:bg-hover-light transition-all"
          >
            {t('nav.emailTemplates')}
          </Link>
        </nav>
      </div>
      <div className="flex flex-1 justify-end gap-2 md:gap-4 items-center">
        <LanguageSwitcher />
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-sm font-medium text-text-secondary-light">
            {user?.username}
          </span>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-primary font-semibold"
            data-alt="User profile avatar"
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center justify-center h-10 px-4 rounded-lg bg-hover-light text-text-light text-sm font-medium hover:bg-hover-light/80 transition-all"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </header>
  )
}
