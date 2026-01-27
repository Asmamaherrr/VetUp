"use client"

import { Button } from "@/components/ui/button"
import { useLanguageContext } from "@/components/language-provider"
import { Globe } from "lucide-react"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguageContext()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "ar" : "en")}
      className="gap-2"
      title={language === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <Globe className="h-4 w-4" />
    </Button>
  )
}
