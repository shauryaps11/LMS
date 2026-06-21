import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { SkeletonBlock } from './Skeleton'

const CourseCard = ({ course }) => {
    const { currency, calculateRating } = useContext(AppContext)
    const [imgLoaded, setImgLoaded] = useState(false)
    const rating = calculateRating(course)
    const price = (course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)

    return (
        <Link
            onClick={() => window.scrollTo(0, 0)}
            to={'/course/' + course._id}
            className="border border-gray-200 pb-6 overflow-hidden rounded-lg hover:scale-[1.02] hover:shadow-lg transition-all duration-200 block"
        >
            <div className="relative w-full aspect-video bg-gray-100">
                {!imgLoaded && <SkeletonBlock className="absolute inset-0 w-full h-full" />}
                <img
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    onLoad={() => setImgLoaded(true)}
                />
                {course.discount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        -{course.discount}%
                    </span>
                )}
            </div>
            <div className="p-3 text-left">
                <h3 className="text-base font-semibold leading-snug line-clamp-2">{course.courseTitle}</h3>
                <p className="text-gray-500 text-sm mt-0.5">{course.educator?.name}</p>
                <div className="flex items-center space-x-1.5 mt-1">
                    <p className="text-sm font-medium">{rating}</p>
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <img
                                key={i}
                                className="w-3.5 h-3.5"
                                src={i < Math.floor(rating) ? assets.star : assets.star_blank}
                                alt=""
                            />
                        ))}
                    </div>
                    <p className="text-gray-400 text-xs">({course.courseRatings.length})</p>
                </div>
                <p className="text-base font-semibold text-gray-800 mt-1">{currency}{price}</p>
            </div>
        </Link>
    )
}

export default CourseCard
