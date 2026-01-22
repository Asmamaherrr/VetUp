"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, GraduationCap } from "lucide-react"
import type { Profile } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface MobileNavProps {
  user: User | null
  profile: Profile | null
}

export function MobileNav({ user, profile }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-6 py-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VetUp</span>
          </Link>
          <nav className="flex flex-col gap-4">
            <Link href="/courses" className="text-lg font-medium" onClick={() => setOpen(false)}>
              Courses
            </Link>
            <Link href="/categories" className="text-lg font-medium" onClick={() => setOpen(false)}>
              universities
            </Link>
            <Link href="/instructors" className="text-lg font-medium" onClick={() => setOpen(false)}>
              Instructors
            </Link>
          </nav>
          {user && profile ? (
            <nav className="flex flex-col gap-4 border-t pt-4">
              <Link href="/dashboard" className="text-lg font-medium" onClick={() => setOpen(false)}>
                My Learning
              </Link>
              {(profile.role === "instructor" || profile.role === "admin") && (
                <Link href="/instructor" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Instructor Dashboard
                </Link>
              )}
              {profile.role === "admin" && (
                <Link href="/admin" className="text-lg font-medium" onClick={() => setOpen(false)}>
                  Admin Dashboard
                </Link>
              )}
            </nav>
          ) : (
            <div className="flex flex-col gap-2 border-t pt-4">
              <Button variant="outline" asChild>
                <Link href="/auth/login" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up" onClick={() => setOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
