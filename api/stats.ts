import type { VercelRequest, VercelResponse } from '@vercel/node'
import { kv, keys } from './_db'
import type { ReferralStats, Application } from '../src/types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const code = req.query.code as string
  if (!code) return res.status(400).json({ error: 'code required' })

  const stats = await kv.get<ReferralStats>(keys.stats(code))
  if (!stats) return res.status(404).json({ error: 'not found' })

  // Fetch application IDs then fetch each application
  const appIds = await kv.lrange<string>(keys.appsList(code), 0, -1)
  const applications: Application[] = []

  if (appIds.length > 0) {
    const appResults = await Promise.all(
      appIds.map(id => kv.get<Application>(keys.app(id)))
    )
    for (const app of appResults) {
      if (app) applications.push(app)
    }
  }

  // Sort newest first
  applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return res.json({ stats, applications })
}
