import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { TableRowSkeleton } from '../../components/student/Skeleton'

const StudentsEnrolled = () => {
    const { isEducator, api } = useContext(AppContext)
    const [enrolledStudents, setEnrolledStudents] = useState(null)

    useEffect(() => {
        document.title = 'Students Enrolled — EduFlow'
    }, [])

    const fetchEnrolledStudents = async () => {
        try {
            const { data } = await api.get('/api/educator/enrolled-students')
            if (data.success) {
                setEnrolledStudents(data.enrolledStudents.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (isEducator) fetchEnrolledStudents()
    }, [isEducator])

    return (
        <div className="min-h-screen flex flex-col items-start md:p-8 md:pb-0 p-4 pt-8 pb-0">
            <h2 className="pb-4 text-lg font-medium">Students Enrolled</h2>
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                <table className="table-fixed md:table-auto w-full overflow-hidden">
                    <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                        <tr>
                            <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                            <th className="px-4 py-3 font-semibold">Student Name</th>
                            <th className="px-4 py-3 font-semibold">Course Title</th>
                            <th className="px-4 py-3 font-semibold hidden sm:table-cell">Date</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm text-gray-500">
                        {enrolledStudents === null
                            ? Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
                            : enrolledStudents.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-10 text-center text-gray-400">
                                            No students enrolled yet.
                                        </td>
                                    </tr>
                                )
                                : enrolledStudents.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-500/20">
                                        <td className="px-4 py-3 text-center hidden sm:table-cell">{index + 1}</td>
                                        <td className="md:px-4 px-2 py-3 flex items-center space-x-3">
                                            {item.student.imageUrl ? (
                                                <img
                                                    src={item.student.imageUrl}
                                                    alt="Profile"
                                                    className="w-9 h-9 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm shrink-0">
                                                    {item.student.name?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <span className="truncate">{item.student.name}</span>
                                        </td>
                                        <td className="px-4 py-3 truncate">{item.courseTitle}</td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            {new Date(item.purchaseDate).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentsEnrolled
