import mongoose from 'mongoose'

const quizScoreSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    attemptedAt: { type: Date, default: Date.now }
}, { _id: false })

const courseProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: [{ type: String }],
    quizScores: [quizScoreSchema],
}, { minimize: false })

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema)
