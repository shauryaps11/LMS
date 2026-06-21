import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const Navbar = ({ bgColor }) => {
    const { isEducator, userData, logout } = useContext(AppContext)

    if (!isEducator || !userData) return null

    return (
        <div className={`flex items-center justify-between px-4 md:px-8 border-b border-gray-200 py-3 ${bgColor}`}>
            <Link to="/">
                <img src={assets.logo} alt="EduFlow" className="w-28 lg:w-32" />
            </Link>
            <div className="flex items-center gap-4 text-gray-500">
                <p className="text-sm">Hi, {userData.name?.split(' ')[0]}!</p>
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    {userData.name?.[0]?.toUpperCase()}
                </div>
                <button
                    onClick={logout}
                    className="text-sm text-red-500 hover:text-red-600 transition"
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Navbar
