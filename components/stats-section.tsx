import { Users, BookOpen, Award, Play } from "lucide-react"

const stats = [
  { label: "Active Students", value: "50,000+", icon: Users },
  { label: "Courses Available", value: "500+", icon: BookOpen },
  { label: "Certificates Issued", value: "25,000+", icon: Award },
  { label: "Video Hours", value: "10,000+", icon: Play },
]

export function StatsSection() {
  return (
    <section className="border-y border-border bg-card py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <stat.icon className="mb-4 h-10 w-10 text-primary" />
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
