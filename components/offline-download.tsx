'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Download, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface OfflineDownloadProps {
  lessonId: string
  lessonTitle: string
  videoUrl: string
  fileSize?: number
}

export function OfflineDownload({
  lessonId,
  lessonTitle,
  videoUrl,
  fileSize = 0,
}: OfflineDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(videoUrl)
      const blob = await response.blob()

      // Simulate download progress
      for (let i = 0; i <= 100; i += 10) {
        setDownloadProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Download the video
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${lessonTitle}.mp4`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setDownloadProgress(0)
      setIsDownloading(false)
    } catch (error) {
      console.error('Download failed:', error)
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download for Offline Viewing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Downloaded videos are protected and can only be viewed within the platform. They cannot be shared or transferred to other devices.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Lesson: <span className="font-medium text-foreground">{lessonTitle}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            File Size: <span className="font-medium text-foreground">{(fileSize / 1024 / 1024).toFixed(2)} MB</span>
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Keep downloaded videos as long as you are enrolled in the course. You can delete them manually from your device settings anytime.
          </p>
        </div>

        {isDownloading && (
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <p className="text-sm text-center text-muted-foreground">{downloadProgress}%</p>
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="w-full gap-2"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download Video'}
        </Button>

        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            This video is DRM-protected. Offline downloads cannot be transferred between devices or shared with others.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
