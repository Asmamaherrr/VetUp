import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Play, BookOpen, Award } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 lg:py-20">
      <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-6xl">
                For Future Vets
              </h1>
              <p className="text-pretty text-lg text-muted-foreground sm:text-xl">
                Because average grades are not your goal !<span className="block">this is where veterinary courses turn into confiedence,
                clarity, and top academic performance.</span>
              </p>
            </div>
            <form action="/courses" className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" name="search" placeholder="What do you want to learn?" className="h-12 pl-10" />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6">
                Search
              </Button>
            </form>
          </div>
          <div className="relative hidden lg:block">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8">
              <div className="grid h-full grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-xl bg-card p-4 shadow-lg">
                    <div className="mb-2 h-24 rounded-lg bg-muted" />
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="mt-2 h-2 w-1/2 rounded bg-muted" />
                  </div>
                  <div className="overflow-hidden rounded-xl bg-card p-4 shadow-lg">
                    <div className="mb-2 h-20 rounded-lg bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted" />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="overflow-hidden rounded-xl bg-card p-4 shadow-lg">
                    <div className="mb-2 h-28 rounded-lg bg-muted" />
                    <div className="h-3 w-full rounded bg-muted" />
                    <div className="mt-2 h-2 w-3/4 rounded bg-muted" />
                  </div>
                  <div className="overflow-hidden rounded-xl bg-card p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20" />
                      <div className="space-y-1">
                        <div className="h-3 w-20 rounded bg-muted" />
                        <div className="h-2 w-16 rounded bg-muted" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
