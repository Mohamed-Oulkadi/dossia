import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Lazy-load heavy pages per AGENTS.md Rule #1
const LandingPage = lazy(() => import('@/pages/Landing'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))

const PageLoader = () => (
  <div className="min-h-screen bg-dossia-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-dossia-accent border-t-transparent animate-spin" />
      <span className="text-dossia-muted text-sm font-medium">Chargement…</span>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app/*" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
