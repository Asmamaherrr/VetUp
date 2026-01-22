import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { InstructorSidebar } from "@/components/instructor-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save } from "lucide-react"

export default async function InstructorSettingsPage() {
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

  return (
    <div className="flex min-h-screen bg-background">
      <InstructorSidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your instructor profile</p>
          </div>

          <div className="max-w-2xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input id="full-name" defaultValue={profile?.full_name || ""} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profile?.email || ""} disabled className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue={profile?.bio || ""} placeholder="Tell students about yourself" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input id="avatar" defaultValue={profile?.avatar_url || ""} className="mt-1" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-language">Default Course Language</Label>
                  <Input id="default-language" defaultValue="English" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="min-price">Minimum Course Price (EGP)</Label>
                  <Input id="min-price" type="number" placeholder="0" className="mt-1" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bank-account">Bank Account</Label>
                  <Input id="bank-account" placeholder="Link your bank account" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="withdrawal-email">Withdrawal Email</Label>
                  <Input id="withdrawal-email" type="email" className="mt-1" />
                </div>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Payment Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
