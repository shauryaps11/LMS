import axios from "axios"
import { createContext, useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import humanizeDuration from "humanize-duration"

export const AppContext = createContext()

// Axios instance shared across the app
export const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true, // send httpOnly refresh cookie
})

export const AppContextProvider = (props) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = import.meta.env.VITE_CURRENCY

    const navigate = useNavigate()

    const [userData, setUserData] = useState(null)
    const [token, setToken] = useState(null)
    const [isEducator, setIsEducator] = useState(false)
    const [allCourses, setAllCourses] = useState([])
    const [enrolledCourses, setEnrolledCourses] = useState([])
    const [showLogin, setShowLogin] = useState(false)

    // Keep token ref in sync for use inside interceptors
    const tokenRef = useRef(token)
    tokenRef.current = token

    // ----- Axios interceptors -----
    useEffect(() => {
        const reqId = api.interceptors.request.use(config => {
            if (tokenRef.current) {
                config.headers.Authorization = `Bearer ${tokenRef.current}`
            }
            return config
        })

        const resId = api.interceptors.response.use(
            r => r,
            async error => {
                const original = error.config
                if (error.response?.status === 401 && !original._retry) {
                    original._retry = true
                    try {
                        const { data } = await axios.post(
                            `${backendUrl}/api/auth/refresh`,
                            {},
                            { withCredentials: true }
                        )
                        if (data.success) {
                            setToken(data.accessToken)
                            tokenRef.current = data.accessToken
                            original.headers.Authorization = `Bearer ${data.accessToken}`
                            return api(original)
                        }
                    } catch {
                        // Refresh failed — log out
                        setToken(null)
                        setUserData(null)
                        setIsEducator(false)
                    }
                }
                return Promise.reject(error)
            }
        )

        return () => {
            api.interceptors.request.eject(reqId)
            api.interceptors.response.eject(resId)
        }
    }, [backendUrl])

    // ----- Auth -----
    const login = async (email, password) => {
        const { data } = await api.post('/api/auth/login', { email, password })
        if (data.success) {
            setToken(data.accessToken)
            setUserData(data.user)
            setIsEducator(data.user.role === 'educator' || data.user.role === 'admin')
            await fetchUserEnrolledCourses()
        }
        return data
    }

    const register = async (name, email, password) => {
        const { data } = await api.post('/api/auth/register', { name, email, password })
        if (data.success) {
            setToken(data.accessToken)
            setUserData(data.user)
            setIsEducator(false)
        }
        return data
    }

    const logout = async () => {
        try {
            await api.post('/api/auth/logout')
        } catch { /* ignore */ }
        setToken(null)
        setUserData(null)
        setIsEducator(false)
        setEnrolledCourses([])
        navigate('/')
    }

    // ----- Data fetchers -----
    const fetchAllCourses = useCallback(async () => {
        try {
            const { data } = await api.get('/api/course/all')
            if (data.success) {
                setAllCourses(data.courses)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [])

    const fetchUserData = useCallback(async () => {
        try {
            const { data } = await api.get('/api/user/data')
            if (data.success) {
                setUserData(data.user)
                setIsEducator(data.user.role === 'educator' || data.user.role === 'admin')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [])

    const fetchUserEnrolledCourses = useCallback(async () => {
        try {
            const { data } = await api.get('/api/user/enrolled-courses')
            if (data.success) {
                setEnrolledCourses(data.enrolledCourses.reverse())
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }, [])

    // Try to restore session on mount using the httpOnly refresh cookie
    useEffect(() => {
        const restore = async () => {
            try {
                const { data } = await axios.post(
                    `${backendUrl}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                )
                if (data.success) {
                    setToken(data.accessToken)
                    tokenRef.current = data.accessToken
                }
            } catch { /* no session */ }
        }
        restore()
        fetchAllCourses()
    }, [backendUrl, fetchAllCourses])

    useEffect(() => {
        if (token) {
            fetchUserData()
            fetchUserEnrolledCourses()
        }
    }, [token, fetchUserData, fetchUserEnrolledCourses])

    // ----- Utility helpers -----
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.forEach(lecture => { time += lecture.lectureDuration })
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] })
    }

    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.forEach(chapter =>
            chapter.chapterContent.forEach(lecture => { time += lecture.lectureDuration })
        )
        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] })
    }

    const calculateRating = (course) => {
        if (!course.courseRatings?.length) return 0
        const total = course.courseRatings.reduce((sum, r) => sum + r.rating, 0)
        return parseFloat((total / course.courseRatings.length).toFixed(1))
    }

    const calculateNoOfLectures = (course) => {
        return course.courseContent.reduce(
            (sum, chapter) => sum + (Array.isArray(chapter.chapterContent) ? chapter.chapterContent.length : 0),
            0
        )
    }

    const value = {
        backendUrl, currency, navigate,
        userData, setUserData,
        token, setToken,
        isEducator, setIsEducator,
        allCourses, fetchAllCourses,
        enrolledCourses, fetchUserEnrolledCourses,
        showLogin, setShowLogin,
        login, register, logout,
        calculateChapterTime, calculateCourseDuration,
        calculateRating, calculateNoOfLectures,
        api,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}
