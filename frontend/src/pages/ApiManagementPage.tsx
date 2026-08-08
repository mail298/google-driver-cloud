import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle, Clipboard, KeyRound, ShieldCheck, Trash2, Sparkles, Layers, Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DummyModal } from '@/components/drive/DummyModal'
import { API_URL, apiFetch, formatDate } from '@/lib/api'

type ApiKey = { id: string; name: string; keyPrefix: string; scopes: string[]; status: string; lastUsedAt: string | null; expiresAt: string | null; revokedAt: string | null; createdAt: string }

const curlUploadExample = `curl -X POST "${API_URL}/api/v1/uploads" \\
  -H "Authorization: Bearer 9d_live_your_secret_api_key" \\
  -F "folderPath=promo" \\
  -F "file=@/path/to/local/photo.png"`

const jsUploadExample = `const form = new FormData()
form.append('folderPath', 'promo') // Auto-creates "promo" folder if missing!
form.append('file', fileInput.files[0]) // sizeBytes is automatically calculated!

const response = await fetch('${API_URL}/api/v1/uploads', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 9d_live_your_secret_api_key'
  },
  body: form,
})
const result = await response.json()`

const pythonUploadExample = `import requests

url = "${API_URL}/api/v1/uploads"
headers = {
    "Authorization": "Bearer 9d_live_your_secret_api_key"
}

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
  headers: {
    'Authorization': 'Bearer 9d_live_your_secret_api_key'
  }
})
const data = await response.json()
// data.files is an array of file objects
// Each file has: id, name, mimeType, sizeBytes, folderId,
//   folderName, provider, viewUrl, downloadUrl, createdAt
console.log(data.files)

// Example: Display images on your landing page
data.files
  .filter(f => f.mimeType.startsWith('image/'))
  .forEach(f => {
    const img = document.createElement('img')
    img.src = f.downloadUrl
    document.body.appendChild(img)
  })`

const pythonGetFilesExample = `import requests

url = "${API_URL}/api/v1/files?folderPath=promo"
headers = {
    "Authorization": "Bearer 9d_live_your_secret_api_key"
}

response = requests.get(url, headers=headers)
data = response.json()

# data['files'] contains array of file objects
# Each file has: id, name, mimeType, sizeBytes,
#   folderId, folderName, provider, viewUrl, downloadUrl
for file in data['files']:
    print(f"{file['name']} → {file['viewUrl']}")`

const curlGetFoldersExample = `curl -X GET "${API_URL}/api/v1/folders" \\
  -H "Authorization: Bearer 9d_live_your_secret_api_key"

# With parent filter:
# curl -X GET "${API_URL}/api/v1/folders?parentId=null" \\

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
  headers: {
    'Authorization': 'Bearer 9d_live_your_secret_api_key'
  }
})
const data = await response.json()
// data.folders is an array of folder objects
// Each folder has: id, name, parentId, color, createdAt, updatedAt
console.log(data.folders)

// Filter root folders only (no parent)
const rootFolders = data.folders.filter(f => f.parentId === null)
console.log('Root folders:', rootFolders)`

