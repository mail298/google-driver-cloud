import { useState, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DriveLayout } from '@/layouts/DriveLayout'
import { AllFilesPage } from '@/pages/AllFilesPage'
import { ArchivedPage } from '@/pages/ArchivedPage'
import { LoginPage } from '@/pages/LoginPage'
import { GoogleAuthPage } from '@/pages/GoogleAuthPage'
import { GoogleConnectedPage } from '@/pages/GoogleConnectedPage'
import { QuotaTrackerPage } from '@/pages/QuotaTrackerPage'
import { RecentPage } from '@/pages/RecentPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { SharedPage } from '@/pages/SharedPage'
import { StarredPage } from '@/pages/StarredPage'
import { PublicFilePage } from '@/pages/PublicFilePage'
import { ApiManagementPage } from '@/pages/ApiManagementPage'
import { TrashPage } from '@/pages/TrashPage'
import { ActivityLogPage } from '@/pages/ActivityLogPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { UploadProvider } from '@/context/UploadContext'
import { apiFetch } from '@/lib/api'

function App() {
  const [ipBlockedState, setIpBlockedState] = useState<{ isBlocked: boolean; message?: string }>({ isBlocked: false })

  useEffect(() => {
    const handleIpBlocked = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>
      setIpBlockedState({ isBlocked: true, message: customEvent.detail?.message })
    }

    window.addEventListener('ip-blocked', handleIpBlocked)

    // Silent check on app load to detect IP whitelist status
    apiFetch('/auth/me', { skipAuth: true }).catch(() => {
      // Ignore normal authentication errors, we only care if it dispatches 'ip-blocked'
    })

    return () => {
      window.removeEventListener('ip-blocked', handleIpBlocked)
    }
  }, [])

  if (ipBlockedState.isBlocked) {
    return <ForbiddenPage message={ipBlockedState.message} />
  }

  return (
    <UploadProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="google-auth" element={<GoogleAuthPage />} />
        <Route path="google-connected" element={<GoogleConnectedPage />} />
        <Route path="public/files/:token" element={<PublicFilePage />} />
        <Route path="public/files/:token/embed" element={<PublicFilePage embed />} />
        <Route path="files/:token" element={<PublicFilePage />} />
        <Route path="files/:token/embed" element={<PublicFilePage embed />} />
        <Route path="file/:token" element={<PublicFilePage />} />
        <Route path="file/:token/embed" element={<PublicFilePage embed />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DriveLayout />}>
            <Route index element={<Navigate to="/all-files" replace />} />
            <Route path="all-files" element={<AllFilesPage />} />
            <Route path="quota" element={<QuotaTrackerPage />} />
            <Route path="shared" element={<SharedPage />} />
            <Route path="recent" element={<RecentPage />} />
            <Route path="starred" element={<StarredPage />} />
            <Route path="archived" element={<ArchivedPage />} />
            <Route path="trash" element={<TrashPage />} />
            <Route path="activity" element={<ActivityLogPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="api" element={<ApiManagementPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/all-files" replace />} />
      </Routes>
    </UploadProvider>
  )
}

export default App

