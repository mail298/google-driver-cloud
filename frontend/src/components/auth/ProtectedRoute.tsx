import { useState, useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { getAccessToken } from '@/lib/auth'
import { ForbiddenPage } from '@/pages/ForbiddenPage'

export function ProtectedRoute() {
  const [isIpBlocked, setIsIpBlocked] = useState(() => Boolean(sessionStorage.getItem('ip_blocked_msg')))

  useEffect(() => {
    const handleIpBlocked = () => {
      setIsIpBlocked(true)
    }

    window.addEventListener('ip-blocked', handleIpBlocked)
    return () => {
      window.removeEventListener('ip-blocked', handleIpBlocked)
    }
  }, [])

  if (isIpBlocked) {
    return <ForbiddenPage />
  }

  return getAccessToken() ? <Outlet /> : <Navigate to="/login" replace />
}
