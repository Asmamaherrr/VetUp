'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, Save } from 'lucide-react'

interface Question {
  id: string
  text: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  options?: string[]
  correctAnswer: string
}

export function QuizBuilder({ lessonId }: { lessonId: string }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [passScore, setPassScore] = useState(70)
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: '',
        type: 'multiple_choice',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const saveQuiz = async () => {
    try {
      // Save quiz to database
      console.log('Saving quiz:', { title, description, passScore, questions })
      // TODO: Implement save functionality
    } catch (error) {
      console.error('Failed to save quiz:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter quiz title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter quiz description"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pass-score">Pass Score (%)</Label>
            <Input
              id="pass-score"
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
          <Button onClick={addQuestion} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Question {index + 1}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeQuestion(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Question Text</Label>
                <Input
                  value={question.text}
                  onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                  placeholder="Enter question text"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Question Type</Label>
                <select
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(question.id, { type: e.target.value as any })
                  }
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>

              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  <Label>Options</Label>
                  {question.options?.map((option, idx) => (
                    <Input
                      key={idx}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(question.options || [])]
                        newOptions[idx] = e.target.value
                        updateQuestion(question.id, { options: newOptions })
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              <div>
                <Label>Correct Answer</Label>
                <Input
                  value={question.correctAnswer}
                  onChange={(e) => updateQuestion(question.id, { correctAnswer: e.target.value })}
                  placeholder="Enter correct answer"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={saveQuiz} className="w-full gap-2" size="lg">
        <Save className="h-4 w-4" />
        Save Quiz
      </Button>
    </div>
  )
}
