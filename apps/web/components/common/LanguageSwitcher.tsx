'use client'

import { useLanguageStore, Language } from '@/lib/store/language-store'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguageStore()

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'zh' : 'en'
    setLanguage(newLanguage)
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-hover-light text-text-light gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
      aria-label={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-text-secondary-light">
        language
      </span>
      <span className="hidden md:inline">{language === 'en' ? 'EN / 中' : '中 / EN'}</span>
      <span className="md:hidden">{language === 'en' ? '中' : 'EN'}</span>
    </button>
  )
}

