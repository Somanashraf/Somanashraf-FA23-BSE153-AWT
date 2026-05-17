import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: UserRole[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, profile, isLoading, isInitialized } = useAuthStore()
  const location = useLocation()

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
