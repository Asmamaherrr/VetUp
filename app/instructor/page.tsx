import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, DollarSign, Star, Plus, Eye, Edit, MoreVertical, BarChart3 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InstructorSidebar } from "@/components/instructor-sidebar"

export default async function InstructorDashboardPage() {
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

  // Get instructor's courses
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

  // Get stats for each course
  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { data: reviews } = await supabase.from("reviews").select("rating").eq("course_id", course.id)

      const averageRating =
        reviews && reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null

      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("course_id", course.id)
        .eq("payment_status", "completed")

      const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

      return {
        ...course,
        enrollment_count: enrollmentCount || 0,
        average_rating: averageRating,
        total_revenue: totalRevenue,
        review_count: reviews?.length || 0,
      }
    }),
  )

  // Calculate overall stats
  const totalStudents = coursesWithStats.reduce((sum, c) => sum + c.enrollment_count, 0)
  const totalRevenue = coursesWithStats.reduce((sum, c) => sum + c.total_revenue, 0)
  const totalReviews = coursesWithStats.reduce((sum, c) => sum + c.review_count, 0)
  const publishedCourses = coursesWithStats.filter((c) => c.is_published).length

  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-success/10 text-success",
    archived: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="flex min-h-screen">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
                <p className="mt-1 text-muted-foreground">Manage your courses and track performance</p>
              </div>
              <Button asChild>
                <Link href="/instructor/courses/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Link>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{publishedCourses}</p>
                    <p className="text-sm text-muted-foreground">Published Courses</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <Users className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                    <DollarSign className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} EGP</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                    <Star className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalReviews}</p>
                    <p className="text-sm text-muted-foreground">Total Reviews</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Courses Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your Courses</CardTitle>
                <Button variant="outline" size="sm" asChild className="bg-transparent">
                  <Link href="/instructor/courses">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {coursesWithStats.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Course</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Students</th>
                          <th className="pb-3 font-medium">Rating</th>
                          <th className="pb-3 font-medium">Revenue</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {coursesWithStats.slice(0, 5).map((course) => (
                          <tr key={course.id}>
                            <td className="py-4">
                              <div>
                                <p className="font-medium line-clamp-1">{course.title}</p>
                                <p className="text-sm text-muted-foreground">{course.category?.name}</p>
                              </div>
                            </td>
                            <td className="py-4">
                              <Badge className={statusColors[course.status]}>{course.status}</Badge>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {course.enrollment_count}
                              </div>
                            </td>
                            <td className="py-4">
                              {course.average_rating ? (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-warning text-warning" />
                                  {course.average_rating.toFixed(1)}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="py-4">
                              <span className="font-medium">{course.total_revenue.toLocaleString()} EGP</span>
                            </td>
                            <td className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/courses/${course.slug}`}>
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/instructor/courses/${course.id}/edit`}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/instructor/courses/${course.id}/analytics`}>
                                      <BarChart3 className="mr-2 h-4 w-4" />
                                      Analytics
                                    </Link>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">You haven&apos;t created any courses yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/instructor/courses/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Course
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
