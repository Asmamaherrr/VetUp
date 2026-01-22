import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, Star, Edit, Eye, MoreVertical, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InstructorSidebar } from "@/components/instructor-sidebar"

export default async function InstructorCoursesPage() {
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

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      category:categories(name)
    `,
    )
    .eq("instructor_id", user.id)
    .order("created_at", { ascending: false })

  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { data: reviews } = await supabase.from("reviews").select("rating").eq("course_id", course.id)

      const averageRating =
        reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

      return {
        ...course,
        enrollment_count: enrollmentCount || 0,
        average_rating: averageRating,
      }
    }),
  )

  const draftCourses = coursesWithStats.filter((c) => !c.is_published)
  const publishedCourses = coursesWithStats.filter((c) => c.is_published)

  const CourseCard = ({ course }: { course: (typeof coursesWithStats)[0] }) => (
    <Card className="group overflow-hidden">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={
            course.thumbnail_url ||
            `/placeholder.svg?height=200&width=360&query=${encodeURIComponent(course.title) || "/placeholder.svg"}`
          }
          alt={course.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute right-2 top-2 flex gap-2">
          <Badge className={course.is_published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
            {course.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="font-semibold line-clamp-1">{course.title}</h3>
            <p className="text-sm text-muted-foreground">{course.category?.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/courses/${course.slug}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/instructor/courses/${course.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.enrollment_count} students
          </div>
          {course.average_rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {course.average_rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" asChild className="flex-1 bg-transparent">
            <Link href={`/instructor/courses/${course.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button size="sm" asChild className="flex-1">
            <Link href={`/instructor/courses/${course.id}/lessons`}>Manage Lessons</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Courses</h1>
                <p className="mt-1 text-muted-foreground">Create and manage your courses</p>
              </div>
              <Button asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="all">All ({coursesWithStats.length})</TabsTrigger>
                <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({draftCourses.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {coursesWithStats.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {coursesWithStats.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No courses yet</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="published">
                {publishedCourses.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {publishedCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No published courses</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="draft">
                {draftCourses.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {draftCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground">No draft courses</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
