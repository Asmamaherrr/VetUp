import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, Edit, Trash2, CheckCircle, XCircle, Users, Star } from "lucide-react"

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: courses } = await supabase
    .from("courses")
    .select(
      `
      *,
      instructor:profiles!courses_instructor_id_fkey(full_name, email),
      category:categories(name)
    `,
    )
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

      const { data: payments } = await supabase
        .from("payments")
        .select("amount")
        .eq("course_id", course.id)
        .eq("status", "completed")

      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

      return {
        ...course,
        enrollment_count: enrollmentCount || 0,
        average_rating: averageRating,
        total_revenue: totalRevenue,
      }
    }),
  )

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Courses</h1>
                <p className="mt-1 text-muted-foreground">Manage all platform courses</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Search courses..." className="pl-10" />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Courses ({coursesWithStats.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Course</th>
                        <th className="pb-3 font-medium">Instructor</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Students</th>
                        <th className="pb-3 font-medium">Rating</th>
                        <th className="pb-3 font-medium">Revenue</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {coursesWithStats.map((course) => (
                        <tr key={course.id}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-20 overflow-hidden rounded">
                                <Image
                                  src={
                                    course.thumbnail_url ||
                                    `/placeholder.svg?height=48&width=80&query=${encodeURIComponent(course.title) || "/placeholder.svg"}`
                                  }
                                  alt={course.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium line-clamp-1">{course.title}</p>
                                <p className="text-sm text-muted-foreground">{course.category?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <p className="text-sm">{course.instructor?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{course.instructor?.email}</p>
                          </td>
                          <td className="py-4">
                            <Badge
                              className={
                                course.is_published ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                              }
                            >
                              {course.is_published ? "Published" : "Draft"}
                            </Badge>
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
                              "-"
                            )}
                          </td>
                          <td className="py-4 font-medium">{course.total_revenue.toLocaleString()} EGP</td>
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
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {!course.is_published && (
                                  <DropdownMenuItem>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Publish
                                  </DropdownMenuItem>
                                )}
                                {course.is_published && (
                                  <DropdownMenuItem>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Unpublish
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
