import Redis from 'ioredis'

const client = new Redis(process.env.REDIS_URL!)

export const kv = {
  async get<T>(key: string): Promise<T | null> {
    const val = await client.get(key)
    if (val === null) return null
    return JSON.parse(val) as T
  },
  async set(key: string, value: unknown): Promise<void> {
    await client.set(key, JSON.stringify(value))
  },
  async rpush(key: string, ...values: unknown[]): Promise<void> {
    await client.rpush(key, ...values.map(v => JSON.stringify(v)))
  },
  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    const items = await client.lrange(key, start, stop)
    return items.map((item: string) => JSON.parse(item) as T)
  },
  async sadd(key: string, value: string): Promise<number> {
    return client.sadd(key, value)
  },
  async scard(key: string): Promise<number> {
    return client.scard(key)
  },
}

// Key helpers
export const keys = {
  user: (lineUserId: string) => `user:${lineUserId}`,
  codeToUser: (code: string) => `code:${code}`,
  stats: (code: string) => `stats:${code}`,
  appsList: (code: string) => `apps:${code}`,
  app: (id: string) => `app:${id}`,
  clickerSet: (code: string) => `clickers:${code}`,
}

// Generate short referral code from LINE user ID
export function generateCode(lineUserId: string): string {
  let hash = 0
  for (let i = 0; i < lineUserId.length; i++) {
    const char = lineUserId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  const base = Math.abs(hash).toString(36).toUpperCase()
  return base.padStart(6, '0').slice(-6)
}
