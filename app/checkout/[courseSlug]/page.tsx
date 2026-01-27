import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { CheckoutHeader } from "@/components/checkout-header"
import { OrderSummary } from "@/components/order-summary"
import Image from "next/image"
import { BookOpen, Clock, Award, Shield, CheckCircle } from "lucide-react"

interface CheckoutPageProps {
  params: Promise<{ courseSlug: string }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { courseSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/login?redirect=/checkout/${courseSlug}`)
  }

  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      profiles!courses_instructor_id_fkey (full_name, avatar_url),
      lessons (id),
      enrollments (id)
    `,
    )
    .eq("slug", courseSlug)
    .eq("is_published", true)
    .single()

  if (!course) {
    redirect("/courses")
  }

  // Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single()

  if (existingEnrollment) {
    redirect(`/dashboard/courses/${courseSlug}`)
  }

  const lessonCount = course.lessons?.length || 0

  return (
    <div className="min-h-screen bg-muted/30">
      <CheckoutHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            <CheckoutForm course={course} userId={user.id} />
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-2">
            <OrderSummary course={course} />
          </div>
        </div>
      </div>
    </div>
  )
}
