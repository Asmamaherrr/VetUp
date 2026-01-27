import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, CheckCircle, Play, FileText, BarChart3, BookOpen } from "lucide-react"
import { MarkCompleteButton } from "@/components/mark-complete-button"
import { AdvancedVideoPlayer } from "@/components/advanced-video-player"
import { PdfViewer } from "@/components/pdf-viewer"

interface LessonPageProps {
  params: Promise<{ slug: string; lessonId: string }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get course
  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).single()

  if (!course) {
    notFound()
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single()

  if (!enrollment) {
    redirect(`/courses/${slug}`)
  }

  // Get all lessons
  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", course.id).order("position")

  // Get current lesson
  const currentLesson = lessons?.find((l) => l.id === lessonId)
  if (!currentLesson) {
    notFound()
  }

  // Get lesson progress
  const { data: lessonProgress } = await supabase.from("lesson_progress").select("*").eq("user_id", user.id)

  const completedLessonIds = new Set(lessonProgress?.filter((p) => p.completed).map((p) => p.lesson_id) || [])
  const isCurrentCompleted = completedLessonIds.has(lessonId)

  // Find prev/next lessons
  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) || 0
  const prevLesson = currentIndex > 0 ? lessons?.[currentIndex - 1] : null
  const nextLesson = currentIndex < (lessons?.length || 0) - 1 ? lessons?.[currentIndex + 1] : null

  const contentTypeIcons = {
    video: Play,
    text: FileText,
    quiz: BarChart3,
    resource: BookOpen,
    pdf: FileText,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Sidebar - Lesson List */}
          <aside className="hidden w-80 overflow-y-auto border-r bg-muted/30 lg:block">
            <div className="sticky top-0 border-b bg-background p-4">
              <Link
                href={`/dashboard/courses/${slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to course
              </Link>
              <h2 className="mt-2 font-semibold line-clamp-2">{course.title}</h2>
            </div>
            <div className="divide-y">
              {lessons?.map((lesson, index) => {
                const Icon = contentTypeIcons[lesson.content_type]
                const isCompleted = completedLessonIds.has(lesson.id)
                const isCurrent = lesson.id === lessonId

                return (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/courses/${slug}/lessons/${lesson.id}`}
                    className={`flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 ${
                      isCurrent ? "bg-primary/10 border-l-2 border-primary" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${
                        isCompleted
                          ? "bg-success text-success-foreground"
                          : isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <span className={`text-sm truncate ${isCurrent ? "font-medium" : ""}`}>{lesson.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{lesson.duration}m</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Mobile header */}
            <div className="sticky top-0 z-10 border-b bg-background p-4 lg:hidden">
              <Link
                href={`/dashboard/courses/${slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to course
              </Link>
            </div>

            {/* Lesson Content */}
            <div className="flex-1 p-6 lg:p-8">
              <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Lesson {currentIndex + 1} of {lessons?.length}
                    </span>
                    {isCurrentCompleted && (
                      <span className="flex items-center gap-1 text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold lg:text-3xl">{currentLesson.title}</h1>
                  {currentLesson.description && (
                    <p className="mt-2 text-muted-foreground">{currentLesson.description}</p>
                  )}
                </div>

                {/* Content based on type */}
                {currentLesson.content_type === "video" && currentLesson.content_url && (
                  <Card className="mb-6 overflow-hidden">
                    <div className="aspect-video bg-black">
                      <AdvancedVideoPlayer 
                        src={currentLesson.content_url} 
                        title={currentLesson.title}
                        userId={user.id}
                        userName={user.user_metadata?.full_name || user.email}
                      />
                    </div>
                  </Card>
                )}

                {currentLesson.content_type === "pdf" && currentLesson.content_url && (
                  <PdfViewer 
                    src={currentLesson.content_url} 
                    title={currentLesson.title}
                    userId={user.id}
                  />
                )}

                {currentLesson.content_type === "video" && !currentLesson.content_url && (
                  <Card className="mb-6 overflow-hidden">
                    <div className="flex aspect-video items-center justify-center bg-muted">
                      <div className="text-center">
                        <Play className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">Video content placeholder</p>
                      </div>
                    </div>
                  </Card>
                )}

                {currentLesson.content_text && (
                  <Card className="mb-6">
                    <CardContent className="prose prose-neutral max-w-none p-6 dark:prose-invert">
                      <div dangerouslySetInnerHTML={{ __html: currentLesson.content_text }} />
                    </CardContent>
                  </Card>
                )}

                {!currentLesson.content_url && !currentLesson.content_text && (
                  <Card className="mb-6">
                    <CardContent className="p-8 text-center">
                      <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">Lesson content will be available soon.</p>
                    </CardContent>
                  </Card>
                )}

                {/* Mark Complete */}
                <div className="mb-8">
                  <MarkCompleteButton
                    lessonId={lessonId}
                    courseId={course.id}
                    userId={user.id}
                    isCompleted={isCurrentCompleted}
                    totalLessons={lessons?.length || 0}
                    completedCount={completedLessonIds.size}
                  />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t pt-6">
                  {prevLesson ? (
                    <Button variant="outline" asChild className="bg-transparent">
                      <Link href={`/dashboard/courses/${slug}/lessons/${prevLesson.id}`}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Link>
                    </Button>
                  ) : (
                    <div />
                  )}
                  {nextLesson ? (
                    <Button asChild>
                      <Link href={`/dashboard/courses/${slug}/lessons/${nextLesson.id}`}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild>
                      <Link href={`/dashboard/courses/${slug}`}>Finish Course</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
