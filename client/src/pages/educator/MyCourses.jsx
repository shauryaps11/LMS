import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { TableRowSkeleton } from '../../components/student/Skeleton'
import { Link } from 'react-router-dom'

const MyCourses = () => {
    const { isEducator, currency, api } = useContext(AppContext)
    const [courses, setCourses] = useState(null)

    useEffect(() => {
        document.title = 'My Courses — EduFlow'
    }, [])

    const fetchEducatorCourses = async () => {
        try {
            const { data } = await api.get('/api/educator/courses')
            if (data.success) setCourses(data.courses)
            else toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isEducator) fetchEducatorCourses()
    }, [isEducator])

    return (
        <div className="h-screen flex flex-col items-start md:p-8 md:pb-0 p-4 pt-8 pb-0">
            <div className='w-full'>
                <h2 className="pb-4 text-lg font-medium">My Courses</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold truncate">Course</th>
                                <th className="px-4 py-3 font-semibold truncate">Earnings</th>
                                <th className="px-4 py-3 font-semibold truncate">Students</th>
                                <th className="px-4 py-3 font-semibold truncate">Published On</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {courses === null
                                ? Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                                : courses.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-12 text-center">
                                                <p className="text-gray-400">You haven't created any courses yet.</p>
                                                <Link
                                                    to="/educator/add-course"
                                                    className="mt-3 inline-block px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition text-xs"
                                                >
                                                    Add Your First Course
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                    : courses.map(course => (
                                        <tr key={course._id} className="border-b border-gray-500/20">
                                            <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3">
                                                <img
                                                    src={course.courseThumbnail}
                                                    alt="Course"
                                                    className="w-16 rounded object-cover"
                                                />
                                                <span className="truncate hidden md:block">{course.courseTitle}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {currency}{Math.floor(course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100))}
                                            </td>
                                            <td className="px-4 py-3">{course.enrolledStudents.length}</td>
                                            <td className="px-4 py-3">{new Date(course.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default MyCourses
