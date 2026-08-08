import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle, KeyRound, Trash2, Sparkles, Copy, Check, UploadCloud, ShieldCheck, Clipboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/drive/PageHeader'
import { DummyModal } from '@/components/drive/DummyModal'
import { API_URL, apiFetch, formatDate } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'

type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  status: string
  lastUsedAt: string | null
  expiresAt: string | null
  revokedAt: string | null
  createdAt: string
}

export function ApiManagementPage() {
  const { t } = useLanguage()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  async function load() {
    const data = await apiFetch<{ apiKeys: ApiKey[] }>('/api-keys')
    setApiKeys(data.apiKeys)
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : 'Failed to load API keys'))
  }, [])

  async function createKey(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const data = await apiFetch<{ apiKey: ApiKey; secret: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: keyName }),
      })
      setSecret(data.secret)
      setKeyName('')
      setCreateOpen(false)
      await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to create API key')
    } finally {
      setLoading(false)
    }
  }

  async function revokeKey(id: string) {
    await apiFetch(`/api-keys/${id}`, { method: 'DELETE' })
    await load()
  }

  function copy(value: string, fieldId: string) {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedField(fieldId)
        setTimeout(() => setCopiedField(null), 2000)
        setMessage(t('api_toast_copied'))
      })
      .catch(() => setMessage(t('api_toast_copy_fail')))
    setTimeout(() => setMessage(''), 3000)
  }

  const activeKeys = apiKeys.filter((k) => k.status === 'active').length
  const usedKeys = apiKeys.filter((k) => k.lastUsedAt).length

  const endpointUrl = `${API_URL}/api/v1/uploads`
  const authHeaderSnippet = `Authorization: Bearer 9d_live_xxx`

  const curlSnippet = `curl -X POST '${endpointUrl}' \\
  -H 'Authorization: Bearer 9d_live_xxx' \\
  -F 'filesMeta=[{"fieldName":"file-0","fileName":"hello.txt","mimeType":"text/plain","sizeBytes":12}]' \\
  -F 'file-0=@hello.txt;type=text/plain'`

  const jsSnippet = `const form = new FormData()
form.append('filesMeta', JSON.stringify([
  { fieldName: 'file-0', fileName: file.name, mimeType: file.type, sizeBytes: String(file.size) },
]))
form.append('file-0', file)

await fetch('${endpointUrl}', {
  method: 'POST',
  headers: { Authorization: 'Bearer 9d_live_xxx' },
  body: form,
})`

  const pythonSnippet = `import requests, json

url = '${endpointUrl}'
headers = { 'Authorization': 'Bearer 9d_live_xxx' }
files_meta = [{ 'fieldName': 'file-0', 'fileName': 'hello.txt', 'mimeType': 'text/plain', 'sizeBytes': 12 }]
files = {
    'filesMeta': (None, json.dumps(files_meta)),
    'file-0': ('hello.txt', open('hello.txt', 'rb'), 'text/plain')
}
response = requests.post(url, headers=headers, files=files)`

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title={t('api_title')}
        description={t('api_subtitle')}
        actions={
          <Button
            className="h-10 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 font-bold text-white shadow-lg shadow-indigo-500/20 hover:from-blue-500 hover:to-purple-500 transition-all rounded-xl flex items-center gap-2"
            onClick={() => setCreateOpen(true)}
          >
            <KeyRound className="h-4 w-4" />
            {t('api_btn_create')}
          </Button>
        }
      />

      {/* ── Stats Bar (3 Cards) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl rounded-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{activeKeys}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('api_stat_active')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl rounded-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{usedKeys}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('api_stat_used')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl rounded-2xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">1</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('api_stat_endpoints')}</p>
          </div>
        </Card>
      </div>

      {/* ── Toast Notification ──────────────────────────────────── */}
      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm font-semibold text-blue-600 dark:text-blue-400 animate-in fade-in">
          <Sparkles className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* ── Secret Key Banner ─────────────────────────────────────── */}
      {secret && (
        <Card className="overflow-hidden border-2 border-emerald-500/50 bg-emerald-500/10 p-5 space-y-4 shadow-lg rounded-2xl">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <p className="text-base font-black text-emerald-700 dark:text-emerald-300">{t('api_secret_title')}</p>
              <p className="text-xs sm:text-sm text-emerald-800/80 dark:text-emerald-400/80">{t('api_secret_desc')}</p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <code className="block min-w-0 overflow-x-auto rounded-xl border border-emerald-500/40 bg-slate-950 p-3.5 text-xs font-bold text-emerald-300">
              {secret}
            </code>
            <button
              type="button"
              onClick={() => copy(secret, 'secret')}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-500 transition-all active:scale-95"
            >
              {copiedField === 'secret' ? (
                <>
                  <Check className="h-4 w-4 text-emerald-200" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Clipboard className="h-4 w-4" />
                  <span>{t('api_secret_btn_copy')}</span>
                </>
              )}
            </button>
          </div>
        </Card>
      )}

      {/* ── API Keys Card (Full Width) ──────────────────────────── */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{t('api_keys_card_title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('api_keys_card_desc')}</p>
        </div>

        {apiKeys.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800/80 p-12 text-center bg-slate-50/50 dark:bg-slate-800/20 flex flex-col items-center justify-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-1">
              <KeyRound className="h-7 w-7" />
            </div>
            <p className="font-extrabold text-slate-800 dark:text-slate-100 text-base">{t('api_keys_empty_title')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">{t('api_keys_empty_desc')}</p>
            <Button
              className="mt-2 h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <KeyRound className="h-4 w-4" />
              {t('api_btn_create')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      {apiKey.status === 'active' ? (
                        <>
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </>
                      ) : (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-400" />
                      )}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{apiKey.name}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <code className="rounded-md bg-slate-200/70 dark:bg-slate-700/70 px-2 py-0.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {apiKey.keyPrefix}...
                    </code>
                    <span>• {t('api_keys_created')} {formatDate(apiKey.createdAt)}</span>
                    <span>• {t('api_keys_last_used')} {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : t('api_keys_never')}</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => revokeKey(apiKey.id)}
                  disabled={apiKey.status === 'revoked'}
                  className="h-8 w-8 p-0 rounded-lg shrink-0 self-end sm:self-center"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Upload API Docs Card (Full Width) ───────────────────── */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{t('api_docs_title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('api_docs_desc')}</p>
        </div>

        <div className="space-y-6">
          {/* Endpoint */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Endpoint</h3>
              <button
                type="button"
                onClick={() => copy(`POST ${endpointUrl}`, 'endpoint')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {copiedField === 'endpoint' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t('api_btn_copy')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs font-bold text-blue-400 overflow-x-auto">
              POST {endpointUrl}
            </div>
          </div>

          {/* Auth Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Auth Header</h3>
              <button
                type="button"
                onClick={() => copy(authHeaderSnippet, 'authHeader')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {copiedField === 'authHeader' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t('api_btn_copy')}</span>
                  </>
                )}
              </button>
            </div>
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs font-bold text-slate-200 overflow-x-auto">
              {authHeaderSnippet}
            </div>
          </div>

          {/* cURL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">cURL</h3>
              <button
                type="button"
                onClick={() => copy(curlSnippet, 'curl')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {copiedField === 'curl' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t('api_btn_copy')}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
              {curlSnippet}
            </pre>
          </div>

          {/* JavaScript */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">JavaScript</h3>
              <button
                type="button"
                onClick={() => copy(jsSnippet, 'js')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {copiedField === 'js' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t('api_btn_copy')}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
              {jsSnippet}
            </pre>
          </div>

          {/* Python */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Python</h3>
              <button
                type="button"
                onClick={() => copy(pythonSnippet, 'python')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                {copiedField === 'python' ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                    <span>{t('api_btn_copy')}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto">
              {pythonSnippet}
            </pre>
          </div>
        </div>
      </Card>

      {/* ── Create Key Modal ─────────────────────────────────────── */}
      <DummyModal
        open={createOpen}
        title={t('api_modal_create_title')}
        description={t('api_modal_create_desc')}
        onClose={() => setCreateOpen(false)}
      >
        <form className="space-y-4" onSubmit={createKey}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('api_modal_key_name')}</label>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              placeholder={t('api_modal_placeholder')}
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)} disabled={loading}>
              {t('api_modal_cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('api_modal_creating') : t('api_modal_submit')}
            </Button>
          </div>
        </form>
      </DummyModal>
    </div>
  )
}
