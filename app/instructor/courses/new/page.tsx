import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { CourseForm } from "@/components/course-form"

export default async function NewCoursePage() {
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

  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: universities } = await supabase.from("universities").select("*").order("name")

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Create New Course</h1>
              <p className="mt-1 text-muted-foreground">Fill in the details to create your course</p>
            </div>
            <CourseForm categories={categories || []} universities={universities || []} instructorId={user.id} universityId={profile?.university_id} />
          </div>
        </main>
      </div>
    </div>
  )
}
