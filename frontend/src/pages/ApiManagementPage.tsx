import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle, Clipboard, KeyRound, ShieldCheck, Trash2, Sparkles, Layers, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DummyModal } from '@/components/drive/DummyModal'
import { API_URL, apiFetch, formatDate } from '@/lib/api'

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
  -F "folderPath=promo" \\
  -F "file=@/path/to/local/photo.png"`

const jsUploadExample = `const form = new FormData()
form.append('folderPath', 'promo') // Auto-creates "promo" folder if missing!
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
        ("folderPath", (None, "promo")),
        ("file", ("photo.png", f.read(), "image/png"))
    ]
    response = requests.post(url, headers=headers, files=files)

print(response.json())`

const curlGetFilesExample = `curl -X GET "${API_URL}/api/v1/files?folderPath=promo" \\
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
#       "folderName": "promo",
#       "provider": "google_drive",
#       "viewUrl": "https://drive.google.com/file/d/xxx/view",
#       "downloadUrl": "https://drive.google.com/uc?id=xxx&export=download",
#       "createdAt": "2024-01-01T00:00:00.000Z"
#     }
#   ]
# }`

const jsGetFilesExample = `const response = await fetch('${API_URL}/api/v1/files?folderPath=promo', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer 9d_live_your_secret_api_key' }
})
const data = await response.json()
// Each file: id, name, mimeType, sizeBytes, folderId,
//   folderName, provider, viewUrl, downloadUrl, createdAt

// Example: render images from "promo" folder
data.files
  .filter((f: any) => f.mimeType.startsWith('image/'))
  .forEach((f: any) => {
    const img = document.createElement('img')
    img.src = f.downloadUrl
    document.body.appendChild(img)
  })`

