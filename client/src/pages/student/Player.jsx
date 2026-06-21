import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { useParams } from 'react-router-dom'
import humanizeDuration from 'humanize-duration'
import { toast } from 'react-toastify'
import Rating from '../../components/student/Rating'
import Footer from '../../components/student/Footer'
import Loading from '../../components/student/Loading'

const Player = () => {
    const { enrolledCourses, calculateChapterTime, userData, fetchUserEnrolledCourses, api } = useContext(AppContext)
    const { courseId } = useParams()

    const [courseData, setCourseData] = useState(null)
    const [progressData, setProgressData] = useState(null)
    const [openSections, setOpenSections] = useState({})
    const [playerData, setPlayerData] = useState(null)
    const [initialRating, setInitialRating] = useState(0)
    const [quiz, setQuiz] = useState(null)
    const [quizAnswers, setQuizAnswers] = useState({})
    const [quizResult, setQuizResult] = useState(null)

    const videoRef = useRef(null)
    const hlsRef = useRef(null)

    useEffect(() => {
        document.title = courseData ? `${courseData.courseTitle} — EduFlow` : 'Player — EduFlow'
    }, [courseData])

    const getCourseData = () => {
        const course = enrolledCourses.find(c => c._id === courseId)
        if (course) {
            setCourseData(course)
            const userRating = course.courseRatings?.find(r => r.userId === userData?._id)
            if (userRating) setInitialRating(userRating.rating)
        }
    }

    const toggleSection = (index) => {
        setOpenSections(prev => ({ ...prev, [index]: !prev[index] }))
    }

    useEffect(() => {
        if (enrolledCourses.length > 0) getCourseData()
    }, [enrolledCourses])

    // HLS video setup
    useEffect(() => {
        if (!playerData?.lectureUrl || !videoRef.current) return

        const url = playerData.lectureUrl

        const setupHls = async () => {
            // Clean up previous instance
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }

            const isHls = url.includes('.m3u8')

            if (isHls) {
                const Hls = (await import('hls.js')).default
                if (Hls.isSupported()) {
                    const hls = new Hls()
                    hls.loadSource(url)
                    hls.attachMedia(videoRef.current)
                    hlsRef.current = hls
                } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
                    // Safari native HLS
                    videoRef.current.src = url
                }
            } else {
                videoRef.current.src = url
            }
        }

        setupHls()

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }
    }, [playerData?.lectureUrl])

    // Load quiz for the current lecture
    useEffect(() => {
        if (!playerData?.lectureId) return
        setQuiz(null)
        setQuizAnswers({})
        setQuizResult(null)

        api.get(`/api/user/quiz/${playerData.lectureId}`)
            .then(({ data }) => {
                if (data.success && data.quiz) setQuiz(data.quiz)
            })
            .catch(() => {})
    }, [playerData?.lectureId])

    const markLectureAsCompleted = async (lectureId) => {
        try {
            const { data } = await api.post('/api/user/update-course-progress', { courseId, lectureId })
            if (data.success) {
                toast.success('Lecture marked as complete')
                getCourseProgress()

                // Auto-advance to next lecture
                const allLectures = courseData.courseContent.flatMap(ch => ch.chapterContent)
                const currentIndex = allLectures.findIndex(l => l.lectureId === lectureId)
                if (currentIndex !== -1 && currentIndex < allLectures.length - 1) {
                    setPlayerData({ ...allLectures[currentIndex + 1], chapter: 0, lecture: currentIndex + 2 })
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getCourseProgress = async () => {
        try {
            const { data } = await api.post('/api/user/get-course-progress', { courseId })
            if (data.success) setProgressData(data.progressData)
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleRate = async (rating) => {
        try {
            const { data } = await api.post('/api/user/add-rating', { courseId, rating })
            if (data.success) {
                toast.success('Rating submitted')
                fetchUserEnrolledCourses()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleQuizSubmit = async () => {
        if (!quiz) return
        const answers = quiz.questions.map((_, i) => quizAnswers[i] ?? -1)
        try {
            const { data } = await api.post('/api/user/submit-quiz', {
                quizId: quiz._id,
                courseId,
                answers,
            })
            if (data.success) {
                setQuizResult(data)
                toast.success(`Quiz submitted: ${data.score}/${data.total}`)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getCourseProgress()
    }, [])

    if (!courseData) return <Loading />

    const isCompleted = (lectureId) => progressData?.lectureCompleted?.includes(lectureId)

    return (
        <>
            <div className='p-4 sm:p-10 flex flex-col md:grid md:grid-cols-2 gap-10 md:px-36'>

                {/* Left — Course Structure */}
                <div className="text-gray-800">
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
                                    <p className="text-sm text-gray-500">
                                        {chapter.chapterContent.length} lectures · {calculateChapterTime(chapter)}
                                    </p>
                                </div>

                                <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-96' : 'max-h-0'}`}>
                                    <ul className="md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300 space-y-1">
                                        {chapter.chapterContent.map((lecture, i) => (
                                            <li key={i} className="flex items-start gap-2 py-1">
                                                <img
                                                    src={isCompleted(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon}
                                                    alt=""
                                                    className="w-4 h-4 mt-0.5 shrink-0"
                                                />
                                                <div className="flex items-center justify-between w-full text-xs md:text-sm">
                                                    <p>{lecture.lectureTitle}</p>
                                                    <div className="flex gap-2 items-center shrink-0 ml-2">
                                                        {lecture.lectureUrl && (
                                                            <button
                                                                onClick={() => setPlayerData({ ...lecture, chapter: index + 1, lecture: i + 1 })}
                                                                className="text-blue-500 hover:text-blue-700 transition"
                                                            >
                                                                Watch
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

                    <div className="flex items-center gap-2 py-3 mt-10">
                        <h1 className="text-xl font-bold">Rate this Course:</h1>
                        <Rating initialRating={initialRating} onRate={handleRate} />
                    </div>
                </div>

                {/* Right — Video Player */}
                <div className='md:mt-10'>
                    {playerData ? (
                        <div>
                            <video
                                ref={videoRef}
                                controls
                                className="w-full aspect-video rounded-lg bg-black"
                                playsInline
                            />
                            <div className='flex justify-between items-center mt-2'>
                                <p className='text-lg font-medium'>
                                    {playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}
                                </p>
                                <button
                                    onClick={() => markLectureAsCompleted(playerData.lectureId)}
                                    className={`text-sm px-4 py-1.5 rounded-full border transition ${isCompleted(playerData.lectureId)
                                        ? 'border-green-600 text-green-600 cursor-default'
                                        : 'border-blue-600 text-blue-600 hover:bg-blue-50'
                                        }`}
                                    disabled={isCompleted(playerData.lectureId)}
                                >
                                    {isCompleted(playerData.lectureId) ? '✓ Completed' : 'Mark Complete'}
                                </button>
                            </div>

                            {/* Quiz section */}
                            {quiz && (
                                <div className="mt-6 border border-gray-200 rounded-lg p-5 bg-gray-50">
                                    <h3 className="font-semibold text-gray-800 mb-4">Quick Quiz</h3>
                                    {quiz.questions.map((q, qi) => (
                                        <div key={qi} className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">{qi + 1}. {q.text}</p>
                                            <div className="space-y-1">
                                                {q.options.map((opt, oi) => (
                                                    <label key={oi} className="flex items-center gap-2 cursor-pointer text-sm">
                                                        <input
                                                            type="radio"
                                                            name={`q${qi}`}
                                                            checked={quizAnswers[qi] === oi}
                                                            onChange={() => setQuizAnswers(a => ({ ...a, [qi]: oi }))}
                                                            disabled={!!quizResult}
                                                        />
                                                        <span className={quizResult
                                                            ? oi === q.correctIndex ? 'text-green-600 font-medium' : quizAnswers[qi] === oi ? 'text-red-500' : ''
                                                            : ''}
                                                        >{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {quizResult ? (
                                        <p className="text-sm font-semibold mt-2 text-blue-700">
                                            Score: {quizResult.score}/{quizResult.total} ({quizResult.percent}%)
                                        </p>
                                    ) : (
                                        <button
                                            onClick={handleQuizSubmit}
                                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-full transition"
                                        >
                                            Submit Quiz
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <img src={courseData.courseThumbnail} alt={courseData.courseTitle} className="w-full rounded-lg" />
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default Player
