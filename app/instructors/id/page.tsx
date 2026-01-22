import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star, Users, BookOpen } from "lucide-react"
import { CourseCard } from "@/components/course-card"

interface InstructorPageProps {
  params: Promise<{ id: string }>
}

export default async function InstructorPage({ params }: InstructorPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get instructor profile
  const { data: instructor } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("role", "instructor")
    .single()

  if (!instructor) {
    notFound()
  }

  // Get all published courses by this instructor
  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:categories(*),
      instructor:profiles!courses_instructor_id_fkey(*)
    `
    )
    .eq("instructor_id", id)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Get instructor stats
  const { count: totalCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("instructor_id", id)
    .eq("is_published", true)

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .in(
      "course_id",
      courses?.map(c => c.id) || []
    )

  const totalStudents = new Set(enrollments?.map(e => e.course_id)).size

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12">
        {/* Instructor Header */}
        <div className="container mb-12">
          <Card>
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <Avatar className="h-24 w-24 md:h-32 md:w-32">
                  <AvatarImage src={instructor.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">
                    {(instructor.full_name || "I").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {instructor.full_name || "Instructor"}
                  </h1>
                  <p className="text-muted-foreground mb-4 text-center md:text-left">
                    {instructor.bio || "Experienced instructor sharing knowledge with students"}
                  </p>
                  <div className="flex flex-wrap gap-8 justify-center md:justify-start">
                    <div>
                      <div className="text-2xl font-bold text-primary">{totalCourses || 0}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Courses
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{totalStudents || 0}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Students
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Published Courses</h2>
          {courses && courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No courses published yet
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
