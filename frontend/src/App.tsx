import { useEffect, lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DriveLayout } from '@/layouts/DriveLayout'
import { LandingPage } from '@/pages/LandingPage'
import { UploadProvider } from '@/context/UploadContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/api'
import { getAccessToken } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

// Code Splitting (Lazy Loading non-landing routes for ultra-fast initial load speed)
const AllFilesPage = lazy(() => import('@/pages/AllFilesPage').then(m => ({ default: m.AllFilesPage })))
const ArchivedPage = lazy(() => import('@/pages/ArchivedPage').then(m => ({ default: m.ArchivedPage })))
const LoginPage = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const GoogleAuthPage = lazy(() => import('@/pages/GoogleAuthPage').then(m => ({ default: m.GoogleAuthPage })))
const GoogleConnectedPage = lazy(() => import('@/pages/GoogleConnectedPage').then(m => ({ default: m.GoogleConnectedPage })))
const QuotaTrackerPage = lazy(() => import('@/pages/QuotaTrackerPage').then(m => ({ default: m.QuotaTrackerPage })))
const RecentPage = lazy(() => import('@/pages/RecentPage').then(m => ({ default: m.RecentPage })))
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const SharedPage = lazy(() => import('@/pages/SharedPage').then(m => ({ default: m.SharedPage })))
const StarredPage = lazy(() => import('@/pages/StarredPage').then(m => ({ default: m.StarredPage })))
const PublicFilePage = lazy(() => import('@/pages/PublicFilePage').then(m => ({ default: m.PublicFilePage })))
const ApiManagementPage = lazy(() => import('@/pages/ApiManagementPage').then(m => ({ default: m.ApiManagementPage })))
const TrashPage = lazy(() => import('@/pages/TrashPage').then(m => ({ default: m.TrashPage })))
const ActivityLogPage = lazy(() => import('@/pages/ActivityLogPage').then(m => ({ default: m.ActivityLogPage })))
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })))
const SitemapPage = lazy(() => import('@/pages/SitemapPage').then(m => ({ default: m.SitemapPage })))
const RobotsPage = lazy(() => import('@/pages/RobotsPage').then(m => ({ default: m.RobotsPage })))

function RouteLoader() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-xs font-mono font-medium tracking-wider">Loading drive9...</span>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => {
    // Silent check on app load if user has access token
    if (getAccessToken()) {
      apiFetch('/auth/me').catch(() => {
        // Handled by apiFetch / ProtectedRoute
      })
    }
  }, [])

  return (
    <LanguageProvider>
      <UploadProvider>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="sitemap.xml" element={<SitemapPage />} />
            <Route path="robots.txt" element={<RobotsPage />} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </UploadProvider>
    </LanguageProvider>
  )
}

export default App
