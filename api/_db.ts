import { Redis } from '@upstash/redis'

const redisUrl = new URL(process.env.REDIS_URL!)
export const kv = new Redis({
  url: `https://${redisUrl.hostname}`,
  token: redisUrl.password,
})

// Key helpers
export const keys = {
  user: (lineUserId: string) => `user:${lineUserId}`,
  codeToUser: (code: string) => `code:${code}`,
  stats: (code: string) => `stats:${code}`,
  appsList: (code: string) => `apps:${code}`,
  app: (id: string) => `app:${id}`,
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
