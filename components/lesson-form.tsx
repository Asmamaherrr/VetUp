"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
  const [contentType, setContentType] = useState<"video" | "text" | "quiz" | "resource" | "pdf">(
    lesson?.content_type || "video"
  )
  const [contentUrl, setContentUrl] = useState(lesson?.video_url || lesson?.resource_url || "")
  const [contentText, setContentText] = useState(lesson?.text_content || "")
  const [duration, setDuration] = useState(lesson?.duration_minutes?.toString() || "10")
  const [isFree, setIsFree] = useState(lesson?.is_free_preview || false)
  const [isLoading, setIsLoading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfFileName, setPdfFileName] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoFileName, setVideoFileName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const sanitizeFileName = (fileName: string) => {
    const ext = fileName.substring(fileName.lastIndexOf("."))
    const name = fileName
      .substring(0, fileName.lastIndexOf("."))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50)

    return `${name}${ext}`
  }

  const uploadToStorage = async (file: File, folder: "videos" | "pdfs") => {
    const cleanName = sanitizeFileName(file.name)
    const path = `${folder}/${courseId}/${Date.now()}-${cleanName}`

    const { error } = await supabase.storage
      .from("lessons")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from("lessons")
      .getPublicUrl(path)

    return data.publicUrl
  }

  const [videoUploadProgress] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Lesson title is required")
      return
    }

    setIsLoading(true)

    try {
      let finalContentUrl = contentUrl

      // 🎥 VIDEO UPLOAD
      if (contentType === "video" && videoFile) {
        finalContentUrl = await uploadToStorage(videoFile, "videos")
      }

      // 📄 PDF UPLOAD
      if (contentType === "pdf" && pdfFile) {
        finalContentUrl = await uploadToStorage(pdfFile, "pdfs")
      }

      const lessonData = {
        course_id: courseId,
        title,
        description: description || null,
        content_type: contentType,
        video_url: contentType === "video" ? finalContentUrl : null,
        text_content: contentType === "text" ? contentText : null,
        resource_url: contentType === "pdf" || contentType === "resource" ? finalContentUrl : null,
        duration_minutes: Number(duration) || 10,
        position: lesson?.position ?? orderIndex,
        is_free_preview: isFree,
        updated_at: new Date().toISOString(),
        created_at: lesson?.created_at ?? new Date().toISOString(),
      }

      if (lesson) {
        const { error } = await supabase.from("lessons").update(lessonData).eq("id", lesson.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("lessons").insert(lessonData)
        if (error) throw error
      }

      router.push(`/instructor/courses/${courseId}/lessons`)
      router.refresh()
    } catch (err: any) {
      console.error(err)
      setError(err.message || "Failed to save lesson")
    } finally {
      setIsLoading(false)
    }
  }

  // UI HANDLERS (ما تغيروا)
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setVideoFile(file)
      setVideoFileName(file.name)
      setContentUrl("")
    }
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPdfFile(file)
      setPdfFileName(file.name)
      setContentUrl("")
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
                onValueChange={(v: "video" | "text" | "quiz" | "resource" | "pdf") => setContentType(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text/Article</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="resource">Resource</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
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
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="videoFile">Upload Video File</Label>
                <input
                  id="videoFile"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {videoFileName && (
                  <p className="text-xs text-muted-foreground">Selected: {videoFileName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP4, WebM, OGG, MOV (Max 500MB)
                </p>
              </div>

              {videoUploadProgress > 0 && videoUploadProgress < 100 && (
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
              )}

              <div className="relative">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex-1 border-t" />
                  <span>OR</span>
                  <div className="flex-1 border-t" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contentUrl">Video URL</Label>
                <Input
                  id="contentUrl"
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4 or YouTube/Vimeo link"
                  disabled={videoFile !== null}
                />
                <p className="text-xs text-muted-foreground">
                  {contentType === "video"
                    ? "Paste a YouTube, Vimeo link, or direct video file URL"
                    : "Link to downloadable resource"}
                </p>
              </div>
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

          {contentType === "pdf" && (
            <div className="grid gap-2">
              <Label htmlFor="pdfFile">PDF File *</Label>
              <input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {pdfFileName && <p className="text-xs text-muted-foreground">Selected: {pdfFileName}</p>}
              <p className="text-xs text-muted-foreground">Maximum file size: 50MB</p>
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