const pythonGetFoldersExample = `import requests

url = "${API_URL}/api/v1/folders"
headers = {
    "Authorization": "Bearer 9d_live_your_secret_api_key"
}

response = requests.get(url, headers=headers)
data = response.json()

# data['folders'] contains array of folder objects
# Each folder has: id, name, parentId, color, createdAt
for folder in data['folders']:
    parent = folder['parentId'] or 'root'
    print(f"{folder['name']} (parent: {parent})")  `

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
      const data = await apiFetch<{ apiKey: ApiKey; secret: string }>('/api-keys', { method: 'POST', body: JSON.stringify({ name: keyName }) })
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
    navigator.clipboard.writeText(value).then(() => setMessage('Copied to clipboard! ✨')).catch(() => setMessage('Failed to copy.'))
    setTimeout(() => setMessage(''), 3000)
  }

  const activeKeys = apiKeys.filter((apiKey) => apiKey.status === 'active').length
  const usedKeys = apiKeys.filter((apiKey) => apiKey.lastUsedAt).length

  const getCodeSnippet = () => {
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

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-indigo-900/40">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>DEVELOPER API GATEWAY v1</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-white">
              API Keys & Developer Documentation
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-indigo-200/80 sm:text-base">
              Integrate 9Drive directly into your web apps, external scripts, or landing pages. Upload files directly into folders with zero configuration.
            </p>
          </div>

          <Button
            className="h-11 px-5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 font-extrabold text-white shadow-lg transition-all hover:from-blue-500 hover:to-indigo-500 hover:shadow-indigo-500/25 sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <KeyRound className="mr-2 h-5 w-5" />
            Create API Key
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{activeKeys}</p>
              <p className="text-xs font-medium text-slate-400">Active Keys</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{usedKeys}</p>
              <p className="text-xs font-medium text-slate-400">Used Keys</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 backdrop-blur-sm border border-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">3</p>
              <p className="text-xs font-medium text-slate-400">Endpoints Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secret Toast Banner */}
      {message ? (
        <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-900 shadow-sm animate-in fade-in">
          <Sparkles className="h-5 w-5 shrink-0 text-blue-600" />
          <span>{message}</span>
        </div>
      ) : null}

      {secret ? (
        <Card className="min-w-0 overflow-hidden border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50 p-0 shadow-lg">
          <div className="grid min-w-0 gap-4 p-5 sm:p-6">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-emerald-950">Copy Your Secret API Key Now!</p>
                <p className="mt-1 text-sm font-medium text-emerald-800">
                  This key will only be shown ONCE. Store it in a secure environment variable before closing.
                </p>
              </div>
            </div>
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <code className="block min-w-0 max-w-full overflow-x-auto rounded-xl border border-emerald-300 bg-white p-3.5 text-xs font-black text-slate-950 shadow-inner sm:text-sm">
                {secret}
              </code>
              <Button className="h-11 px-5 w-full bg-emerald-600 font-bold hover:bg-emerald-700 lg:w-auto" type="button" onClick={() => copy(secret)}>
                <Clipboard className="mr-2 h-4 w-4" />
                Copy Secret Key
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Main Grid: Keys List & Documentation */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: API Keys Management (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Your API Keys</h2>
                <p className="text-xs text-slate-500">Keys give external apps permission to upload files.</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                + New
              </Button>
            </div>

            <div className="mt-5 space-y-3">
              {apiKeys.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <KeyRound className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="mt-3 font-extrabold text-slate-800">No API keys created</p>
                  <p className="mt-1 text-xs text-slate-500">Create your first API key to start integrating.</p>
                  <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
                    Create API Key
                  </Button>
                </div>
              ) : (
                apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:border-slate-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5">
                            {apiKey.status === 'active' ? (
                              <>
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                              </>
                            ) : (
                              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-slate-400" />
                            )}
                          </span>
                          <p className="font-bold text-slate-900">{apiKey.name}</p>
                        </div>
                        <code className="inline-block rounded-md bg-slate-200/70 px-2 py-0.5 text-xs font-bold text-slate-800">
                          {apiKey.keyPrefix}...
                        </code>
                      </div>

                      <Button
                        size="sm"
                        variant="danger"
                        className="opacity-90 hover:opacity-100"
                        onClick={() => revokeKey(apiKey.id)}
                        disabled={apiKey.status === 'revoked'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
                      <span>Created: {formatDate(apiKey.createdAt)}</span>
                      <span>Last used: {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Authentication Tip Card */}
          <Card className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/30 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <Code2 className="h-4 w-4" />
              </div>
              <div className="space-y-1 text-xs leading-relaxed text-slate-700">
                <p className="font-extrabold text-slate-900">Supported Headers</p>
                <p>You can send your API key in either header format:</p>
                <div className="mt-2 space-y-1 font-mono text-[11px] font-bold text-blue-900">
                  <p className="rounded bg-white/80 p-1.5 border border-blue-200">Authorization: Bearer 9d_live_...</p>
                  <p className="rounded bg-white/80 p-1.5 border border-blue-200">X-API-Key: 9d_live_...</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Interactive API Documentation & Code Playground (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
            {/* Docs Section Header */}
            <div className="border-b border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">API Documentation</h2>
                  <p className="text-xs text-slate-500">Explore interactive request specifications and code snippets.</p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-slate-200/80 p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedEndpoint('upload')}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      selectedEndpoint === 'upload' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    POST Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEndpoint('files')}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      selectedEndpoint === 'files' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    GET Files
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEndpoint('folders')}
                    className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                      selectedEndpoint === 'folders' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    GET Folders
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Endpoint Display Badge */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg px-2.5 py-1 text-xs font-black uppercase ${selectedEndpoint === 'upload' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {selectedEndpoint === 'upload' ? 'POST' : 'GET'}
                    </span>
                    <code className="text-xs font-mono font-extrabold text-blue-300 sm:text-sm">
                      {API_URL}/api/v1/{selectedEndpoint === 'upload' ? 'uploads' : selectedEndpoint}
                    </code>
                  </div>
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800" onClick={() => copy(`${API_URL}/api/v1/${selectedEndpoint === 'upload' ? 'uploads' : selectedEndpoint}`)}>
                    <Clipboard className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Endpoint Details */}
              {selectedEndpoint === 'upload' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-slate-900 text-sm">Upload Parameters (`multipart/form-data`)</h3>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">✨ Auto-Folder Creation Supported</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-extrabold text-slate-800">
                        <tr>
                          <th className="p-3">Field</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        <tr>
                          <td className="p-3 font-extrabold text-blue-600">file</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">File</span></td>
                          <td className="p-3"><span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Required</span></td>
                          <td className="p-3">The binary file content to upload.</td>
                        </tr>
                        <tr className="bg-emerald-50/50">
                          <td className="p-3 font-extrabold text-emerald-700">folderPath</td>
                          <td className="p-3"><span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-emerald-900">Text</span></td>
                          <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Optional</span></td>
                          <td className="p-3">
                            Target folder name/path (e.g. <code className="font-bold text-emerald-800">promo</code>). 
                            <span className="ml-1 font-bold text-emerald-700">Auto-creates folder in MySQL & Google Drive if it doesn't exist!</span>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-900">folderId</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">Text</span></td>
                          <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Optional</span></td>
                          <td className="p-3">Exact UUID of an existing virtual folder in 9Drive.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-900">sizeBytes</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">Text</span></td>
                          <td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Optional</span></td>
                          <td className="p-3">File size in bytes. <span className="font-semibold text-slate-950">Auto-calculated from stream buffer if omitted!</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedEndpoint === 'files' ? (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">File Listing Query Parameters</h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-extrabold text-slate-800">
                        <tr>
                          <th className="p-3">Query Param</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        <tr>
                          <td className="p-3 font-extrabold text-blue-600">folderPath</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td>
                          <td className="p-3">Filter files inside folder name (e.g. <code className="font-bold">promo</code>).</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-900">folderId</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td>
                          <td className="p-3">Filter files by folder UUID.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-900">q</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td>
                          <td className="p-3">Search by file name keyword.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Response Fields */}
                  <h3 className="font-extrabold text-slate-900 text-sm pt-2">Response Fields (per file)</h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-extrabold text-slate-800">
                        <tr>
                          <th className="p-3">Field</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        <tr><td className="p-3 font-extrabold text-blue-600">id</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">Unique file UUID in 9Drive database.</td></tr>
                        <tr><td className="p-3 font-semibold">name</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">File name with extension.</td></tr>
                        <tr><td className="p-3 font-semibold">mimeType</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">MIME type (e.g. <code>image/png</code>, <code>video/mp4</code>).</td></tr>
                        <tr><td className="p-3 font-semibold">sizeBytes</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">File size in bytes (as string to avoid BigInt issues).</td></tr>
                        <tr><td className="p-3 font-semibold">folderId</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String|null</span></td><td className="p-3">Parent folder UUID, or null if root.</td></tr>
                        <tr><td className="p-3 font-semibold">folderName</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String|null</span></td><td className="p-3">Parent folder name, or null if root.</td></tr>
                        <tr><td className="p-3 font-semibold">provider</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">Storage provider: <code>google_drive</code> or <code>s3</code>.</td></tr>
                        <tr className="bg-emerald-50/50"><td className="p-3 font-extrabold text-emerald-700">viewUrl</td><td className="p-3"><span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-emerald-900">String|null</span></td><td className="p-3">Google Drive view link — open file in browser directly.</td></tr>
                        <tr className="bg-emerald-50/50"><td className="p-3 font-extrabold text-emerald-700">downloadUrl</td><td className="p-3"><span className="rounded bg-emerald-100 px-1.5 py-0.5 font-mono text-emerald-900">String|null</span></td><td className="p-3">Direct download/embed link — use as <code>&lt;img src&gt;</code> or <code>&lt;video src&gt;</code>.</td></tr>
                        <tr><td className="p-3 font-semibold">createdAt</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">DateTime</span></td><td className="p-3">ISO 8601 timestamp when file was uploaded.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-sm">Folder Listing Query Parameters</h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-extrabold text-slate-800">
                        <tr>
                          <th className="p-3">Query Param</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        <tr>
                          <td className="p-3 font-semibold text-slate-900">parentId</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td>
                          <td className="p-3">Filter by parent folder UUID. Use <code className="font-bold">null</code> or <code className="font-bold">root</code> to get top-level folders.</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold text-slate-900">q</td>
                          <td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td>
                          <td className="p-3">Search by folder name keyword.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Folder Response Fields */}
                  <h3 className="font-extrabold text-slate-900 text-sm pt-2">Response Fields (per folder)</h3>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 font-extrabold text-slate-800">
                        <tr>
                          <th className="p-3">Field</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                        <tr><td className="p-3 font-extrabold text-blue-600">id</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">Unique folder UUID. Use this as <code>folderId</code> in file upload.</td></tr>
                        <tr><td className="p-3 font-semibold">name</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">Folder display name.</td></tr>
                        <tr><td className="p-3 font-semibold">parentId</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String|null</span></td><td className="p-3">Parent folder UUID. Null means top-level (root) folder.</td></tr>
                        <tr><td className="p-3 font-semibold">color</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">String</span></td><td className="p-3">Folder color hex code (e.g. <code>#3b82f6</code>).</td></tr>
                        <tr><td className="p-3 font-semibold">createdAt</td><td className="p-3"><span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">DateTime</span></td><td className="p-3">ISO 8601 timestamp when folder was created.</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Code Snippet Window */}
              <div className="rounded-2xl border border-slate-900 bg-slate-950 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    <span className="ml-2 font-mono text-xs font-semibold text-slate-400">
                      {selectedEndpoint === 'upload' ? 'upload_example' : selectedEndpoint === 'files' ? 'get_files_example' : 'get_folders_example'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveLang('curl')}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                        activeLang === 'curl' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      cURL
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLang('js')}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                        activeLang === 'js' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      JS (Fetch)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveLang('python')}
                      className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                        activeLang === 'python' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Python
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                      onClick={() => copy(getCodeSnippet())}
                    >
                      <Clipboard className="mr-1 h-3.5 w-3.5" /> Copy Code
                    </Button>
                  </div>
                </div>

                <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-200">
                  {getCodeSnippet()}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal Create Key */}
      <DummyModal open={createOpen} title="Create API Key" description="API keys allow external applications to upload and manage files." onClose={() => setCreateOpen(false)}>
        <form className="space-y-4" onSubmit={createKey}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Key Name</label>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm font-semibold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Landing Page Form, Backup Script"
              value={keyName}
              onChange={(event) => setKeyName(event.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setCreateOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating Key...' : 'Create API Key'}
            </Button>
          </div>
        </form>
      </DummyModal>
    </div>
  )
}
