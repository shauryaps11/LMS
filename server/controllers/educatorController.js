import { v2 as cloudinary } from 'cloudinary'
import Course from '../models/Course.js'
import { Purchase } from '../models/Purchase.js'
import User from '../models/User.js'

// Become Educator — updates the requesting user's role
export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.user.userId
        await User.findByIdAndUpdate(userId, { role: 'educator' })
        res.json({ success: true, message: 'You can publish a course now' })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add New Course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body
        const imageFile = req.file
        const educatorId = req.user.userId

        if (!imageFile) {
            return res.json({ success: false, message: 'Thumbnail Not Attached' })
        }

        const parsedCourseData = JSON.parse(courseData)
        parsedCourseData.educator = educatorId

        const newCourse = await Course.create(parsedCourseData)

        const imageUpload = await cloudinary.uploader.upload(imageFile.path)
        newCourse.courseThumbnail = imageUpload.secure_url
        await newCourse.save()

        res.json({ success: true, message: 'Course Added' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.user.userId
        const courses = await Course.find({ educator })
        res.json({ success: true, courses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Educator Dashboard Data
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.user.userId
        const courses = await Course.find({ educator })
        const totalCourses = courses.length
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        })

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0)

        const enrolledStudentsData = []
        for (const course of courses) {
            const students = await User.find(
                { _id: { $in: course.enrolledStudents } },
                'name imageUrl'
            )
            students.forEach(student => {
                enrolledStudentsData.push({ courseTitle: course.courseTitle, student })
            })
        }

        res.json({
            success: true,
            dashboardData: { totalEarnings, enrolledStudentsData, totalCourses }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get Enrolled Students Data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        const educator = req.user.userId
        const courses = await Course.find({ educator })
        const courseIds = courses.map(course => course._id)

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle')

        const enrolledStudents = purchases.map(purchase => ({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
        }))

        res.json({ success: true, enrolledStudents })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Admin: List all users (admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password -refreshToken')
        res.json({ success: true, users })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Upload lecture video — returns HLS streaming URL via Cloudinary
export const uploadLectureVideo = async (req, res) => {
    try {
        const videoFile = req.file
        if (!videoFile) {
            return res.json({ success: false, message: 'No video file attached' })
        }

        const result = await cloudinary.uploader.upload(videoFile.path, {
            resource_type: 'video',
            eager: [{ streaming_profile: 'hd', format: 'm3u8' }],
            eager_async: false,
        })

        // Use the HLS streaming URL if available, else fall back to direct URL
        const hlsUrl = result.eager?.[0]?.secure_url || result.secure_url

        res.json({ success: true, videoUrl: hlsUrl, publicId: result.public_id })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Admin: Toggle educator role for a user
export const toggleEducatorRole = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findById(userId)
        if (!user) return res.json({ success: false, message: 'User not found' })

        user.role = user.role === 'educator' ? 'student' : 'educator'
        await user.save()
        res.json({ success: true, message: `Role set to ${user.role}`, role: user.role })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
