'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { CheckCircle2, XCircle } from 'lucide-react'

interface Quiz {
  id: string
  title: string
  description: string
  passScore: number
  questions: Array<{
    id: string
    text: string
    type: 'multiple_choice' | 'true_false' | 'short_answer'
    options?: string[]
    correctAnswer: string
  }>
}

export function QuizPlayer({ quiz, onComplete }: { quiz: Quiz; onComplete: (score: number) => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const question = quiz.questions[currentQuestion]
  const isLastQuestion = currentQuestion === quiz.questions.length - 1

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [question.id]: answer,
    })
  }

  const calculateScore = () => {
    let correct = 0
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++
      }
    })
    return (correct / quiz.questions.length) * 100
  }

  const handleSubmit = () => {
    const score = calculateScore()
    setSubmitted(true)
    onComplete(score)
  }

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  if (submitted) {
    const score = calculateScore()
    const passed = score >= quiz.passScore

    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          {passed ? (
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
          )}
          <h2 className="text-2xl font-bold">
            {passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
          </h2>
          <p className="text-3xl font-bold text-primary">{Math.round(score)}%</p>
          <p className="text-muted-foreground">
            You got {Math.round((score / 100) * quiz.questions.length)} out of{' '}
            {quiz.questions.length} questions correct
          </p>
          <p className="text-sm text-muted-foreground">
            Passing score: {quiz.passScore}%
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{quiz.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {quiz.questions.length}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">{question.text}</h3>

            {question.type === 'multiple_choice' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(val) => handleAnswer(val)}
              >
                <div className="space-y-3">
                  {question.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`option-${idx}`} />
                      <Label htmlFor={`option-${idx}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {question.type === 'true_false' && (
              <RadioGroup
                value={answers[question.id] || ''}
                onValueChange={(val) => handleAnswer(val)}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="true-option" />
                    <Label htmlFor="true-option" className="font-normal cursor-pointer">
                      True
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="false-option" />
                    <Label htmlFor="false-option" className="font-normal cursor-pointer">
                      False
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            )}

            {question.type === 'short_answer' && (
              <Input
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Enter your answer"
              />
            )}
          </div>

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button onClick={handleSubmit} className="flex-1">
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
