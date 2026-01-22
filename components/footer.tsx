import Link from "next/link"
import { GraduationCap } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">VetUp</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Supporting the next generation of veterinarians
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold">Learn</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground">
                  Universities
                </Link>
              </li>
              <li>
                <Link href="/instructors" className="hover:text-foreground">
                  Instructors
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
