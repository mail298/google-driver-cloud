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
import { ShieldAlert, RefreshCw } from 'lucide-react'

function App() {
  const [isIpBlocked, setIsIpBlocked] = useState(false)
  const [blockedMessage, setBlockedMessage] = useState('')

  useEffect(() => {
    const handleIpBlocked = (e: Event) => {
      const customEvent = e as CustomEvent
      setIsIpBlocked(true)
      setBlockedMessage(customEvent.detail?.message || 'Access to dashboard API is restricted.')
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
    const ipMatch = blockedMessage.match(/\(([^)]+)\)/)
    const clientIp = ipMatch ? ipMatch[1] : ''

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 py-12 text-white selection:bg-red-500 selection:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08),transparent_45%)] pointer-events-none" />
        
        <div className="relative w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/40 p-8 text-center backdrop-blur-xl shadow-2xl">
          {/* Centered Image */}
          <div className="mx-auto mb-6 flex justify-center">
            <img 
              src="/forbidden.png" 
              alt="Forbidden Access" 
              className="h-44 w-auto object-contain rounded-xl border border-slate-800/50 shadow-lg"
              onError={(e) => {
                // Fallback icon if image fails to load
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>

          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 border border-red-500/25">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>

          <h1 className="text-xl font-extrabold tracking-tight text-red-500">Access Restricted</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {blockedMessage || 'Your IP address is not authorized to access this dashboard.'}
          </p>

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-left font-mono text-[11px] leading-relaxed text-slate-400">
            <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2 border-b border-slate-800 pb-1.5 flex items-center justify-between">
              <span>Authorization Guide</span>
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="mb-2">1. Open your configured Telegram bot helper.</p>
            <p className="mb-2">2. Send the whitelist command:</p>
            <div className="my-2 rounded bg-slate-900 border border-slate-800 p-2 text-center text-xs font-semibold text-slate-200 select-all cursor-pointer hover:bg-slate-800/60 active:scale-[0.99] transition">
              /addip {clientIp || 'your_ip'}
            </div>
            <p>3. Once whitelisted, click the refresh button below.</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 transition shadow-lg shadow-blue-600/15 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </button>
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

