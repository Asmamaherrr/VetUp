"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getQuiz(quizId: string) {
  try {
    const supabase = await createServerClient()

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single()

    if (quizError) throw quizError

    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("position")

    if (questionsError) throw questionsError

    return { quiz, questions }
  } catch (error) {
    console.error("Get quiz error:", error)
    throw error
  }
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, string>
) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Get quiz and questions
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single()

    if (quizError) throw quizError

    const { data: questions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)

    if (questionsError) throw questionsError

    // Calculate score
    let correctAnswers = 0
    questions?.forEach((question) => {
      const userAnswer = answers[question.id]
      if (userAnswer === question.correct_answer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / (questions?.length || 1)) * 100)
    const passed = score >= (quiz?.pass_score || 70)

    // Check attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)

    if (attemptsError) throw attemptsError

    if ((attempts?.length || 0) >= (quiz?.attempts_allowed || 3)) {
      throw new Error("Maximum attempts reached")
    }

    // Record attempt
    const { error: insertError } = await supabase
      .from("quiz_attempts")
      .insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        passed,
        attempted_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })

    if (insertError) throw insertError

    return { success: true, score, passed }
  } catch (error) {
    console.error("Submit quiz error:", error)
    throw error
  }
}

export async function getQuizAttempts(quizId: string) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const { data: attempts, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .order("attempted_at", { ascending: false })

    if (error) throw error
    return attempts
  } catch (error) {
    console.error("Get quiz attempts error:", error)
    throw error
  }
}
