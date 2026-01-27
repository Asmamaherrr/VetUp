'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Language = 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isArabic: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Get language from localStorage on mount
    const savedLanguage = localStorage.getItem('language') as Language | null
    if (savedLanguage === 'en' || savedLanguage === 'ar') {
      setLanguageState(savedLanguage)
      document.documentElement.lang = savedLanguage
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr'
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isArabic: language === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Return a default value during SSR/hydration instead of throwing
    return { language: 'en' as Language, setLanguage: () => {}, isArabic: false }
  }
  return context
}
