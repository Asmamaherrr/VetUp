import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Mail, ArrowRight, Home } from "lucide-react"
import Link from "next/link"

interface ConfirmationPageProps {
  searchParams: Promise<{ payment_id?: string }>
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { payment_id } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  if (!payment_id) {
    redirect("/courses")
  }

  const { data: payment } = await supabase
    .from("payments")
    .select(
      `
      *,
      courses (title, slug, thumbnail_url)
    `,
    )
    .eq("id", payment_id)
    .eq("user_id", user.id)
    .single()

  if (!payment) {
    redirect("/courses")
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Success Animation */}
        <div className="text-center space-y-4">
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative bg-green-100 rounded-full p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Payment Submitted!</h1>
            <p className="text-muted-foreground">Thank you, {profile?.full_name || "Student"}!</p>
          </div>
        </div>

        {/* Payment Details Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-2 bg-amber-50 text-amber-700 rounded-lg py-3 px-4">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Payment Pending Verification</span>
            </div>

            {/* Course Info */}
            <div className="text-center pb-4 border-b">
              <p className="text-sm text-muted-foreground mb-1">Course</p>
              <p className="font-semibold">{payment.courses?.title}</p>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="font-semibold">EGP {payment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Method</p>
                <p className="font-semibold capitalize">
                  {payment.payment_method === "vodafone_cash"
                    ? "Vodafone Cash"
                    : payment.payment_method === "instapay"
                      ? "InstaPay"
                      : "Visa Card"}
                </p>
              </div>
              {payment.payment_method === "visa" && payment.metadata?.cardLast4 ? (
                <div>
                  <p className="text-muted-foreground">Card</p>
                  <p className="font-mono font-semibold">
                    •••• •••• •••• {payment.metadata.cardLast4}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-muted-foreground">Transaction ID</p>
                  <p className="font-mono font-semibold">{payment.transaction_id}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Reference</p>
                <p className="font-mono text-xs">{payment.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Payment Screenshot */}
            {payment.screenshot_url && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Payment Screenshot</p>
                <img 
                  src={payment.screenshot_url || "/placeholder.svg"} 
                  alt="Payment screenshot" 
                  className="max-h-64 rounded-lg border w-full object-cover"
                />
              </div>
            )}

            {/* What's Next */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                What happens next?
              </h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-medium">1.</span>
                  Our team will verify your payment within 1-24 hours
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-medium">2.</span>
                  You&apos;ll receive an email confirmation once verified
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-medium">3.</span>
                  Access your course instantly from your dashboard
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/courses">
                  <Home className="mr-2 h-4 w-4" />
                  Browse More Courses
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Support Note */}
        <p className="text-center text-sm text-muted-foreground">
          Have questions? Contact us at{" "}
          <a href="mailto:support@courses.com" className="text-primary hover:underline">
            support@courses.com
          </a>
        </p>
      </div>
    </div>
  )
}
