import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl bg-primary px-6 py-16 text-center sm:px-12 lg:px-16">
          <h2 className="text-balance text-3xl font-bold text-primary-foreground sm:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-primary-foreground/80">
            Join thousands of students already learning on LearnHub. Start your journey today with our free courses.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/auth/sign-up">
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto bg-transparent"
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
