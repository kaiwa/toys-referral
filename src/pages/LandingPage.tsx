import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn, login, getProfile, isInClient, getReferralCodeFromUrl, shareReferral } from '../lib/liff'
import { registerUser, trackClick } from '../lib/api'
import type { RegisterResponse } from '../types'

const JOB_TITLE = import.meta.env.VITE_JOB_TITLE || 'Job Opportunity'
const JOB_DESCRIPTION = import.meta.env.VITE_JOB_DESCRIPTION || 'Join our team! Great pay and flexible hours.'

export default function LandingPage() {
  const navigate = useNavigate()
  const [state, setState] = useState<'loading' | 'ready' | 'sharing' | 'shared'>('loading')
  const [userData, setUserData] = useState<RegisterResponse | null>(null)
  const [refCode] = useState(() => getReferralCodeFromUrl())
  const [error, setError] = useState<string | null>(null)

  const init = useCallback(async () => {
    // Track the click if arrived via referral
    if (refCode) {
      trackClick(refCode).catch(() => {})
    }

    // If not logged in, show landing with login prompt
    if (!isLoggedIn()) {
      setState('ready')
      return
    }

    try {
      const profile = await getProfile()
      const data = await registerUser({
        lineUserId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl ?? '',
        referredBy: refCode ?? undefined,
      })
      setUserData(data)
      setState('ready')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setState('ready')
    }
  }, [refCode])

  useEffect(() => { init() }, [init])

  const handleLogin = () => {
    const redirectUrl = refCode
      ? `${window.location.origin}/?ref=${refCode}`
      : window.location.href
    login()
    // liff.login() redirects, but pass current URL as redirect target
    void redirectUrl
  }

  const handleShare = async () => {
    if (!userData) return
    setState('sharing')
    try {
      await shareReferral(userData.user.referralCode)
      setState('shared')
      setTimeout(() => setState('ready'), 2000)
    } catch {
      setState('ready')
    }
  }

  const handleApply = () => {
    navigate(`/apply${refCode ? `?ref=${refCode}` : ''}`)
  }

  const handleViewDashboard = () => {
    navigate('/dashboard')
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-line-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const loggedIn = isLoggedIn()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50">
      {/* Header */}
      <div className="bg-line-green text-white px-5 pt-12 pb-8">
        <p className="text-sm font-medium opacity-80 mb-1">✨ Job Opportunity</p>
        <h1 className="text-2xl font-bold leading-tight">{JOB_TITLE}</h1>
        {loggedIn && userData && (
          <p className="text-sm mt-2 opacity-90">
            Hi {userData.user.displayName} 👋
          </p>
        )}
      </div>

      <div className="px-5 py-6 flex flex-col gap-4 max-w-md mx-auto">

        {/* Job Card */}
        <div className="card">
          <p className="text-gray-600 text-sm leading-relaxed">{JOB_DESCRIPTION}</p>
          {refCode && (
            <div className="mt-3 py-2 px-3 bg-green-50 rounded-lg">
              <p className="text-xs text-line-green font-medium">
                👍 Referred by a friend
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* CTA Buttons */}
        {!loggedIn ? (
          <div className="flex flex-col gap-3">
            <button onClick={handleLogin} className="btn-primary">
              Login with LINE to Apply or Share
            </button>
            {refCode && (
              <button onClick={handleApply} className="btn-secondary">
                Apply Without Login
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Share button — main CTA */}
            {isInClient() && (
              <button
                onClick={handleShare}
                disabled={state === 'sharing'}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {state === 'sharing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sharing...
                  </>
                ) : state === 'shared' ? (
                  '✅ Shared!'
                ) : (
                  '📤 Share with Friends'
                )}
              </button>
            )}

            {/* Apply button */}
            <button onClick={handleApply} className="btn-secondary">
              Apply for This Job
            </button>

            {/* My referral stats */}
            {userData && (
              <div className="card text-center">
                <p className="text-xs text-gray-400 mb-1">My Referral Code</p>
                <p className="text-xl font-mono font-bold text-line-green tracking-widest">
                  {userData.user.referralCode}
                </p>
                <div className="flex justify-center gap-6 mt-3">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{userData.stats.clicks}</p>
                    <p className="text-xs text-gray-400">Clicks</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{userData.stats.applications}</p>
                    <p className="text-xs text-gray-400">Applications</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{userData.stats.shares}</p>
                    <p className="text-xs text-gray-400">Shares</p>
                  </div>
                </div>
                <button
                  onClick={handleViewDashboard}
                  className="mt-3 text-xs text-line-green underline"
                >
                  View full dashboard →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
