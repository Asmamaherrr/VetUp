import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get all universities with course counts
  const { data: universities } = await supabase.from("universities").select("*").order("name")

  const universitiesWithCounts = await Promise.all(
    (universities || []).map(async (university) => {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("university_id", university.id)
        .eq("is_published", true)

      return {
        ...university,
        course_count: count || 0,
      }
    }),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="border-b border-border bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Universities</h1>
            <p className="mt-2 text-muted-foreground">Explore courses by university</p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {universitiesWithCounts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {universitiesWithCounts.map((university) => (
                <a
                  key={university.id}
                  href={`/courses?university=${university.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg">
                    <CardContent className="flex h-40 items-center justify-center p-6">
                      <div className="text-center">
                        <div className="mb-3 flex justify-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {university.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {university.course_count} {university.course_count === 1 ? "course" : "courses"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">No universities available yet</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
