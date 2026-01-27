"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Award, Shield, CheckCircle, Phone } from "lucide-react"
import Image from "next/image"
import { useTranslation } from "@/hooks/use-translation"
import type { Course } from "@/lib/types"

interface OrderSummaryProps {
  course: Course & { profiles?: { full_name?: string }; lessons?: { id: string }[]; enrollments?: { id: string }[] }
}

export function OrderSummary({ course }: OrderSummaryProps) {
  const { t } = useTranslation()

  const lessonCount = course.lessons?.length || 0
  const studentCount = course.enrollments?.length || 0

  return (
    <div className="lg:sticky lg:top-8 space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">{t.orderSummary}</h2>

          <div className="flex gap-4 pb-4 border-b">
            <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={course.thumbnail_url || "/placeholder.svg?height=64&width=96&query=course"}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium line-clamp-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground">
                {t.instructor} {course.profiles?.full_name || "Instructor"}
              </p>
            </div>
          </div>

          <div className="py-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>
                {lessonCount} {t.lessons}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{course.duration || t.selfPaced}</span>
            </div>
            <Badge variant="outline" className="capitalize">
              {t[course.level?.toLowerCase() as keyof typeof t] || course.level}
            </Badge>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t.price}</span>
              <span>EGP {course.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>{t.total}</span>
              <span className="text-primary">EGP {course.price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t.securePayment}</p>
              <p className="text-xs text-muted-foreground">{t.securePaymentDesc}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{t.phoneSupport}</p>
              <p className="text-xs text-muted-foreground">{t.callUs}</p>
              <a href={`tel:${t.supportPhone.replace(/\s/g, '')}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1 inline-block">
                {t.supportPhone}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Count */}
      <p className="text-center text-sm text-muted-foreground">
        {t.joinStudents} {studentCount.toLocaleString()}+
      </p>
    </div>
  )
}
