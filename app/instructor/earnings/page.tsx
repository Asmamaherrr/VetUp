import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react"

export default async function InstructorEarningsPage() {
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

  // Get earnings data
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, price")
    .eq("instructor_id", user.id)

  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status")

  const courseIds = courses?.map(c => c.id) || []
  const totalEarnings = payments
    ?.filter(p => courseIds.some(id => id) && p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  const pendingEarnings = payments
    ?.filter(p => courseIds.some(id => id) && p.status === "pending")
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Earnings</h1>
            <p className="text-muted-foreground mt-2">Track your course revenue</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEarnings.toLocaleString()} EGP</div>
                <p className="text-xs text-muted-foreground mt-1">Completed payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingEarnings.toLocaleString()} EGP</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 EGP</div>
                <p className="text-xs text-muted-foreground mt-1">Current month earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(totalEarnings - pendingEarnings).toLocaleString()} EGP</div>
                <p className="text-xs text-muted-foreground mt-1">Available to withdraw</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No payments yet
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
