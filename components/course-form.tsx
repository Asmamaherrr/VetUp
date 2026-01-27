"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Category, Course } from "@/lib/types"

interface CourseFormProps {
  categories: Category[]
  instructorId: string
  course?: Course
}

export function CourseForm({ categories, instructorId, course }: CourseFormProps) {
  const [title, setTitle] = useState(course?.title || "")
  const [description, setDescription] = useState(course?.description || "")
  const [categoryId, setCategoryId] = useState(course?.category_id || "")
  const [level, setLevel] = useState<"1st" | "2nd" | "3rd" | "4th " | "5th">(course?.level || "1st")
  const [price, setPrice] = useState(course?.price?.toString() || "0")
  const [thumbnailUrl, setThumbnailUrl] = useState(course?.thumbnail_url || "")
  const [isPublished, setIsPublished] = useState(course?.is_published || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const courseData = {
        title,
        slug: generateSlug(title),
        description,
        category_id: categoryId || null,
        level,
        price: Number.parseFloat(price) || 0,
        thumbnail_url: thumbnailUrl || null,
        is_published: isPublished,
        instructor_id: instructorId,
        updated_at: new Date().toISOString(),
      }

      if (course) {
        const { error } = await supabase.from("courses").update(courseData).eq("id", course.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("courses").insert(courseData)
        if (error) throw error
      }

      router.push("/instructor/courses")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save course")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Basic information about your course</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete Web Development Bootcamp"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what students will learn in this course..."
              rows={4}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="level">Level</Label>
              <Select value={level} onValueChange={(v: "1st" | "2nd" | "3rd" | "4th" | "5th") => setLevel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">1st</SelectItem>
                  <SelectItem value="second">2nd</SelectItem>
                  <SelectItem value="third">3rd</SelectItem>
                  <SelectItem value="forth">4th</SelectItem>
                  <SelectItem value="fifth">5th</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Price (EGP)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0 for free"
              />
              <p className="text-xs text-muted-foreground">Set to 0 for a free course</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={isPublished ? "published" : "draft"}
                onValueChange={(v) => setIsPublished(v === "published")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="thumbnail">Thumbnail URL</Label>
            <Input
              id="thumbnail"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="text-xs text-muted-foreground">Recommended size: 1280x720 pixels</p>
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : course ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </form>
  )
}
