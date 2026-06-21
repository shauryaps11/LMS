import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import connectCloudinary from './configs/cloudinary.js'
import authRouter from './routes/authRoutes.js'
import userRouter from './routes/userRoutes.js'
import educatorRouter from './routes/educatorRoutes.js'
import courseRouter from './routes/courseRoute.js'
import { stripeWebhooks } from './controllers/webhooks.js'

const app = express()

await connectDB()
await connectCloudinary()

// Stripe webhook must receive raw body before json middleware
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks)

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => res.send('EduFlow API'))
app.use('/api/auth', authRouter)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
