import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'

const Footer = () => {
    return (
        <footer className="bg-gray-900 md:px-36 text-left w-full mt-10">
            <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">

                <div className="flex flex-col md:items-start items-center w-full">
                    <img src={assets.logo_dark} alt="EduFlow" />
                    <p className="mt-6 text-center md:text-left text-sm text-white/80">
                        EduFlow — Learn at your own pace with world-class instructors. Build skills that matter, on a schedule that works for you.
                    </p>
                </div>

                <div className="flex flex-col md:items-start items-center w-full">
                    <h2 className="font-semibold text-white mb-5">Company</h2>
                    <ul className="flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2">
                        <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                        <li><a href="#" className="hover:text-white transition">About us</a></li>
                        <li><a href="#" className="hover:text-white transition">Contact us</a></li>
                        <li><a href="#" className="hover:text-white transition">Privacy policy</a></li>
                    </ul>
                </div>

                <div className="hidden md:flex flex-col items-start w-full">
                    <h2 className="font-semibold text-white mb-5">Stay up to date</h2>
                    <p className="text-sm text-white/80">
                        New courses, tips, and learning resources — delivered weekly.
                    </p>
                    <div className="flex items-center gap-2 pt-4">
                        <input
                            className="border border-gray-500/30 bg-gray-800 text-gray-300 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm focus:border-blue-500"
                            type="email"
                            placeholder="Enter your email"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 w-24 h-9 text-white rounded transition text-sm">
                            Subscribe
                        </button>
                    </div>
                </div>

            </div>
            <p className="py-4 text-center text-xs md:text-sm text-white/60">
                Copyright {new Date().getFullYear()} © EduFlow. All Rights Reserved.
            </p>
        </footer>
    )
}

export default Footer
