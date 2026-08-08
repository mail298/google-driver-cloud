import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle, Clipboard, KeyRound, ShieldCheck, Trash2, Sparkles, Layers, Code2, Copy, Check } from 'lucide-react'
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

const curlUploadExample = `curl -X POST "${API_URL}/api/v1/uploads" \\
  -H "Authorization: Bearer 9d_live_your_secret_api_key" \\
  -F "folderPath=Namafolder" \\
  -F "file=@/path/to/local/photo.png"`

const jsUploadExample = `const form = new FormData()
form.append('folderPath', 'Namafolder') // Auto-creates "Namafolder" folder if missing!
form.append('file', fileInput.files[0])

const response = await fetch('${API_URL}/api/v1/uploads', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer 9d_live_your_secret_api_key' },
  body: form,
})
const result = await response.json()`

const pythonUploadExample = `import requests

url = "${API_URL}/api/v1/uploads"
headers = { "Authorization": "Bearer 9d_live_your_secret_api_key" }

with open("photo.png", "rb") as f:
    files = [
        ("folderPath", (None, "Namafolder")),
        ("file", ("photo.png", f.read(), "image/png"))
    ]
    response = requests.post(url, headers=headers, files=files)

print(response.json())`

const curlGetFilesExample = `curl -X GET "${API_URL}/api/v1/files?folderPath=Namafolder" \\
  -H "Authorization: Bearer 9d_live_your_secret_api_key"

# Response JSON:
# {
#   "status": "ok",
#   "count": 2,
#   "files": [
#     {
#       "id": "uuid...",
#       "name": "photo.png",
#       "mimeType": "image/png",
#       "sizeBytes": "204800",
#       "folderId": "uuid...",
#       "folderName": "Namafolder",
#       "provider": "google_drive",
#       "viewUrl": "https://drive.google.com/file/d/xxx/view",
#       "downloadUrl": "https://drive.google.com/uc?id=xxx&export=download",
#       "createdAt": "2024-01-01T00:00:00.000Z"
#     }
#   ]
# }`

const jsGetFilesExample = `const response = await fetch('${API_URL}/api/v1/files?folderPath=Namafolder', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer 9d_live_your_secret_api_key' }
})
const data = await response.json()
// Each file: id, name, mimeType, sizeBytes, folderId,
//   folderName, provider, viewUrl, downloadUrl, createdAt

// Example: render images from "Namafolder" folder
data.files
  .filter((f: any) => f.mimeType.startsWith('image/'))
  .forEach((f: any) => {
    const img = document.createElement('img')
    img.src = f.downloadUrl
    document.body.appendChild(img)
  })`

const pythonGetFilesExample = `import requests

url = "${API_URL}/api/v1/files?folderPath=Namafolder"
headers = { "Authorization": "Bearer 9d_live_your_secret_api_key" }

data = requests.get(url, headers=headers).json()

for file in data['files']:
    print(f"{file['name']} -> {file['viewUrl']}")`

const curlGetFoldersExample = `curl -X GET "${API_URL}/api/v1/folders" \\
  -H "Authorization: Bearer 9d_live_your_secret_api_key"

# Response JSON:
# {
#   "status": "ok",
#   "count": 2,
#   "folders": [
#     {
#       "id": "uuid...",
#       "name": "Namafolder",
#       "parentId": null,
#       "color": "#3b82f6",
#       "createdAt": "2024-01-01T00:00:00.000Z"
#     }
#   ]
# }`

const jsGetFoldersExample = `const response = await fetch('${API_URL}/api/v1/folders', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer 9d_live_your_secret_api_key' }
})
const data = await response.json()
// Each folder: id, name, parentId, color, createdAt

// Get only root-level folders
const rootFolders = data.folders.filter((f: any) => f.parentId === null)
console.log('Root folders:', rootFolders)`

const pythonGetFoldersExample = `import requests

url = "${API_URL}/api/v1/folders"
headers = { "Authorization": "Bearer 9d_live_your_secret_api_key" }

data = requests.get(url, headers=headers).json()

for folder in data['folders']:
    parent = folder['parentId'] or 'root'
    print(f"{folder['name']} (parent: {parent})")`

