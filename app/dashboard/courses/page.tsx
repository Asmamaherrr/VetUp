import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, BookOpen, Play, CheckCircle } from "lucide-react"

export default async function MyCoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      *,
      course:courses(
        *,
        instructor:profiles!courses_instructor_id_fkey(full_name, avatar_url),
        category:categories(name)
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const inProgressCourses = enrollments?.filter((e) => !e.completed_at) || []
  const completedCourses = enrollments?.filter((e) => e.completed_at) || []

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const CourseCard = ({ enrollment }: { enrollment: (typeof enrollments)[0] }) => (
    <Link href={`/dashboard/courses/${enrollment.course?.slug}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={
              enrollment.course?.thumbnail_url ||
              `/placeholder.svg?height=200&width=360&query=${encodeURIComponent(enrollment.course?.title || "course") || "/placeholder.svg"}`
            }
            alt={enrollment.course?.title || "Course"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          {enrollment.completed_at && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="flex flex-col items-center text-white">
                <CheckCircle className="mb-2 h-12 w-12" />
                <span className="font-semibold">Completed</span>
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            {enrollment.course?.category && (
              <Badge variant="secondary" className="text-xs">
                {enrollment.course.category.name}
              </Badge>
            )}
          </div>
          <h3 className="mb-2 font-semibold line-clamp-2 group-hover:text-primary">{enrollment.course?.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{enrollment.course?.instructor?.full_name}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{enrollment.progress}% complete</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatDuration(enrollment.course?.total_duration || 0)}
              </div>
            </div>
            <Progress value={enrollment.progress} className="h-2" />
          </div>
          <Button className="mt-4 w-full" variant={enrollment.completed_at ? "secondary" : "default"}>
            {enrollment.completed_at ? (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Review Course
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="mt-1 text-muted-foreground">Track your progress and continue learning</p>
          </div>

          <Tabs defaultValue="in-progress" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="in-progress">
              {inProgressCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((enrollment) => (
                    <CourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No courses in progress</p>
                  <Button asChild className="mt-4">
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedCourses.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((enrollment) => (
                    <CourseCard key={enrollment.id} enrollment={enrollment} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <CheckCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No completed courses yet</p>
                  <p className="text-sm text-muted-foreground">Keep learning to complete your first course!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
