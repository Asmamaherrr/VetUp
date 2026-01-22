'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Settings,
  Download,
  Rewind,
  FastForward,
} from 'lucide-react'

interface AdvancedVideoPlayerProps {
  src: string
  title: string
  duration?: number
  onDownload?: () => void
}

export function AdvancedVideoPlayer({
  src,
  title,
  duration = 0,
  onDownload,
}: AdvancedVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              src={src}
              className="w-full"
              controls={false}
              playbackRate={playbackSpeed}
              muted={isMuted}
              volume={volume}
            />
          </div>

          <div>
            <h3 className="font-semibold mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </p>
          </div>

          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={(value) => setCurrentTime(value[0])}
            className="w-full"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
              >
                <Rewind className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
              >
                <FastForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Speed:</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                  className="text-xs px-2 py-1 border rounded"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              {onDownload && (
                <Button size="sm" variant="ghost" onClick={onDownload}>
                  <Download className="h-4 w-4" />
                </Button>
              )}

              <Button size="sm" variant="ghost">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
