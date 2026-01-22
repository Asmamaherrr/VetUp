import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, BookOpen, Eye } from "lucide-react"

export default async function InstructorAnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "instructor" && profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Get instructor analytics
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", user.id)

  const totalCourses = courses?.length || 0

  // Get enrollment stats
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")

  const myEnrollments = enrollments?.filter(e => courses?.some(c => c.id === e.course_id)).length || 0

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-2">Your course performance and insights</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Published courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{myEnrollments}</div>
                <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground mt-1">Course views</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <BarChart3 className="h-16 w-16 text-muted-foreground opacity-50" />
              </div>
              <p className="text-center text-muted-foreground">Detailed course analytics coming soon</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
