import { useEffect, useState, type FormEvent } from 'react'
import { Check, CheckCircle, Clipboard, KeyRound, ShieldCheck, Trash2, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DummyModal } from '@/components/drive/DummyModal'
import { PageHeader } from '@/components/drive/PageHeader'
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

const curlExample = `curl -X POST '${API_URL}/api/v1/uploads' \\
  -H 'Authorization: Bearer 9d_live_xxx' \\
  -F 'filesMeta=[{"fieldName":"file-0","fileName":"hello.txt","mimeType":"text/plain","sizeBytes":"12"}]' \\
  -F 'file-0=@hello.txt;type=text/plain'`

const jsExample = `const form = new FormData()
form.append('filesMeta', JSON.stringify([
  { fieldName: 'file-0', fileName: file.name, mimeType: file.type, sizeBytes: String(file.size) },
]))
form.append('file-0', file)

await fetch('${API_URL}/api/v1/uploads', {
  method: 'POST',
  headers: { Authorization: 'Bearer 9d_live_xxx' },
  body: form,
})`

export function ApiManagementPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [keyName, setKeyName] = useState('')
  const [secret, setSecret] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

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

  function copy(value: string, id: string) {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      })
      .catch(() => setMessage('Failed to copy.'))
  }

  const activeKeys = apiKeys.filter((apiKey) => apiKey.status === 'active').length
  const usedKeys = apiKeys.filter((apiKey) => apiKey.lastUsedAt).length

  return (
    <>
      <PageHeader
        title="API Management"
        description="Create API keys, copy examples, and upload files from external apps."
        actions={
          <Button
            className="w-full sm:w-auto"
            onClick={() => setCreateOpen(true)}
          >
            <KeyRound className="h-4 w-4 mr-1.5" />
            Create API Key
          </Button>
        }
      />

      {message ? (
        <p className="mt-5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
          {message}
        </p>
      ) : null}

      {secret ? (
        <Card className="mt-5 min-w-0 overflow-hidden border-blue-200/80 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/30 p-0">
          <div className="grid min-w-0 gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-slate-900 dark:text-white">Copy your API key now</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                  This secret is shown once. Store it securely before closing this page.
                </p>
              </div>
            </div>
            <div className="grid min-w-0 gap-2.5 lg:grid-cols-[minmax(0,1fr)_auto]">
              <code className="block min-w-0 max-w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono font-semibold text-emerald-400 sm:text-sm">
                {secret}
              </code>
              <Button
                className="w-full lg:w-auto"
                type="button"
                onClick={() => copy(secret, 'secret')}
              >
                {copiedId === 'secret' ? <Check className="h-4 w-4 mr-1.5 text-emerald-400" /> : <Clipboard className="h-4 w-4 mr-1.5" />}
                {copiedId === 'secret' ? 'Copied key' : 'Copy key'}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Stat Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{activeKeys}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Active keys</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{usedKeys}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Used keys</p>
          </div>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">1</p>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">Upload endpoint</p>
          </div>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="mt-6 grid gap-6">
        {/* API Keys Card */}
        <Card className="min-w-0 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">API Keys</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Keys can only upload files. Raw secrets are never stored.
            </p>
          </div>
          <div className="mt-5">
            {apiKeys.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800/80 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-3">
                  <KeyRound className="h-6 w-6" />
                </div>
                <p className="font-extrabold text-base text-slate-900 dark:text-white">No API keys yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Create one key, copy it once, then use the docs below.
                </p>
                <Button className="mt-5" onClick={() => setCreateOpen(true)}>
                  <KeyRound className="h-4 w-4 mr-1.5" /> Create API Key
                </Button>
              </div>
            ) : (
              <div className="grid gap-3">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="grid min-w-0 gap-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 p-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="min-w-0 break-words font-extrabold text-slate-900 dark:text-white text-base">
                          {apiKey.name}
                        </p>
                        <span
                          className={
                            apiKey.status === 'active'
                              ? 'rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400'
                              : 'rounded-full bg-slate-500/10 border border-slate-500/20 px-2.5 py-0.5 text-xs font-bold text-slate-500 dark:text-slate-400'
                          }
                        >
                          {apiKey.status}
                        </span>
                      </div>
                      <div className="mt-2.5 grid min-w-0 gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
                        <p className="min-w-0 truncate">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Prefix:</span>{' '}
                          <code className="font-mono bg-slate-200/60 dark:bg-slate-800/60 px-1.5 py-0.5 rounded text-xs">
                            {apiKey.keyPrefix}...
                          </code>
                        </p>
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Created:</span>{' '}
                          {formatDate(apiKey.createdAt)}
                        </p>
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Last used:</span>{' '}
                          {apiKey.lastUsedAt ? formatDate(apiKey.lastUsedAt) : 'Never'}
                        </p>
                        <p className="min-w-0 break-words">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Scope:</span>{' '}
                          {apiKey.scopes.join(', ')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => revokeKey(apiKey.id)}
                      disabled={apiKey.status === 'revoked'}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Revoke
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Upload API Docs Card */}
        <Card className="min-w-0 p-5 sm:p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Upload API Docs</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Multipart upload uses the same storage routing as dashboard uploads.
            </p>
          </div>
          <div className="mt-6 grid gap-5 text-sm">
            {/* Endpoint */}
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">Endpoint</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => copy(`${API_URL}/api/v1/uploads`, 'endpoint')}
                >
                  {copiedId === 'endpoint' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedId === 'endpoint' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto">
                <span className="text-purple-400 font-bold mr-2">POST</span>
                <span>{API_URL}/api/v1/uploads</span>
              </div>
            </div>

            {/* Auth Header */}
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">Auth Header</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => copy('Authorization: Bearer 9d_live_xxx', 'auth')}
                >
                  {copiedId === 'auth' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedId === 'auth' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto">
                <span className="text-sky-400 font-medium">Authorization:</span> Bearer 9d_live_xxx
              </div>
            </div>

            {/* cURL */}
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">cURL</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => copy(curlExample, 'curl')}
                >
                  {copiedId === 'curl' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedId === 'curl' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto whitespace-pre">
                {curlExample}
              </pre>
            </div>

            {/* JavaScript */}
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-extrabold text-slate-900 dark:text-white text-sm">JavaScript</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold"
                  onClick={() => copy(jsExample, 'js')}
                >
                  {copiedId === 'js' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
                  ) : (
                    <Clipboard className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedId === 'js' ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto whitespace-pre">
                {jsExample}
              </pre>
            </div>
          </div>
        </Card>
      </div>

      <DummyModal
        open={createOpen}
        title="Create API Key"
        description="API keys can upload files using the public API."
        onClose={() => setCreateOpen(false)}
      >
        <form className="grid gap-4" onSubmit={createKey}>
          <input
            className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Key name (e.g. My App Uploader)"
            value={keyName}
            onChange={(event) => setKeyName(event.target.value)}
            required
          />
          <div className="grid gap-3 sm:flex sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </form>
      </DummyModal>
    </>
  )
}

