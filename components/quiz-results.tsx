'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, DownloadIcon } from 'lucide-react'

interface QuizResultsProps {
  score: number
  passScore: number
  totalQuestions: number
  correctAnswers: number
  onRetry?: () => void
  onDownload?: () => void
}

export function QuizResults({
  score,
  passScore,
  totalQuestions,
  correctAnswers,
  onRetry,
  onDownload,
}: QuizResultsProps) {
  const passed = score >= passScore
  const percentage = Math.round(score)

  return (
    <div className="space-y-6">
      <Card className={passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardContent className="pt-6 text-center space-y-4">
          {passed ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          )}
          <h2 className="text-3xl font-bold">
            {passed ? 'Congratulations!' : 'Not Passed'}
          </h2>
          <p className="text-4xl font-bold text-primary">{percentage}%</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Correct Answers</p>
              <p className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Passing Score</p>
              <p className="text-2xl font-bold">{passScore}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Your Score</p>
              <p className="text-2xl font-bold">{percentage}%</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-2xl font-bold">{passed ? 'Passed' : 'Failed'}</p>
            </div>
          </div>

          {passed && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">
                Great job! You have passed this quiz. A certificate will be issued upon course completion.
              </p>
            </div>
          )}

          {!passed && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-900">
                You need {passScore - percentage}% more to pass. Review the material and try again.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex-1 bg-transparent">
                Retry Quiz
              </Button>
            )}
            {onDownload && (
              <Button onClick={onDownload} className="flex-1 gap-2">
                <DownloadIcon className="h-4 w-4" />
                Download Results
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
