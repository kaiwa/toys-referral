import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, login, getProfile } from '../lib/liff'
import { registerUser, getStats } from '../lib/api'
import type { ReferralStats, Application } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    if (!isLoggedIn()) {
      login()
      return
    }
    const load = async () => {
      try {
        const profile = await getProfile()
        const reg = await registerUser({
          lineUserId: profile.userId,
          displayName: profile.displayName,
          pictureUrl: profile.pictureUrl ?? '',
        })
        setReferralCode(reg.user.referralCode)
        const data = await getStats(reg.user.referralCode)
        setStats(data.stats)
        setApplications(data.applications)
        setState('ready')
      } catch {
        setState('error')
      }
    }
    load()
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-line-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="card text-center">
          <p className="text-gray-500">Failed to load dashboard.</p>
          <button onClick={() => navigate('/')} className="mt-4 btn-secondary">Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50">
      <div className="bg-line-green text-white px-5 pt-12 pb-6">
        <button onClick={() => navigate('/')} className="text-white/80 text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">My Dashboard</h1>
        <p className="text-sm opacity-80 mt-1 font-mono">Code: {referralCode}</p>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto flex flex-col gap-4">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Clicks', value: stats.clicks, icon: '👆' },
              { label: 'Applications', value: stats.applications, icon: '📝' },
              { label: 'Shares', value: stats.shares, icon: '📤' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <div className="text-xl mb-1">{s.icon}</div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Applications list */}
        <div className="card">
          <h2 className="font-bold text-sm mb-3 text-gray-700">
            Applications ({applications.length})
          </h2>
          {applications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              No applications yet.<br />Share your referral link to get started!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map(app => (
                <div key={app.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm">{app.name}</p>
                      <p className="text-xs text-gray-400">{app.phone}</p>
                    </div>
                    <p className="text-xs text-gray-300">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {app.note && (
                    <p className="text-xs text-gray-500 mt-2 italic">"{app.note}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
