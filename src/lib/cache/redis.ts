import { Redis } from '@upstash/redis'

let redis: Redis | null = null

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const r = getRedis()
  if (r) {
    try {
      const cached = await r.get<T>(key)
      if (cached !== null && cached !== undefined) return cached
    } catch {
      // Redis unavailable, fall through
    }
  }

  const data = await fetchFn()

  if (r && ttlSeconds > 0) {
    try {
      await r.set(key, JSON.stringify(data), { ex: ttlSeconds })
    } catch {
      // Redis unavailable
    }
  }

  return data
}
