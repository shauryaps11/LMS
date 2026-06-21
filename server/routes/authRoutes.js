import express from 'express'
import { register, login, refreshToken, logout, getMe } from '../controllers/authController.js'
import { protect } from '../middlewares/authMiddleware.js'

const authRouter = express.Router()

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/refresh', refreshToken)
authRouter.post('/logout', logout)
authRouter.get('/me', protect, getMe)

export default authRouter