const pythonGetFilesExample = `import requests

url = "${API_URL}/api/v1/files?folderPath=promo"
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
#       "name": "promo",
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
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<'upload' | 'files' | 'folders'>('upload')
  const [activeLang, setActiveLang] = useState<'curl' | 'js' | 'python'>('curl')

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

  function copy(value: string) {
    navigator.clipboard
      .writeText(value)
      .then(() => setMessage('Copied to clipboard! ✨'))
      .catch(() => setMessage('Failed to copy.'))
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

  // ── Reusable dark-mode table classes ─────────────────────────────────────
  const thCls = 'px-4 py-2.5 text-left text-[11px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400'
  const tdCls = 'px-4 py-3 text-xs text-slate-700 dark:text-slate-300 align-top'
  const trBase = 'border-b border-slate-100 dark:border-slate-800 last:border-0'
  const trGreen = 'border-b border-slate-100 dark:border-slate-800 last:border-0 bg-emerald-500/5 dark:bg-emerald-500/10'
  const mono = 'rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-slate-600 dark:text-slate-300'
  const sectionH = 'text-sm font-extrabold text-slate-800 dark:text-slate-100'

  const endpointLabel = (ep: 'upload' | 'files' | 'folders') =>
    ep === 'upload' ? 'POST Upload' : ep === 'files' ? 'GET Files' : 'GET Folders'

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/40">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>DEVELOPER API GATEWAY v1</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl text-white">
              API Keys &amp; Developer Documentation
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-indigo-200/80">
              Integrate 9Drive into your web apps, scripts, or landing pages. Upload files directly into virtual folders with zero config.
            </p>
          </div>
          <Button
            className="h-11 px-5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <KeyRound className="mr-2 h-5 w-5" />
            Create API Key
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          {([
            { icon: <KeyRound className="h-5 w-5" />, value: activeKeys, label: 'Active Keys', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
            { icon: <CheckCircle className="h-5 w-5" />, value: usedKeys, label: 'Used Keys', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
            { icon: <Layers className="h-5 w-5" />, value: 3, label: 'Endpoints Ready', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
          ] as const).map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Toast ────────────────────────────────────────────────── */}
      {message && (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm font-semibold text-blue-400 animate-in fade-in">
          <Sparkles className="h-5 w-5 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* ── Secret Key Banner ─────────────────────────────────────── */}
      {secret && (
        <div className="overflow-hidden rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-black text-emerald-300">Copy Your Secret API Key Now!</p>
              <p className="text-sm text-emerald-400/80 mt-0.5">This key is shown ONCE. Store it in a secure environment variable.</p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <code className="block min-w-0 overflow-x-auto rounded-xl border border-emerald-500/40 bg-slate-950 p-3.5 text-xs font-bold text-emerald-300">
              {secret}
            </code>
            <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white" onClick={() => copy(secret)}>
              <Clipboard className="mr-2 h-4 w-4" /> Copy Key
            </Button>
          </div>
        </div>
      )}

      {/* ── Main Grid ────────────────────────────────────────────── */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Keys + Auth info */}
        <div className="lg:col-span-5 space-y-5">
          {/* API Keys Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">Your API Keys</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Keys let external apps upload files.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>+ New</Button>
            </div>
            <div className="p-4 space-y-3">
              {apiKeys.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                  <KeyRound className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-3 font-extrabold text-slate-700 dark:text-slate-200">No API keys yet</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">Create your first key to start integrating.</p>
                  <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>Create API Key</Button>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700"
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
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{apiKey.name}</p>
                        </div>
                        <code className="inline-block rounded bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {apiKey.keyPrefix}...
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => revokeKey(apiKey.id)}
                        disabled={apiKey.status === 'revoked'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700/60 pt-2 text-[11px] text-slate-500 dark:text-slate-500">
                      <span>Created: {formatDate(apiKey.createdAt)}</span>
                      <span>Last used: {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Supported Auth Headers */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Supported Auth Headers</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Send your API key in either format:</p>
                <div className="space-y-1.5">
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400">
                    Authorization: Bearer 9d_live_...
                  </div>
                  <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-[11px] font-bold text-blue-700 dark:text-blue-400">
                    X-API-Key: 9d_live_...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: API Docs */}
        <div className="lg:col-span-7">
          <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            {/* Doc Header + Endpoint Tabs */}
            <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-slate-100">API Documentation</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Interactive specs &amp; code snippets.</p>
                </div>
                <div className="flex items-center gap-1 rounded-xl bg-slate-200 dark:bg-slate-700 p-1">
                  {(['upload', 'files', 'folders'] as const).map((ep) => (
                    <button
                      key={ep}
                      type="button"
                      onClick={() => setSelectedEndpoint(ep)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                        selectedEndpoint === ep
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {endpointLabel(ep)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* URL Bar */}
              <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-black text-white ${selectedEndpoint === 'upload' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    {selectedEndpoint === 'upload' ? 'POST' : 'GET'}
                  </span>
                  <code className="min-w-0 truncate text-xs font-mono font-bold text-sky-400">
                    {API_URL}/api/v1/{selectedEndpoint === 'upload' ? 'uploads' : selectedEndpoint}
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => copy(`${API_URL}/api/v1/${selectedEndpoint === 'upload' ? 'uploads' : selectedEndpoint}`)}
                >
                  <Clipboard className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* ── Upload Docs ── */}
              {selectedEndpoint === 'upload' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className={sectionH}>Upload Parameters <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px] normal-case">(multipart/form-data)</span></h3>
                    <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✨ Auto-creates folders
                    </span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>Field</th>
                          <th className={thCls}>Type</th>
                          <th className={thCls}>Status</th>
                          <th className={thCls}>Description</th>
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
                            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-bold text-emerald-600 dark:text-emerald-400">promo</code>
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
                  <h3 className={sectionH}>Query Parameters</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>Param</th>
                          <th className={thCls}>Type</th>
                          <th className={thCls}>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className={trBase}>
                          <td className={`${tdCls} font-extrabold text-blue-600 dark:text-blue-400`}>folderPath</td>
                          <td className={tdCls}><span className={mono}>String</span></td>
                          <td className={tdCls}>Filter by folder name (e.g. promo).</td>
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

                  <h3 className={sectionH}>Response Fields <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">(per file)</span></h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>Field</th>
                          <th className={thCls}>Type</th>
                          <th className={thCls}>Description</th>
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
                  <h3 className={sectionH}>Query Parameters</h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>Param</th>
                          <th className={thCls}>Type</th>
                          <th className={thCls}>Description</th>
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

                  <h3 className={sectionH}>Response Fields <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">(per folder)</span></h3>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left">
                      <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                        <tr>
                          <th className={thCls}>Field</th>
                          <th className={thCls}>Type</th>
                          <th className={thCls}>Description</th>
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
                <div className="flex items-center justify-between border-b border-slate-800 bg-[#161b2e] px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-[11px] font-semibold text-slate-500">
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                      onClick={() => copy(getCodeSnippet())}
                    >
                      <Clipboard className="mr-1 h-3.5 w-3.5" /> Copy
                    </Button>
                  </div>
                </div>
                <pre className="max-h-80 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-300">
                  {getCodeSnippet()}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Create Key Modal ─────────────────────────────────────── */}
      <DummyModal
        open={createOpen}
        title="Create API Key"
        description="API keys allow external applications to upload and manage files."
        onClose={() => setCreateOpen(false)}
      >
        <form className="space-y-4" onSubmit={createKey}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Key Name</label>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g. Landing Page Form, Backup Script"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create API Key'}
            </Button>
          </div>
        </form>
      </DummyModal>
    </div>
  )
}
