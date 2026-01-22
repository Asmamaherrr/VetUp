import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"
import { StudentSearchFilter } from "@/components/student-search-filter"

export default async function InstructorStudentsPage() {
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

  // Get instructor's students
  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .eq("instructor_id", user.id)

  const courseIds = courses?.map(c => c.id) || []

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("user_id, course_id, created_at")

  const studentIds = enrollments
    ?.filter(e => courseIds.includes(e.course_id))
    .map(e => e.user_id) || []

  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .in("id", studentIds.length > 0 ? studentIds : [null])

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Students</h1>
            <p className="text-muted-foreground mt-2">Manage your enrolled students</p>
          </div>

          <StudentSearchFilter students={students || []} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Total Students: {students?.length || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {students && students.length > 0 ? (
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.full_name || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <Button variant="outline">View Progress</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No students enrolled yet
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
