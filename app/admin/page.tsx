import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BookOpen, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default async function AdminDashboardPage() {
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

  // Get stats
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: totalCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: totalEnrollments } = await supabase.from("enrollments").select("*", { count: "exact", head: true })

  const { data: payments } = await supabase.from("payments").select("amount").eq("payment_status", "completed")

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  // Get recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select(
      `
      *,
      user:profiles!payments_user_id_fkey(full_name, email),
      course:courses(title)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(5)

  const paymentStatusColors = {
    pending: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground",
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Overview of your platform performance</p>
            </div>

            {/* Stats Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold">{totalUsers?.toLocaleString()}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-success">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +12% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Published Courses</p>
                      <p className="text-3xl font-bold">{totalCourses}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                      <BookOpen className="h-6 w-6 text-success" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-success">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +5 new this week
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Enrollments</p>
                      <p className="text-3xl font-bold">{totalEnrollments?.toLocaleString()}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                      <TrendingUp className="h-6 w-6 text-warning" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-success">
                    <ArrowUpRight className="mr-1 h-4 w-4" />
                    +23% from last month
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-3xl font-bold">{totalRevenue.toLocaleString()} EGP</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-destructive">
                    <ArrowDownRight className="mr-1 h-4 w-4" />
                    -8% from last month
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Users</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/users">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUsers?.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback>{(user.full_name || user.email || "U").charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.full_name || "No name"}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Payments</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/admin/payments">View All</Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentPayments && recentPayments.length > 0 ? (
                      recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{payment.user?.full_name || payment.user?.email}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{payment.course?.title}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{payment.amount} EGP</p>
                            <Badge className={paymentStatusColors[payment.payment_status]}>
                              {payment.payment_status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground">No payments yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
