import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Shield, UserCog, Trash2 } from "lucide-react"

export default async function AdminUsersPage() {
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

  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  // Get enrollment counts for each user
  const usersWithStats = await Promise.all(
    (users || []).map(async (u) => {
      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", u.id)

      const { count: courseCount } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("instructor_id", u.id)

      return {
        ...u,
        enrollment_count: enrollmentCount || 0,
        course_count: courseCount || 0,
      }
    }),
  )

  const roleColors = {
    student: "bg-primary/10 text-primary",
    instructor: "bg-warning/10 text-warning",
    admin: "bg-destructive/10 text-destructive",
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <Header />
        <main className="bg-muted/30 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Users</h1>
                <p className="mt-1 text-muted-foreground">Manage platform users and their roles</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" placeholder="Search users..." className="pl-10" />
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Users ({usersWithStats.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">User</th>
                        <th className="pb-3 font-medium">Role</th>
                        <th className="pb-3 font-medium">Enrollments</th>
                        <th className="pb-3 font-medium">Courses</th>
                        <th className="pb-3 font-medium">Joined</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {usersWithStats.map((u) => (
                        <tr key={u.id}>
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={u.avatar_url || ""} />
                                <AvatarFallback>{(u.full_name || u.email || "U").charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{u.full_name || "No name"}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={roleColors[u.role]}>{u.role}</Badge>
                          </td>
                          <td className="py-4">{u.enrollment_count}</td>
                          <td className="py-4">{u.course_count}</td>
                          <td className="py-4 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <UserCog className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Change Role
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
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
