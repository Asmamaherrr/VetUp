"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import type { User } from "@supabase/supabase-js"

interface EnrollButtonProps {
  courseId: string
  courseSlug: string
  isEnrolled: boolean
  isFree: boolean
  user: User | null
}

export function EnrollButton({ courseId, courseSlug, isEnrolled, isFree, user }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    if (!isFree) {
      router.push(`/checkout/${courseSlug}`)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: courseId,
      })

      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error enrolling:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isEnrolled) {
    return (
      <Button className="w-full" size="lg" onClick={() => router.push(`/dashboard/courses/${courseSlug}`)}>
        Continue Learning
      </Button>
    )
  }

  return (
    <Button className="w-full" size="lg" onClick={handleEnroll} disabled={isLoading}>
      {isLoading ? "Enrolling..." : isFree ? "Enroll for Free" : "Buy Now"}
    </Button>
  )
}
