import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Play, FileText, BarChart3, BookOpen, CheckCircle, Circle, Clock, Award } from "lucide-react"

interface CourseLearnPageProps {
  params: Promise<{ slug: string }>
}

export default async function CourseLearnPage({ params }: CourseLearnPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get course
  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(*)
    `,
    )
    .eq("slug", slug)
    .single()

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

  // Get lessons
  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", course.id).order("position")

  // Get lesson progress
  const { data: lessonProgress } = await supabase.from("lesson_progress").select("*").eq("user_id", user.id)

  const completedLessonIds = new Set(lessonProgress?.filter((p) => p.completed).map((p) => p.lesson_id) || [])

  // Find next lesson to continue
  const nextLesson = lessons?.find((l) => !completedLessonIds.has(l.id))

  // Check for certificate
  const { data: certificate } = await supabase
    .from("certificates")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .single()

  const contentTypeIcons = {
    video: Play,
    text: FileText,
    quiz: BarChart3,
    resource: BookOpen,
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Course Header */}
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="relative h-48 w-full overflow-hidden rounded-xl lg:h-40 lg:w-64">
              <Image
                src={
                  course.thumbnail_url ||
                  `/placeholder.svg?height=160&width=256&query=${encodeURIComponent(course.title) || "/placeholder.svg"}`
                }
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-2xl font-bold lg:text-3xl">{course.title}</h1>
              <p className="mb-4 text-muted-foreground">{course.instructor?.full_name}</p>
              <div className="mb-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.total_duration)}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {course.total_lessons} lessons
                </div>
                <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                  {enrollment.completed_at ? "Completed" : "In Progress"}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{enrollment.progress}% complete</span>
                    <span>
                      {completedLessonIds.size}/{lessons?.length || 0} lessons
                    </span>
                  </div>
                  <Progress value={enrollment.progress} className="h-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Lessons List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {lessons?.map((lesson, index) => {
                      const Icon = contentTypeIcons[lesson.content_type]
                      const isCompleted = completedLessonIds.has(lesson.id)
                      const isCurrent = nextLesson?.id === lesson.id

                      return (
                        <Link
                          key={lesson.id}
                          href={`/dashboard/courses/${slug}/lessons/${lesson.id}`}
                          className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${
                            isCurrent ? "bg-primary/5" : ""
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              isCompleted
                                ? "bg-success text-success-foreground"
                                : isCurrent
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="h-5 w-5" /> : <span>{index + 1}</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-muted-foreground" />
                              <span className={`font-medium ${isCompleted ? "text-muted-foreground" : ""}`}>
                                {lesson.title}
                              </span>
                              {isCurrent && (
                                <Badge variant="secondary" className="text-xs">
                                  Continue
                                </Badge>
                              )}
                            </div>
                            {lesson.description && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{lesson.duration}m</span>
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-success" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Continue Button */}
              {nextLesson && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-semibold">Continue Learning</h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{nextLesson.title}</p>
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/courses/${slug}/lessons/${nextLesson.id}`}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Certificate */}
              {enrollment.completed_at && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Award className="mx-auto mb-4 h-12 w-12 text-warning" />
                    <h3 className="mb-2 font-semibold">Congratulations!</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      You have completed this course.{" "}
                      {certificate ? "Your certificate is ready!" : "Certificate will be generated soon."}
                    </p>
                    {certificate && (
                      <Button variant="outline" className="w-full bg-transparent">
                        Download Certificate
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Course Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About this course</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
