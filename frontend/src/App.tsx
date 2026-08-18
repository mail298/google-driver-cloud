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
import { Component, type ErrorInfo, type ReactNode } from 'react'

// Helper for safe lazy loading with chunk error auto-retry
function safeLazy<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T } | { [key: string]: any }>
) {
  return lazy(async () => {
    try {
      const page = await importFn()
      return 'default' in page ? (page as { default: T }) : { default: Object.values(page)[0] as T }
    } catch (error) {
      const chunkRetry = sessionStorage.getItem('app_chunk_retry')
      if (!chunkRetry) {
        sessionStorage.setItem('app_chunk_retry', 'true')
        window.location.reload()
      }
      throw error
    }
  })
}

// Code Splitting (Lazy Loading dashboard routes for ultra-fast initial load speed)
const AllFilesPage = safeLazy(() => import('@/pages/AllFilesPage'))
const ArchivedPage = safeLazy(() => import('@/pages/ArchivedPage'))
const LoginPage = safeLazy(() => import('@/pages/LoginPage'))
const ForgotPasswordPage = safeLazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = safeLazy(() => import('@/pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })))
const GoogleAuthPage = safeLazy(() => import('@/pages/GoogleAuthPage'))
const GoogleConnectedPage = safeLazy(() => import('@/pages/GoogleConnectedPage'))
const QuotaTrackerPage = safeLazy(() => import('@/pages/QuotaTrackerPage'))
const RecentPage = safeLazy(() => import('@/pages/RecentPage'))
const RegisterPage = safeLazy(() => import('@/pages/RegisterPage'))
const SettingsPage = safeLazy(() => import('@/pages/SettingsPage'))
const SharedPage = safeLazy(() => import('@/pages/SharedPage'))
const StarredPage = safeLazy(() => import('@/pages/StarredPage'))
const PublicFilePage = safeLazy(() => import('@/pages/PublicFilePage'))
const ApiManagementPage = safeLazy(() => import('@/pages/ApiManagementPage'))
const TrashPage = safeLazy(() => import('@/pages/TrashPage'))
const ActivityLogPage = safeLazy(() => import('@/pages/ActivityLogPage'))
const SitemapPage = safeLazy(() => import('@/pages/SitemapPage'))
const RobotsPage = safeLazy(() => import('@/pages/RobotsPage'))
const PrivacyPage = safeLazy(() => import('@/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const TermsPage = safeLazy(() => import('@/pages/TermsPage').then(m => ({ default: m.TermsPage })))

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false }

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App routing error caught by ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-bold text-white">Page Failed to Load</h2>
            <p className="text-xs text-slate-400">
              A network issue or app update interrupted the page load. Please reload.
            </p>
            <button
              onClick={() => {
                sessionStorage.removeItem('app_chunk_retry')
                window.location.reload()
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Reload Page (F5)
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function RouteLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="text-xs font-mono font-medium tracking-wider">Loading Drive9...</span>
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
        <ErrorBoundary>
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="terms" element={<TermsPage />} />
              <Route path="sitemap.xml" element={<SitemapPage />} />
              <Route path="robots.txt" element={<RobotsPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
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
        </ErrorBoundary>
      </UploadProvider>
    </LanguageProvider>
  )
}

export default App
