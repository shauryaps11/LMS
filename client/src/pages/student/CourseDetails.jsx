import React, { useContext, useEffect, useRef, useState } from 'react'
import Footer from '../../components/student/Footer'
import { assets } from '../../assets/assets'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import humanizeDuration from 'humanize-duration'
import Loading from '../../components/student/Loading'

const CourseDetails = () => {
    const { id } = useParams()
    const [courseData, setCourseData] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
    const [openSections, setOpenSections] = useState({})
    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    const {
        currency, userData, calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures, setShowLogin, api
    } = useContext(AppContext)

    useEffect(() => {
        if (courseData) document.title = `${courseData.courseTitle} — EduFlow`
    }, [courseData])

    const fetchCourseData = async () => {
        try {
            const { data } = await api.get('/api/course/' + id)
            if (data.success) setCourseData(data.courseData)
            else toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const toggleSection = (index) => {
        setOpenSections(prev => ({ ...prev, [index]: !prev[index] }))
    }

    const enrollCourse = async () => {
        if (!userData) {
            setShowLogin(true)
            return
        }
        if (isAlreadyEnrolled) {
            return toast.warn('Already enrolled')
        }
        try {
            const { data } = await api.post('/api/user/purchase', { courseId: courseData._id })
            if (data.success) {
                window.location.replace(data.session_url)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Set up HLS for free preview videos
    useEffect(() => {
        if (!previewUrl || !videoRef.current) return

        const setup = async () => {
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }

            if (previewUrl.includes('.m3u8')) {
                const Hls = (await import('hls.js')).default
                if (Hls.isSupported()) {
                    const hls = new Hls()
                    hls.loadSource(previewUrl)
                    hls.attachMedia(videoRef.current)
                    hlsRef.current = hls
                } else {
                    videoRef.current.src = previewUrl
                }
            } else {
                videoRef.current.src = previewUrl
            }
        }
        setup()
        return () => { if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null } }
    }, [previewUrl])

    useEffect(() => { fetchCourseData() }, [])

    useEffect(() => {
        if (userData && courseData) {
            setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id))
        }
    }, [userData, courseData])

    if (!courseData) return <Loading />

    const rating = calculateRating(courseData)
    const price = (courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)

    return (
        <>
            <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-20 pt-10 text-left">
                <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70" />

                <div className="max-w-xl z-10 text-gray-500">
                    <h1 className="md:text-course-deatails-heading-large text-course-deatails-heading-small font-semibold text-gray-800">
                        {courseData.courseTitle}
                    </h1>
                    <p
                        className="pt-4 md:text-base text-sm"
                        dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}
                    />

                    <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
                        <p>{rating}</p>
                        <div className='flex'>
                            {[...Array(5)].map((_, i) => (
                                <img key={i} src={i < Math.floor(rating) ? assets.star : assets.star_blank} alt="" className='w-3.5 h-3.5' />
                            ))}
                        </div>
                        <p className='text-blue-600'>({courseData.courseRatings.length} {courseData.courseRatings.length !== 1 ? 'ratings' : 'rating'})</p>
                        <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length !== 1 ? 'students' : 'student'}</p>
                    </div>

                    <p className='text-sm'>Course by <span className='text-blue-600 underline'>{courseData.educator.name}</span></p>

                    <div className="pt-8 text-gray-800">
                        <h2 className="text-xl font-semibold">Course Structure</h2>
                        <div className="pt-5">
                            {courseData.courseContent.map((chapter, index) => (
                                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                                    <div
                                        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                                        onClick={() => toggleSection(index)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={assets.down_arrow_icon}
                                                alt=""
                                                className={`transform transition-transform ${openSections[index] ? 'rotate-180' : ''}`}
                                            />
                                            <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                                        </div>
                                        <p className="text-sm text-gray-400">
                                            {chapter.chapterContent.length} lectures · {calculateChapterTime(chapter)}
                                        </p>
                                    </div>

                                    <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                                        <ul className="md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                                            {chapter.chapterContent.map((lecture, i) => (
                                                <li key={i} className="flex items-start gap-2 py-1">
                                                    <img src={assets.play_icon} alt="" className="w-4 h-4 mt-0.5" />
                                                    <div className="flex items-center justify-between w-full text-xs md:text-sm">
                                                        <p>{lecture.lectureTitle}</p>
                                                        <div className='flex gap-2'>
                                                            {lecture.isPreviewFree && (
                                                                <button
                                                                    onClick={() => setPreviewUrl(lecture.lectureUrl)}
                                                                    className='text-blue-500 hover:text-blue-700'
                                                                >
                                                                    Preview
                                                                </button>
                                                            )}
                                                            <span className="text-gray-400">
                                                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="py-20 text-sm md:text-default">
                        <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
                        <p className="rich-text pt-3" dangerouslySetInnerHTML={{ __html: courseData.courseDescription }} />
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
                    {previewUrl ? (
                        <video
                            ref={videoRef}
                            controls
                            autoPlay
                            className="w-full aspect-video bg-black"
                        />
                    ) : (
                        <img src={courseData.courseThumbnail} alt={courseData.courseTitle} className="w-full" />
                    )}
                    <div className="p-5">
                        <div className="flex gap-3 items-center pt-2">
                            <p className="text-gray-800 md:text-4xl text-2xl font-semibold">{currency}{price}</p>
                            {courseData.discount > 0 && (
                                <>
                                    <p className="md:text-lg text-gray-400 line-through">{currency}{courseData.coursePrice}</p>
                                    <p className="md:text-lg text-green-600 font-medium">{courseData.discount}% off</p>
                                </>
                            )}
                        </div>
                        <div className="flex items-center text-sm gap-4 pt-2 md:pt-4 text-gray-500">
                            <div className="flex items-center gap-1">
                                <img src={assets.star} alt="" />
                                <p>{rating}</p>
                            </div>
                            <div className="h-4 w-px bg-gray-300" />
                            <div className="flex items-center gap-1">
                                <img src={assets.time_clock_icon} alt="" />
                                <p>{calculateCourseDuration(courseData)}</p>
                            </div>
                            <div className="h-4 w-px bg-gray-300" />
                            <div className="flex items-center gap-1">
                                <img src={assets.lesson_icon} alt="" />
                                <p>{calculateNoOfLectures(courseData)} lessons</p>
                            </div>
                        </div>
                        <button
                            onClick={enrollCourse}
                            className={`md:mt-6 mt-4 w-full py-3 rounded font-medium transition ${isAlreadyEnrolled
                                ? 'bg-green-600 text-white cursor-default'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {isAlreadyEnrolled ? '✓ Already Enrolled' : 'Enroll Now'}
                        </button>
                        <div className="pt-6">
                            <p className="md:text-xl text-lg font-medium text-gray-800">What's in the course?</p>
                            <ul className="ml-4 pt-2 text-sm list-disc text-gray-500 space-y-1">
                                <li>Lifetime access with free updates.</li>
                                <li>Step-by-step, hands-on project guidance.</li>
                                <li>Downloadable resources and source code.</li>
                                <li>Quizzes to test your knowledge.</li>
                                <li>Certificate of completion.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default CourseDetails
