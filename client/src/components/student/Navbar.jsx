import React, { useContext, useState } from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'

const Navbar = () => {
    const location = useLocation()
    const isCoursesListPage = location.pathname.includes('/course-list')

    const { isEducator, setIsEducator, navigate, userData, logout, setShowLogin, api } = useContext(AppContext)

    const [mobileOpen, setMobileOpen] = useState(false)
    const [educatorLoading, setEducatorLoading] = useState(false)

    const becomeEducator = async () => {
        if (isEducator) {
            navigate('/educator')
            return
        }

        if (!userData) {
            setShowLogin(true)
            return
        }

        setEducatorLoading(true)
        try {
            const { data } = await api.get('/api/educator/update-role')
            if (data.success) {
                toast.success(data.message)
                setIsEducator(true)
                navigate('/educator')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setEducatorLoading(false)
        }
    }

    const navLinks = userData ? (
        <>
            <button
                onClick={becomeEducator}
                disabled={educatorLoading}
                className="hover:text-blue-600 transition disabled:opacity-60"
            >
                {educatorLoading ? '…' : isEducator ? 'Educator Dashboard' : 'Become Educator'}
            </button>
            <span className="text-gray-300">|</span>
            <Link to="/my-enrollments" className="hover:text-blue-600 transition">My Enrollments</Link>
            <span className="text-gray-300">|</span>
            <Link to="/my-dashboard" className="hover:text-blue-600 transition">Dashboard</Link>
        </>
    ) : null

    return (
        <nav className={`relative flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-200 py-4 ${isCoursesListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
            {/* Logo */}
            <img
                onClick={() => navigate('/')}
                src={assets.logo}
                alt="EduFlow"
                className="w-28 lg:w-32 cursor-pointer"
            />

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-5 text-gray-500 text-sm">
                {navLinks}
                {userData ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                            {userData.name?.[0]?.toUpperCase()}
                        </div>
                        <button
                            onClick={logout}
                            className="text-red-500 hover:text-red-600 transition text-sm"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setShowLogin(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm transition"
                    >
                        Sign In
                    </button>
                )}
            </div>

            {/* Mobile hamburger */}
            <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
            >
                <div className={`w-5 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <div className={`w-5 h-0.5 bg-current transition-all mb-1 ${mobileOpen ? 'opacity-0' : ''}`} />
                <div className={`w-5 h-0.5 bg-current transition-all ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </button>

            {/* Mobile dropdown */}
            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-md z-40 md:hidden">
                    <div className="flex flex-col gap-4 px-6 py-5 text-sm text-gray-600">
                        {userData ? (
                            <>
                                <span className="font-medium text-gray-800">{userData.name}</span>
                                <button onClick={() => { becomeEducator(); setMobileOpen(false) }}>
                                    {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                                </button>
                                <Link to="/my-enrollments" onClick={() => setMobileOpen(false)}>My Enrollments</Link>
                                <Link to="/my-dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                                <button onClick={() => { logout(); setMobileOpen(false) }} className="text-red-500 text-left">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { setShowLogin(true); setMobileOpen(false) }}
                                className="bg-blue-600 text-white py-2 rounded-full"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navbar
