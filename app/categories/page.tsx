import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default async function CategoriesPage() {
  const supabase = await createClient()

  // Get all categories with course counts
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_published", true)

      return {
        ...category,
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
            <h1 className="text-3xl font-bold text-foreground">choose your university</h1>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {categoriesWithCounts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {categoriesWithCounts.map((category) => (
                <a
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
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
                          {category.name}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {category.course_count} {category.course_count === 1 ? "course" : "courses"}
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
              <p className="text-lg text-muted-foreground">Not available yet</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
