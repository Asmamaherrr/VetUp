"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle } from "lucide-react"

interface MarkCompleteButtonProps {
  lessonId: string
  courseId: string
  userId: string
  isCompleted: boolean
  totalLessons: number
  completedCount: number
}

export function MarkCompleteButton({
  lessonId,
  courseId,
  userId,
  isCompleted,
  totalLessons,
  completedCount,
}: MarkCompleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      if (isCompleted) {
        // Mark as incomplete
        await supabase.from("lesson_progress").delete().eq("user_id", userId).eq("lesson_id", lessonId)
      } else {
        // Mark as complete
        await supabase.from("lesson_progress").upsert({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        })

        // Update enrollment progress
        const newCompletedCount = completedCount + 1
        const newProgress = Math.round((newCompletedCount / totalLessons) * 100)

        await supabase
          .from("enrollments")
          .update({
            progress: newProgress,
            completed_at: newProgress === 100 ? new Date().toISOString() : null,
          })
          .eq("user_id", userId)
          .eq("course_id", courseId)

        // If course is complete, create certificate
        if (newProgress === 100) {
          await supabase.from("certificates").upsert({
            user_id: userId,
            course_id: courseId,
            issued_at: new Date().toISOString(),
          })
        }
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating progress:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={isCompleted ? "secondary" : "default"}
      className="w-full sm:w-auto"
    >
      {loading ? (
        "Updating..."
      ) : isCompleted ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Completed - Click to Undo
        </>
      ) : (
        <>
          <Circle className="mr-2 h-4 w-4" />
          Mark as Complete
        </>
      )}
    </Button>
  )
}
