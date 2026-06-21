import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { Line } from 'rc-progress'
import Footer from '../../components/student/Footer'
import { TableRowSkeleton } from '../../components/student/Skeleton'
import { Link } from 'react-router-dom'

const MyEnrollments = () => {
    const {
        userData, enrolledCourses, fetchUserEnrolledCourses,
        navigate, calculateCourseDuration, calculateNoOfLectures, api
    } = useContext(AppContext)

    const [progressArray, setProgressData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        document.title = 'My Enrollments — EduFlow'
    }, [])

    const getCourseProgress = async () => {
        try {
            const tempProgressArray = await Promise.all(
                enrolledCourses.map(async (course) => {
                    const { data } = await api.post('/api/user/get-course-progress', { courseId: course._id })
                    const totalLectures = calculateNoOfLectures(course)
                    const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0
                    return { totalLectures, lectureCompleted }
                })
            )
            setProgressData(tempProgressArray)
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (userData) {
            fetchUserEnrolledCourses()
        }
    }, [userData])

    useEffect(() => {
        if (enrolledCourses.length > 0) {
            getCourseProgress()
        } else if (userData) {
            setLoading(false)
        }
    }, [enrolledCourses])

    return (
        <>
            <div className='md:px-36 px-8 pt-10 min-h-[60vh]'>
                <h1 className='text-2xl font-semibold'>My Enrollments</h1>

                {loading ? (
                    <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Course</th>
                                <th className="px-4 py-3 font-semibold max-sm:hidden">Duration</th>
                                <th className="px-4 py-3 font-semibold max-sm:hidden">Completed</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)}
                        </tbody>
                    </table>
                ) : enrolledCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-gray-500 text-lg">You haven't enrolled in any courses yet.</p>
                        <Link
                            to="/course-list"
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <table className="md:table-auto table-fixed w-full overflow-hidden border mt-10">
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Course</th>
                                <th className="px-4 py-3 font-semibold truncate max-sm:hidden">Duration</th>
                                <th className="px-4 py-3 font-semibold truncate max-sm:hidden">Completed</th>
                                <th className="px-4 py-3 font-semibold truncate">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {enrolledCourses.map((course, index) => {
                                const prog = progressArray[index]
                                const percent = prog ? Math.round((prog.lectureCompleted / prog.totalLectures) * 100) : 0
                                const isComplete = prog && prog.lectureCompleted === prog.totalLectures && prog.totalLectures > 0

                                return (
                                    <tr key={index} className="border-b border-gray-500/20">
                                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                                            <img
                                                src={course.courseThumbnail}
                                                alt={course.courseTitle}
                                                className="w-14 sm:w-24 md:w-28 object-cover rounded"
                                            />
                                            <div className='flex-1'>
                                                <p className='mb-1 max-sm:text-sm font-medium'>{course.courseTitle}</p>
                                                <Line
                                                    className='bg-gray-300 rounded-full'
                                                    strokeWidth={2}
                                                    percent={percent}
                                                    strokeColor={isComplete ? '#16a34a' : '#2563eb'}
                                                />
                                                <p className="text-xs text-gray-400 mt-0.5">{percent}% complete</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-sm:hidden text-sm">{calculateCourseDuration(course)}</td>
                                        <td className="px-4 py-3 max-sm:hidden text-sm">
                                            {prog ? `${prog.lectureCompleted} / ${prog.totalLectures}` : '—'}
                                            <span className='text-xs ml-1 text-gray-400'>lectures</span>
                                        </td>
                                        <td className="px-4 py-3 max-sm:text-right">
                                            <button
                                                onClick={() => navigate('/player/' + course._id)}
                                                className={`px-3 sm:px-5 py-1.5 sm:py-2 max-sm:text-xs text-white rounded transition ${isComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                            >
                                                {isComplete ? 'Completed' : 'Continue'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            <Footer />
        </>
    )
}

export default MyEnrollments
