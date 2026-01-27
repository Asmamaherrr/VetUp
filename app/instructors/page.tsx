import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Star } from "lucide-react"

export default async function InstructorsPage() {
  const supabase = await createClient()

  const { data: instructorCourses } = await supabase
    .from("courses")
    .select("instructor_id")
    .eq("is_published", true)

  const instructorIds = [
    ...new Set(instructorCourses?.map((c) => c.instructor_id)),
  ]

  if (!instructorIds || instructorIds.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No instructors available yet</p>
        </main>
        <Footer />
      </div>
    )
  }

  const { data: instructors } = await supabase
    .from("profiles")
    .select("*")
    .in("id", instructorIds)
    .order("created_at", { ascending: false })

  const instructorsWithStats = await Promise.all(
    (instructors || []).map(async (instructor) => {
      const { count: coursesCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("instructor_id", instructor.id)
        .eq("is_published", true)

      const { count: studentsCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .in(
          "course_id",
          (
            await supabase
              .from("courses")
              .select("id")
              .eq("instructor_id", instructor.id)
              .eq("is_published", true)
          ).data?.map((c) => c.id) || [],
        )

      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .in(
          "course_id",
          (
            await supabase
              .from("courses")
              .select("id")
              .eq("instructor_id", instructor.id)
              .eq("is_published", true)
          ).data?.map((c) => c.id) || [],
        )

      const averageRating =
        reviews && reviews.length > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null

      return {
        ...instructor,
        courses_count: coursesCount || 0,
        students_count: studentsCount || 0,
        average_rating: averageRating,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h1 className="text-3xl font-bold">Our Instructors</h1>
            <p className="mt-2 text-muted-foreground">
              Learn from instructors who actively teach on the platform
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {instructorsWithStats.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-lg transition">
                <CardContent className="p-6 text-center">
                  <Avatar className="mx-auto mb-4 h-20 w-20">
                    <AvatarImage src={instructor.avatar_url || ""} />
                    <AvatarFallback>
                      {(instructor.full_name || "I").charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-semibold">
                    {instructor.full_name || "Instructor"}
                  </h3>

                  {instructor.bio && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {instructor.bio}
                    </p>
                  )}

                  <div className="mt-4 flex justify-center gap-6 border-t pt-4">
                    <div>
                      <p className="font-bold">{instructor.courses_count}</p>
                      <p className="text-xs text-muted-foreground">Courses</p>
                    </div>

                    {instructor.average_rating && (
                      <div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold">
                            {instructor.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
