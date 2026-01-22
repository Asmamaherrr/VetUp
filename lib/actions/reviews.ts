"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function submitReview(
  courseId: string,
  rating: number,
  comment: string
) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Check if user is enrolled in the course
    const { data: enrollment, error: enrollError } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (enrollError || !enrollment) {
      throw new Error("You must be enrolled in this course to leave a review")
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (existingReview) {
      // Update existing review
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          rating,
          comment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingReview.id)

      if (updateError) throw updateError
    } else {
      // Create new review
      const { error: insertError } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          course_id: courseId,
          rating,
          comment,
        })

      if (insertError) throw insertError
    }

    return { success: true }
  } catch (error) {
    console.error("Submit review error:", error)
    throw error
  }
}

export async function getUserReview(courseId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: review, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return review || null
  } catch (error) {
    console.error("Get user review error:", error)
    return null
  }
}
