import Quiz from '../models/Quiz.js'
import { CourseProgress } from '../models/CourseProgress.js'

// GET /api/user/quiz/:lectureId
export const getQuiz = async (req, res) => {
    try {
        const { lectureId } = req.params
        const quiz = await Quiz.findOne({ lectureId })
        if (!quiz) {
            return res.json({ success: true, quiz: null })
        }
        // Strip correct answers before sending to client
        const safe = {
            _id: quiz._id,
            lectureId: quiz.lectureId,
            questions: quiz.questions.map(q => ({
                text: q.text,
                options: q.options,
            }))
        }
        res.json({ success: true, quiz: safe })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// POST /api/user/submit-quiz
export const submitQuiz = async (req, res) => {
    try {
        const userId = req.user.userId
        const { quizId, courseId, answers } = req.body

        const quiz = await Quiz.findById(quizId)
        if (!quiz) return res.json({ success: false, message: 'Quiz not found' })

        let score = 0
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctIndex) score++
        })

        const total = quiz.questions.length

        let progress = await CourseProgress.findOne({ userId, courseId })
        if (!progress) {
            progress = await CourseProgress.create({ userId, courseId, lectureCompleted: [] })
        }

        // Replace existing score for this quiz if already attempted
        const existing = progress.quizScores.findIndex(s => s.quizId?.toString() === quizId)
        if (existing > -1) {
            progress.quizScores[existing] = { quizId, score, total }
        } else {
            progress.quizScores.push({ quizId, score, total })
        }

        await progress.save()

        res.json({ success: true, score, total, percent: Math.round((score / total) * 100) })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
