import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, HardDrive, Mail, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/api'

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim()

export function ForgotPasswordPage() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
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
      const callbackName = '__onRecaptchaLoadedForgot'
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
      } else {
        renderCaptcha()
      }
    }

    return () => {
      isMounted = false
    }
  }, [])

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
      await apiFetch<{ status: string; message: string }>('/auth/forgot-password', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ email: email.trim(), captchaToken }),
      })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim email reset password')
      if (recaptchaWidgetId.current !== null) window.grecaptcha?.reset(recaptchaWidgetId.current)
      setCaptchaToken('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">
      <Card className="relative w-full max-w-md p-6 sm:p-8">
        <div className="absolute right-4 top-4">
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-md shadow-blue-500/20">
            <HardDrive className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t('forgot_pwd_title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{t('forgot_pwd_subtitle')}</p>
          </div>
        </div>

        {sent ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {t('forgot_pwd_sent_title')}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300/90">
                {t('forgot_pwd_sent_desc')} <strong className="font-bold underline">{email}</strong>.
              </p>
              <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400">
                💡 {t('forgot_pwd_check_spam')}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false)
                  if (recaptchaWidgetId.current !== null) window.grecaptcha?.reset(recaptchaWidgetId.current)
                  setCaptchaToken('')
                }}
                className="w-full text-xs font-bold"
              >
                <RotateCw className="h-3.5 w-3.5 mr-1.5" />
                {t('forgot_pwd_btn_resend')}
              </Button>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline py-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t('auth_back_to_login')}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                {t('auth_email_label')}
              </span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                autoFocus
              />
            </label>

            {recaptchaSiteKey ? (
              <div className="min-h-[78px] overflow-hidden rounded-xl bg-slate-50 p-2 border border-slate-200 dark:border-slate-800 dark:bg-slate-900 flex justify-center">
                <div ref={recaptchaRef} />
              </div>
            ) : null}

            {error ? (
              <p className="rounded-xl bg-red-50 p-3 text-xs sm:text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-medium">
                {t(error)}
              </p>
            ) : null}

            <Button disabled={loading || !email.trim()} className="w-full font-bold">
              {loading ? t('forgot_pwd_btn_sending') : t('forgot_pwd_btn_send')}
            </Button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                {t('auth_back_to_login')}
              </Link>
            </div>
          </form>
        )}
      </Card>
    </main>
  )
}
