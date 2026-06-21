import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { Circle } from 'rc-progress'
import Footer from '../../components/student/Footer'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { StatCardSkeleton } from '../../components/student/Skeleton'

const StudentDashboard = () => {
    const { userData, navigate, api } = useContext(AppContext)
    const [dashboard, setDashboard] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        document.title = 'My Dashboard — EduFlow'
    }, [])

    useEffect(() => {
        if (!userData) return
        api.get('/api/user/dashboard')
            .then(({ data }) => {
                if (data.success) setDashboard(data.dashboard)
                else toast.error(data.message)
            })
            .catch(err => toast.error(err.message))
            .finally(() => setLoading(false))
    }, [userData])

    if (!userData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-gray-500">Please sign in to view your dashboard.</p>
            </div>
        )
    }

    return (
        <>
            <div className="md:px-36 px-8 pt-10 min-h-[60vh]">
                <h1 className="text-2xl font-semibold mb-1">My Dashboard</h1>
                <p className="text-gray-500 mb-8">Welcome back, {userData.name?.split(' ')[0]}!</p>

                {/* Stat cards */}
                <div className="flex flex-wrap gap-5 mb-10">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                        <>
                            <div className="border border-blue-200 rounded-xl p-5 w-48 bg-blue-50">
                                <p className="text-3xl font-bold text-blue-600">{dashboard.totalCourses}</p>
                                <p className="text-sm text-gray-600 mt-1">Courses Enrolled</p>
                            </div>
                            <div className="border border-green-200 rounded-xl p-5 w-48 bg-green-50">
                                <p className="text-3xl font-bold text-green-600">{dashboard.overallCompletion}%</p>
                                <p className="text-sm text-gray-600 mt-1">Overall Completion</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Course breakdown */}
                {!loading && dashboard?.courseBreakdown.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-500">You haven't enrolled in any courses yet.</p>
                        <Link
                            to="/course-list"
                            className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-sm"
                        >
                            Browse Courses
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {loading
                            ? Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="border border-gray-200 rounded-xl p-4 animate-pulse space-y-3">
                                    <div className="h-32 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                                </div>
                            ))
                            : dashboard.courseBreakdown.map(course => (
                                <div
                                    key={course.courseId}
                                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer"
                                    onClick={() => navigate('/player/' + course.courseId)}
                                >
                                    {course.thumbnail && (
                                        <img
                                            src={course.thumbnail}
                                            alt={course.title}
                                            className="w-full h-36 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <p className="font-medium text-gray-800 text-sm truncate">{course.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {course.completedLectures}/{course.totalLectures} lectures
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <Circle
                                                percent={course.completionPercent}
                                                strokeWidth={8}
                                                strokeColor={course.completionPercent === 100 ? '#16a34a' : '#2563eb'}
                                                trailWidth={8}
                                                style={{ width: 44, height: 44 }}
                                            />
                                            <span className={`text-sm font-semibold ${course.completionPercent === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                                                {course.completionPercent}%
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {course.completionPercent === 100 ? 'Completed' : 'In Progress'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )}
            </div>
            <Footer />
        </>
    )
}

export default StudentDashboard
