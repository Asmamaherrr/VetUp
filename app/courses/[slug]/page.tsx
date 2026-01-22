import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Star, Play, FileText, Lock, BookOpen, Award, BarChart3 } from "lucide-react"
import { EnrollButton } from "@/components/enroll-button"
import { CourseReviews } from "@/components/course-reviews"

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Get course with instructor and category
  const { data: course } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(*),
      category:categories(*)
    `,
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (!course) {
    notFound()
  }

  // Get lessons
  const { data: lessons } = await supabase.from("lessons").select("*").eq("course_id", course.id).order("position")

  // Get enrollment count
  const { count: enrollmentCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("course_id", course.id)

  // Get reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      *,
      user:profiles(*)
    `,
    )
    .eq("course_id", course.id)
    .order("created_at", { ascending: false })

  const averageRating =
    reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

  // Check if user is enrolled
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isEnrolled = false
  let enrollment = null
  if (user) {
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .single()

    isEnrolled = !!data
    enrollment = data
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} minutes`
    if (mins === 0) return `${hours} hours`
    return `${hours}h ${mins}m`
  }

  const levelColors = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
  }

  const contentTypeIcons = {
    video: Play,
    text: FileText,
    quiz: BarChart3,
    resource: BookOpen,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero section */}
        <div className="bg-foreground py-12 text-background lg:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
                  <Badge className={levelColors[course.level]}>{course.level}</Badge>
                </div>
                <h1 className="mb-4 text-3xl font-bold lg:text-4xl">{course.title}</h1>
                <p className="mb-6 text-lg text-muted">{course.description}</p>
                <div className="mb-6 flex flex-wrap items-center gap-6 text-sm">
                  {averageRating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-warning text-warning" />
                      <span className="font-semibold">{averageRating.toFixed(1)}</span>
                      <span className="text-muted">({reviews?.length} reviews)</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted">
                    <Users className="h-5 w-5" />
                    {enrollmentCount} students
                  </div>
                  <div className="flex items-center gap-1 text-muted">
                    <Clock className="h-5 w-5" />
                    {formatDuration(course.total_duration)}
                  </div>
                  <div className="flex items-center gap-1 text-muted">
                    <BookOpen className="h-5 w-5" />
                    {course.total_lessons} lessons
                  </div>
                </div>
                {course.instructor && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={course.instructor.avatar_url || ""} />
                      <AvatarFallback>{(course.instructor.full_name || "I").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{course.instructor.full_name}</p>
                      <p className="text-sm text-muted">Instructor</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:col-span-1">
                <Card className="sticky top-24 overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={
                        course.thumbnail_url ||
                        `/placeholder.svg?height=200&width=360&query=${encodeURIComponent(course.title) || "/placeholder.svg"}`
                      }
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Button size="lg" variant="secondary" className="rounded-full">
                        <Play className="h-6 w-6" />
                        <span className="sr-only">Preview</span>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-4 text-3xl font-bold text-foreground">
                      {course.price === 0 ? "Free" : `${course.price} EGP`}
                    </div>
                    <div className="flex gap-2">
                      <EnrollButton
                        courseId={course.id}
                        courseSlug={course.slug}
                        isEnrolled={isEnrolled}
                        isFree={course.price === 0}
                        user={user}
                      />
                      
                    </div>
                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span>{formatDuration(course.total_duration)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <span>{course.total_lessons} lessons</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Course content */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="lg:w-2/3">
            <Tabs defaultValue="curriculum" className="w-full">
              <TabsList className="mb-8 w-full justify-start">
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews?.length || 0})</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {course.total_lessons} lessons • {formatDuration(course.total_duration)}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {lessons?.map((lesson, index) => {
                        const Icon = contentTypeIcons[lesson.content_type]
                        const isAccessible = lesson.is_free || isEnrolled

                        return (
                          <div key={lesson.id} className="flex items-center gap-4 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{lesson.title}</span>
                                {lesson.is_free && !isEnrolled && (
                                  <Badge variant="secondary" className="text-xs">
                                    Free Preview
                                  </Badge>
                                )}
                              </div>
                              {lesson.description && (
                                <p className="mt-1 text-sm text-muted-foreground">{lesson.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground">{lesson.duration}m</span>
                              {isAccessible ? (
                                isEnrolled ? (
                                  <Link href={`/courses/${course.slug}/lessons/${lesson.id}`}>
                                    <Button size="sm" variant="ghost">
                                      <Play className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                ) : (
                                  <Button size="sm" variant="ghost">
                                    <Play className="h-4 w-4" />
                                  </Button>
                                )
                              ) : (
                                <Lock className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <CourseReviews courseId={course.id} reviews={reviews || []} isEnrolled={isEnrolled} user={user} />
              </TabsContent>

              <TabsContent value="instructor">
                {course.instructor && (
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-20 w-20">
                          <AvatarImage src={course.instructor.avatar_url || ""} />
                          <AvatarFallback className="text-2xl">
                            {(course.instructor.full_name || "I").charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-semibold">{course.instructor.full_name}</h3>
                          <p className="text-muted-foreground">Instructor</p>
                          {course.instructor.bio && (
                            <p className="mt-4 text-muted-foreground">{course.instructor.bio}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
