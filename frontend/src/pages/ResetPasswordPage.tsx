import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, Eye, EyeOff, HardDrive, KeyRound, Loader2, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'
import { apiFetch } from '@/lib/api'

export function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const token = params.get('token')

  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setVerifying(false)
      setTokenValid(false)
      return
    }

    apiFetch<{ valid: boolean; email?: string; name?: string }>('/auth/verify-reset-token', {
      method: 'POST',
      skipAuth: true,
      body: JSON.stringify({ token }),
    })
      .then((data) => {
        setTokenValid(true)
        if (data.email) setUserEmail(data.email)
        if (data.name) setUserName(data.name)
      })
      .catch(() => {
        setTokenValid(false)
      })
      .finally(() => {
        setVerifying(false)
      })
  }, [token])

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('pwd_err_min'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('pwd_err_mismatch'))
      return
    }

    setLoading(true)

    try {
      await apiFetch<{ status: string; message: string }>('/auth/reset-password', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ token, password }),
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mereset password')
    } finally {
      setLoading(false)
    }
  }

  const isPasswordMinValid = password.length >= 8
  const isMatchValid = confirmPassword.length > 0 && password === confirmPassword

  if (verifying) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-xs font-mono font-medium tracking-wider">Memverifikasi tautan...</span>
        </div>
      </main>
    )
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
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{t('reset_pwd_title')}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{t('reset_pwd_subtitle')}</p>
          </div>
        </div>

        {!tokenValid ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 text-red-900 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
                {t('reset_pwd_invalid_token')}
              </div>
              <p className="mt-2 text-xs leading-relaxed opacity-90">
                Tautan ini mungkin sudah kedaluwarsa (lebih dari 15 menit) atau sudah pernah digunakan sebelumnya demi keamanan akun.
              </p>
            </div>

            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <KeyRound className="h-3.5 w-3.5 mr-1.5" />
              {t('reset_pwd_request_new')}
            </Button>
          </div>
        ) : success ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {t('reset_pwd_success_title')}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300/90">
                {t('reset_pwd_success_desc')}
              </p>
            </div>

            <Button
              onClick={() => navigate('/login')}
              className="w-full font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {t('auth_login_link')}
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-6 grid gap-4">
            {userEmail ? (
              <div className="rounded-xl bg-slate-100 p-2.5 px-3.5 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <span>Akun: <strong className="text-slate-900 dark:text-slate-200">{userName || userEmail}</strong></span>
                <span className="font-mono text-[11px] text-slate-400">{userEmail}</span>
              </div>
            ) : null}

            <div className="grid gap-2 text-sm font-semibold">
              <label className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-400" />
                {t('pwd_new_label')}
              </label>
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
                isPasswordMinValid ? (
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

            <div className="grid gap-2 text-sm font-semibold">
              <label className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-slate-400" />
                {t('pwd_confirm_label')}
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 ? (
                isMatchValid ? (
                  <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t('pwd_match_success')}
                  </p>
                ) : (
                  <p className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" /> {t('pwd_match_error')}
                  </p>
                )
              ) : null}
            </div>

            {error ? (
              <p className="rounded-xl bg-red-50 p-3 text-xs sm:text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60 font-medium">
                {t(error)}
              </p>
            ) : null}

            <Button
              disabled={loading || !isPasswordMinValid || !isMatchValid}
              className="w-full font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? t('reset_pwd_btn_saving') : t('reset_pwd_btn_save')}
            </Button>
          </form>
        )}
      </Card>
    </main>
  )
}
