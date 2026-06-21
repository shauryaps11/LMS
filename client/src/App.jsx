import React, { useContext } from 'react'
import { Routes, Route, useLocation, useMatch, Navigate } from 'react-router-dom'
import Navbar from './components/student/Navbar'
import Home from './pages/student/Home'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Dashboard from './pages/educator/Dashboard'
import AddCourse from './pages/educator/AddCourse'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import Educator from './pages/educator/Educator'
import StudentDashboard from './pages/student/StudentDashboard'
import 'quill/dist/quill.snow.css'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import Player from './pages/student/Player'
import MyEnrollments from './pages/student/MyEnrollments'
import Loading from './components/student/Loading'
import { AppContext } from './context/AppContext'
import AuthModal from './components/student/AuthModal'

const EducatorRoute = ({ children }) => {
  const { isEducator } = useContext(AppContext)
  return isEducator ? children : <Navigate to="/" replace />
}

const App = () => {
  const isEducatorRoute = useMatch('/educator/*')
  const { showLogin } = useContext(AppContext)

  return (
    <div className="text-default min-h-screen bg-white">
      <ToastContainer position="bottom-right" />
      {showLogin && <AuthModal />}
      {!isEducatorRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:id" element={<CourseDetails />} />
        <Route path="/course-list" element={<CoursesList />} />
        <Route path="/course-list/:input" element={<CoursesList />} />
        <Route path="/my-enrollments" element={<MyEnrollments />} />
        <Route path="/my-dashboard" element={<StudentDashboard />} />
        <Route path="/player/:courseId" element={<Player />} />
        <Route path="/loading/:path" element={<Loading />} />
        <Route path='/educator' element={<EducatorRoute><Educator /></EducatorRoute>}>
          <Route path='/educator' element={<Dashboard />} />
          <Route path='add-course' element={<AddCourse />} />
          <Route path='my-courses' element={<MyCourses />} />
          <Route path='student-enrolled' element={<StudentsEnrolled />} />
        </Route>
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-6xl font-bold text-gray-200">404</h1>
            <p className="text-xl text-gray-600 mt-4">Page not found</p>
            <a href="/" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">
              Back to Home
            </a>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
