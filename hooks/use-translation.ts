'use client'

import { useLanguageContext } from '@/components/language-provider'
import { translations, type Language } from '@/lib/translations'

export function useTranslation() {
  const { language } = useLanguageContext()
  
  const t = translations[language as Language]

  return { t, language }
}
