import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout-form"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Award, Shield, CheckCircle } from "lucide-react"
import Image from "next/image"

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
  const studentCount = course.enrollments?.length || 0

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="bg-background border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
          <p className="text-muted-foreground">Complete your purchase to start learning</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Checkout Form - Left Side */}
          <div className="lg:col-span-3 space-y-6">
            <CheckoutForm course={course} userId={user.id} />
          </div>

          {/* Order Summary - Right Side */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

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
                      <p className="text-sm text-muted-foreground">By {course.profiles?.full_name || "Instructor"}</p>
                    </div>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{lessonCount} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {course.level}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Course Price</span>
                      <span>EGP {course.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
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
                      <p className="font-medium text-sm">Secure Payment</p>
                      <p className="text-xs text-muted-foreground">Your payment information is encrypted and secure</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Count */}
              <p className="text-center text-sm text-muted-foreground">
                Join {studentCount.toLocaleString()}+ students already enrolled
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
