'use client'

import { useEffect } from 'react'
import { useLanguageStore } from '@/lib/store/language-store'

export function LanguageInitializer() {
  const { language } = useLanguageStore()

  useEffect(() => {
    // Set document language based on store
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language])

  return null
}

