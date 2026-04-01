import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv, keys } from './_db.js'
import type { ReferralStats } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { referralCode, type = 'click', visitorId } = req.body as {
    referralCode: string
    type?: 'click' | 'share'
    visitorId?: string
  }

  if (!referralCode) return res.status(400).json({ error: 'referralCode required' })

  const statsKey = keys.stats(referralCode)
  const current = await kv.get<ReferralStats>(statsKey)

  if (!current) return res.status(404).json({ error: 'referral code not found' })

  const updated: ReferralStats = {
    ...current,
    uniqueClicks: current.uniqueClicks ?? 0,
    rewardEarned: current.rewardEarned ?? false,
    clicks: type === 'click' ? current.clicks + 1 : current.clicks,
    shares: type === 'share' ? current.shares + 1 : current.shares,
  }

  if (type === 'click' && visitorId) {
    const isNew = await kv.sadd(keys.clickerSet(referralCode), visitorId)
    if (isNew) {
      const uniqueClicks = await kv.scard(keys.clickerSet(referralCode))
      updated.uniqueClicks = uniqueClicks
      updated.rewardEarned = uniqueClicks >= 7
    }
  }

  await kv.set(statsKey, updated)
  return res.json({ ok: true, rewardEarned: updated.rewardEarned })
}
