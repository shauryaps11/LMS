import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
const ACCESS_EXPIRES = '15m'
const REFRESH_EXPIRES = '7d'

const generateTokens = (userId, role) => {
    const accessToken = jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRES })
    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES })
    return { accessToken, refreshToken }
}

const setRefreshCookie = (res, token) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })
}

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { name, email, password, role = 'student' } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' })
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' })
        }

        // Only allow admin creation if no admin exists (first-run bootstrap)
        if (role === 'admin') {
            const existingAdmin = await User.findOne({ role: 'admin' })
            if (existingAdmin) {
                return res.status(403).json({ success: false, message: 'Admin account already exists' })
            }
        }

        const existing = await User.findOne({ email })
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: hashedPassword, role })

        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role)

        user.refreshToken = refreshToken
        await user.save()

        setRefreshCookie(res, refreshToken)

        res.status(201).json({
            success: true,
            accessToken,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, imageUrl: user.imageUrl }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' })
        }

        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role)

        user.refreshToken = refreshToken
        await user.save()

        setRefreshCookie(res, refreshToken)

        res.json({
            success: true,
            accessToken,
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, imageUrl: user.imageUrl }
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken
        if (!token) {
            return res.status(401).json({ success: false, message: 'No refresh token' })
        }

        let payload
        try {
            payload = jwt.verify(token, REFRESH_TOKEN_SECRET)
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' })
        }

        const user = await User.findById(payload.userId)
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ success: false, message: 'Refresh token revoked' })
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role)

        user.refreshToken = newRefreshToken
        await user.save()

        setRefreshCookie(res, newRefreshToken)

        res.json({ success: true, accessToken })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// POST /api/auth/logout
export const logout = async (req, res) => {
    try {
        const token = req.cookies?.refreshToken
        if (token) {
            const user = await User.findOne({ refreshToken: token })
            if (user) {
                user.refreshToken = null
                await user.save()
            }
        }
        res.clearCookie('refreshToken')
        res.json({ success: true, message: 'Logged out' })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// GET /api/auth/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -refreshToken')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        res.json({ success: true, user })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}
