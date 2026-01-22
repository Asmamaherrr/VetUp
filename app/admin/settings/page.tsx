import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save } from "lucide-react"

export default async function AdminSettingsPage() {
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

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage platform configuration</p>
          </div>

          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input id="platform-name" placeholder="LearnHub" defaultValue="LearnHub" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="platform-email">Support Email</Label>
                  <Input id="platform-email" type="email" placeholder="support@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" placeholder="EGP" defaultValue="EGP" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="commission">Instructor Commission (%)</Label>
                  <Input id="commission" type="number" placeholder="70" defaultValue="70" className="mt-1" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Max Device Sessions</p>
                    <p className="text-sm text-muted-foreground">Maximum devices per user account</p>
                  </div>
                  <Input type="number" placeholder="2" defaultValue="2" className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout (minutes)</p>
                    <p className="text-sm text-muted-foreground">Inactivity timeout duration</p>
                  </div>
                  <Input type="number" placeholder="30" defaultValue="30" className="w-20" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
