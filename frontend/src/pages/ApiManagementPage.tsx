import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle, Clipboard, KeyRound, ShieldCheck, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DummyModal } from '@/components/drive/DummyModal'
import { PageHeader } from '@/components/drive/PageHeader'
import { API_URL, apiFetch, formatDate } from '@/lib/api'

type ApiKey = { id: string; name: string; keyPrefix: string; scopes: string[]; status: string; lastUsedAt: string | null; expiresAt: string | null; revokedAt: string | null; createdAt: string }

const curlExample = `curl -X POST "${API_URL}/api/v1/uploads" \\
  -H "Authorization: Bearer 9d_live_your_secret_api_key" \\
  -F "folderPath=promo" \\
  -F "file=@/path/to/local/photo.png"`

const jsExample = `const form = new FormData()
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

const pythonExample = `import requests

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

export function ApiManagementPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'curl' | 'js' | 'python'>('curl')

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
    navigator.clipboard.writeText(value).then(() => setMessage('Copied to clipboard.')).catch(() => setMessage('Failed to copy.'))
  }

  const activeKeys = apiKeys.filter((apiKey) => apiKey.status === 'active').length
  const usedKeys = apiKeys.filter((apiKey) => apiKey.lastUsedAt).length

  return (
    <>
      <PageHeader title="API Management" description="Create API keys, copy examples, and upload files directly into folders from external apps." actions={<Button className="col-span-2 w-full sm:w-auto" onClick={() => setCreateOpen(true)}><KeyRound className="h-4 w-4" />Create API Key</Button>} />
      {message ? <p className="mt-5 rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-700">{message}</p> : null}
      {secret ? <Card className="mt-5 min-w-0 overflow-hidden border-blue-200 bg-blue-50 p-0"><div className="grid min-w-0 gap-4 p-4 sm:p-5"><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white"><ShieldCheck className="h-5 w-5" /></div><div className="min-w-0"><p className="font-extrabold text-blue-950">Copy your API key now</p><p className="mt-1 text-sm text-blue-700">This secret is shown once. Store it securely before closing this page.</p></div></div><div className="grid min-w-0 gap-2 lg:grid-cols-[minmax(0,1fr)_auto]"><code className="block min-w-0 max-w-full overflow-x-auto rounded-xl bg-white p-3 text-xs font-semibold text-slate-950 sm:text-sm">{secret}</code><Button className="w-full lg:w-auto" type="button" onClick={() => copy(secret)}><Clipboard className="h-4 w-4" />Copy key</Button></div></div></Card> : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4"><KeyRound className="h-5 w-5 text-blue-600" /><p className="mt-3 text-2xl font-extrabold">{activeKeys}</p><p className="text-sm text-slate-500">Active keys</p></Card>
        <Card className="p-4"><CheckCircle className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-extrabold">{usedKeys}</p><p className="text-sm text-slate-500">Used keys</p></Card>
        <Card className="p-4"><UploadCloud className="h-5 w-5 text-blue-600" /><p className="mt-3 text-2xl font-extrabold">1</p><p className="text-sm text-slate-500">Upload endpoint</p></Card>
      </div>

      <div className="mt-6 grid gap-6">
        <Card className="min-w-0 p-4 sm:p-5">
          <div><h2 className="text-lg font-extrabold">API Keys</h2><p className="mt-1 text-sm text-slate-500">Keys can upload files directly into virtual folders. Raw secrets are never stored.</p></div>
          <div className="mt-4 grid gap-3">
            {apiKeys.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-center sm:p-6"><KeyRound className="mx-auto h-8 w-8 text-blue-600" /><p className="mt-3 font-extrabold">No API keys yet</p><p className="mt-1 text-sm text-slate-500">Create one key, copy it once, then use the docs below.</p><Button className="mt-4 w-full sm:w-auto" onClick={() => setCreateOpen(true)}>Create API Key</Button></div> : apiKeys.map((apiKey) => <div key={apiKey.id} className="grid min-w-0 gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0"><div className="flex min-w-0 flex-wrap items-center gap-2"><p className="min-w-0 break-words font-semibold text-slate-950">{apiKey.name}</p><span className={apiKey.status === 'active' ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700' : 'rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-600'}>{apiKey.status}</span></div><div className="mt-2 grid min-w-0 gap-1 text-sm text-slate-500 sm:grid-cols-2"><p className="min-w-0 truncate"><span className="font-semibold text-slate-700">Prefix:</span> {apiKey.keyPrefix}...</p><p className="min-w-0 break-words"><span className="font-semibold text-slate-700">Created:</span> {formatDate(apiKey.createdAt)}</p><p className="min-w-0 break-words"><span className="font-semibold text-slate-700">Last used:</span> {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never'}</p><p className="min-w-0 break-words"><span className="font-semibold text-slate-700">Scope:</span> {apiKey.scopes.join(', ')}</p></div></div>
              <Button className="w-full lg:w-auto" variant="danger" onClick={() => revokeKey(apiKey.id)} disabled={apiKey.status === 'revoked'}><Trash2 className="h-4 w-4" />Revoke</Button>
            </div>)}
          </div>
        </Card>

        {/* Enhanced Interactive API Documentation */}
        <Card className="min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold">External Upload API Documentation</h2>
              <p className="mt-1 text-sm text-slate-500">Upload files programmatically using API keys into any folder.</p>
            </div>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">POST /api/v1/uploads</span>
          </div>

          <div className="mt-5 grid gap-4 text-sm">
            <div className="min-w-0">
              <p className="font-bold text-slate-950">Endpoint & Headers</p>
              <div className="mt-2 grid gap-2">
                <code className="block min-w-0 max-w-full overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs font-semibold text-blue-600 sm:text-sm">POST {API_URL}/api/v1/uploads</code>
                <div className="grid gap-1 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 sm:text-sm">
                  <p><span className="font-bold text-slate-900">Header Option 1:</span> <code className="rounded bg-slate-200 px-1 py-0.5">Authorization: Bearer 9d_live_your_api_key</code></p>
                  <p><span className="font-bold text-slate-900">Header Option 2:</span> <code className="rounded bg-slate-200 px-1 py-0.5">X-API-Key: 9d_live_your_api_key</code></p>
                </div>
              </div>
            </div>

            {/* Form Data Parameters Table */}
            <div className="min-w-0">
              <p className="mb-2 font-bold text-slate-950">Form-Data Request Parameters (`multipart/form-data`)</p>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 font-bold text-slate-800">
                    <tr>
                      <th className="p-3">Field</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white text-slate-700">
                    <tr>
                      <td className="p-3 font-semibold text-blue-600">file</td>
                      <td className="p-3">File</td>
                      <td className="p-3 font-bold text-rose-600">Required</td>
                      <td className="p-3">The binary file content to upload.</td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-semibold text-emerald-700">folderPath</td>
                      <td className="p-3">Text</td>
                      <td className="p-3 text-slate-500">Optional</td>
                      <td className="p-3">
                        Folder name or path (e.g. <code className="rounded bg-emerald-100 px-1 font-bold text-emerald-800">promo</code> or <code className="rounded bg-emerald-100 px-1 font-bold text-emerald-800">landingpage/promo</code>). 
                        <span className="ml-1 font-bold text-emerald-700">✨ Auto-creates folder in MySQL & Google Drive if it doesn't exist!</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">folderId</td>
                      <td className="p-3">Text</td>
                      <td className="p-3 text-slate-500">Optional</td>
                      <td className="p-3">Exact UUID of an existing folder in 9Drive dashboard.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">sizeBytes</td>
                      <td className="p-3">Text</td>
                      <td className="p-3 text-slate-500">Optional</td>
                      <td className="p-3">File size in bytes. <span className="font-semibold text-slate-950">Auto-calculated from stream buffer if omitted!</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-semibold text-slate-900">fileName</td>
                      <td className="p-3">Text</td>
                      <td className="p-3 text-slate-500">Optional</td>
                      <td className="p-3">Custom file name override.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Code Examples Tabs */}
            <div className="mt-2 min-w-0">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div className="flex gap-2">
                  <button type="button" onClick={() => setActiveTab('curl')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === 'curl' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>cURL</button>
                  <button type="button" onClick={() => setActiveTab('js')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === 'js' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>JavaScript (Fetch)</button>
                  <button type="button" onClick={() => setActiveTab('python')} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${activeTab === 'python' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Python</button>
                </div>
                <Button variant="outline" size="sm" onClick={() => copy(activeTab === 'curl' ? curlExample : activeTab === 'js' ? jsExample : pythonExample)}>
                  <Clipboard className="h-4 w-4" />Copy Code
                </Button>
              </div>

              <pre className="mt-3 max-h-80 max-w-full overflow-auto rounded-xl bg-slate-950 p-4 text-xs leading-relaxed text-slate-100 shadow-inner">
                {activeTab === 'curl' ? curlExample : activeTab === 'js' ? jsExample : pythonExample}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      <DummyModal open={createOpen} title="Create API Key" description="API keys can upload files using the public API." onClose={() => setCreateOpen(false)}>
        <form className="grid gap-4" onSubmit={createKey}>
          <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm" placeholder="Key name" value={keyName} onChange={(event) => setKeyName(event.target.value)} required />
          <div className="grid gap-3 sm:flex sm:justify-end"><Button variant="outline" type="button" onClick={() => setCreateOpen(false)} disabled={loading}>Cancel</Button><Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Key'}</Button></div>
        </form>
      </DummyModal>
    </>
  )
}
