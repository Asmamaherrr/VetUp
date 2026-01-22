import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CoursesFilter } from "@/components/courses-filter"

interface CoursesPageProps {
  searchParams: Promise<{
    search?: string
    university?: string
    category?: string
    level?: string
    sort?: string
  }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams
  const supabase = await createClient()

  const { data: universities } = await supabase
    .from("universities")
    .select("*")
    .order("name")

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  let query = supabase
    .from("courses")
    .select(
      `
        *,
        instructor:profiles!courses_instructor_id_fkey(*),
        university:universities(*),
        category:categories(*)
      `,
    )
    .eq("is_published", true)

  if (params.search) {
    query = query.ilike("title", `%${params.search}%`)
  }

  if (params.university) {
    const { data: university } = await supabase
      .from("universities")
      .select("id")
      .eq("slug", params.university)
      .single()

    if (university) {
      query = query.eq("university_id", university.id)
    }
  }

  if (params.category && params.category !== "all") {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  if (params.level) {
    query = query.eq("level", params.level)
  }

  switch (params.sort) {
    case "price-low":
      query = query.order("price", { ascending: true })
      break
    case "price-high":
      query = query.order("price", { ascending: false })
      break
    case "popular":
      query = query.order("created_at", { ascending: false })
      break
    default:
      query = query.order("created_at", { ascending: false })
  }

  const { data: courses } = await query

  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("course_id", course.id)

      const averageRating =
        reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null

      return {
        ...course,
        enrollment_count: enrollmentCount || 0,
        average_rating: averageRating,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="border-b border-border bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">All Courses</h1>
            <p className="mt-2 text-muted-foreground">
              Discover courses that will help you reach your goals
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Suspense fallback={<div>Loading filters...</div>}>
            <CoursesFilter
              universities={universities || []}
              categories={categories || []}
            />
          </Suspense>

          {(params.search || params.university || params.category || params.level) && (
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {params.search && <Badge variant="secondary">Search: {params.search}</Badge>}
              {params.university && (
                <Badge variant="secondary">University: {params.university}</Badge>
              )}
              {params.category && (
                <Badge variant="secondary">Category: {params.category}</Badge>
              )}
              {params.level && <Badge variant="secondary">Level: {params.level}</Badge>}
            </div>
          )}

          <p className="mb-6 text-sm text-muted-foreground">
            Showing {coursesWithStats.length} courses
          </p>

          {coursesWithStats.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coursesWithStats.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-lg text-muted-foreground">
                No courses found matching your criteria.
              </p>
              <Button asChild className="mt-4">
                <a href="/courses">Clear all filters</a>
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
