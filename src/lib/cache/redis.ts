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

// In-memory fallback cache for when Redis is unavailable
const memCache = new Map<string, { data: unknown; expiresAt: number }>()

function isEmptyArray(data: unknown): boolean {
  return Array.isArray(data) && data.length === 0
}

export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>,
): Promise<T> {
  // Try Redis first
  const r = getRedis()
  if (r) {
    try {
      const cached = await r.get<T>(key)
      if (cached !== null && cached !== undefined) return cached
    } catch {
      // Redis unavailable, fall through to memory cache
    }
  }

  // Try in-memory cache (return if still valid)
  const mem = memCache.get(key)
  if (mem && mem.expiresAt > Date.now()) {
    return mem.data as T
  }

  const data = await fetchFn()

  // If fetch returned empty array but we have stale data, prefer stale data
  if (isEmptyArray(data) && mem && !isEmptyArray(mem.data)) {
    // Extend stale cache by half the TTL to avoid hammering the API
    mem.expiresAt = Date.now() + (ttlSeconds * 1000) / 2
    return mem.data as T
  }

  // Store in Redis (only non-empty data)
  if (r && ttlSeconds > 0 && !isEmptyArray(data)) {
    try {
      await r.set(key, JSON.stringify(data), { ex: ttlSeconds })
    } catch {
      // Redis unavailable
    }
  }

  // Store in memory cache
  memCache.set(key, { data, expiresAt: Date.now() + ttlSeconds * 1000 })

  return data
}
