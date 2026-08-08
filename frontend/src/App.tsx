import { useEffect } from 'react'
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
import { LandingPage } from '@/pages/LandingPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { TermsPage } from '@/pages/TermsPage'
import { SitemapPage } from '@/pages/SitemapPage'
import { RobotsPage } from '@/pages/RobotsPage'
import { UploadProvider } from '@/context/UploadContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/api'
import { getAccessToken } from '@/lib/auth'

function App() {
  useEffect(() => {
    // Silent check on app load if user has access token
    if (getAccessToken()) {
      apiFetch('/auth/me')
        .catch(() => {
          // Handled by apiFetch / ProtectedRoute if IP blocked
        })
    }
  }, [])

  return (
    <LanguageProvider>
      <UploadProvider>
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
      </UploadProvider>
    </LanguageProvider>
  )
}

export default App
