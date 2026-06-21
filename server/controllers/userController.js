import Course from "../models/Course.js"
import { CourseProgress } from "../models/CourseProgress.js"
import { Purchase } from "../models/Purchase.js"
import User from "../models/User.js"
import stripe from "stripe"



// Get User Data
export const getUserData = async (req, res) => {
    try {
        const userId = req.user.userId
        const user = await User.findById(userId).select('-password -refreshToken')

        if (!user) {
            return res.json({ success: false, message: 'User Not Found' })
        }

        res.json({ success: true, user })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Purchase Course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const { origin } = req.headers
        const userId = req.user.userId

        const courseData = await Course.findById(courseId)
        const userData = await User.findById(userId)

        if (!userData || !courseData) {
            return res.json({ success: false, message: 'Data Not Found' })
        }

        const purchaseData = {
            courseId: courseData._id,
            userId,
            amount: (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2),
        }

        const newPurchase = await Purchase.create(purchaseData)

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
        const currency = process.env.CURRENCY.toLocaleLowerCase()

        const line_items = [{
            price_data: {
                currency,
                product_data: { name: courseData.courseTitle },
                unit_amount: Math.floor(newPurchase.amount) * 100
            },
            quantity: 1
        }]

        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`,
            cancel_url: `${origin}/`,
            line_items,
            mode: 'payment',
            metadata: { purchaseId: newPurchase._id.toString() }
        })

        res.json({ success: true, session_url: session.url })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Users Enrolled Courses
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.userId
        const userData = await User.findById(userId).populate('enrolledCourses')
        res.json({ success: true, enrolledCourses: userData.enrolledCourses })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const userId = req.user.userId
        const { courseId, lectureId } = req.body

        const progressData = await CourseProgress.findOne({ userId, courseId })

        if (progressData) {
            if (progressData.lectureCompleted.includes(lectureId)) {
                return res.json({ success: true, message: 'Lecture Already Completed' })
            }
            progressData.lectureCompleted.push(lectureId)
            await progressData.save()
        } else {
            await CourseProgress.create({ userId, courseId, lectureCompleted: [lectureId] })
        }

        res.json({ success: true, message: 'Progress Updated' })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const userId = req.user.userId
        const { courseId } = req.body
        const progressData = await CourseProgress.findOne({ userId, courseId })
        res.json({ success: true, progressData })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

// Add User Rating to Course
export const addUserRating = async (req, res) => {
    const userId = req.user.userId
    const { courseId, rating } = req.body

    if (!courseId || !userId || !rating || rating < 1 || rating > 5) {
        return res.json({ success: false, message: 'Invalid Details' })
    }

    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.json({ success: false, message: 'Course not found.' })
        }

        const user = await User.findById(userId)
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: 'User has not purchased this course.' })
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId)
        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating
        } else {
            course.courseRatings.push({ userId, rating })
        }

        await course.save()
        return res.json({ success: true, message: 'Rating added' })

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

// Get Student Dashboard Data
export const getStudentDashboard = async (req, res) => {
    try {
        const userId = req.user.userId
        const userData = await User.findById(userId).populate('enrolledCourses')

        if (!userData) {
            return res.json({ success: false, message: 'User not found' })
        }

        const enrolledCourses = userData.enrolledCourses
        const totalCourses = enrolledCourses.length

        const progressRecords = await CourseProgress.find({ userId })

        let totalCompleted = 0
        let totalLectures = 0

        const courseBreakdown = enrolledCourses.map(course => {
            const lectures = course.courseContent.reduce(
                (sum, ch) => sum + ch.chapterContent.length, 0
            )
            const progress = progressRecords.find(
                p => p.courseId.toString() === course._id.toString()
            )
            const completed = progress ? progress.lectureCompleted.length : 0
            const percent = lectures > 0 ? Math.round((completed / lectures) * 100) : 0

            totalLectures += lectures
            totalCompleted += completed

            return {
                courseId: course._id,
                title: course.courseTitle,
                thumbnail: course.courseThumbnail,
                totalLectures: lectures,
                completedLectures: completed,
                completionPercent: percent,
            }
        })

        const overallCompletion = totalLectures > 0
            ? Math.round((totalCompleted / totalLectures) * 100)
            : 0

        res.json({
            success: true,
            dashboard: {
                totalCourses,
                overallCompletion,
                courseBreakdown,
            }
        })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
