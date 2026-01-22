import type React from "react"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Code, Palette, TrendingUp, Megaphone, BookOpen } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  development: <Code className="h-8 w-8" />,
  design: <Palette className="h-8 w-8" />,
  business: <TrendingUp className="h-8 w-8" />,
  marketing: <Megaphone className="h-8 w-8" />,
}

export async function CategoriesSection() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const categoriesWithCount = await Promise.all(
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
    <section className="bg-muted/50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground">choose your University</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categoriesWithCount.map((category) => (
            <Link key={category.id} href={`/courses?category=${category.slug}`}>
              <Card className="group h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {iconMap[category.slug] || <BookOpen className="h-8 w-8" />}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.course_count} courses</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
