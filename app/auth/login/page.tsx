"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { trackDeviceSession } from "@/lib/actions/device-security"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GraduationCap, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Track device after successful login (non-blocking)
      setTimeout(async () => {
        try {
          const deviceName = `Device (${new Date().toLocaleDateString()})`
          const deviceType = /mobile|android|iphone/i.test(navigator.userAgent) ? "mobile" : "laptop"
          const userAgent = navigator.userAgent
          const ipAddress = "unknown" // We'll get this from server if available

          await trackDeviceSession(deviceName, deviceType, ipAddress, userAgent)
        } catch (deviceError) {
          console.error("[v0] Device tracking error:", deviceError)
          // Silently fail - don't block login
        }
      }, 100)

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VetUp</span>
          </Link>
          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 px-0 lg:px-6">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="px-0 lg:px-6">
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="font-medium text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Right side - Image/Branding */}
      <div className="hidden bg-primary lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-md text-center text-primary-foreground">
          <GraduationCap className="mx-auto mb-8 h-20 w-20" />
          <h2 className="mb-4 text-3xl font-bold">Start Learning Today</h2>
          <p className="text-lg text-primary-foreground/80">
            Access thousands of courses from expert instructors. Learn at your own pace and achieve your goals.
          </p>
        </div>
      </div>
    </div>
  )
}
