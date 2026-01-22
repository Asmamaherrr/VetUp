import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { FeaturedCourses } from "@/components/featured-courses"
import { CategoriesSection } from "@/components/categories-section"
import { StatsSection } from "@/components/stats-section"
import { CTASection } from "@/components/cta-section"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCourses />
        <CategoriesSection />
      </main>
      <Footer />
    </div>
  )
}
