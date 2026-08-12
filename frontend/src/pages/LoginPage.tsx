import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleLogo } from '@/components/auth/GoogleLogo'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/api'
import { setAuthSession, type AuthUser } from '@/lib/auth'

type AuthResponse = { accessToken: string; refreshToken: string; user: AuthUser }

export function LoginPage() {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function continueWithGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ url: string }>('/auth/google/url', { skipAuth: true })
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed')
      setGoogleLoading(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', { method: 'POST', skipAuth: true, body: JSON.stringify({ email, password }) })
      setAuthSession(data.accessToken, data.refreshToken, data.user)
      navigate('/all-files')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">
      <Card className="relative w-full max-w-md p-6">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t('auth_login_title')}</h1>
            <p className="text-sm text-slate-500">{t('auth_login_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            {t('auth_email_label')}
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
          </label>
          <div className="grid gap-2 text-sm font-semibold">
            <label>{t('auth_password_label')}</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-medium">
              {error}
            </p>
          ) : null}

          <Button disabled={loading}>
            {loading ? t('auth_btn_logging_in') : t('auth_btn_login')}
          </Button>
        </form>

        <div className="mt-4 grid gap-3">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            {t('auth_or')}
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>
          <Button variant="outline" disabled={googleLoading} onClick={continueWithGoogle}>
            <GoogleLogo />
            {googleLoading ? t('auth_google_redirecting') : t('auth_google_login_btn')}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          {t('auth_no_account')}{' '}
          <Link className="font-bold text-blue-600 hover:underline" to="/register">
            {t('auth_register_link')}
          </Link>
        </p>
      </Card>
    </main>
  )
}
