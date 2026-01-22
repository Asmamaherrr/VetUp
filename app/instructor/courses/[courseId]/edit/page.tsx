import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { CourseForm } from "@/components/course-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

interface EditCoursePageProps {
  params: Promise<{ courseId: string }>
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const { courseId } = await params
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

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (!course) {
    notFound()
  }

  // Check ownership
  if (course.instructor_id !== user.id && profile?.role !== "admin") {
    redirect("/instructor/courses")
  }

  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: universities } = await supabase.from("universities").select("*").order("name")

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Edit Course</h1>
                <p className="mt-1 text-muted-foreground">Update your course details</p>
              </div>
              <Button asChild className="gap-2">
                <Link href={`/instructor/courses/${courseId}/quiz/new`}>
                  <Plus className="h-4 w-4" />
                  New Quiz
                </Link>
              </Button>
            </div>
            <CourseForm categories={categories || []} universities={universities || []} instructorId={user.id} course={course} />
          </div>
        </main>
      </div>
    </div>
  )
}
