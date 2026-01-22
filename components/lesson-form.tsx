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
import { Switch } from "@/components/ui/switch"
import type { Lesson } from "@/lib/types"

interface LessonFormProps {
  courseId: string
  orderIndex: number
  lesson?: Lesson
}

export function LessonForm({ courseId, orderIndex, lesson }: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title || "")
  const [description, setDescription] = useState(lesson?.description || "")
  const [contentType, setContentType] = useState<"video" | "text" | "quiz" | "resource">(
    lesson?.content_type || "video",
  )
  const [contentUrl, setContentUrl] = useState(lesson?.content_url || "")
  const [contentText, setContentText] = useState(lesson?.content_text || "")
  const [duration, setDuration] = useState(lesson?.duration?.toString() || "10")
  const [isFree, setIsFree] = useState(lesson?.is_free || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const lessonData = {
        course_id: courseId,
        title,
        description: description || null,
        content_type: contentType,
        content_url: contentUrl || null,
        content_text: contentText || null,
        duration: Number.parseInt(duration) || 10,
        position: lesson?.position || orderIndex,
        is_free: isFree,
        updated_at: new Date().toISOString(),
      }

      if (lesson) {
        const { error } = await supabase.from("lessons").update(lessonData).eq("id", lesson.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("lessons").insert(lessonData)
        if (error) throw error

        // Update course totals
        await supabase.rpc("update_course_totals", { course_id_param: courseId })
      }

      router.push(`/instructor/courses/${courseId}/lessons`)
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save lesson")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Details</CardTitle>
          <CardDescription>Information about this lesson</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Introduction to Variables"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this lesson covers..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select
                value={contentType}
                onValueChange={(v: "video" | "text" | "quiz" | "resource") => setContentType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>
          </div>

          {(contentType === "video" || contentType === "resource") && (
            <div className="grid gap-2">
              <Label htmlFor="contentUrl">Content URL</Label>
              <Input
                id="contentUrl"
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
              <p className="text-xs text-muted-foreground">
                {contentType === "video"
                  ? "Link to your video file (MP4, YouTube, Vimeo)"
                  : "Link to downloadable resource"}
              </p>
            </div>
          )}

          {contentType === "text" && (
            <div className="grid gap-2">
              <Label htmlFor="contentText">Content</Label>
              <Textarea
                id="contentText"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Write your lesson content here... (HTML supported)"
                rows={10}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch id="isFree" checked={isFree} onCheckedChange={setIsFree} />
            <Label htmlFor="isFree" className="cursor-pointer">
              Free Preview
            </Label>
            <span className="text-sm text-muted-foreground">Allow non-enrolled users to view this lesson</span>
          </div>
        </CardContent>
      </Card>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="flex gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} className="bg-transparent">
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : lesson ? "Update Lesson" : "Add Lesson"}
        </Button>
      </div>
    </form>
  )
}
