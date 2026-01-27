'use client';

import React from "react"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, Star } from "lucide-react"
import type { Course } from "@/lib/types"

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const router = useRouter()

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const levelMap: { [key: string]: string } = {
    beginner: "1st",
    intermediate: "2nd",
    advanced: "3rd",
    expert: "4th",
    master: "5th",
  }

  const levelColors = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-destructive/10 text-destructive",
    expert: "bg-purple-100 text-purple-700",
    master: "bg-amber-100 text-amber-700",
  }

  const getLevelDisplay = (level: string) => {
    return levelMap[level] || level
  }

  const handleCourseClick = () => {
    router.push(`/courses/${course.slug}`)
  }

  const handleInstructorClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/instructors/${course.instructor?.id}`)
  }

  return (
    <Card 
      className="group h-full overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={handleCourseClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={
            course.thumbnail_url ||
            `/placeholder.svg?height=200&width=360&query=${encodeURIComponent(course.title + " course thumbnail") || "/placeholder.svg"}`
          }
          alt={course.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <Badge className={`absolute right-2 top-2 ${levelColors[course.level]}`}>{getLevelDisplay(course.level)}</Badge>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          {course.category && (
            <Badge variant="secondary" className="text-xs">
              {course.category.name}
            </Badge>
          )}
        </div>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary">
          {course.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
        {course.instructor && (
          <div 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={handleInstructorClick}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={course.instructor.avatar_url || ""} />
              <AvatarFallback className="text-xs">{(course.instructor.full_name || "I").charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hover:text-primary">{course.instructor.full_name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(course.total_duration)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.enrollment_count || 0}
          </div>
          {course.average_rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {course.average_rating.toFixed(1)}
            </div>
          )}
        </div>
        <div className="text-lg font-bold text-foreground">
          {course.price === 0 ? "Free" : `${course.price} EGP`}
        </div>
      </CardFooter>
    </Card>
  )
}
