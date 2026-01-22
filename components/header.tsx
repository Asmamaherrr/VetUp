import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { GraduationCap } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SignOutButton } from "./sign-out-button"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"
import { NotificationCenter } from "./notification-center"

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">VetUp</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/courses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              All Courses
            </Link>
            <Link
              href="/categories"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Universities
            </Link>
            <Link
              href="/instructors"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Instructors
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && profile && <NotificationCenter />}
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.full_name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(profile.full_name || profile.email || "U").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col gap-1 p-2">
                  <p className="text-sm font-medium leading-none">{profile.full_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">My Learning</Link>
                </DropdownMenuItem>
                {(profile.role === "instructor" || profile.role === "admin") && (
                  <DropdownMenuItem asChild>
                    <Link href="/instructor">Instructor Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {profile.role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <SignOutButton />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          )}
          <MobileNav user={user} profile={profile} />
        </div>
      </div>
    </header>
  )
}
