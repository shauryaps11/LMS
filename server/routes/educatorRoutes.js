import express from 'express'
import {
    addCourse,
    educatorDashboardData,
    getEducatorCourses,
    getEnrolledStudentsData,
    updateRoleToEducator,
    getAllUsers,
    toggleEducatorRole,
    uploadLectureVideo
} from '../controllers/educatorController.js'
import upload from '../configs/multer.js'
import { protect, restrictTo } from '../middlewares/authMiddleware.js'

const educatorRouter = express.Router()

// Any authenticated user can become an educator
educatorRouter.get('/update-role', protect, updateRoleToEducator)

// Educator-only routes
educatorRouter.post('/add-course', protect, restrictTo('educator', 'admin'), upload.single('image'), addCourse)
educatorRouter.get('/courses', protect, restrictTo('educator', 'admin'), getEducatorCourses)
educatorRouter.get('/dashboard', protect, restrictTo('educator', 'admin'), educatorDashboardData)
educatorRouter.get('/enrolled-students', protect, restrictTo('educator', 'admin'), getEnrolledStudentsData)

// Video upload
educatorRouter.post('/upload-video', protect, restrictTo('educator', 'admin'), upload.single('video'), uploadLectureVideo)

// Admin-only routes
educatorRouter.get('/admin/users', protect, restrictTo('admin'), getAllUsers)
educatorRouter.patch('/admin/users/:userId/toggle-role', protect, restrictTo('admin'), toggleEducatorRole)

export default educatorRouter
