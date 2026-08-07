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
import { UploadProvider } from '@/context/UploadContext'
import { apiFetch } from '@/lib/api'

function App() {
  const [isIpBlocked, setIsIpBlocked] = useState(false)

  useEffect(() => {
    const handleIpBlocked = () => {
      setIsIpBlocked(true)
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

  if (isIpBlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.04),transparent_45%)] pointer-events-none" />
        
        <div className="relative w-full max-w-md rounded-2xl border border-slate-900 bg-slate-950/20 p-8 text-center backdrop-blur-xl">
          {/* Centered Image Only */}
          <div className="mx-auto flex justify-center">
            <img 
              src="/forbidden.png" 
              alt="Access Denied" 
              className="h-72 w-auto object-contain rounded-xl border border-slate-900/40 shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
      </main>
    )
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

