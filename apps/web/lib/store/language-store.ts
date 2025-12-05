import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'zh'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang: Language) => {
        set({ language: lang })
        // Update document language attribute
        if (typeof window !== 'undefined') {
          document.documentElement.lang = lang
        }
      },
    }),
    {
      name: 'language-storage',
    },
  ),
)

