import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Eye, EyeOff, HardDrive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { GoogleLogo } from '@/components/auth/GoogleLogo'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { Seo } from '@/components/common/Seo'
import { useLanguage } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/api'
import { setAuthSession, type AuthUser } from '@/lib/auth'

type AuthResponse = { accessToken: string; refreshToken: string; user: AuthUser }
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim()

declare global {
  interface Window {
    grecaptcha?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void }) => number
      reset: (widgetId?: number) => void
    }
  }
}

export function RegisterPage() {
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const recaptchaRef = useRef<HTMLDivElement | null>(null)
  const recaptchaWidgetId = useRef<number | null>(null)

  useEffect(() => {
    if (!recaptchaSiteKey) return

    let isMounted = true

    const renderCaptcha = () => {
      if (!isMounted || !recaptchaRef.current || recaptchaWidgetId.current !== null) return
      if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
        try {
          recaptchaWidgetId.current = window.grecaptcha.render(recaptchaRef.current, {
            sitekey: recaptchaSiteKey,
            callback: (token: string) => {
              if (isMounted) {
                setCaptchaToken(token)
                setError('')
              }
            },
            'expired-callback': () => {
              if (isMounted) setCaptchaToken('')
            },
          })
        } catch (err) {
          console.warn('reCAPTCHA render error:', err)
        }
      }
    }

    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      renderCaptcha()
    } else {
      const callbackName = '__onRecaptchaLoaded'
      ;(window as any)[callbackName] = () => {
        renderCaptcha()
      }

      const scriptId = 'google-recaptcha-script'
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script')
        script.id = scriptId
        script.src = `https://www.google.com/recaptcha/api.js?onload=${callbackName}&render=explicit`
        script.async = true
        script.defer = true
        document.body.appendChild(script)
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

  async function continueWithGoogle() {
    setGoogleLoading(true)
    setError('')
    try {
      const data = await apiFetch<{ url: string }>('/auth/google/url', { skipAuth: true })
      window.location.href = data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google register failed')
      setGoogleLoading(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (recaptchaSiteKey && !captchaToken) {
      setError(t('auth_captcha_required'))
      setLoading(false)
      return
    }
    try {
      const data = await apiFetch<AuthResponse>('/auth/register', { method: 'POST', skipAuth: true, body: JSON.stringify({ name, email, password, captchaToken }) })
      setAuthSession(data.accessToken, data.refreshToken, data.user)
      navigate('/all-files')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Register failed')
      if (recaptchaWidgetId.current !== null) window.grecaptcha?.reset(recaptchaWidgetId.current)
      setCaptchaToken('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">
      <Seo
        title={lang === 'id' ? 'Daftar Akun Baru - Drive9' : 'Create Account - Drive9'}
        noindex={true}
      />
      <Card className="relative w-full max-w-md p-6">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t('auth_register_title')}</h1>
            <p className="text-sm text-slate-500">{t('auth_register_subtitle')}</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold">
            {t('auth_name_label')}
            <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="John Doe" />
          </label>
          <label className="grid gap-2 text-sm font-semibold">
            {t('auth_email_label')}
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
          </label>
          <div className="grid gap-2 text-sm font-semibold">
            <label>{t('auth_password_label')}</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                minLength={8}
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
            {password.length > 0 ? (
              password.length >= 8 ? (
                <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {t('pwd_req_min_met')}
                </p>
              ) : (
                <p className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5" /> {t('pwd_req_min_not_met')} ({password.length}/8)
                </p>
              )
            ) : null}
          </div>

          {recaptchaSiteKey ? (
            <div className="min-h-[78px] overflow-hidden rounded-xl bg-slate-50 p-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 flex justify-center">
              <div ref={recaptchaRef} />
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-medium">
              {t(error)}
            </p>
          ) : null}

          <Button disabled={loading || password.length < 8}>
            {loading ? t('auth_btn_creating') : t('auth_btn_create')}
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
            {googleLoading ? t('auth_google_redirecting') : t('auth_google_btn')}
          </Button>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          {t('auth_already_registered')}{' '}
          <Link className="font-bold text-blue-600 hover:underline" to="/login">
            {t('auth_login_link')}
          </Link>
        </p>
      </Card>
    </main>
  )
}
