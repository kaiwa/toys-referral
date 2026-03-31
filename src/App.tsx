import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initLiff } from './lib/liff'
import LandingPage from './pages/LandingPage'
import ApplyPage from './pages/ApplyPage'
import DashboardPage from './pages/DashboardPage'

function App() {
  const [liffReady, setLiffReady] = useState(false)
  const [liffError, setLiffError] = useState<string | null>(null)

  useEffect(() => {
    initLiff()
      .then(() => setLiffReady(true))
      .catch((e: Error) => setLiffError(e.message))
  }, [])

  if (liffError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="card text-center max-w-sm w-full">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-sm text-gray-500">
            LIFF initialization failed.<br />
            <span className="text-xs text-red-400">{liffError}</span>
          </p>
        </div>
      </div>
    )
  }

  if (!liffReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-line-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
