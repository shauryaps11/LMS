import React, { useEffect } from 'react'
import { assets } from '../../assets/assets'
import SearchBar from '../../components/student/SearchBar'

const Hero = () => {
    useEffect(() => {
        document.title = 'EduFlow — Learn at Your Own Pace'
    }, [])

    return (
        <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 space-y-7 text-center bg-gradient-to-b from-cyan-100/70">
            <h1 className="md:text-home-heading-large text-home-heading-small relative font-bold text-gray-800 max-w-3xl mx-auto">
                Empower your future with courses designed to
                <span className="text-blue-600"> fit your goals.</span>
                <img src={assets.sketch} alt="" className="md:block hidden absolute -bottom-7 right-0" />
            </h1>
            <p className="md:block hidden text-gray-500 max-w-2xl mx-auto">
                EduFlow brings together world-class instructors, interactive content, and real progress tracking to help you achieve your personal and professional goals.
            </p>
            <p className="md:hidden text-gray-500 max-w-sm mx-auto">
                Learn from world-class instructors and track your real progress.
            </p>
            <SearchBar />
        </div>
    )
}

export default Hero
