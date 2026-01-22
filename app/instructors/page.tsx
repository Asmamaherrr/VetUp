import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, Star } from "lucide-react"

export default async function InstructorsPage() {
  const supabase = await createClient()

  // Get all instructors with their stats
  const { data: instructors } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "instructor")
    .order("created_at", { ascending: false })

  const instructorsWithStats = await Promise.all(
    (instructors || []).map(async (instructor) => {
      // Get courses count
      const { count: coursesCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("instructor_id", instructor.id)
        .eq("is_published", true)

      // Get total students
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("id", { count: "exact" })
        .in(
          "course_id",
          (
            await supabase
              .from("courses")
              .select("id")
              .eq("instructor_id", instructor.id)
          ).data?.map((c) => c.id) || [],
        )

      // Get average rating
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
          ).data?.map((c) => c.id) || [],
        )

      const averageRating =
        reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

      return {
        ...instructor,
        courses_count: coursesCount || 0,
        students_count: enrollments?.length || 0,
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
            <h1 className="text-3xl font-bold text-foreground">Our Instructors</h1>
            <p className="mt-2 text-muted-foreground">Learn from experienced professionals</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {instructorsWithStats.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {instructorsWithStats.map((instructor) => (
                <Card key={instructor.id} className="overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Avatar className="mx-auto mb-4 h-20 w-20">
                        <AvatarImage src={instructor.avatar_url || ""} />
                        <AvatarFallback>{(instructor.full_name || "I").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-foreground">{instructor.full_name || "Instructor"}</h3>
                      {instructor.bio && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{instructor.bio}</p>
                      )}

                      <div className="mt-4 flex items-center justify-center gap-4 border-t pt-4">
                        <div className="text-center">
                          <p className="text-lg font-bold">{instructor.courses_count}</p>
                          <p className="text-xs text-muted-foreground">Courses</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-4 w-4" />
                            <span className="text-lg font-bold">{instructor.students_count}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Students</p>
                        </div>
                        {instructor.average_rating && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="text-lg font-bold">{instructor.average_rating.toFixed(1)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Rating</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No instructors available yet</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
