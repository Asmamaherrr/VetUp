'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Download, ZoomIn, ZoomOut, Check } from 'lucide-react'

interface PdfViewerProps {
  src: string
  title: string
  userId?: string
}

export function PdfViewer({ src, title, userId }: PdfViewerProps) {
  const [scale, setScale] = useState(1)
  const [isCached, setIsCached] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  // Check if PDF is cached on mount
  useEffect(() => {
    checkCacheStatus()
  }, [src])

  const checkCacheStatus = async () => {
    try {
      const cache = await caches.open('pdf-cache-v1')
      const cachedResponse = await cache.match(src)
      setIsCached(!!cachedResponse)
    } catch (error) {
      console.error('[v0] Error checking PDF cache:', error)
    }
  }

  const handleCachePdfOffline = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(src)
      const cache = await caches.open('pdf-cache-v1')
      await cache.put(src, response.clone())
      setIsCached(true)
      console.log('[v0] PDF cached successfully for offline viewing')
    } catch (error) {
      console.error('[v0] Error caching PDF:', error)
      alert('Failed to cache PDF. Please check your internet connection.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  return (
    <Card className="overflow-hidden bg-background">
      <div className="bg-muted border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleZoomOut} disabled={scale <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button size="sm" variant="ghost" onClick={handleZoomIn} disabled={scale >= 2}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleCachePdfOffline}
            disabled={isDownloading}
            title={isCached ? "PDF cached for offline viewing" : "Cache PDF for offline viewing"}
          >
            {isCached ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* PDF Embed with Watermark */}
      <div className="relative w-full bg-black flex items-center justify-center min-h-96">
        <iframe
          src={`${src}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-screen"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
          title={title}
        />
        
        {/* Student ID Watermark */}
        {userId && (
          <div className="absolute top-4 right-4 bg-black/60 text-white px-3 py-2 rounded text-sm font-mono pointer-events-none z-10">
            <div className="text-xs opacity-75">Student ID:</div>
            <div className="font-semibold">{userId}</div>
          </div>
        )}
      </div>
    </Card>
  )
}
