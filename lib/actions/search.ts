"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function searchCoursesAutocomplete(query: string, universityId?: string) {
  try {
    const supabase = await createServerClient()

    let queryBuilder = supabase
      .from("courses")
      .select("id, title, slug, thumbnail_url")
      .eq("is_published", true)
      .ilike("title", `%${query}%`)
      .limit(8)

    if (universityId) {
      queryBuilder = queryBuilder.eq("university_id", universityId)
    }

    const { data: courses, error } = await queryBuilder

    if (error) throw error

    return courses || []
  } catch (error) {
    console.error("Search autocomplete error:", error)
    return []
  }
}
