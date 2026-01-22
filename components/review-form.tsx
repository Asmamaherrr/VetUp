"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitReview } from "@/lib/actions/reviews"
import { useToast } from "@/hooks/use-toast"
import { Star, Loader2 } from "lucide-react"

interface ReviewFormProps {
  courseId: string
  onSuccess?: () => void
  initialRating?: number
  initialComment?: string
}

export function ReviewForm({ courseId, onSuccess, initialRating = 5, initialComment = "" }: ReviewFormProps) {
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState(initialComment)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setIsLoading(true)
      await submitReview(courseId, rating, comment)
      toast({
        title: "Success",
        description: "Your review has been submitted",
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>Share your experience with this course</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">Rating</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{rating} out of 5 stars</p>
          </div>

          <div>
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this course..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2 min-h-[120px]"
            />
            <p className="mt-1 text-xs text-muted-foreground">{comment.length}/500 characters</p>
          </div>

          <Alert>
            <AlertDescription>
              Your review helps other students make informed decisions. Please be honest and constructive.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
