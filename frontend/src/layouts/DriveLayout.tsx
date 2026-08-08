import { type FormEvent, type ReactNode, useEffect, useState, useRef } from 'react'
import { Outlet, useOutletContext, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Bell,
  Braces,
  FileArchive,
  Gauge,
  History,
  LogOut,
  Menu,
  Moon,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Share2,
  SlidersHorizontal,
  Star,
  Sun,
  Trash2,
  X,
  ShieldCheck,
  HardDrive,
  Info,
  CheckCircle,
  ChevronDown,
  Upload,
  HelpCircle
} from 'lucide-react'
import { OnboardingModal } from '@/components/drive/OnboardingModal'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'
import { GoogleLogo } from '@/components/auth/GoogleLogo'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/drive/BrandLogo'
import { Input } from '@/components/ui/input'
import { apiFetch, formatBytes } from '@/lib/api'
import { useUpload } from '@/context/UploadContext'
import { clearAuthSession, getStoredUser, updateStoredUser, type AuthUser } from '@/lib/auth'
import { getGravatarUrl } from '@/lib/gravatar'
import { cn } from '@/lib/utils'



type StorageSummary = {
  totalBytes: string
  usedBytes: string
  availableBytes: string
}

type StorageBreakdown = {
  photo: string
  video: string
  document: string
}

