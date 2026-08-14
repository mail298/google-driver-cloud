import { useState, useEffect } from 'react'
import {
  FileArchive,
  Gauge,
  Share2,
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
  HardDrive,
  RefreshCw
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
      subtitle: isEn ? 'Introduction to Drive9 Gateway' : 'Pengenalan Drive9 Gateway',
      icon: Sparkles,
      badge: isEn ? 'Overview' : 'Ringkasan',
      color: 'from-blue-600 to-indigo-600 text-blue-500',
      content: {
        heading: isEn ? 'Welcome to Drive9 Storage Gateway' : 'Selamat Datang di Drive9 Storage Gateway',
        description: isEn
          ? 'Drive9 is a smart storage gateway that unifies multiple Google Drive and S3-compatible accounts (MinIO, Cloudflare R2, Wasabi, Backblaze B2) into a single organized dashboard.'
          : 'Drive9 adalah gateway penyimpanan pintar yang menggabungkan beberapa akun Google Drive dan S3-compatible (MinIO, Cloudflare R2, Wasabi, Backblaze B2) menjadi satu dashboard penyimpanan yang terorganisir.',
        features: [
          {
            title: isEn ? 'Direct Stream Upload' : 'Unggah Direct Stream',
            desc: isEn
              ? 'Files stream directly to Google Drive or S3 — no temporary storage on the server disk.'
              : 'File di-stream langsung ke Google Drive atau S3 — tidak ada penyimpanan sementara di server.',
            icon: Upload
          },
          {
            title: isEn ? 'Virtual Folder Organization' : 'Folder Virtual Fleksibel',
            desc: isEn
              ? 'Create nested folder structures in Drive9 without affecting the physical layout of files in Google Drive or S3.'
              : 'Buat struktur folder bersarang di Drive9 tanpa mempengaruhi susunan fisik file di Google Drive atau S3.',
            icon: FolderInput
          },
          {
            title: isEn ? 'Smart Upload Routing' : 'Routing Unggahan Otomatis',
            desc: isEn
              ? 'Three routing modes: Most Available (largest free space), Round Robin (rotation), or Priority Order (your custom order).'
              : 'Tiga mode routing: Most Available (ruang terbesar), Round Robin (bergantian), atau Priority Order (urutan pilihan Anda).',
            icon: HardDrive
          },
          {
            title: isEn ? 'Resumable Chunked Upload' : 'Upload Chunked & Lanjutkan',
            desc: isEn
              ? 'Large files are uploaded in 5MB chunks with automatic resume support if the connection drops.'
              : 'File besar diunggah dalam potongan 5MB dengan dukungan lanjut-otomatis jika koneksi terputus.',
            icon: RefreshCw
          }
        ],
        tips: isEn
          ? [
            'Connect multiple Google Drive and S3 accounts in Settings to expand your total storage.',
            'All OAuth tokens and API credentials are AES-256 encrypted before being saved to the database.'
          ]
          : [
            'Hubungkan beberapa akun Google Drive dan S3 di menu Pengaturan untuk memperluas total kapasitas penyimpanan.',
            'Semua token OAuth dan kredensial API dienkripsi AES-256 sebelum disimpan ke database.'
          ]
      }
    },
    {
      id: 'all-files',
      title: isEn ? 'All Files' : 'Semua File',
      subtitle: isEn ? 'File & Folder Management Hub' : 'Pusat Pengelolaan File & Folder',
      icon: FileArchive,
      badge: isEn ? 'Main' : 'Utama',
      color: 'from-indigo-600 to-violet-600 text-indigo-500',
      content: {
        heading: isEn ? 'All Files — Manage Your Files & Folders' : 'Menu Semua File — Kelola File & Folder Anda',
        description: isEn
          ? 'Your main workspace: upload files, create nested folders, search, filter, preview media, and perform actions via the right-click context menu.'
          : 'Ruang kerja utama Anda: unggah file, buat folder bertingkat, cari, filter, pratinjau media, dan lakukan tindakan via menu klik kanan.',
        features: [
          {
            title: isEn ? 'Drag & Drop Upload' : 'Unggah Drag & Drop',
            desc: isEn
              ? 'Drag files from your computer directly into the browser window. Progress panel appears at the bottom-right corner.'
              : 'Tarik file dari komputer ke jendela browser. Panel progres muncul di pojok kanan bawah layar.',
            icon: Upload
          },
          {
            title: isEn ? 'Right-Click Context Menu' : 'Menu Klik Kanan',
            desc: isEn
              ? 'Right-click any file or folder: Preview, Download, Rename, Move, Share (public link), Invite (user), or Delete.'
              : 'Klik kanan file atau folder: Pratinjau, Unduh, Ganti Nama, Pindah, Bagikan (tautan publik), Undang (pengguna), atau Hapus.',
            icon: CheckCircle
          },
          {
            title: isEn ? 'Search & Filter' : 'Cari & Filter',
            desc: isEn
              ? 'Search by name in the header. Filter by type (image, video, pdf, doc, archive), account, file size, or date range.'
              : 'Cari berdasarkan nama di header. Filter berdasarkan jenis (gambar, video, pdf, dokumen, arsip), akun, ukuran, atau rentang tanggal.',
            icon: ShieldCheck
          },
          {
            title: isEn ? 'Batch Actions' : 'Aksi Massal',
            desc: isEn
              ? 'Select multiple files with checkboxes to Move, Delete, or Download as a ZIP archive in one click.'
              : 'Centang beberapa file sekaligus untuk Pindah, Hapus, atau Unduh sebagai arsip ZIP dalam satu klik.',
            icon: FolderInput
          }
        ],
        tips: isEn
          ? [
            'Click "Sync Drive" if you uploaded files directly via Google Drive web to update Drive9 database.',
            'Files deleted in Drive9 go to Recycle Bin — they are NOT deleted from Google Drive until you click "Delete Forever" in Trash.',
            'Switch between Grid and List view using the toggle button at the top-right of the file area.'
          ]
          : [
            'Klik tombol "Sinkron Drive" jika Anda mengunggah file langsung dari Google Drive web untuk memperbarui database Drive9.',
            'File yang dihapus di Drive9 masuk ke Tempat Sampah — TIDAK terhapus dari Google Drive sampai Anda klik "Hapus Permanen" di Tempat Sampah.',
            'Ganti tampilan Grid atau List menggunakan tombol toggle di pojok kanan atas area file.'
          ]
      }
    },
    {
      id: 'quota',
      title: isEn ? 'Quota Tracker' : 'Pemantau Kuota',
      subtitle: isEn ? 'Connected Accounts Storage Monitor' : 'Pemantau Penyimpanan Akun Terhubung',
      icon: Gauge,
      badge: isEn ? 'Storage' : 'Penyimpanan',
      color: 'from-emerald-600 to-teal-600 text-emerald-500',
      content: {
        heading: isEn ? 'Quota Tracker — Monitor Storage Capacity' : 'Menu Quota Tracker — Pantau Kapasitas Penyimpanan',
        description: isEn
          ? 'Track remaining capacity and usage across all connected Google Drive and S3 accounts in real time.'
          : 'Lacak sisa kapasitas dan penggunaan penyimpanan dari seluruh akun Google Drive dan S3 yang terhubung secara real time.',
        features: [
          {
            title: isEn ? 'Total Quota Summary' : 'Ringkasan Total Kuota',
            desc: isEn
              ? 'See aggregated used space and free space across all accounts in one combined view.'
              : 'Lihat akumulasi ruang terpakai dan ruang bebas dari seluruh akun dalam satu tampilan gabungan.',
            icon: Gauge
          },
          {
            title: isEn ? 'Per-Account Breakdown' : 'Rincian Per-Akun',
            desc: isEn
              ? 'View connection status, used, free, and total quota individually for each Google Drive or S3 account.'
              : 'Lihat status koneksi, ruang terpakai, ruang bebas, dan total kuota per akun Google Drive atau S3 secara individual.',
            icon: ShieldCheck
          },
          {
            title: isEn ? 'Sync Quota Button' : 'Tombol Sinkron Kuota',
            desc: isEn
              ? 'Refresh quota data manually from Google Drive or S3 after adding or removing files directly on the provider.'
              : 'Segarkan data kuota secara manual dari Google Drive atau S3 setelah menambah atau menghapus file langsung dari provider.',
            icon: RefreshCw
          }
        ],
        tips: isEn
          ? [
            'If storage is running low, go to Settings → Connected Accounts to add a new Google Drive or S3 account.',
            'For S3 accounts, quota is estimated from files tracked in Drive9 since S3 does not report usage natively.',
            'Quota data refreshes automatically when you upload or delete files through Drive9.'
          ]
          : [
            'Jika penyimpanan hampir habis, pergi ke Pengaturan → Akun Terhubung untuk menambah akun Google Drive atau S3 baru.',
            'Untuk akun S3, kuota dihitung berdasarkan file yang tercatat di Drive9 karena S3 tidak melaporkan penggunaan secara langsung.',
            'Data kuota diperbarui otomatis saat Anda mengunggah atau menghapus file melalui Drive9.'
          ]
      }
    },
    {
      id: 'shared',
      title: isEn ? 'Shared With Me' : 'Dibagikan ke Saya',
      subtitle: isEn ? 'Shared Files & Folders' : 'File & Folder Berbagi',
      icon: Share2,
      badge: isEn ? 'Collaboration' : 'Kolaborasi',
      color: 'from-amber-600 to-orange-600 text-amber-500',
      content: {
        heading: isEn ? 'Shared — Collaboration & File Sharing' : 'Menu Shared — Kolaborasi & Berbagi File',
        description: isEn
          ? 'Manage public share links you created, invitations you sent or received, and publicly shared files from other users.'
          : 'Kelola tautan publik yang Anda buat, undangan yang Anda kirim atau terima, dan file yang dibagikan oleh pengguna lain kepada Anda.',
        features: [
          {
            title: isEn ? 'Public Share Links' : 'Tautan Berbagi Publik',
            desc: isEn
              ? 'Generate secure read-only public links for any file. Set an optional expiry date. Anyone with the link can preview or download without logging in.'
              : 'Buat tautan publik hanya-baca yang aman untuk file apapun. Atur tanggal kedaluwarsa opsional. Siapa pun dengan tautan dapat pratinjau atau unduh tanpa login.',
            icon: BookOpen
          },
          {
            title: isEn ? 'Embed Mode' : 'Mode Embed',
            desc: isEn
              ? 'Public file links also support /embed mode for direct iframe embedding into websites or landing pages.'
              : 'Tautan file publik juga mendukung mode /embed untuk disematkan langsung via iframe ke website atau halaman landing.',
            icon: Sparkles
          },
          {
            title: isEn ? 'User Invitations (Viewer / Editor)' : 'Undangan Pengguna (Viewer / Editor)',
            desc: isEn
              ? 'Invite specific users to access your files or folders with Viewer (read-only) or Editor permissions.'
              : 'Undang pengguna tertentu untuk mengakses file atau folder Anda dengan peran Viewer (hanya lihat) atau Editor.',
            icon: Share2
          }
        ],
        tips: isEn
          ? [
            'Right-click any file → Share to create a public link or set an expiry date.',
            'Right-click any file or folder → Invite to send a Viewer/Editor invitation to another user.',
            'Public links can be revoked anytime from the Shared page by disabling or deleting the link.'
          ]
          : [
            'Klik kanan file → Bagikan untuk membuat tautan publik atau mengatur tanggal kedaluwarsa.',
            'Klik kanan file atau folder → Undang untuk mengirim undangan Viewer/Editor ke pengguna lain.',
            'Tautan publik dapat dicabut kapan saja dari halaman Shared dengan menonaktifkan atau menghapus tautan.'
          ]
      }
    },
    {
      id: 'other-menus',
      title: isEn ? 'Trash & Activity Log' : 'Tempat Sampah & Log Aktivitas',
      subtitle: isEn ? 'Recycle Bin & Audit History' : 'Tempat Sampah & Riwayat Audit',
      icon: Trash2,
      badge: isEn ? 'System' : 'Sistem',
      color: 'from-rose-600 to-pink-600 text-rose-500',
      content: {
        heading: isEn ? 'Trash & Activity Log — Safety Net & Audit' : 'Tempat Sampah & Log Aktivitas — Jaring Pengaman & Audit',
        description: isEn
          ? 'Deleted files land safely in Trash for recovery. The Activity Log records every action taken in Drive9 for full transparency.'
          : 'File yang dihapus masuk ke Tempat Sampah untuk pemulihan. Log Aktivitas merekam setiap tindakan di Drive9 untuk transparansi penuh.',
        features: [
          {
            title: isEn ? 'Recycle Bin (Trash)' : 'Tempat Sampah (Trash)',
            desc: isEn
              ? 'Deleted files and folders stay here safely. Click Restore anytime to bring them back to All Files.'
              : 'File dan folder yang dihapus tersimpan di sini dengan aman. Klik Pulihkan kapan saja untuk mengembalikannya ke Semua File.',
            icon: Trash2
          },
          {
            title: isEn ? 'Permanent Delete' : 'Hapus Permanen',
            desc: isEn
              ? 'Only "Delete Forever" in Trash physically removes the file from Google Drive / S3 and frees up quota. This cannot be undone.'
              : 'Hanya "Hapus Permanen" di Tempat Sampah yang menghapus file secara fisik dari Google Drive / S3 dan membebaskan kuota. Ini tidak bisa dibatalkan.',
            icon: ShieldCheck
          },
          {
            title: isEn ? 'Activity Log' : 'Log Aktivitas',
            desc: isEn
              ? 'Automatic audit trail recording every upload, move, rename, share, restore, delete, and login event with timestamps.'
              : 'Jejak audit otomatis yang merekam setiap unggahan, pemindahan, ganti nama, berbagi, pemulihan, penghapusan, dan login beserta waktu kejadian.',
            icon: History
          }
        ],
        tips: isEn
          ? [
            'Restoring a file from Trash instantly returns it to your All Files — no re-upload needed.',
            '"Delete Forever" is the only action that permanently removes a file from Google Drive and frees storage quota.',
            'Use the Activity Log to audit which user performed which action and when — useful for teams.'
          ]
          : [
            'Memulihkan file dari Tempat Sampah langsung mengembalikannya ke Semua File — tidak perlu unggah ulang.',
            '"Hapus Permanen" adalah satu-satunya tindakan yang benar-benar menghapus file dari Google Drive dan membebaskan kuota penyimpanan.',
            'Gunakan Log Aktivitas untuk mengaudit siapa melakukan apa dan kapan — berguna untuk tim.'
          ]
      }
    },
    {
      id: 'settings-api',
      title: isEn ? 'Settings & API Keys' : 'Pengaturan & API Keys',
      subtitle: isEn ? 'Account Connection & Developer Tokens' : 'Koneksi Akun & Token Developer',
      icon: Settings,
      badge: isEn ? 'Configuration' : 'Konfigurasi',
      color: 'from-cyan-600 to-blue-600 text-cyan-500',
      content: {
        heading: isEn ? 'Settings & API Keys — Configuration & Integrations' : 'Menu Pengaturan & API Keys — Konfigurasi & Integrasi',
        description: isEn
          ? 'Connect Google Drive and S3 accounts, configure upload routing, create API keys for external integrations, manage system updates and backups.'
          : 'Hubungkan akun Google Drive dan S3, atur routing unggahan, buat API key untuk integrasi eksternal, kelola pembaruan sistem dan backup.',
        features: [
          {
            title: isEn ? 'Connect Google Drive & S3' : 'Hubungkan Google Drive & S3',
            desc: isEn
              ? 'Add multiple Google Drive accounts via OAuth or S3-compatible storage (MinIO, R2, Wasabi, Backblaze, AWS S3) with custom endpoints.'
              : 'Tambahkan beberapa akun Google Drive via OAuth atau penyimpanan S3-compatible (MinIO, R2, Wasabi, Backblaze, AWS S3) dengan endpoint kustom.',
            icon: HardDrive
          },
          {
            title: isEn ? 'Upload Routing Policy' : 'Kebijakan Routing Unggahan',
            desc: isEn
              ? 'Choose how uploads are distributed: Most Available (most free space), Round Robin (rotation), or Priority Order (your custom priority).'
              : 'Pilih cara distribusi unggahan: Most Available (ruang terbesar), Round Robin (bergantian), atau Priority Order (prioritas pilihan Anda).',
            icon: RefreshCw
          },
          {
            title: isEn ? 'API Keys for External Apps' : 'API Key untuk Aplikasi Eksternal',
            desc: isEn
              ? 'Create secret API keys (shown only once) to upload files from external scripts, web forms, or applications via POST /api/v1/uploads.'
              : 'Buat API key rahasia (ditampilkan sekali saja) untuk mengunggah file dari skrip eksternal, formulir web, atau aplikasi via POST /api/v1/uploads.',
            icon: Braces
          },
          {
            title: isEn ? 'System Update & DB Backup' : 'Pembaruan Sistem & Backup DB',
            desc: isEn
              ? 'Trigger automatic system updates from GitHub and monitor rebuild logs. Export and restore MySQL database backups directly from the UI.'
              : 'Picu pembaruan sistem otomatis dari GitHub dan pantau log rebuild. Ekspor dan pulihkan backup database MySQL langsung dari UI.',
            icon: ShieldCheck
          }
        ],
        tips: isEn
          ? [
            'API Key secret is shown only once when created — save it immediately in a safe place.',
            'Use API Keys to integrate Drive9 with automated upload scripts, website forms, or Telegram bots.',
            'Change your password anytime from Settings → Profile section.',
            'After connecting a new account, click "Sync Quota" in Quota Tracker to see its storage data.'
          ]
          : [
            'Secret API Key hanya ditampilkan sekali saat dibuat — segera simpan di tempat yang aman.',
            'Gunakan API Key untuk mengintegrasikan Drive9 dengan skrip unggah otomatis, formulir website, atau bot Telegram.',
            'Ganti kata sandi kapan saja dari Pengaturan → bagian Profil.',
            'Setelah menghubungkan akun baru, klik "Sinkron Kuota" di Quota Tracker untuk melihat data penyimpanannya.'
          ]
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
    localStorage.setItem('Drive9:onboarding-completed', 'true')
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
          onClick={handleComplete}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          aria-label="Tutup petunjuk"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Sidebar Navigation */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4 shrink-0 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3.5 pr-8 lg:pr-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-extrabold tracking-tight truncate">{isEn ? 'Drive9 User Guide' : 'Petunjuk Drive9'}</h3>
                <p className="text-[11px] text-slate-500 truncate">{isEn ? 'Dashboard Complete Tour' : 'Panduan Lengkap Dashboard'}</p>
              </div>
            </div>

            {/* Steps Tab List: Horizontal scrollable pills on mobile, full list on lg */}
            <div className="flex items-center gap-1.5 overflow-x-auto lg:flex-col lg:items-stretch lg:overflow-visible py-1 scrollbar-none">
              {steps.map((s, index) => {
                const isActive = index === currentStepIndex
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(index)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-xl lg:rounded-2xl px-2.5 py-1.5 lg:px-3 lg:py-2.5 text-left text-xs font-bold transition-all border shrink-0 lg:shrink min-w-0',
                      isActive
                        ? 'bg-blue-600/10 border-blue-600/30 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'border-transparent text-slate-500 hover:bg-slate-200/50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold transition-colors',
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
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
        <div className="flex-1 flex flex-col justify-between p-4 sm:p-7 overflow-y-auto min-w-0">
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
              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200">
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

          {/* Footer Controls - No truncation on mobile */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isFirstStep}
              onClick={handlePrev}
              className="font-bold text-xs shrink-0"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {isEn ? 'Previous' : 'Sebelumnya'}
            </Button>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0"
              >
                {isEn ? 'Skip' : 'Lewati'}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                className="font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shrink-0 px-3.5"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isEn ? 'Done' : 'Selesai'}
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
