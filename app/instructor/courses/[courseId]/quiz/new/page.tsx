import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { QuizBuilder } from "@/components/quiz-builder"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface CreateQuizPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CreateQuizPage({ params }: CreateQuizPageProps) {
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

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/instructor/courses/${courseId}/edit`}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Create New Quiz</h1>
                <p className="mt-1 text-muted-foreground">Add a quiz to {course.title}</p>
              </div>
            </div>
            <QuizBuilder lessonId={courseId} />
          </div>
        </main>
      </div>
    </div>
  )
}
