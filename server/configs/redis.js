import Redis from 'ioredis'

let redis = null

const connectRedis = () => {
    if (!process.env.REDIS_URL) {
        console.log('REDIS_URL not set — caching disabled')
        return null
    }

    const client = new Redis(process.env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
    })

    client.on('connect', () => console.log('Redis connected'))
    client.on('error', (err) => {
        console.warn('Redis error (caching disabled):', err.message)
        redis = null
    })

    client.connect().catch(() => {})
    redis = client
    return client
}

connectRedis()

export { redis }