function SystemInfoDropdown({ storage }: { storage: any }) {
  const activeGoogle = storage?.accounts?.filter((a: any) => a.provider === 'google_drive' && a.status === 'connected') ?? []

  return (
    <div className="absolute right-0 top-12 z-50 w-[min(calc(100vw-2rem),22rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15">
      <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/50">
        <p className="text-sm font-extrabold text-slate-950">Workspace Status & Info</p>
        <p className="text-xs text-slate-500">Overview of your connections & guidelines</p>
      </div>
      <div className="max-h-96 overflow-y-auto p-4 space-y-4">
        {/* Connection status */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Connection Status</h4>
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between text-xs rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="font-semibold text-slate-700">Google Drive accounts</span>
              <span className={activeGoogle.length > 0 ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-100" : "text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold border border-amber-100"}>
                {activeGoogle.length} Connected
              </span>
            </div>
            {activeGoogle.map((acc: any) => (
              <p key={acc.id} className="text-[11px] text-slate-500 truncate px-2.5">— {acc.email}</p>
            ))}
          </div>
        </div>

        {/* Database & engine status */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-blue-500" /> Storage Engine</h4>
          <div className="mt-2 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <p>• <b>DB Type:</b> MySQL Database</p>
            <p>• <b>Upload Folder:</b> Google Drive dedicated <code>9drive</code></p>
            <p>• <b>Max Upload Size:</b> 5 GB per stream</p>
          </div>
        </div>

        {/* Tips & Guides */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Info className="h-3.5 w-3.5 text-indigo-500" /> Usage Tips</h4>
          <ul className="mt-2 text-[11px] text-slate-500 list-disc list-inside space-y-1 pl-1">
            <li>Virtual folders exist in your MySQL database.</li>
            <li>Physical files are always uploaded straight to Google Drive.</li>
            <li>Use the Sync button to fetch changes made directly on Drive.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function Sidebar({
  onNavigate,
  user,
  storage,
  breakdown,
  accounts = [],
  onLogout,
  onOpenGuide
}: {
  onNavigate?: () => void
  user: AuthUser | null
  storage: StorageSummary | null
  breakdown: StorageBreakdown
  accounts?: ConnectedAccount[]
  onLogout: () => void
  onOpenGuide?: () => void
}) {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const used = Number(storage?.usedBytes ?? 0)
  const total = Number(storage?.totalBytes ?? 0)
  const progress = total > 0 ? Math.min(100, (used / total) * 100) : 0
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [avatarError, setAvatarError] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    setUserMenuOpen(true)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false)
    }, 250)
  }

  const menuList = [
    { label: t('nav_all_files'), icon: FileArchive, href: '/all-files' },
    { label: t('nav_quota'), icon: Gauge, href: '/quota' },
    { label: t('nav_shared'), icon: Share2, href: '/shared' },
    { label: t('nav_starred'), icon: Star, href: '/starred', disabled: true },
    { label: t('nav_trash'), icon: Trash2, href: '/trash' },
    { label: t('nav_activity'), icon: History, href: '/activity' },
    { label: t('nav_setting'), icon: Settings, href: '/settings' },
    { label: t('nav_api_keys'), icon: Braces, href: '/api' },
  ]

  const items = [
    ['Photo', formatBytes(breakdown.photo), 'bg-lime-500'],
    ['Video', formatBytes(breakdown.video), 'bg-yellow-400'],
    ['Document', formatBytes(breakdown.document), 'bg-cyan-400'],
    ['Free Storage', formatBytes(storage?.availableBytes), 'bg-orange-500'],
  ]

  useEffect(() => {
    setAvatarError(false)
    getGravatarUrl(user?.email, 64).then(setProfileImageUrl).catch(() => setProfileImageUrl(''))
  }, [user?.email])

  return (
    <aside className="flex h-full w-64 flex-col border-slate-200/60 bg-slate-50/40 backdrop-blur-xl p-4 lg:border-r">
      <div className="flex items-center gap-2.5 pb-3 pt-1">
        <BrandLogo className="h-8 w-8" />
        <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">9Drive</span>
      </div>

      {/* User & Connected Accounts Section with Hover & Click Menu */}
      <div
        className="relative border-y border-slate-200/60 py-3 my-3"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="flex items-center gap-2.5 cursor-pointer rounded-xl p-1.5 -mx-1.5 hover:bg-slate-200/60 transition-colors group select-none"
        >
          {!profileImageUrl || avatarError ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-sm border border-blue-400/20">
              {(user?.name ?? user?.email ?? 'U').trim().charAt(0).toUpperCase()}
            </div>
          ) : (
            <img
              src={profileImageUrl}
              alt="User avatar"
              className="h-8 w-8 rounded-full border border-slate-200 object-cover"
              onError={() => setAvatarError(true)}
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-slate-900 leading-none">{user?.name ?? 'User'}</p>
            <p className="truncate text-[11px] text-slate-500 mt-1">{user?.email ?? 'Loading...'}</p>
          </div>
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all",
              userMenuOpen && "bg-slate-200 text-slate-900"
            )}
            title={t('nav_connected_accounts')}
          >
            <MoreVertical className="h-4 w-4" />
          </div>
        </div>

        {/* Connected Accounts Popover Dropdown */}
        {userMenuOpen && (
          <div
            className="absolute left-0 top-full mt-1 z-50 w-[240px] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-2 shadow-2xl shadow-slate-950/15 dark:bg-slate-900/95 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/80 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t('nav_connected_accounts')}</span>
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                {accounts.length} {accounts.length === 1 ? 'Account' : 'Accounts'}
              </span>
            </div>

            {/* List of Connected Accounts */}
            <div className="max-h-56 overflow-y-auto space-y-1 py-1">
              {accounts.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400">
                  {t('nav_no_accounts')}
                </div>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700">
                      {acc.provider === 'google_drive' ? (
                        <GoogleLogo className="h-4 w-4" />
                      ) : (
                        <HardDrive className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900 dark:text-slate-100 leading-tight">
                        {acc.displayName || acc.email}
                      </p>
                      <p className="truncate text-[10px] text-slate-400 mt-0.5">
                        {acc.storageAccount?.usedBytes ? `${formatBytes(acc.storageAccount.usedBytes)}` : 'Google Drive'}
                      </p>
                    </div>
                    <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-sm" title="Online" />
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  onNavigate?.()
                  navigate('/settings')
                }}
                className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t('nav_connect_manage')}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <nav className="grid gap-1">
        {menuList.map((item) => item.disabled ? (
          <button key={item.label} type="button" disabled className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl px-3.5 text-[13px] font-bold text-slate-400 opacity-60">
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ) : (
          <NavLink key={item.label} to={item.href} onClick={onNavigate} className={({ isActive }) => cn('inline-flex h-10 items-center gap-2.5 rounded-xl px-3.5 text-[13px] font-bold transition-all border border-transparent', isActive ? 'bg-blue-600/10 text-blue-600 border-blue-600/10 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900')}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => {
            onNavigate?.()
            onOpenGuide?.()
          }}
          className="mt-1 inline-flex h-10 items-center gap-2.5 rounded-xl px-3.5 text-[13px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all border border-blue-200/40 dark:border-blue-800/40 shadow-sm"
        >
          <HelpCircle className="h-4 w-4" />
          <span>{t('nav_user_guide')}</span>
        </button>
      </nav>

      <div className="mt-auto border-t border-slate-200/60 pt-4 text-[13px]">
        <div className="mb-3 space-y-1.5">
          {items.map(([label, value, color]) => (
            <div key={label} className="flex items-center justify-between text-slate-500 font-medium">
              <span className="flex items-center gap-1.5"><span className={cn('h-1.5 w-1.5 rounded-full', color)} />{label}</span>
              <span className="font-semibold text-slate-700">{value}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm font-bold text-slate-700">
          <span>{formatBytes(storage?.usedBytes)} used</span>
          <span className="text-slate-400">{formatBytes(storage?.totalBytes)}</span>
        </div>
        <div className="my-2 h-1.5 rounded-full bg-slate-200/60 overflow-hidden">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <Button variant="danger" size="sm" className="mt-3 w-full justify-start h-10 px-3 text-[13px] font-bold" onClick={onLogout}>
          <LogOut className="h-4 w-4" />{t('nav_logout')}
        </Button>
      </div>
    </aside>
  )
}

type ConnectedAccount = {
  id: string
  email: string
  provider: string
  displayName?: string | null
  status?: string
  storageAccount?: {
    totalBytes?: string | null
    usedBytes?: string
    availableBytes?: string | null
  } | null
}

export type DriveLayoutContext = {
  setHeaderActions: (actions: ReactNode) => void
}

export function useDriveLayoutActions() {
  return useOutletContext<DriveLayoutContext>()
}

export function DriveLayout() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const [user, setUser] = useState<AuthUser | null>(getStoredUser())
  const [storage, setStorage] = useState<StorageSummary | null>(null)
  const [breakdown, setBreakdown] = useState<StorageBreakdown>({ photo: '0', video: '0', document: '0' })
  const [infoOpen, setInfoOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [headerActions, setHeaderActions] = useState<ReactNode>(null)
  const { uploadProgress, setUploadProgress, retryFailedUpload } = useUpload()
  const [uploadProgressCollapsed, setUploadProgressCollapsed] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('9drive:theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'dark'
  })

  useEffect(() => {
    const completed = localStorage.getItem('9drive:onboarding-completed')
    if (completed !== 'true') {
      setOnboardingOpen(true)
    }
  }, [])

  // Advanced search states
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterKind, setFilterKind] = useState(searchParams.get('kind') ?? '')
  const [filterAccountId, setFilterAccountId] = useState(searchParams.get('accountId') ?? '')
  const [filterMinSize, setFilterMinSize] = useState(() => {
    const min = searchParams.get('minSize')
    return min ? String(Math.round(Number(min) / (1024 * 1024))) : ''
  })
  const [filterMaxSize, setFilterMaxSize] = useState(() => {
    const max = searchParams.get('maxSize')
    return max ? String(Math.round(Number(max) / (1024 * 1024))) : ''
  })
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const raw = searchParams.get('startDate')
    return raw ? raw.split('T')[0] : ''
  })
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const raw = searchParams.get('endDate')
    return raw ? raw.split('T')[0] : ''
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    localStorage.setItem('9drive:theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }

  async function loadSidebarStats() {
    await Promise.all([
      apiFetch<StorageSummary>('/storage/summary').then(setStorage),
      apiFetch<StorageBreakdown>('/storage/breakdown').then(setBreakdown),
    ])
  }

  async function loadConnectedAccounts() {
    try {
      const data = await apiFetch<{ accounts: ConnectedAccount[] }>('/connected-accounts')
      setAccounts(data.accounts)
    } catch (e) {
      console.error('Failed to load accounts for filter dropdown', e)
    }
  }

  useEffect(() => {
    setSearchValue(searchParams.get('q') ?? '')
    setFilterKind(searchParams.get('kind') ?? '')
    setFilterAccountId(searchParams.get('accountId') ?? '')
    setFilterMinSize(() => {
      const min = searchParams.get('minSize')
      return min ? String(Math.round(Number(min) / (1024 * 1024))) : ''
    })
    setFilterMaxSize(() => {
      const max = searchParams.get('maxSize')
      return max ? String(Math.round(Number(max) / (1024 * 1024))) : ''
    })

    const rawStart = searchParams.get('startDate')
    setFilterStartDate(rawStart ? rawStart.split('T')[0] : '')

    const rawEnd = searchParams.get('endDate')
    setFilterEndDate(rawEnd ? rawEnd.split('T')[0] : '')
  }, [searchParams])

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => undefined)
    clearAuthSession()
    navigate('/login')
  }

  function applyFilters() {
    const nextParams = new URLSearchParams()
    const activeFolderId = searchParams.get('folderId')
    if (activeFolderId && location.pathname === '/all-files') {
      nextParams.set('folderId', activeFolderId)
    }

    const q = searchValue.trim()
    if (q) nextParams.set('q', q)

    if (filterKind) nextParams.set('kind', filterKind)
    if (filterAccountId) nextParams.set('accountId', filterAccountId)

    if (filterMinSize) {
      const bytes = Number(filterMinSize) * 1024 * 1024
      if (!isNaN(bytes)) nextParams.set('minSize', String(bytes))
    }
    if (filterMaxSize) {
      const bytes = Number(filterMaxSize) * 1024 * 1024
      if (!isNaN(bytes)) nextParams.set('maxSize', String(bytes))
    }

    if (filterStartDate) {
      nextParams.set('startDate', new Date(filterStartDate).toISOString())
    }
    if (filterEndDate) {
      nextParams.set('endDate', new Date(filterEndDate).toISOString())
    }

    setFiltersOpen(false)
    navigate({ pathname: '/all-files', search: nextParams.toString() })
  }

  function clearFilters() {
    setFilterKind('')
    setFilterAccountId('')
    setFilterMinSize('')
    setFilterMaxSize('')
    setFilterStartDate('')
    setFilterEndDate('')
    setFiltersOpen(false)

    const nextParams = new URLSearchParams()
    const activeFolderId = searchParams.get('folderId')
    if (activeFolderId && location.pathname === '/all-files') {
      nextParams.set('folderId', activeFolderId)
    }
    const q = searchValue.trim()
    if (q) nextParams.set('q', q)

    navigate({ pathname: '/all-files', search: nextParams.toString() })
  }

  function searchFiles(event: FormEvent) {
    event.preventDefault()
    applyFilters()
  }

  useEffect(() => {
    apiFetch<{ user: AuthUser }>('/auth/me')
      .then((data) => {
        setUser(data.user)
        updateStoredUser(data.user)
      })
      .catch(() => undefined)
    loadSidebarStats().catch(() => undefined)
    loadConnectedAccounts().catch(() => undefined)
    window.addEventListener('9drive:storage-changed', loadSidebarStats)
    return () => window.removeEventListener('9drive:storage-changed', loadSidebarStats)
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setInfoOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white">
      <div className="flex min-h-screen w-full flex-col bg-white lg:h-screen lg:overflow-hidden lg:flex-row">
        <div className="hidden lg:block lg:h-screen lg:shrink-0">
          <Sidebar user={user} storage={storage} breakdown={breakdown} accounts={accounts} onLogout={logout} onOpenGuide={() => setOnboardingOpen(true)} />
        </div>
        <div className={cn('fixed inset-0 z-40 bg-slate-950/40 transition-opacity lg:hidden', sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0')} onClick={() => setSidebarOpen(false)} />
        <div className={cn('fixed inset-y-0 left-0 z-50 transform bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
          <div className="absolute right-4 top-4 z-10">
            <Button variant="outline" size="icon" aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Sidebar user={user} storage={storage} breakdown={breakdown} accounts={accounts} onLogout={logout} onNavigate={() => setSidebarOpen(false)} onOpenGuide={() => setOnboardingOpen(true)} />
        </div>
        <section className="min-w-0 flex-1 p-4 sm:p-6 lg:h-screen lg:overflow-y-auto lg:p-8">
          <header className="flex w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <Button variant="outline" size="icon" aria-label="Open sidebar" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="flex min-w-0 items-center gap-2">
                  <BrandLogo className="h-9 w-9 shrink-0" />
                  <span className="truncate text-xl font-extrabold tracking-tight">9Drive</span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <LanguageSwitcher />
                <Button variant="outline" size="icon" title={t('nav_user_guide')} aria-label={t('nav_user_guide')} onClick={() => setOnboardingOpen(true)}>
                  <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Button>
                <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
                  {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
                <div className="relative shrink-0">
                  <Button variant="outline" size="icon" className="relative" aria-label="System info" aria-expanded={infoOpen} onClick={() => setInfoOpen(!infoOpen)}>
                    <Bell className="h-5 w-5" />
                    {!infoOpen ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" /> : null}
                  </Button>
                  {infoOpen ? <SystemInfoDropdown storage={storage} /> : null}
                </div>
              </div>
            </div>
            <div className="relative w-full min-w-0 flex-1 lg:max-w-sm xl:max-w-xl">
              <form onSubmit={searchFiles} className="relative w-full">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <Input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search Documents" className="pl-11 pr-12" />
                <button type="button" onClick={() => setFiltersOpen(!filtersOpen)} className={cn("absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:text-slate-100", filtersOpen && "text-blue-600 hover:text-blue-700 dark:text-blue-400")} aria-label="Search filters"><SlidersHorizontal className="h-5 w-5" /></button>
              </form>

              {filtersOpen && (
                <div className="absolute left-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-[500px] md:w-[540px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <span className="text-sm font-extrabold text-slate-950 dark:text-slate-100">Advanced Search Filters</span>
                    <button type="button" onClick={clearFilters} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Clear All</button>
                  </div>

                  <div className="mt-4 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                    {/* File Kind */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">File Type</label>
                      <select value={filterKind} onChange={(e) => setFilterKind(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800">
                        <option value="">All Types</option>
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="doc">Document</option>
                        <option value="archive">Archive</option>
                      </select>
                    </div>

                    {/* Connected Account */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Connected Account</label>
                      <select value={filterAccountId} onChange={(e) => setFilterAccountId(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800">
                        <option value="">All Accounts</option>
                        {accounts.map((acc) => (
                          <option key={acc.id} value={acc.id}>{acc.email} ({acc.provider})</option>
                        ))}
                      </select>
                    </div>

                    {/* Size range */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Size Range (MB)</label>
                      <div className="mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
                        <input type="number" placeholder="Min" value={filterMinSize} onChange={(e) => setFilterMinSize(e.target.value)} className="block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800" />
                        <span className="text-slate-400 text-xs font-semibold text-center sm:text-left">to</span>
                        <input type="number" placeholder="Max" value={filterMaxSize} onChange={(e) => setFilterMaxSize(e.target.value)} className="block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800" />
                      </div>
                    </div>

                    {/* Date range */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date Range</label>
                      <div className="mt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
                        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800" />
                        <span className="text-slate-400 text-xs font-semibold text-center sm:text-left">to</span>
                        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="block w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <Button variant="outline" size="sm" type="button" onClick={() => setFiltersOpen(false)}>Cancel</Button>
                    <Button variant="default" size="sm" type="button" onClick={applyFilters}>Apply Filters</Button>
                  </div>
                </div>
              )}
            </div>
            {/* Header actions injected by child pages (desktop only, mobile renders below page title) */}
            {headerActions ? (
              <div className="hidden lg:flex flex-wrap items-center gap-2 shrink-0">
                {headerActions}
              </div>
            ) : null}
             <div className="relative hidden flex-wrap gap-2 items-center lg:flex shrink-0">
              <LanguageSwitcher />
              <Button variant="outline" size="icon" title={t('nav_user_guide')} aria-label={t('nav_user_guide')} onClick={() => setOnboardingOpen(true)}>
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Toggle theme" onClick={toggleTheme}>
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button variant="outline" size="icon" className="relative" aria-label="System info" aria-expanded={infoOpen} onClick={() => setInfoOpen(!infoOpen)}>
                <Bell className="h-5 w-5" />
                {!infoOpen ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" /> : null}
              </Button>
              {infoOpen ? <SystemInfoDropdown storage={storage} /> : null}
            </div>
          </header>
          <Outlet context={{ setHeaderActions } satisfies DriveLayoutContext} />
        </section>
      </div>

      {uploadProgress.open ? (
        <div className="fixed inset-x-3 bottom-3 z-[70] max-h-[70dvh] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-900 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[min(420px,calc(100vw-2.5rem))]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="flex items-center gap-2 font-extrabold text-sm text-slate-950 dark:text-slate-100">
              {uploadProgress.status === 'done' ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : uploadProgress.status === 'partial' || uploadProgress.status === 'error' ? <X className="h-5 w-5 text-red-500" /> : <Upload className="h-5 w-5 text-blue-600" />}
              {uploadProgress.status === 'done' ? 'Upload complete' : uploadProgress.status === 'partial' ? 'Upload completed with errors' : uploadProgress.status === 'error' ? 'Upload failed' : uploadProgress.percent >= 99 ? 'Processing on server' : 'Uploading files'}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setUploadProgressCollapsed(!uploadProgressCollapsed)}><ChevronDown className={cn("h-4 w-4 transition-transform", uploadProgressCollapsed && "rotate-180")} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setUploadProgress((current) => ({ ...current, open: false }))}><X className="h-4 w-4" /></Button>
            </div>
          </div>
          {!uploadProgressCollapsed && (
            <div className="p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <p className="truncate font-semibold">{uploadProgress.fileName}</p>
                <span className="text-slate-500">{uploadProgress.percent}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className={uploadProgress.status === 'error' || uploadProgress.status === 'partial' ? 'h-full rounded-full bg-red-500' : uploadProgress.status === 'done' ? 'h-full rounded-full bg-emerald-500' : 'h-full rounded-full bg-blue-600'} style={{ width: `${uploadProgress.percent}%` }} />
              </div>
              {uploadProgress.files.length > 0 ? (
                <div className="mt-4 grid max-h-64 gap-3 overflow-y-auto pr-1 text-slate-950">
                  {uploadProgress.files.map((file, index) => (
                    <div key={`${file.name}-${file.size}-${index}`} className="grid gap-1 rounded-xl bg-slate-50 p-3">
                      <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                        <p className="min-w-0 flex-1 truncate font-semibold" title={file.name}>{file.name}</p>
                        <span className="shrink-0 text-xs text-slate-500">{file.percent}%</span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
                        <span>{formatBytes(file.size)}</span>
                        <div className="flex items-center gap-2">
                          {file.status === 'error' && (
                            <Button variant="default" className="h-6 px-2 text-[11px] font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-none border-none" onClick={() => retryFailedUpload(file.name)}>
                              Retry
                            </Button>
                          )}
                          <span className={file.status === 'error' ? 'font-semibold text-red-600' : file.status === 'done' ? 'font-semibold text-emerald-600' : 'font-semibold text-blue-600'}>
                            {file.status === 'error' ? 'Failed' : file.status === 'done' ? 'Done' : file.percent >= 99 ? 'Processing' : 'Uploading'}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200">
                        <div className={file.status === 'error' ? 'h-full rounded-full bg-red-500' : file.status === 'done' ? 'h-full rounded-full bg-emerald-500' : 'h-full rounded-full bg-blue-600'} style={{ width: `${file.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <OnboardingModal open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
    </main>
  )
}
