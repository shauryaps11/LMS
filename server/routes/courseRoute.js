import express from 'express'
import { getAllCourse, getCourseId } from '../controllers/courseController.js'
import { cache } from '../middleware/cache.js'

const courseRouter = express.Router()

courseRouter.get('/all', cache(300), getAllCourse)
courseRouter.get('/:id', cache(600), getCourseId)

export default courseRouter
