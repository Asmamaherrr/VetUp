import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Award, TrendingUp, Play, ChevronRight } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's enrollments with course details
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

  // Get user's certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select(
      `
      *,
      course:courses(title, slug)
    `,
    )
    .eq("user_id", user.id)

  // Calculate stats
  const totalCourses = enrollments?.length || 0
  const completedCourses = enrollments?.filter((e) => e.completed_at)?.length || 0
  const inProgressCourses = totalCourses - completedCourses
  const totalCertificates = certificates?.length || 0

  // Get total learning time (sum of course durations for enrolled courses)
  const totalMinutes = enrollments?.reduce((sum, e) => sum + (e.course?.total_duration || 0), 0) || 0
  const totalHours = Math.floor(totalMinutes / 60)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile?.full_name || "Student"}!</h1>
            <p className="mt-1 text-muted-foreground">Continue your learning journey</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                  <TrendingUp className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgressCourses}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <Award className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCertificates}</p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalHours}h</p>
                  <p className="text-sm text-muted-foreground">Learning Time</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Continue Learning */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Continue Learning</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard/courses">
                      View All
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {enrollments && enrollments.length > 0 ? (
                    <div className="space-y-4">
                      {enrollments.slice(0, 4).map((enrollment) => (
                        <Link
                          key={enrollment.id}
                          href={`/dashboard/courses/${enrollment.course?.slug}`}
                          className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-md">
                            <Image
                              src={
                                enrollment.course?.thumbnail_url ||
                                `/placeholder.svg?height=80&width=128&query=${encodeURIComponent(enrollment.course?.title || "course") || "/placeholder.svg"}`
                              }
                              alt={enrollment.course?.title || "Course"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <h3 className="font-semibold line-clamp-1">{enrollment.course?.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {enrollment.course?.instructor?.full_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <div className="mb-1 flex items-center justify-between text-xs">
                                  <span>{enrollment.progress}% complete</span>
                                  <span>{formatDuration(enrollment.course?.total_duration || 0)}</span>
                                </div>
                                <Progress value={enrollment.progress} className="h-2" />
                              </div>
                              <Button size="sm" variant="secondary">
                                <Play className="mr-1 h-3 w-3" />
                                Continue
                              </Button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">You haven&apos;t enrolled in any courses yet</p>
                      <Button asChild className="mt-4">
                        <Link href="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certificates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-warning" />
                    Certificates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificates && certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.slice(0, 3).map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                          <div>
                            <p className="font-medium line-clamp-1">{cert.course?.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Issued {new Date(cert.issued_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="secondary">View</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Complete a course to earn your first certificate!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                    <Link href="/courses">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Courses
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                    <Link href="/dashboard/profile">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full justify-start bg-transparent">
                    <Link href="/dashboard/certificates">
                      <Award className="mr-2 h-4 w-4" />
                      My Certificates
                    </Link>
                  </Button>
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
