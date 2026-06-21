import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import { StatCardSkeleton, TableRowSkeleton } from '../../components/student/Skeleton'

const Dashboard = () => {
    const { isEducator, currency, api } = useContext(AppContext)
    const [dashboardData, setDashboardData] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/api/educator/dashboard')
            if (data.success) {
                setDashboardData(data.dashboardData)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isEducator) {
            fetchDashboardData()
        }
    }, [isEducator])

    const stats = dashboardData ? [
        {
            label: 'Total Enrolments',
            value: dashboardData.enrolledStudentsData.length,
            icon: assets.person_tick_icon,
        },
        {
            label: 'Total Courses',
            value: dashboardData.totalCourses,
            icon: assets.my_course_icon,
        },
        {
            label: 'Total Earnings',
            value: `${currency}${Math.floor(dashboardData.totalEarnings)}`,
            icon: assets.earning_icon,
        },
    ] : []

    return (
        <div className='min-h-screen flex flex-col gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            {/* Stat Cards */}
            <div className='flex flex-wrap gap-5 items-center'>
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
                    : stats.map((stat, i) => (
                        <div key={i} className='flex items-center gap-3 shadow-custom-card border border-blue-500 p-4 w-56 rounded-md'>
                            <img src={stat.icon} alt={stat.label} className="w-10 h-10" />
                            <div>
                                <p className='text-2xl font-medium text-gray-600'>{stat.value}</p>
                                <p className='text-base text-gray-500'>{stat.label}</p>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* Latest Enrolments */}
            <div>
                <h2 className="pb-4 text-lg font-medium">Latest Enrolments</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
                    <table className="table-fixed md:table-auto w-full overflow-hidden">
                        <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-center hidden sm:table-cell">#</th>
                                <th className="px-4 py-3 font-semibold">Student Name</th>
                                <th className="px-4 py-3 font-semibold">Course Title</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-500">
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
                                : dashboardData?.enrolledStudentsData.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                                                No students enrolled yet.
                                            </td>
                                        </tr>
                                    )
                                    : dashboardData.enrolledStudentsData.map((item, index) => (
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
                                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                                                        {item.student.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="truncate">{item.student.name}</span>
                                            </td>
                                            <td className="px-4 py-3 truncate">{item.courseTitle}</td>
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

export default Dashboard
