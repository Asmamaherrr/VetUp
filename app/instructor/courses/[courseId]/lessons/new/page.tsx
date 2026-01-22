import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { LessonForm } from "@/components/lesson-form"

interface NewLessonPageProps {
  params: Promise<{ courseId: string }>
}

export default async function NewLessonPage({ params }: NewLessonPageProps) {
  const { courseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()

  if (!course) {
    notFound()
  }

  if (course.instructor_id !== user.id) {
    redirect("/instructor/courses")
  }

  // Get next order index
  const { data: lessons } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1)

  const nextOrderIndex = lessons && lessons.length > 0 ? lessons[0].order_index + 1 : 1

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8">
              <Link
                href={`/instructor/courses/${courseId}/lessons`}
                className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Lessons
              </Link>
              <h1 className="text-3xl font-bold">Add New Lesson</h1>
              <p className="mt-1 text-muted-foreground">{course.title}</p>
            </div>
            <LessonForm courseId={courseId} orderIndex={nextOrderIndex} />
          </div>
        </main>
      </div>
    </div>
  )
}
