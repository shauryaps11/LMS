import { redis } from '../configs/redis.js'

// Cache middleware — caches GET responses in Redis
// Usage: router.get('/path', cache(300), handler)
export const cache = (ttlSeconds = 300) => async (req, res, next) => {
    if (!redis) return next()

    const key = `cache:${req.originalUrl}`

    try {
        const cached = await redis.get(key)
        if (cached) {
            res.setHeader('X-Cache', 'HIT')
            return res.json(JSON.parse(cached))
        }
    } catch {
        return next()
    }

    // Intercept res.json to cache before sending
    const originalJson = res.json.bind(res)
    res.json = (body) => {
        if (redis && body?.success) {
            redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(() => {})
        }
        res.setHeader('X-Cache', 'MISS')
        return originalJson(body)
    }

    next()
}

// Invalidate one or more cache keys
export const invalidateCache = async (...keys) => {
    if (!redis) return
    try {
        await Promise.all(keys.map(k => redis.del(k)))
    } catch {
        // non-fatal
    }
}
