import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../../assets/assets'
import { toast } from 'react-toastify'
import Quill from 'quill'
import uniqid from 'uniqid'
import { AppContext } from '../../context/AppContext'

const AddCourse = () => {
    const editorRef = useRef(null)
    const quillRef = useRef(null)

    const { api } = useContext(AppContext)

    const [courseTitle, setCourseTitle] = useState('')
    const [coursePrice, setCoursePrice] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [image, setImage] = useState(null)
    const [chapters, setChapters] = useState([])
    const [showPopup, setShowPopup] = useState(false)
    const [currentChapterId, setCurrentChapterId] = useState(null)
    const [lectureDetails, setLectureDetails] = useState({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
    })
    const [uploadingVideo, setUploadingVideo] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const handleChapter = (action, chapterId) => {
        if (action === 'add') {
            const title = prompt('Enter Chapter Name:')
            if (title) {
                setChapters(prev => [...prev, {
                    chapterId: uniqid(),
                    chapterTitle: title,
                    chapterContent: [],
                    collapsed: false,
                    chapterOrder: prev.length > 0 ? prev.slice(-1)[0].chapterOrder + 1 : 1,
                }])
            }
        } else if (action === 'remove') {
            setChapters(prev => prev.filter(ch => ch.chapterId !== chapterId))
        } else if (action === 'toggle') {
            setChapters(prev => prev.map(ch =>
                ch.chapterId === chapterId ? { ...ch, collapsed: !ch.collapsed } : ch
            ))
        }
    }

    const handleLecture = (action, chapterId, lectureIndex) => {
        if (action === 'add') {
            setCurrentChapterId(chapterId)
            setShowPopup(true)
        } else if (action === 'remove') {
            setChapters(prev => prev.map(ch => {
                if (ch.chapterId === chapterId) {
                    const updated = [...ch.chapterContent]
                    updated.splice(lectureIndex, 1)
                    return { ...ch, chapterContent: updated }
                }
                return ch
            }))
        }
    }

    const handleVideoUpload = async (file) => {
        if (!file) return
        setUploadingVideo(true)
        setUploadProgress(0)
        try {
            const formData = new FormData()
            formData.append('video', file)
            const { data } = await api.post('/api/educator/upload-video', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (e) => {
                    setUploadProgress(Math.round((e.loaded / e.total) * 100))
                }
            })
            if (data.success) {
                setLectureDetails(d => ({ ...d, lectureUrl: data.videoUrl }))
                toast.success('Video uploaded')
            } else {
                toast.error(data.message)
            }
        } catch (err) {
            toast.error(err.message)
        } finally {
            setUploadingVideo(false)
        }
    }

    const addLecture = () => {
        setChapters(prev => prev.map(ch => {
            if (ch.chapterId === currentChapterId) {
                const newLecture = {
                    ...lectureDetails,
                    lectureOrder: ch.chapterContent.length > 0 ? ch.chapterContent.slice(-1)[0].lectureOrder + 1 : 1,
                    lectureId: uniqid()
                }
                return { ...ch, chapterContent: [...ch.chapterContent, newLecture] }
            }
            return ch
        }))
        setShowPopup(false)
        setLectureDetails({ lectureTitle: '', lectureDuration: '', lectureUrl: '', isPreviewFree: false })
        setUploadProgress(0)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (!image) {
                return toast.error('Thumbnail Not Selected')
            }

            const courseData = {
                courseTitle,
                courseDescription: quillRef.current.root.innerHTML,
                coursePrice: Number(coursePrice),
                discount: Number(discount),
                courseContent: chapters,
            }

            const formData = new FormData()
            formData.append('courseData', JSON.stringify(courseData))
            formData.append('image', image)

            const { data } = await api.post('/api/educator/add-course', formData)

            if (data.success) {
                toast.success(data.message)
                setCourseTitle('')
                setCoursePrice(0)
                setDiscount(0)
                setImage(null)
                setChapters([])
                quillRef.current.root.innerHTML = ''
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, { theme: 'snow' })
        }
    }, [])

    return (
        <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
            <form onSubmit={handleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>
                <div className='flex flex-col gap-1'>
                    <p>Course Title</p>
                    <input
                        onChange={e => setCourseTitle(e.target.value)}
                        value={courseTitle}
                        type="text"
                        placeholder='Type here'
                        className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-300 focus:border-blue-500'
                        required
                    />
                </div>

                <div className='flex flex-col gap-1'>
                    <p>Course Description</p>
                    <div ref={editorRef} />
                </div>

                <div className='flex items-center justify-between flex-wrap gap-3'>
                    <div className='flex flex-col gap-1'>
                        <p>Course Price</p>
                        <input
                            onChange={e => setCoursePrice(e.target.value)}
                            value={coursePrice}
                            type="number"
                            placeholder='0'
                            className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-300 focus:border-blue-500'
                            required
                        />
                    </div>
                    <div className='flex md:flex-row flex-col items-center gap-3'>
                        <p>Course Thumbnail</p>
                        <label htmlFor='thumbnailImage' className='flex items-center gap-3 cursor-pointer'>
                            <img src={assets.file_upload_icon} alt="" className='p-3 bg-blue-500 rounded' />
                            <input
                                type="file"
                                id='thumbnailImage'
                                onChange={e => setImage(e.target.files[0])}
                                accept="image/*"
                                hidden
                            />
                            {image && <img className='max-h-10 rounded' src={URL.createObjectURL(image)} alt="preview" />}
                        </label>
                    </div>
                </div>

                <div className='flex flex-col gap-1'>
                    <p>Discount %</p>
                    <input
                        onChange={e => setDiscount(e.target.value)}
                        value={discount}
                        type="number"
                        placeholder='0'
                        min={0}
                        max={100}
                        className='outline-none md:py-2.5 py-2 w-28 px-3 rounded border border-gray-300 focus:border-blue-500'
                        required
                    />
                </div>

                {/* Chapters & Lectures */}
                <div>
                    {chapters.map((chapter, chapterIndex) => (
                        <div key={chapter.chapterId} className="bg-white border rounded-lg mb-4">
                            <div className="flex justify-between items-center p-4 border-b">
                                <div className="flex items-center gap-2">
                                    <img
                                        className={`cursor-pointer transition-all ${chapter.collapsed ? '-rotate-90' : ''}`}
                                        onClick={() => handleChapter('toggle', chapter.chapterId)}
                                        src={assets.dropdown_icon}
                                        width={14}
                                        alt=""
                                    />
                                    <span className="font-semibold">{chapterIndex + 1}. {chapter.chapterTitle}</span>
                                </div>
                                <span className="text-gray-500 text-sm">{chapter.chapterContent.length} Lectures</span>
                                <img
                                    onClick={() => handleChapter('remove', chapter.chapterId)}
                                    src={assets.cross_icon}
                                    alt="remove"
                                    className='cursor-pointer'
                                />
                            </div>
                            {!chapter.collapsed && (
                                <div className="p-4">
                                    {chapter.chapterContent.map((lecture, lectureIndex) => (
                                        <div key={lecture.lectureId} className="flex justify-between items-center mb-2 text-sm">
                                            <span className="truncate flex-1">
                                                {lectureIndex + 1}. {lecture.lectureTitle} · {lecture.lectureDuration} min
                                                {lecture.isPreviewFree && <span className="ml-2 text-green-600">Free Preview</span>}
                                            </span>
                                            <img
                                                onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)}
                                                src={assets.cross_icon}
                                                alt="remove"
                                                className='cursor-pointer ml-2'
                                            />
                                        </div>
                                    ))}
                                    <div
                                        className="inline-flex bg-gray-100 hover:bg-gray-200 p-2 rounded cursor-pointer mt-2 text-sm transition"
                                        onClick={() => handleLecture('add', chapter.chapterId)}
                                    >
                                        + Add Lecture
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div
                        className="flex justify-center items-center bg-blue-50 hover:bg-blue-100 border border-blue-200 p-3 rounded-lg cursor-pointer text-blue-700 text-sm transition"
                        onClick={() => handleChapter('add')}
                    >
                        + Add Chapter
                    </div>

                    {showPopup && (
                        <div className="fixed inset-0 flex items-center justify-center bg-gray-800/60 z-50">
                            <div className="bg-white text-gray-700 p-5 rounded-xl relative w-full max-w-sm shadow-xl">
                                <h2 className="text-lg font-semibold mb-4">Add Lecture</h2>
                                <div className="mb-3">
                                    <p className="text-sm mb-1">Lecture Title</p>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border rounded py-2 px-3 text-sm focus:border-blue-500 outline-none"
                                        value={lectureDetails.lectureTitle}
                                        onChange={e => setLectureDetails(d => ({ ...d, lectureTitle: e.target.value }))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm mb-1">Duration (minutes)</p>
                                    <input
                                        type="number"
                                        className="mt-1 block w-full border rounded py-2 px-3 text-sm focus:border-blue-500 outline-none"
                                        value={lectureDetails.lectureDuration}
                                        onChange={e => setLectureDetails(d => ({ ...d, lectureDuration: e.target.value }))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <p className="text-sm mb-1">Video</p>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        onChange={e => handleVideoUpload(e.target.files[0])}
                                        className="text-sm"
                                    />
                                    {uploadingVideo && (
                                        <div className="mt-2">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-2 bg-blue-500 rounded-full transition-all"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Uploading {uploadProgress}%...</p>
                                        </div>
                                    )}
                                    {lectureDetails.lectureUrl && !uploadingVideo && (
                                        <p className="text-xs text-green-600 mt-1">✓ Video uploaded</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">Or paste a URL manually:</p>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="mt-1 block w-full border rounded py-1.5 px-3 text-sm focus:border-blue-500 outline-none"
                                        value={lectureDetails.lectureUrl}
                                        onChange={e => setLectureDetails(d => ({ ...d, lectureUrl: e.target.value }))}
                                    />
                                </div>
                                <div className="flex gap-2 my-3 items-center">
                                    <input
                                        type="checkbox"
                                        id="freePreview"
                                        className='scale-125 cursor-pointer'
                                        checked={lectureDetails.isPreviewFree}
                                        onChange={e => setLectureDetails(d => ({ ...d, isPreviewFree: e.target.checked }))}
                                    />
                                    <label htmlFor="freePreview" className="text-sm cursor-pointer">Free Preview</label>
                                </div>
                                <button
                                    type='button'
                                    disabled={uploadingVideo}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm transition"
                                    onClick={addLecture}
                                >
                                    Add Lecture
                                </button>
                                <img
                                    onClick={() => setShowPopup(false)}
                                    src={assets.cross_icon}
                                    className='absolute top-4 right-4 w-4 cursor-pointer'
                                    alt="close"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <button type="submit" className='bg-blue-600 hover:bg-blue-700 text-white w-max py-2.5 px-8 rounded-lg my-4 transition'>
                    Publish Course
                </button>
            </form>
        </div>
    )
}

export default AddCourse
