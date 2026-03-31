import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isLoggedIn, getProfile } from '../lib/liff'
import { submitApplication } from '../lib/api'

const JOB_TITLE = import.meta.env.VITE_JOB_TITLE || 'Job Opportunity'

export default function ApplyPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const refCode = params.get('ref') ?? ''

  const [form, setForm] = useState({ name: '', phone: '', note: '' })
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return

    setState('submitting')
    try {
      let applicantLineUserId: string | undefined
      if (isLoggedIn()) {
        const profile = await getProfile()
        applicantLineUserId = profile.userId
      }

      await submitApplication({
        name: form.name.trim(),
        phone: form.phone.trim(),
        note: form.note.trim(),
        referralCode: refCode,
        applicantLineUserId,
      })
      setState('done')
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Submission failed')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center px-5">
        <div className="card text-center max-w-sm w-full">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">Application Sent!</h2>
          <p className="text-gray-500 text-sm mb-6">
            We'll contact you soon. Thank you for your interest!
          </p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50">
      {/* Header */}
      <div className="bg-line-green text-white px-5 pt-12 pb-6">
        <button onClick={() => navigate(-1)} className="text-white/80 text-sm mb-3 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-xl font-bold">Apply for Position</h1>
        <p className="text-sm opacity-80 mt-1">{JOB_TITLE}</p>
      </div>

      <div className="px-5 py-6 max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="card flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Full Name *
              </label>
              <input
                className="input"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Phone / LINE ID *
              </label>
              <input
                className="input"
                placeholder="e.g. 0812345678"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Message (optional)
              </label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Any questions or notes..."
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>

          {refCode && (
            <p className="text-xs text-center text-gray-400">
              Referred by code: <span className="font-mono font-bold text-line-green">{refCode}</span>
            </p>
          )}

          {state === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-600">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={state === 'submitting' || !form.name || !form.phone}
            className="btn-primary flex items-center justify-center gap-2"
          >
            {state === 'submitting' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
