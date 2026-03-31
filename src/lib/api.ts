import type { RegisterResponse, ReferralStats, Application } from '../types'

const BASE = '/api'

export async function registerUser(params: {
  lineUserId: string
  displayName: string
  pictureUrl: string
  referredBy?: string
}): Promise<RegisterResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function trackClick(referralCode: string): Promise<void> {
  await fetch(`${BASE}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ referralCode }),
  })
}

export async function submitApplication(data: {
  name: string
  phone: string
  note: string
  referralCode: string
  applicantLineUserId?: string
}): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getStats(referralCode: string): Promise<{
  stats: ReferralStats
  applications: Application[]
}> {
  const res = await fetch(`${BASE}/stats?code=${referralCode}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}
