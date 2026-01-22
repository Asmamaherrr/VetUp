"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function addToWishlist(courseId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
      .from("wishlists")
      .insert({
        user_id: user.id,
        course_id: courseId,
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Add to wishlist error:", error)
    throw error
  }
}

export async function removeFromWishlist(courseId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", user.id)
      .eq("course_id", courseId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Remove from wishlist error:", error)
    throw error
  }
}

export async function isInWishlist(courseId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
      .from("wishlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .single()

    if (error && error.code !== "PGRST116") throw error
    return !!data
  } catch (error) {
    console.error("Check wishlist error:", error)
    return false
  }
}

export async function getWishlist() {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: wishlists, error } = await supabase
      .from("wishlists")
      .select("*, course:courses(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error
    return wishlists
  } catch (error) {
    console.error("Get wishlist error:", error)
    throw error
  }
}