export function ApiManagementPage() {
  const { t } = useLanguage()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<'upload' | 'files' | 'folders'>('upload')
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl')
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

  function copy(value: string, fieldId?: string) {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        if (fieldId) {
          setCopiedField(fieldId)
          setTimeout(() => setCopiedField(null), 2000)
        }
        setMessage(t('api_toast_copied'))
      })
      .catch(() => setMessage(t('api_toast_copy_fail')))
    setTimeout(() => setMessage(''), 3000)
  }

  const activeKeys = apiKeys.filter((k) => k.status === 'active').length
  const usedKeys = apiKeys.filter((k) => k.lastUsedAt).length

  function getCodeSnippet() {
    if (selectedEndpoint === 'upload') {
      if (activeLang === 'curl') return curlUploadExample
      if (activeLang === 'js') return jsUploadExample
      return pythonUploadExample
    } else if (selectedEndpoint === 'files') {
      if (activeLang === 'curl') return curlGetFilesExample
      if (activeLang === 'js') return jsGetFilesExample
      return pythonGetFilesExample
    } else {
      if (activeLang === 'curl') return curlGetFoldersExample
      if (activeLang === 'js') return jsGetFoldersExample
      return pythonGetFoldersExample
    }
  }

  // ── Reusable table styling ────────────────────────────────────────────────
  const thCls = 'px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400'
  const tdCls = 'px-4 py-3.5 text-xs text-slate-700 dark:text-slate-300 align-top'
  const trBase = 'border-b border-slate-100 dark:border-slate-800/80 last:border-0'
  const trGreen = 'border-b border-slate-100 dark:border-slate-800/80 last:border-0 bg-emerald-500/5 dark:bg-emerald-500/10'
  const mono = 'rounded-md bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50'
  const sectionH = 'text-sm font-extrabold text-slate-900 dark:text-slate-100'

  const endpointLabel = (ep: 'upload' | 'files' | 'folders') =>
    ep === 'upload' ? t('api_tab_upload') : ep === 'files' ? t('api_tab_files') : t('api_tab_folders')

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title={t('api_title')}
        description={t('api_subtitle')}
        actions={
          <Button
            className="h-10 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 font-bold text-white shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all"
            onClick={() => setCreateOpen(true)}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            {t('api_btn_create')}
          </Button>
        }
      />

      {/* ── Stats Bar ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{activeKeys}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('api_stat_active')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{usedKeys}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('api_stat_used')}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">3</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{t('api_stat_endpoints')}</p>
          </div>
        </Card>
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm font-semibold text-blue-600 dark:text-blue-400 animate-in fade-in">
          <Sparkles className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* ── Secret Key Banner ─────────────────────────────────────── */}
      {secret && (
        <Card className="overflow-hidden border-2 border-emerald-500/50 bg-emerald-500/10 p-5 space-y-4 shadow-lg">
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

      {/* ── Main Layout Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: API Keys + Auth Info */}
        <div className="xl:col-span-5 space-y-6">
          {/* API Keys Card */}
          <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{t('api_keys_card_title')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('api_keys_card_desc')}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)} className="h-8 text-xs font-bold">
                {t('api_keys_btn_new')}
              </Button>
            </div>
            <div className="p-4 space-y-3">
              {apiKeys.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-800/20">
                  <KeyRound className="mx-auto h-10 w-10 text-slate-400 dark:text-slate-500" />
                  <p className="mt-3 font-extrabold text-slate-700 dark:text-slate-200">{t('api_keys_empty_title')}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('api_keys_empty_desc')}</p>
                  <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>{t('api_btn_create')}</Button>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
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
                        <code className="inline-block rounded-md bg-slate-200/70 dark:bg-slate-700/70 px-2 py-0.5 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {apiKey.keyPrefix}...
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => revokeKey(apiKey.id)}
                        disabled={apiKey.status === 'revoked'}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 pt-2 text-[11px] text-slate-500 dark:text-slate-400 gap-1">
                      <span>{t('api_keys_created')} {formatDate(apiKey.createdAt)}</span>
                      <span>{t('api_keys_last_used')} {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : t('api_keys_never')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Supported Auth Headers */}
          <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 shadow-sm backdrop-blur-xl">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Code2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-2 flex-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{t('api_auth_headers_title')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('api_auth_headers_desc')}</p>
                <div className="space-y-2 font-mono text-[11px] font-bold pt-1">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-blue-600 dark:text-blue-400">
                    <span>Authorization: Bearer 9d_live_...</span>
                    <button
                      type="button"
                      onClick={() => copy('Authorization: Bearer 9d_live_your_secret_api_key', 'auth1')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy header format"
                    >
                      {copiedField === 'auth1' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-blue-600 dark:text-blue-400">
                    <span>X-API-Key: 9d_live_...</span>
                    <button
                      type="button"
                      onClick={() => copy('X-API-Key: 9d_live_your_secret_api_key', 'auth2')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy header format"
                    >
                      {copiedField === 'auth2' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: API Documentation */}
        <div className="xl:col-span-7">
          <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl">
            {/* Doc Header + Endpoint Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{t('api_docs_title')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('api_docs_desc')}</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1 overflow-x-auto max-w-full shrink-0">
                  {(['upload', 'files', 'folders'] as const).map((ep) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => setSelectedEndpoint(ep)}
                      className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        selectedEndpoint === ep
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {endpointLabel(ep)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-6">
              {/* URL Bar */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 flex items-center justify-between gap-3 shadow-inner">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-black text-white ${selectedEndpoint === 'upload' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {selectedEndpoint === 'upload' ? 'POST' : 'GET'}
                  </span>
                  <code className="min-w-0 truncate text-xs font-mono font-bold text-sky-400">
                    {API_URL}/api/v1/{selectedEndpoint === 'upload' ? 'uploads' : selectedEndpoint}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`${API_URL}/api/v1/${selectedEndpoint === 'upload' ? 'uploads' : selectedEndpoint}`, 'url')}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
                  title={t('api_btn_copy')}
                >
                  {copiedField === 'url' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>{t('api_btn_copy')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* ── Upload Docs ── */}
              {selectedEndpoint === 'upload' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className={sectionH}>{t('api_upload_params')} <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px] normal-case">(multipart/form-data)</span></h3>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {t('api_upload_auto_folder')}
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>{t('api_table_field')}</th>
                          <th className={thCls}>{t('api_table_type')}</th>
                          <th className={thCls}>{t('api_table_status')}</th>
                          <th className={thCls}>{t('api_table_description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-extrabold text-blue-600 dark:text-blue-400`}>file</td>
                          <td className={tdCls}><span className={mono}>File</span></td>
                          <td className={tdCls}><span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">Required</span></td>
                          <td className={tdCls}>Binary file content to upload.</td>
                        </tr>
                        <tr className={trGreen}>
                          <td className={`${tdCls} font-extrabold text-emerald-600 dark:text-emerald-400`}>folderPath</td>
                          <td className={tdCls}><span className={mono}>Text</span></td>
                          <td className={tdCls}><span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">Optional</span></td>
                          <td className={tdCls}>
                            Folder name/path (e.g.{' '}
                            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-bold text-emerald-600 dark:text-emerald-400">Namafolder</code>
                            ). Auto-creates in MySQL &amp; Drive if missing.
                          </td>
                        </tr>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-semibold`}>folderId</td>
                          <td className={tdCls}><span className={mono}>Text</span></td>
                          <td className={tdCls}><span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">Optional</span></td>
                          <td className={tdCls}>UUID of an existing virtual folder in 9Drive.</td>
                        </tr>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-semibold`}>sizeBytes</td>
                          <td className={tdCls}><span className={mono}>Text</span></td>
                          <td className={tdCls}><span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">Optional</span></td>
                          <td className={tdCls}>File size in bytes — auto-calculated from buffer if omitted.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Files Docs ── */}
              {selectedEndpoint === 'files' && (
                <div className="space-y-4">
                  <h3 className={sectionH}>{t('api_query_params')}</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>{t('api_table_param')}</th>
                          <th className={thCls}>{t('api_table_type')}</th>
                          <th className={thCls}>{t('api_table_description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-extrabold text-blue-600 dark:text-blue-400`}>folderPath</td>
                          <td className={tdCls}><span className={mono}>String</span></td>
                          <td className={tdCls}>Filter by folder name (e.g. Namafolder).</td>
                        </tr>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-semibold`}>folderId</td>
                          <td className={tdCls}><span className={mono}>String</span></td>
                          <td className={tdCls}>Filter by exact folder UUID.</td>
                        </tr>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-semibold`}>q</td>
                          <td className={tdCls}><span className={mono}>String</span></td>
                          <td className={tdCls}>Search by file name keyword.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className={sectionH}>{t('api_response_fields')} <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">{t('api_per_file')}</span></h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>{t('api_table_field')}</th>
                          <th className={thCls}>{t('api_table_type')}</th>
                          <th className={thCls}>{t('api_table_description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'id', type: 'String', desc: 'Unique file UUID in 9Drive.', cls: `${tdCls} font-extrabold text-blue-600 dark:text-blue-400`, row: trBase },
                          { name: 'name', type: 'String', desc: 'File name with extension.', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'mimeType', type: 'String', desc: 'MIME type (e.g. image/png, video/mp4).', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'sizeBytes', type: 'String', desc: 'File size in bytes (returned as string).', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'folderId', type: 'String|null', desc: 'Parent folder UUID, or null if root.', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'folderName', type: 'String|null', desc: 'Parent folder name, or null if root.', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'provider', type: 'String', desc: 'Storage: google_drive or s3.', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'viewUrl', type: 'String|null', desc: 'Google Drive view link — open in browser.', cls: `${tdCls} font-extrabold text-emerald-600 dark:text-emerald-400`, row: trGreen },
                          { name: 'downloadUrl', type: 'String|null', desc: 'Direct embed URL — use as <img src> or <video src>.', cls: `${tdCls} font-extrabold text-emerald-600 dark:text-emerald-400`, row: trGreen },
                          { name: 'createdAt', type: 'DateTime', desc: 'ISO 8601 upload timestamp.', cls: `${tdCls} font-semibold`, row: trBase },
                        ].map((f) => (
                          <tr key={f.name} className={f.row}>
                            <td className={f.cls}>{f.name}</td>
                            <td className={tdCls}><span className={mono}>{f.type}</span></td>
                            <td className={tdCls}>{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Folders Docs ── */}
              {selectedEndpoint === 'folders' && (
                <div className="space-y-4">
                  <h3 className={sectionH}>{t('api_query_params')}</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>{t('api_table_param')}</th>
                          <th className={thCls}>{t('api_table_type')}</th>
                          <th className={thCls}>{t('api_table_description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-semibold`}>parentId</td>
                          <td className={tdCls}><span className={mono}>String</span></td>
                          <td className={tdCls}>
                            Filter by parent UUID. Pass{' '}
                            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono">null</code> or{' '}
                            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono">root</code> for top-level folders.
                          </td>
                        </tr>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-semibold`}>q</td>
                          <td className={tdCls}><span className={mono}>String</span></td>
                          <td className={tdCls}>Search by folder name keyword.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className={sectionH}>{t('api_response_fields')} <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">{t('api_per_folder')}</span></h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>{t('api_table_field')}</th>
                          <th className={thCls}>{t('api_table_type')}</th>
                          <th className={thCls}>{t('api_table_description')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'id', type: 'String', desc: 'Unique folder UUID — pass as folderId when uploading.', cls: `${tdCls} font-extrabold text-blue-600 dark:text-blue-400`, row: trBase },
                          { name: 'name', type: 'String', desc: 'Folder display name.', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'parentId', type: 'String|null', desc: 'Parent UUID. Null = root level.', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'color', type: 'String', desc: 'Hex color code (e.g. #3b82f6).', cls: `${tdCls} font-semibold`, row: trBase },
                          { name: 'createdAt', type: 'DateTime', desc: 'ISO 8601 creation timestamp.', cls: `${tdCls} font-semibold`, row: trBase },
                        ].map((f) => (
                          <tr key={f.name} className={f.row}>
                            <td className={f.cls}>{f.name}</td>
                            <td className={tdCls}><span className={mono}>{f.type}</span></td>
                            <td className={tdCls}>{f.desc}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── Code Snippet Window ─────────────────────────────────── */}
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-xl">
                {/* Terminal Title Bar */}
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-[#161b2e] px-3.5 sm:px-4 py-2.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500/80" />
                    <span className="ml-1 truncate font-mono text-[11px] font-semibold text-slate-400">
                      {selectedEndpoint === 'upload'
                        ? 'upload_example'
                        : selectedEndpoint === 'files'
                          ? 'get_files_example'
                          : 'get_folders_example'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {(['curl', 'js', 'python'] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={`rounded px-2.5 py-1 text-xs font-bold transition-all ${
                          activeLang === lang ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang === 'curl' ? 'cURL' : lang === 'js' ? 'JS (Fetch)' : 'Python'}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => copy(getCodeSnippet(), 'snippet')}
                      className="ml-2 flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/90 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {copiedField === 'snippet' ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                          <span>{t('api_btn_copy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {getCodeSnippet()}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>

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
