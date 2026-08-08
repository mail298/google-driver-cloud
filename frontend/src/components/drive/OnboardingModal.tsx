import { useState, useEffect } from 'react'
import {
  FileArchive,
  Gauge,
  Share2,
  Star,
  Trash2,
  History,
  Settings,
  Braces,
  Upload,
  FolderInput,
  ShieldCheck,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  BookOpen,
  Info,
  HardDrive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/LanguageContext'

export type OnboardingStep = {
  id: string
  title: string
  subtitle: string
  icon: any
  badge: string
  color: string
  content: {
    heading: string
    description: string
    features: Array<{ title: string; desc: string; icon: any }>
    tips?: string[]
  }
}

export function getOnboardingSteps(lang: 'id' | 'en'): OnboardingStep[] {
  const isEn = lang === 'en'
  return [
    {
      id: 'welcome',
      title: isEn ? 'Welcome' : 'Selamat Datang',
      subtitle: isEn ? 'Introduction to 9Drive Gateway' : 'Pengenalan 9Drive Gateway',
      icon: Sparkles,
      badge: 'Overview',
      color: 'from-blue-600 to-indigo-600 text-blue-500',
      content: {
        heading: isEn ? 'Welcome to 9Drive Storage Gateway' : 'Selamat Datang di 9Drive Storage Gateway',
        description: isEn
          ? '9Drive is a smart storage gateway that unifies multiple Google Drive and S3 accounts into a single organized storage space.'
          : '9Drive adalah gateway penyimpanan pintar yang menggabungkan beberapa akun Google Drive dan S3 milik Anda menjadi satu ruang penyimpanan besar yang terorganisir.',
        features: [
          {
            title: isEn ? 'Direct Stream Upload' : 'Direct Stream Upload',
            desc: isEn
              ? 'Files stream directly to Google Drive 9drive folder without consuming local server disk space.'
              : 'Pengunggahan file di-stream langsung ke Google Drive folder 9drive tanpa membebankan ruang memori lokal server.',
            icon: Upload
          },
          {
            title: isEn ? 'Virtual Folder Organization' : 'Organisasi Folder Virtual',
            desc: isEn
              ? 'Create flexible folder structures in MySQL without affecting physical files in Google Drive.'
              : 'Buat struktur folder fleksibel di MySQL tanpa mempengaruhi susunan fisik file Anda di Google Drive.',
            icon: FolderInput
          },
          {
            title: isEn ? 'Auto Quota Routing' : 'Auto Quota Routing',
            desc: isEn
              ? 'Automatically routes uploads to the connected account with the most available free space.'
              : 'Sistem secara otomatis memilih akun Google Drive terhubung yang memiliki sisa kuota terbesar untuk menyimpan upload baru.',
            icon: HardDrive
          }
        ],
        tips: isEn
          ? ['You can connect more than 1 Google Drive account in Settings.', 'All access tokens are encrypted for maximum security.']
          : ['Anda dapat menghubungkan lebih dari 1 akun Google Drive di menu Setting.', 'Semua file di-enkripsi token aksesnya demi keamanan maksimal.']
      }
    },
    {
      id: 'all-files',
      title: isEn ? 'All Files' : 'All Files',
      subtitle: isEn ? 'File & Folder Management Hub' : 'Pusat Pengelolaan File & Folder',
      icon: FileArchive,
      badge: isEn ? 'Main' : 'Utama',
      color: 'from-indigo-600 to-violet-600 text-indigo-500',
      content: {
        heading: isEn ? 'All Files - Manage Your Files & Folders' : 'Menu All Files - Kelola File & Folder Anda',
        description: isEn
          ? 'Main page to upload files, organize folders, preview media, and share files with others.'
          : 'Halaman utama untuk mengupload, mengorganisasi folder, melihat preview media, serta berbagi file dengan pengguna lain.',
        features: [
          {
            title: isEn ? 'Drag & Drop File Upload' : 'Drag & Drop File Upload',
            desc: isEn ? 'Drag files from your computer into the browser to upload instantly.' : 'Tarik file dari komputer Anda ke dalam browser untuk mengupload secara langsung.',
            icon: Upload
          },
          {
            title: isEn ? 'Checkbox & Batch Actions' : 'Checkbox & Batch Actions',
            desc: isEn
              ? 'Check multiple items to Move, Delete, or Download ZIP simultaneously.'
              : 'Centang beberapa file untuk melakukan Move (Pindah), Delete (Hapus), atau Download ZIP secara serentak.',
            icon: CheckCircle
          },
          {
            title: isEn ? 'Smart Move Validation' : 'Smart Move Validation',
            desc: isEn
              ? 'When moving items, current folder or selected subfolders are automatically greyed-out (disabled).'
              : 'Saat memindahkan file, folder lokasi saat ini atau subfolder terpilih otomatis di-hitam-putihkan (disabled) agar tidak salah pilih.',
            icon: FolderInput
          },
          {
            title: isEn ? 'Select All Checkbox' : 'Tombol Pilih Semua',
            desc: isEn ? 'Use the "Select All" checkbox in the toolbar to quickly select all displayed files.' : 'Gunakan checkbox "Pilih Semua" di toolbar atas untuk mencentang seluruh file terpapar secara cepat.',
            icon: CheckCircle
          }
        ],
        tips: isEn
          ? ['Right-click any file/folder card to open quick context menu (Rename, Move, Share, Delete).', 'Click 3-dots button on folder card to perform per-folder actions.']
          : ['Klik kanan pada kartu file/folder untuk membuka context menu cepat (Rename, Move, Share, Delete).', 'Klik tombol titik 3 di sudut kartu folder untuk melakukan aksi per-folder.']
      }
    },
    {
      id: 'quota',
      title: isEn ? 'Quota Tracker' : 'Quota Tracker',
      subtitle: isEn ? 'Connected Accounts Storage Monitor' : 'Pemantau Kuota Akun Terhubung',
      icon: Gauge,
      badge: 'Storage',
      color: 'from-emerald-600 to-teal-600 text-emerald-500',
      content: {
        heading: isEn ? 'Quota Tracker - Monitor Storage Capacity' : 'Menu Quota Tracker - Pantau Kapasitas Penyimpanan',
        description: isEn
          ? 'Track remaining space and storage usage across all connected Google Drive and S3 accounts.'
          : 'Lacak sisa kapasitas dan penggunaan penyimpanan gabungan dari seluruh akun Google Drive dan S3 yang terhubung.',
        features: [
          {
            title: isEn ? 'Total Quota Summary' : 'Ringkasan Total Kuota',
            desc: isEn ? 'View aggregated used and free space across all connected accounts.' : 'Melihat akumulasi ruang penyimpanan terpakai dan ruang bebas dari seluruh akun terhubung.',
            icon: Gauge
          },
          {
            title: isEn ? 'Per-Account Breakdown' : 'Rincian Per-Akun',
            desc: isEn ? 'View connection status and storage breakdown for each Google Drive account.' : 'Melihat status kesehatan koneksi dan penggunaan penyimpanan pada masing-masing email Google Drive.',
            icon: ShieldCheck
          },
          {
            title: isEn ? 'Sync Quota Button' : 'Tombol Sync Quota',
            desc: isEn ? 'Manually refresh storage quotas if you add or remove files directly on Google Drive.' : 'Perbarui kapasitas kuota terbaru secara manual jika Anda menambahkan atau menghapus file langsung melalui website Google Drive.',
            icon: Info
          }
        ],
        tips: isEn
          ? ['If storage space is running low, you can add new Google Drive accounts in Settings.']
          : ['Jika ruang penyimpanan hampir habis, Anda bisa menambahkan akun Google Drive baru di menu Setting.']
      }
    },
    {
      id: 'shared',
      title: isEn ? 'Shared With Me' : 'Shared With Me',
      subtitle: isEn ? 'Shared Files & Folders' : 'File & Folder Berbagi',
      icon: Share2,
      badge: isEn ? 'Collaboration' : 'Kolaborasi',
      color: 'from-amber-600 to-orange-600 text-amber-500',
      content: {
        heading: isEn ? 'Shared With Me - Collaboration & Permissions' : 'Menu Shared With Me - Kolaborasi & Hak Akses',
        description: isEn ? 'Access files and folders shared by team members or public share links.' : 'Kelola dan akses file atau folder yang dibagikan oleh anggota tim lain atau link publik.',
        features: [
          {
            title: isEn ? 'Team Invites' : 'Undangan Akses Tim',
            desc: isEn ? 'Receive files and folders shared by team members with Viewer or Editor permissions.' : 'Menerima file dan folder yang di-invite oleh email anggota tim Anda dengan role Viewer atau Editor.',
            icon: Share2
          },
          {
            title: isEn ? 'Public Web Preview Links' : 'Link Publik Web View',
            desc: isEn ? 'Generate public preview links without requiring user login.' : 'Generasi link preview cepat untuk dibagikan ke publik tanpa memerlukan login.',
            icon: BookOpen
          },
          {
            title: isEn ? 'Direct HTML Stream Links' : 'Direct HTML Stream Link',
            desc: isEn ? 'Copy direct video/image/audio stream URLs for embedding in your HTML landing pages.' : 'Salin URL direct stream video/gambar/audio untuk disematkan langsung ke landing page HTML Anda.',
            icon: Sparkles
          }
        ],
        tips: isEn
          ? ['Click "Share" button on any file to get direct HTML5 stream links (MP4, MP3, PNG).']
          : ['Klik tombol "Share" pada file untuk mendapatkan link stream HTML5 langsung (MP4, MP3, PNG).']
      }
    },
    {
      id: 'other-menus',
      title: isEn ? 'Starred, Trash & Activity' : 'Starred & Trash & Logs',
      subtitle: isEn ? 'Favorites, Trash & Audit Logs' : 'Favorit, Tempat Sampah & Aktivitas',
      icon: Trash2,
      badge: isEn ? 'System' : 'Sistem',
      color: 'from-rose-600 to-pink-600 text-rose-500',
      content: {
        heading: isEn ? 'Starred, Recycle Bin, & Activity Log' : 'Menu Starred, Recycle Bin, & Activity Log',
        description: isEn ? 'Helper pages for managing starred favorites, restoring deleted files, and auditing logs.' : 'Fasilitas pendukung untuk mengelola file favorit, memulihkan file terhapus, serta melihat riwayat audit.',
        features: [
          {
            title: isEn ? 'Starred Items' : 'Starred (Berbintang)',
            desc: isEn ? 'Star important files or folders for quick access from this page.' : 'Tandai file atau folder penting agar dapat diakses dengan cepat dari menu ini.',
            icon: Star
          },
          {
            title: isEn ? 'Recycle Bin (Trash)' : 'Recycle Bin (Trash)',
            desc: isEn ? 'Deleted files are safely moved here. You can Restore or Permanently Delete them.' : 'File yang dihapus akan disimpan sementara di sini. Anda dapat memilih untuk Restore (Pulihkan) atau Hapus Permanen.',
            icon: Trash2
          },
          {
            title: isEn ? 'Activity Log' : 'Activity Log',
            desc: isEn ? 'Automatic audit log recording uploads, moves, folder creations, and deletions.' : 'Catatan log audit otomatis yang merekam setiap aktivitas upload, pemindahan, pembuatan folder, dan penghapusan.',
            icon: History
          }
        ],
        tips: isEn
          ? ['Files in Recycle Bin still count towards storage quota until permanently deleted.']
          : ['File yang berada di Recycle Bin masih menggunakan kuota hingga Anda menghapusnya secara permanen.']
      }
    },
    {
      id: 'settings-api',
      title: isEn ? 'Settings & API Keys' : 'Setting & API Keys',
      subtitle: isEn ? 'Account Connection & API Tokens' : 'Koneksi Akun & Developer Token',
      icon: Settings,
      badge: isEn ? 'Configuration' : 'Konfigurasi',
      color: 'from-cyan-600 to-blue-600 text-cyan-500',
      content: {
        heading: isEn ? 'Settings & API Keys - Configuration & Integrations' : 'Menu Setting & API Keys - Konfigurasi & Integrasi',
        description: isEn ? 'Manage Google Drive/S3 storage connections and API keys for external applications.' : 'Pengaturan akun penyimpanan Google Drive/S3 dan kunci API untuk integrasi sistem eksternal.',
        features: [
          {
            title: isEn ? 'Google OAuth Connection' : 'Koneksi Google OAuth',
            desc: isEn ? 'Connect new Google Drive accounts with 1 click via official Google OAuth 2.0.' : 'Tambah akun Google Drive baru dengan sekali klik melalui OAuth 2.0 resmi Google.',
            icon: Settings
          },
          {
            title: isEn ? 'Developer API Keys' : 'API Keys Developer',
            desc: isEn ? 'Create secret API Tokens to upload files automatically from external scripts or landing page forms.' : 'Buat API Token rahasia untuk mengupload file secara otomatis dari aplikasi external, website, atau form landing page.',
            icon: Braces
          },
          {
            title: isEn ? 'Profile & Theme Settings' : 'Pengaturan Profil',
            desc: isEn ? 'Manage username, password, language preferences, and theme (Light / Dark).' : 'Kelola nama pengguna, password, dan preferensi tema (Light Mode / Dark Mode).',
            icon: ShieldCheck
          }
        ],
        tips: isEn
          ? ['Use API Keys to integrate 9Drive with automated file uploader scripts.']
          : ['Gunakan API Key jika Anda ingin mengintegrasikan 9Drive dengan script pengunggah otomatis.']
      }
    }
  ]
}

export function OnboardingModal({
  open,
  onClose
}: {
  open: boolean
  onClose: () => void
}) {
  const { lang } = useLanguage()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const steps = getOnboardingSteps(lang)
  const isEn = lang === 'en'

  useEffect(() => {
    if (open) {
      setCurrentStepIndex(0)
    }
  }, [open])

  if (!open) return null

  const step = steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100

  function handleComplete() {
    localStorage.setItem('9drive:onboarding-completed', 'true')
    onClose()
  }

  function handleNext() {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col lg:flex-row w-full max-w-4xl max-h-[92dvh] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {/* Top Progress Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-100 dark:bg-slate-800 z-30">
          <div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          aria-label="Tutup petunjuk"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight">{isEn ? '9Drive User Guide' : 'Petunjuk 9Drive'}</h3>
                <p className="text-[11px] text-slate-500">{isEn ? 'Dashboard Complete Tour' : 'Panduan Lengkap Dashboard'}</p>
              </div>
            </div>

            {/* Steps Tab List */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-1.5 overflow-x-auto lg:overflow-visible py-1">
              {steps.map((s, index) => {
                const isActive = index === currentStepIndex
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(index)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-xs font-bold transition-all border min-w-0',
                      isActive
                        ? 'bg-blue-600/10 border-blue-600/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-transparent text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="hidden lg:block min-w-0 flex-1 truncate">
                      <p className="truncate leading-none">{s.title}</p>
                      <p className="truncate text-[10px] font-medium text-slate-400 mt-0.5">{s.subtitle}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden lg:block pt-4 border-t border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-400">
            <p>{isEn ? 'Tip: You can re-open this guide anytime from the help button in the sidebar.' : 'Tips: Anda dapat membuka kembali petunjuk ini kapan saja dari tombol bantuan di sidebar.'}</p>
          </div>
        </div>

        {/* Right Main Content Area */}
        <div className="flex-1 flex flex-col justify-between p-5 sm:p-7 overflow-y-auto min-w-0">
          <div>
            {/* Header Tag */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                <step.icon className="h-3.5 w-3.5" />
                <span>{step.badge}</span>
              </span>
              <span className="text-xs font-extrabold text-slate-400">
                {isEn ? `Step ${currentStepIndex + 1} of ${steps.length}` : `Langkah ${currentStepIndex + 1} dari ${steps.length}`}
              </span>
            </div>

            {/* Title & Description */}
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {step.content.heading}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {step.content.description}
            </p>

            {/* Feature Cards Grid */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {step.content.features.map((feat, fIndex) => {
                const FeatIcon = feat.icon
                return (
                  <div
                    key={fIndex}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-950/40 p-3.5 transition-all hover:border-blue-300 dark:hover:border-blue-800"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                        <FeatIcon className="h-4 w-4" />
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                        {feat.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                      {feat.desc}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Tips Banner */}
            {step.content.tips && step.content.tips.length > 0 && (
              <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-extrabold flex items-center gap-1.5 mb-1 text-amber-700 dark:text-amber-400">
                  <Info className="h-4 w-4 shrink-0" /> {isEn ? 'Usage Tips:' : 'Tips Penggunaan:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 pl-1">
                  {step.content.tips.map((tip, tIdx) => (
                    <li key={tIdx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div className="mt-7 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFirstStep}
              onClick={handlePrev}
              className="font-bold text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {isEn ? 'Previous' : 'Sebelumnya'}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                {isEn ? 'Skip Guide' : 'Lewati Panduan'}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isEn ? 'Done & Got It' : 'Selesai & Paham'}
                  </>
                ) : (
                  <>
                    {isEn ? 'Next' : 'Lanjut'}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
