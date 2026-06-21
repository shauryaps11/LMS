import multer from 'multer'

const storage = multer.diskStorage({})

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo']
    if (allowed.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Only images and videos are allowed'), false)
    }
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
})

export default upload
