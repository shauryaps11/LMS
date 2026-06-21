import express from 'express'
import {
    addUserRating,
    getUserCourseProgress,
    getUserData,
    purchaseCourse,
    updateUserCourseProgress,
    userEnrolledCourses,
    getStudentDashboard
} from '../controllers/userController.js'
import { submitQuiz, getQuiz } from '../controllers/quizController.js'
import { protect } from '../middlewares/authMiddleware.js'
import { cache } from '../middleware/cache.js'

const userRouter = express.Router()

userRouter.get('/data', protect, getUserData)
userRouter.post('/purchase', protect, purchaseCourse)
userRouter.get('/enrolled-courses', protect, cache(120), userEnrolledCourses)
userRouter.post('/update-course-progress', protect, updateUserCourseProgress)
userRouter.post('/get-course-progress', protect, getUserCourseProgress)
userRouter.post('/add-rating', protect, addUserRating)
userRouter.get('/dashboard', protect, getStudentDashboard)

// Quiz routes
userRouter.get('/quiz/:lectureId', protect, getQuiz)
userRouter.post('/submit-quiz', protect, submitQuiz)

export default userRouter
