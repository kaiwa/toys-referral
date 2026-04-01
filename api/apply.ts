import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv, keys } from './_db.js'
import type { Application, ReferralStats } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, phone, note, referralCode, applicantLineUserId } = req.body as {
    name: string
    phone: string
    note: string
    referralCode: string
    applicantLineUserId?: string
  }

  if (!name || !phone) return res.status(400).json({ error: 'name and phone required' })

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const application: Application = {
    id,
    name,
    phone,
    note: note ?? '',
    referralCode: referralCode ?? '',
    applicantLineUserId,
    createdAt: new Date().toISOString(),
  }

  const ops: Promise<unknown>[] = [
    kv.set(keys.app(id), application),
  ]

  if (referralCode) {
    // Append to referrer's application list
    ops.push(kv.rpush(keys.appsList(referralCode), id))

    // Increment referrer's application counter
    const statsKey = keys.stats(referralCode)
    const stats = await kv.get<ReferralStats>(statsKey)
    if (stats) {
      ops.push(kv.set(statsKey, { ...stats, applications: stats.applications + 1 }))
    }
  }

  await Promise.all(ops)
  return res.status(201).json({ id })
}
