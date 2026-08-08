import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle, KeyRound, Trash2, Sparkles, Copy, Check, UploadCloud, ShieldCheck, Clipboard, FileText, FolderTree } from 'lucide-react'
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

type ExpirationOption = 'never' | '7d' | '30d' | '90d' | '1y'
type ApiDocTab = 'upload' | 'files' | 'folders'
type UploadMode = 'simple' | 'batch'

export function ApiManagementPage() {
  const { t } = useLanguage()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [expiration, setExpiration] = useState<ExpirationOption>('never')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['files:read', 'files:upload'])
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  // Interactive documentation state
  const [activeTab, setActiveTab] = useState<ApiDocTab>('upload')
  const [uploadMode, setUploadMode] = useState<UploadMode>('simple')

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
      let expiresAt: string | null = null
      const now = new Date()
      if (expiration === '7d') {
        expiresAt = new Date(now.getTime() + 7 * 86400 * 1000).toISOString()
      } else if (expiration === '30d') {
        expiresAt = new Date(now.getTime() + 30 * 86400 * 1000).toISOString()
      } else if (expiration === '90d') {
        expiresAt = new Date(now.getTime() + 90 * 86400 * 1000).toISOString()
      } else if (expiration === '1y') {
        expiresAt = new Date(now.getTime() + 365 * 86400 * 1000).toISOString()
      }

      const data = await apiFetch<{ apiKey: ApiKey; secret: string }>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name: keyName, expiresAt, scopes: selectedScopes }),
      })
      setSecret(data.secret)
      setKeyName('')
      setExpiration('never')
      setSelectedScopes(['files:read', 'files:upload'])
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

  // URLs
  const uploadsEndpoint = `${API_URL}/api/v1/uploads`
  const filesEndpoint = `${API_URL}/api/v1/files`
  const foldersEndpoint = `${API_URL}/api/v1/folders`

  // Header Snippets
  const authHeaderBearer = `Authorization: Bearer 9d_live_xxx`
  const authHeaderXApiKey = `X-API-Key: 9d_live_xxx`

  // Upload Snippets - Simple
  const simpleCurl = `curl -X POST '${uploadsEndpoint}' \\
  -H 'Authorization: Bearer 9d_live_xxx' \\
  -F 'file=@photo.jpg'`

  const simpleJs = `const form = new FormData()
form.append('file', file) // File object from input element

const res = await fetch('${uploadsEndpoint}', {
  method: 'POST',
  headers: { Authorization: 'Bearer 9d_live_xxx' },
  body: form,
})
const data = await res.json()`

  const simplePython = `import requests

url = '${uploadsEndpoint}'
headers = { 'Authorization': 'Bearer 9d_live_xxx' }
files = { 'file': ('photo.jpg', open('photo.jpg', 'rb'), 'image/jpeg') }

response = requests.post(url, headers=headers, files=files)
print(response.json())`

  // Upload Snippets - Batch
  const batchCurl = `curl -X POST '${uploadsEndpoint}' \\
  -H 'Authorization: Bearer 9d_live_xxx' \\
  -F 'filesMeta=[{"fieldName":"file-0","fileName":"hello.txt","mimeType":"text/plain","sizeBytes":12,"folderPath":"Documents/Notes"}]' \\
  -F 'file-0=@hello.txt;type=text/plain'`

  const batchJs = `const form = new FormData()
form.append('filesMeta', JSON.stringify([
  { fieldName: 'file-0', fileName: file.name, mimeType: file.type, sizeBytes: String(file.size), folderPath: 'Documents/Notes' },
]))
form.append('file-0', file)

const res = await fetch('${uploadsEndpoint}', {
  method: 'POST',
  headers: { Authorization: 'Bearer 9d_live_xxx' },
  body: form,
})
const data = await res.json()`

  const batchPython = `import requests, json

url = '${uploadsEndpoint}'
headers = { 'Authorization': 'Bearer 9d_live_xxx' }
files_meta = [{ 'fieldName': 'file-0', 'fileName': 'hello.txt', 'mimeType': 'text/plain', 'sizeBytes': 12, 'folderPath': 'Documents/Notes' }]
files = {
    'filesMeta': (None, json.dumps(files_meta)),
    'file-0': ('hello.txt', open('hello.txt', 'rb'), 'text/plain')
}

response = requests.post(url, headers=headers, files=files)
print(response.json())`

  // Files Snippets
  const filesCurl = `curl -X GET '${filesEndpoint}?folderPath=Documents' \\
  -H 'Authorization: Bearer 9d_live_xxx'`

  const filesJs = `const res = await fetch('${filesEndpoint}?q=invoice', {
  headers: { Authorization: 'Bearer 9d_live_xxx' },
})
const data = await res.json()`

  const filesPython = `import requests

url = '${filesEndpoint}'
headers = { 'Authorization': 'Bearer 9d_live_xxx' }
params = { 'folderPath': 'Documents/Invoices' }

response = requests.get(url, headers=headers, params=params)
print(response.json())`

  // Folders Snippets
  const foldersCurl = `curl -X GET '${foldersEndpoint}' \\
  -H 'Authorization: Bearer 9d_live_xxx'`

  const foldersJs = `const res = await fetch('${foldersEndpoint}', {
  headers: { Authorization: 'Bearer 9d_live_xxx' },
})
const data = await res.json()`

  const foldersPython = `import requests

url = '${foldersEndpoint}'
headers = { 'Authorization': 'Bearer 9d_live_xxx' }
params = { 'parentId': 'root' }

response = requests.get(url, headers=headers, params=params)
print(response.json())`

  // JSON Response Examples
  const uploadResponseJson = `{
  "file": {
    "id": "c7b3a9e2-8d1f-4a3b-9c2e-1f8a7d6c5b4a",
    "name": "photo.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": "1048576",
    "folderId": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
    "provider": "google_drive",
    "providerFileId": "1A2B3C4D5E6F7G8H9I0J",
    "createdAt": "2026-08-08T10:00:00.000Z",
    "updatedAt": "2026-08-08T10:00:00.000Z"
  }
}`

  const filesResponseJson = `{
  "status": "ok",
  "count": 1,
  "files": [
    {
      "id": "c7b3a9e2-8d1f-4a3b-9c2e-1f8a7d6c5b4a",
      "name": "invoice_august.pdf",
      "mimeType": "application/pdf",
      "sizeBytes": "245760",
      "folderId": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "folderName": "Invoices",
      "provider": "google_drive",
      "viewUrl": "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view",
      "downloadUrl": "https://drive.google.com/uc?id=1A2B3C4D5E6F7G8H9I0J&export=download",
      "createdAt": "2026-08-08T10:00:00.000Z",
      "updatedAt": "2026-08-08T10:00:00.000Z"
    }
  ]
}`

  const foldersResponseJson = `{
  "status": "ok",
  "count": 2,
  "folders": [
    {
      "id": "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
      "name": "Documents",
      "parentId": null,
      "color": "#3b82f6",
      "createdAt": "2026-08-01T08:00:00.000Z",
      "updatedAt": "2026-08-01T08:00:00.000Z"
    },
    {
      "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "name": "Images",
      "parentId": null,
      "color": "#10b981",
      "createdAt": "2026-08-02T09:00:00.000Z",
      "updatedAt": "2026-08-02T09:00:00.000Z"
    }
  ]
}`

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title={t('api_title')}
        description={t('api_subtitle')}
        actions={
          <Button
            className="h-10 px-4 bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-md shadow-blue-500/20 transition-all rounded-xl flex items-center gap-2"
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
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">3</p>
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
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{apiKey.name}</p>
                    {apiKey.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                        </span>
                        {t('api_status_active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <span className="inline-flex h-2 w-2 rounded-full bg-rose-500" />
                        {t('api_status_revoked')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <code className="rounded-md bg-slate-200/70 dark:bg-slate-700/70 px-2 py-0.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {apiKey.keyPrefix}...
                    </code>
                    <span>• {t('api_keys_created')} {formatDate(apiKey.createdAt)}</span>
                    <span>• {t('api_keys_last_used')} {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : t('api_keys_never')}</span>
                    <span>• Expired: {apiKey.expiresAt ? formatDate(apiKey.expiresAt) : 'Never'}</span>
                  </div>
                  {apiKey.scopes && apiKey.scopes.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {apiKey.scopes.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
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

      {/* ── API Documentation Section (Interactive Tabs) ──────────────── */}
      <Card className="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shadow-sm backdrop-blur-xl rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100">{t('api_docs_title')}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('api_docs_desc')}</p>
        </div>

        {/* ── Auth Header Banner ─────────────────────────────────── */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 p-4 space-y-2">
          <h3 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('api_auth_headers_title')}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">{t('api_auth_headers_desc')}</p>
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <code className="rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold text-emerald-400 border border-slate-800">
              {authHeaderBearer}
            </code>
            <code className="rounded-lg bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold text-indigo-400 border border-slate-800">
              {authHeaderXApiKey}
            </code>
          </div>
        </div>

        {/* ── Tabs Header ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'upload'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>{t('api_tab_upload')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'files'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{t('api_tab_files')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('folders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'folders'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>{t('api_tab_folders')}</span>
          </button>
        </div>

        {/* ── TAB 1: POST /v1/uploads ──────────────────────────────── */}
        {activeTab === 'upload' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Mode toggle */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Format Payload</span>
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setUploadMode('simple')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${uploadMode === 'simple' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                  Standard Single-File
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('batch')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${uploadMode === 'batch' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                >
                  Batch & Metadata ({t('api_upload_auto_folder')})
                </button>
              </div>
            </div>

            {/* Endpoint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Endpoint</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Scope: files:upload
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`POST ${uploadsEndpoint}`, 'endpoint_upload')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'endpoint_upload' ? (
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
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs font-bold text-emerald-400 overflow-x-auto">
                POST {uploadsEndpoint}
              </div>
            </div>

            {/* Parameters Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('api_upload_params')}</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('api_table_field')}</th>
                      <th className="p-3">{t('api_table_type')}</th>
                      <th className="p-3">{t('api_table_status')}</th>
                      <th className="p-3">{t('api_table_description')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {uploadMode === 'simple' ? (
                      <>
                        <tr>
                          <td className="p-3 font-mono font-bold text-emerald-500">file</td>
                          <td className="p-3 font-mono">File / Binary</td>
                          <td className="p-3 text-emerald-600 font-bold">Required</td>
                          <td className="p-3">File binary yang diunggah.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-blue-500">folderPath</td>
                          <td className="p-3 font-mono">string</td>
                          <td className="p-3 text-slate-400">Optional</td>
                          <td className="p-3">Path folder virtual (misal <code className="text-indigo-400">Documents/Notes</code>). Otomatis membuat folder bersarang jika belum ada.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-blue-500">folderId</td>
                          <td className="p-3 font-mono">string</td>
                          <td className="p-3 text-slate-400">Optional</td>
                          <td className="p-3">ID folder virtual spesifik di 9Drive.</td>
                        </tr>
                      </>
                    ) : (
                      <>
                        <tr>
                          <td className="p-3 font-mono font-bold text-emerald-500">filesMeta</td>
                          <td className="p-3 font-mono">JSON String Array</td>
                          <td className="p-3 text-emerald-600 font-bold">Required</td>
                          <td className="p-3">Array metadata JSON berisi <code className="text-indigo-400">[&#123; fieldName, fileName, mimeType, sizeBytes, folderPath, folderId &#125;]</code>.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-bold text-emerald-500">file-0, file-1, ...</td>
                          <td className="p-3 font-mono">File / Binary</td>
                          <td className="p-3 text-emerald-600 font-bold">Required</td>
                          <td className="p-3">Field multipart file yang namanya cocok dengan <code className="text-indigo-400">fieldName</code> di dalam <code className="text-indigo-400">filesMeta</code>.</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* cURL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">cURL</h3>
                <button
                  type="button"
                  onClick={() => copy(uploadMode === 'simple' ? simpleCurl : batchCurl, 'curl_upload')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'curl_upload' ? (
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
                {uploadMode === 'simple' ? simpleCurl : batchCurl}
              </pre>
            </div>

            {/* JavaScript */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">JavaScript</h3>
                <button
                  type="button"
                  onClick={() => copy(uploadMode === 'simple' ? simpleJs : batchJs, 'js_upload')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'js_upload' ? (
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
                {uploadMode === 'simple' ? simpleJs : batchJs}
              </pre>
            </div>

            {/* Python */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Python</h3>
                <button
                  type="button"
                  onClick={() => copy(uploadMode === 'simple' ? simplePython : batchPython, 'py_upload')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'py_upload' ? (
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
                {uploadMode === 'simple' ? simplePython : batchPython}
              </pre>
            </div>

            {/* Response Example */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('api_response_example')}</h3>
                <button
                  type="button"
                  onClick={() => copy(uploadResponseJson, 'res_upload')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'res_upload' ? (
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
              <pre className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto">
                {uploadResponseJson}
              </pre>
            </div>
          </div>
        )}

        {/* ── TAB 2: GET /v1/files ─────────────────────────────────── */}
        {activeTab === 'files' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Endpoint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Endpoint</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Scope: files:read
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`GET ${filesEndpoint}`, 'endpoint_files')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'endpoint_files' ? (
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
                GET {filesEndpoint}
              </div>
            </div>

            {/* Query Params Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('api_query_params')}</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('api_table_param')}</th>
                      <th className="p-3">{t('api_table_type')}</th>
                      <th className="p-3">{t('api_table_status')}</th>
                      <th className="p-3">{t('api_table_description')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-500">folderPath</td>
                      <td className="p-3 font-mono">string</td>
                      <td className="p-3 text-slate-400">Optional</td>
                      <td className="p-3">Path folder virtual (misal: <code className="text-indigo-400">Documents/Invoices</code>). Otomatis memfilter file di dalam path ini.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-500">folderId</td>
                      <td className="p-3 font-mono">string</td>
                      <td className="p-3 text-slate-400">Optional</td>
                      <td className="p-3">UUID spesifik folder virtual di 9Drive.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-blue-500">q</td>
                      <td className="p-3 font-mono">string</td>
                      <td className="p-3 text-slate-400">Optional</td>
                      <td className="p-3">Pencarian kata kunci nama file.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* cURL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">cURL</h3>
                <button
                  type="button"
                  onClick={() => copy(filesCurl, 'curl_files')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'curl_files' ? (
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
                {filesCurl}
              </pre>
            </div>

            {/* JavaScript */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">JavaScript</h3>
                <button
                  type="button"
                  onClick={() => copy(filesJs, 'js_files')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'js_files' ? (
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
                {filesJs}
              </pre>
            </div>

            {/* Python */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Python</h3>
                <button
                  type="button"
                  onClick={() => copy(filesPython, 'py_files')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'py_files' ? (
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
                {filesPython}
              </pre>
            </div>

            {/* Response Example */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('api_response_example')}</h3>
                <button
                  type="button"
                  onClick={() => copy(filesResponseJson, 'res_files')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'res_files' ? (
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
              <pre className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-blue-400 leading-relaxed overflow-x-auto">
                {filesResponseJson}
              </pre>
            </div>
          </div>
        )}

        {/* ── TAB 3: GET /v1/folders ───────────────────────────────── */}
        {activeTab === 'folders' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Endpoint */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Endpoint</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    Scope: files:read
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copy(`GET ${foldersEndpoint}`, 'endpoint_folders')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'endpoint_folders' ? (
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
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs font-bold text-purple-400 overflow-x-auto">
                GET {foldersEndpoint}
              </div>
            </div>

            {/* Query Params Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('api_query_params')}</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="p-3">{t('api_table_param')}</th>
                      <th className="p-3">{t('api_table_type')}</th>
                      <th className="p-3">{t('api_table_status')}</th>
                      <th className="p-3">{t('api_table_description')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    <tr>
                      <td className="p-3 font-mono font-bold text-purple-500">parentId</td>
                      <td className="p-3 font-mono">string</td>
                      <td className="p-3 text-slate-400">Optional</td>
                      <td className="p-3">ID folder atasan (Gunakan <code className="text-indigo-400">null</code> atau <code className="text-indigo-400">root</code> untuk folder tingkat teratas).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-bold text-purple-500">q</td>
                      <td className="p-3 font-mono">string</td>
                      <td className="p-3 text-slate-400">Optional</td>
                      <td className="p-3">Pencarian nama folder.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* cURL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">cURL</h3>
                <button
                  type="button"
                  onClick={() => copy(foldersCurl, 'curl_folders')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'curl_folders' ? (
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
                {foldersCurl}
              </pre>
            </div>

            {/* JavaScript */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">JavaScript</h3>
                <button
                  type="button"
                  onClick={() => copy(foldersJs, 'js_folders')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'js_folders' ? (
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
                {foldersJs}
              </pre>
            </div>

            {/* Python */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Python</h3>
                <button
                  type="button"
                  onClick={() => copy(foldersPython, 'py_folders')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'py_folders' ? (
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
                {foldersPython}
              </pre>
            </div>

            {/* Response Example */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('api_response_example')}</h3>
                <button
                  type="button"
                  onClick={() => copy(foldersResponseJson, 'res_folders')}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  {copiedField === 'res_folders' ? (
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
              <pre className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-purple-400 leading-relaxed overflow-x-auto">
                {foldersResponseJson}
              </pre>
            </div>
          </div>
        )}

        {/* ── Status & Error Codes Table ─────────────────────────────── */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Status & Error Codes Reference</h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                <tr>
                  <th className="p-3">HTTP Status</th>
                  <th className="p-3">Error Code</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                <tr>
                  <td className="p-3 font-mono font-bold text-emerald-500">200 / 201</td>
                  <td className="p-3 font-mono text-slate-400">N/A</td>
                  <td className="p-3">Request successful / Resource created.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-amber-500">401</td>
                  <td className="p-3 font-mono text-amber-500 font-bold">API_KEY_REQUIRED</td>
                  <td className="p-3">Header <code className="text-indigo-400">Authorization</code> / <code className="text-indigo-400">X-API-Key</code> is missing.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-amber-500">401</td>
                  <td className="p-3 font-mono text-amber-500 font-bold">API_KEY_INVALID</td>
                  <td className="p-3">API Key invalid, expired, or revoked.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-rose-500">403</td>
                  <td className="p-3 font-mono text-rose-500 font-bold">API_KEY_FORBIDDEN</td>
                  <td className="p-3">API Key does not have the required scope (<code className="text-indigo-400">files:read</code> or <code className="text-indigo-400">files:upload</code>).</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-rose-500">404</td>
                  <td className="p-3 font-mono text-rose-500 font-bold">FOLDER_NOT_FOUND</td>
                  <td className="p-3">Specified <code className="text-indigo-400">folderPath</code> does not exist.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-rose-500">404</td>
                  <td className="p-3 font-mono text-rose-500 font-bold">API_KEY_NOT_FOUND</td>
                  <td className="p-3">Specified API Key ID was not found or already revoked.</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono font-bold text-rose-500">400</td>
                  <td className="p-3 font-mono text-rose-500 font-bold">UPLOAD_TOO_LARGE</td>
                  <td className="p-3">Uploaded file exceeds maximum allowed upload size.</td>
                </tr>
              </tbody>
            </table>
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

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('api_modal_expiration')}</label>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value as ExpirationOption)}
            >
              <option value="never">{t('api_expiration_never')}</option>
              <option value="7d">{t('api_expiration_7d')}</option>
              <option value="30d">{t('api_expiration_30d')}</option>
              <option value="90d">{t('api_expiration_90d')}</option>
              <option value="1y">{t('api_expiration_1y')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{t('api_modal_scopes')}</label>
            <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 p-3">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedScopes.includes('files:read')}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedScopes([...selectedScopes, 'files:read'])
                    else setSelectedScopes(selectedScopes.filter((s) => s !== 'files:read'))
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{t('api_scope_read')}</span>
              </label>
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedScopes.includes('files:upload')}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedScopes([...selectedScopes, 'files:upload'])
                    else setSelectedScopes(selectedScopes.filter((s) => s !== 'files:upload'))
                  }}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{t('api_scope_upload')}</span>
              </label>
            </div>
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
