import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
}, { _id: false })

const quizSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    lectureId: { type: String, required: true },
    questions: [questionSchema],
}, { timestamps: true })

const Quiz = mongoose.model('Quiz', quizSchema)

export default Quiz
