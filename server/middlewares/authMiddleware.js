import jwt from 'jsonwebtoken'

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET

// Attach user to req; return 401 if token missing/invalid
export const protect = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Not authenticated' })
    }

    const token = authHeader.split(' ')[1]
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET)
        req.user = payload
        next()
    } catch {
        return res.status(401).json({ success: false, message: 'Token invalid or expired' })
    }
}

// Role gate — use after protect
export const restrictTo = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: 'Access denied' })
    }
    next()
}
