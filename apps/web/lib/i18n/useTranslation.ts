import { useLanguageStore } from '@/lib/store/language-store'
import { translations, TranslationKey } from './translations'

export function useTranslation() {
  const { language } = useLanguageStore()
  
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key
    
    // Replace placeholders like {count} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue))
      })
    }
    
    return text
  }

  return { t, language }
}

