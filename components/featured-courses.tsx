import { createClient } from "@/lib/supabase/server"
import { CourseCard } from "./course-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export async function FeaturedCourses() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(*),
      category:categories(*)
    `,
    )
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(6)

  // Get enrollment counts
  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { data: reviews } = await supabase.from("reviews").select("rating").eq("course_id", course.id)

      const averageRating =
        reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

      return {
        ...course,
        enrollment_count: enrollmentCount || 0,
        average_rating: averageRating,
      }
    }),
  )

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Courses</h2>
            <p className="mt-2 text-muted-foreground">Explore our most popular courses and start learning today</p>
          </div>
          <Button variant="ghost" asChild className="hidden sm:flex">
            <Link href="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coursesWithStats.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Button asChild>
            <Link href="/courses">
              View All Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
