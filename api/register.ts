import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv, keys, generateCode } from './_db'
import type { User, ReferralStats } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { lineUserId, displayName, pictureUrl, referredBy } = req.body as {
    lineUserId: string
    displayName: string
    pictureUrl: string
    referredBy?: string
  }

  if (!lineUserId) return res.status(400).json({ error: 'lineUserId required' })

  // Check if user already exists
  const existing = await kv.get<User>(keys.user(lineUserId))

  if (existing) {
    const stats = await kv.get<ReferralStats>(keys.stats(existing.referralCode)) ?? {
      referralCode: existing.referralCode,
      clicks: 0,
      applications: 0,
      shares: 0,
    }
    return res.json({ user: existing, stats, isNew: false })
  }

  // Create new user
  const referralCode = generateCode(lineUserId)
  const user: User = {
    lineUserId,
    displayName,
    pictureUrl,
    referralCode,
    referredBy: referredBy ?? undefined,
    createdAt: new Date().toISOString(),
  }

  const stats: ReferralStats = {
    referralCode,
    clicks: 0,
    applications: 0,
    shares: 0,
  }

  // If code already taken (collision), append suffix
  const codeOwner = await kv.get(keys.codeToUser(referralCode))
  const finalCode = codeOwner ? `${referralCode}${lineUserId.slice(-2)}` : referralCode
  user.referralCode = finalCode
  stats.referralCode = finalCode

  await Promise.all([
    kv.set(keys.user(lineUserId), user),
    kv.set(keys.codeToUser(finalCode), lineUserId),
    kv.set(keys.stats(finalCode), stats),
  ])

  return res.status(201).json({ user, stats, isNew: true })
}
