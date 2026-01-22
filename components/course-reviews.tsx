"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import type { Review } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface CourseReviewsProps {
  courseId: string
  reviews: (Review & { user: { full_name: string; avatar_url: string | null } | null })[]
  isEnrolled: boolean
  user: User | null
}

export function CourseReviews({ courseId, reviews, isEnrolled, user }: CourseReviewsProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const hasReviewed = reviews.some((r) => r.user_id === user?.id)

  const handleSubmitReview = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        course_id: courseId,
        rating,
        comment: comment || null,
      })

      if (error) throw error

      setComment("")
      setRating(5)
      router.refresh()
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Review form */}
      {isEnrolled && !hasReviewed && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Write a Review</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                    <Star
                      className={`h-6 w-6 ${star <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">Comment (optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={4}
              />
            </div>
            <Button onClick={handleSubmitReview} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground">No reviews yet. Be the first to review this course!</p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={review.user?.avatar_url || ""} />
                    <AvatarFallback>{(review.user?.full_name || "U").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{review.user?.full_name || "Anonymous"}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating ? "fill-warning text-warning" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                    {review.comment && <p className="mt-2 text-muted-foreground">{review.comment}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
