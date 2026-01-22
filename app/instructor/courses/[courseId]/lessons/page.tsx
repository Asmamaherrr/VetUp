import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Play, FileText, BarChart3, BookOpen, GripVertical, Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InstructorSidebar } from "@/components/instructor-sidebar"

interface ManageLessonsPageProps {
  params: Promise<{ courseId: string }>
}

export default async function ManageLessonsPage({ params }: ManageLessonsPageProps) {
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

  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", courseId).order("position")

  const contentTypeIcons = {
    video: Play,
    text: FileText,
    quiz: BarChart3,
    resource: BookOpen,
  }

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link
                  href="/instructor/courses"
                  className="mb-2 inline-block text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Back to Courses
                </Link>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="mt-1 text-muted-foreground">Manage your course lessons</p>
              </div>
              <Button asChild>
                <Link href={`/instructor/courses/${courseId}/lessons/new`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lesson
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Course Lessons ({lessons?.length || 0})</CardTitle>
                  <p className="text-sm text-muted-foreground">Drag to reorder</p>
                </div>
              </CardHeader>
              <CardContent>
                {lessons && lessons.length > 0 ? (
                  <div className="space-y-2">
                    {lessons.map((lesson, index) => {
                      const Icon = contentTypeIcons[lesson.content_type]
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                        >
                          <button className="cursor-grab text-muted-foreground hover:text-foreground">
                            <GripVertical className="h-5 w-5" />
                          </button>
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate">{lesson.title}</span>
                              {lesson.is_free && (
                                <Badge variant="secondary" className="text-xs">
                                  Free Preview
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {lesson.content_type} • {lesson.duration} min
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/instructor/courses/${courseId}/lessons/${lesson.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No lessons yet</p>
                    <Button asChild className="mt-4">
                      <Link href={`/instructor/courses/${courseId}/lessons/new`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Lesson
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
