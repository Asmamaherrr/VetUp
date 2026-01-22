import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default async function AdminPaymentsPage() {
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

  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
      *,
      user:profiles!payments_user_id_fkey(full_name, email),
      course:courses(title, slug)
    `,
    )
    .order("created_at", { ascending: false })

  const paymentMethodLabels = {
    vodafone_cash: "Vodafone Cash",
    instapay: "InstaPay",
    visa: "Visa Card",
  }

  const paymentStatusColors = {
    pending: "bg-warning/10 text-warning",
    completed: "bg-success/10 text-success",
    failed: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground",
  }

  // Calculate totals
  const totalCompleted =
    payments?.filter((p) => p.payment_status === "completed").reduce((sum, p) => sum + p.amount, 0) || 0
  const totalPending =
    payments?.filter((p) => p.payment_status === "pending").reduce((sum, p) => sum + p.amount, 0) || 0

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="mt-1 text-muted-foreground">Manage all platform transactions</p>
            </div>

            {/* Summary Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Total Completed</p>
                  <p className="text-2xl font-bold text-success">{totalCompleted.toLocaleString()} EGP</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{totalPending.toLocaleString()} EGP</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{payments?.length || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Search by user or course..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="vodafone_cash">Vodafone Cash</SelectItem>
                  <SelectItem value="instapay">InstaPay</SelectItem>
                  <SelectItem value="visa">Visa Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Transaction</th>
                          <th className="pb-3 font-medium">User</th>
                          <th className="pb-3 font-medium">Course</th>
                          <th className="pb-3 font-medium">Method</th>
                          <th className="pb-3 font-medium">Amount</th>
                          <th className="pb-3 font-medium">Status</th>
                          <th className="pb-3 font-medium">Date</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="py-4">
                              <p className="font-mono text-sm">{payment.transaction_id || payment.id.slice(0, 8)}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-sm">{payment.user?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{payment.user?.email}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-sm line-clamp-1">{payment.course?.title}</p>
                            </td>
                            <td className="py-4">
                              <p className="text-sm">{paymentMethodLabels[payment.payment_method]}</p>
                            </td>
                            <td className="py-4 font-medium">{payment.amount} EGP</td>
                            <td className="py-4">
                              <Badge className={paymentStatusColors[payment.payment_status]}>
                                {payment.payment_status}
                              </Badge>
                            </td>
                            <td className="py-4 text-sm text-muted-foreground">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  {payment.payment_status === "pending" && (
                                    <>
                                      <DropdownMenuItem>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Mark Completed
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Mark Failed
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                  {payment.payment_status === "completed" && (
                                    <DropdownMenuItem>
                                      <RefreshCw className="mr-2 h-4 w-4" />
                                      Refund
                                    </DropdownMenuItem>
                                  )}
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
                    <p className="text-muted-foreground">No payments yet</p>
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
