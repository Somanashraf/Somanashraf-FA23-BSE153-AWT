import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { applyTheme, useThemeStore } from '@/stores/theme-store'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { ElectionsBrowsePage } from '@/pages/elections/ElectionsBrowsePage'
import { ElectionDetailPage } from '@/pages/elections/ElectionDetailPage'
import { VotePage } from '@/pages/elections/VotePage'
import { ApplyCreatorPage } from '@/pages/ApplyCreatorPage'
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { ApprovalsPage } from '@/pages/dashboard/ApprovalsPage'
import { CreateElectionPage } from '@/pages/dashboard/CreateElectionPage'
import { AuditLogsPage } from '@/pages/dashboard/AuditLogsPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'
import { NotificationsPage } from '@/pages/dashboard/NotificationsPage'
import { ManageElectionPage } from '@/pages/dashboard/ManageElectionPage'
import { ResultsPage } from '@/pages/elections/ResultsPage'
import { VoterDashboard } from '@/pages/dashboard/VoterDashboard'
import { AnalyticsPage } from '@/pages/dashboard/AnalyticsPage'

function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    initialize()
    applyTheme(theme)
  }, [initialize, theme])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/elections" element={<ElectionsBrowsePage />} />
      <Route path="/elections/:id" element={<ElectionDetailPage />} />
      <Route path="/elections/:id/results" element={<ResultsPage />} />
      <Route path="/vote/:id" element={<VotePage />} />
      <Route path="/apply" element={<ApplyCreatorPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route
          path="approvals"
          element={
            <ProtectedRoute roles={['super_admin']}>
              <ApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="audit"
          element={
            <ProtectedRoute roles={['super_admin']}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="create"
          element={
            <ProtectedRoute roles={['election_creator', 'super_admin']}>
              <CreateElectionPage />
            </ProtectedRoute>
          }
        />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="elections" element={<DashboardHome />} />
        <Route
          path="elections/:id/manage"
          element={
            <ProtectedRoute roles={['election_creator', 'super_admin']}>
              <ManageElectionPage />
            </ProtectedRoute>
          }
        />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="my-votes" element={<VoterDashboard />} />
        <Route path="users" element={<DashboardHome />} />
      </Route>

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-muted-foreground">Page not found</p>
          </div>
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
