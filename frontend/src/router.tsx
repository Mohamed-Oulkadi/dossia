import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { AdminLayout } from '@/layouts/AdminLayout'

// Lazy-load heavy pages per AGENTS.md Rule #1
const LandingPage = lazy(() => import('@/pages/Landing'))
const DashboardPage = lazy(() => import('@/pages/Dashboard'))
const LoginPage = lazy(() => import('@/pages/Login'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminClinicDetailPage = lazy(() => import('@/pages/admin/AdminClinicDetailPage'))
const AdminSubscriptionsPage = lazy(() => import('@/pages/admin/AdminSubscriptionsPage'))
const AdminAuditPage = lazy(() => import('@/pages/admin/AdminAuditPage'))
const ForbiddenPage = lazy(() => import('@/pages/error/Forbidden'))
const NotFoundPage = lazy(() => import('@/pages/error/NotFound'))

const PageLoader = () => (
  <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-emerald-600 dark:border-emerald-500 border-t-transparent animate-spin" />
      <span className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">Chargement…</span>
    </div>
  </div>
)

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Super Admin Workspace (Multi-Tenant Management) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['SUPER_ADMIN']} redirectTo="/app">
                  <AdminLayout />
                </RoleGuard>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="cabinets" element={<AdminDashboard />} />
            <Route path="cabinets/:id" element={<AdminClinicDetailPage />} />
            <Route path="abonnements" element={<AdminSubscriptionsPage />} />
            <Route path="audit" element={<AdminAuditPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          {/* Medical Clinic Workspace (Doctor & Secretary) */}
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['DOCTOR', 'SECRETARY']} redirectTo="/admin">
                  <DashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Error & Access Control Pages */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
