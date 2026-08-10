import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  UploadCloud,
  KeyRound,
  FolderTree,
  ArrowRight,
  Lock,
  Database,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Cpu,
  Zap,
  Server,
  Menu,
  X,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Seo } from '@/components/common/Seo'

// Floating 3D Geometric Shape Component inspired by 21st.dev
function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  y = 15,
  gradient = 'from-indigo-500/[0.15]',
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  y?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96] as const,
        opacity: { duration: 1.2 },
      }}
      className={cn('absolute pointer-events-none', className)}
    >
      <motion.div
        animate={{
          y: [0, y, 0],
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-r to-transparent',
            gradient,
            'backdrop-blur-[3px] border border-white/[0.12]',
            'shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]',
            'after:absolute after:inset-0 after:rounded-full',
            'after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]'
          )}
        />
      </motion.div>
    </motion.div>
  )
}

const faqs = [
  {
    q: 'Apa itu drive9?',
    a: 'drive9 adalah platform Google Drive Storage Gateway yang memungkinkan Anda menghubungkan akun Google Drive, mengunggah dan mengelola file dalam folder khusus "9drive", melacak kuota penyimpanan, serta membuat API Key terenkripsi.'
  },
  {
    q: 'Apakah file yang diunggah disimpan di server drive9?',
    a: 'Tidak. drive9 menggunakan arsitektur direct file streaming. Setiap file yang Anda unggah akan langsung dialirkan (streamed) ke folder khusus "9drive" di akun Google Drive milik Anda tanpa pernah disimpan di disk fisik server drive9.'
  },
  {
    q: 'Bagaimana drive9 mengamankan data dan akses akun Google saya?',
    a: 'Seluruh OAuth Access Token & Refresh Token Anda disimpan di database dengan enkripsi kuat AES-256-GCM. drive9 hanya meminta izin untuk mengelola file di folder khusus dan tidak pernah mengakses file pribadi di luar folder tersebut.'
  },
  {
    q: 'Apakah saya bisa menghubungkan lebih dari satu akun Google Drive?',
    a: 'Ya! Anda dapat menghubungkan beberapa akun Google Drive sekaligus. drive9 secara otomatis memantau kuota tiap akun dan dapat mengarahkan (route) unggahan baru ke akun yang memiliki sisa ruang paling banyak.'
  },
  {
    q: 'Bagaimana cara kerja API Key untuk pengembang (developer)?',
    a: 'Melalui menu API Management, Anda dapat membuat API Key dengan scope terisolasi seperti files:read (untuk membaca file/folder) dan files:upload (untuk mengunggah file). API Key ini dapat digunakan untuk skrip backend, otomatisasi, atau aplikasi eksternal Anda.'
  },
  {
    q: 'Berapa batas ukuran file maksimum yang bisa di-upload?',
    a: 'drive9 mendukung pengunggahan file hingga ukuran 5 GB per file. Kami juga menyediakan dukungan pengunggahan bertahap (resumable chunked upload) agar proses upload tetap stabil meski koneksi jaringan terganggu.'
  },
  {
    q: 'Bagaimana cara membagikan file ke pengguna lain?',
    a: 'Anda dapat membagikan file secara langsung melalui tautan publik (Public Shared Link), membuat token pratinjau khusus (Preview Token), atau mengundang (Invite) email pengguna lain untuk mengakses folder virtual tertentu.'
  },
  {
    q: 'Apakah saya bisa mencabut (revoke) akses akun Google kapan saja?',
    a: 'Tentu saja. Anda dapat memutuskan hubungan akun Google Drive kapan saja dari menu Settings di drive9, atau mencabut izin akses drive9 secara langsung melalui halaman Google Account Security Anda.'
  },
  {
    q: 'Apakah layanan drive9 memerlukan biaya berlangganan?',
    a: 'drive9 dapat digunakan secara gratis menggunakan kuota penyimpanan Google Drive milik Anda sendiri tanpa biaya tersembunyi.'
  },
  {
    q: 'Bagaimana jika kuota salah satu akun Google Drive saya penuh?',
    a: 'Sistem cerdas Upload Routing Policy di drive9 akan otomatis mendeteksi batas kuota dan mengalihkan pengunggahan file berikutnya ke akun Google Drive terhubung lainnya yang masih memiliki kapasitas sisa.'
  }
]

export function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Seo title="drive9 - Google Drive Storage Gateway & Virtual Cloud Management" />

      {/* ── Navigation Bar (Fully Mobile Optimized) ───────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#030712]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="drive9 logo - Google Drive Storage Gateway"
              width="40"
              height="40"
              fetchPriority="high"
              loading="eager"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain shadow-lg shadow-blue-500/25 ring-1 ring-white/20 bg-slate-900/80 p-1 shrink-0"
            />
            <div className="flex items-center">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">drive9</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                Storage Gateway
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
            <a href="#purpose" className="hover:text-white transition-colors">App Purpose</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <RouterLink to="/privacy" className="hover:text-white transition-colors">Privacy Policy</RouterLink>
            <RouterLink to="/terms" className="hover:text-white transition-colors">Terms of Service</RouterLink>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <RouterLink to="/login">
              <Button variant="outline" className="h-9 px-4 text-xs font-bold border border-slate-700/80 bg-slate-900/90 text-white hover:bg-slate-800 hover:text-white transition-all rounded-xl shadow-sm">
                Sign In
              </Button>
            </RouterLink>
            <RouterLink to="/register">
              <Button className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all rounded-xl">
                Get Started
              </Button>
            </RouterLink>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <RouterLink to="/login">
              <Button size="sm" className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                Sign In
              </Button>
            </RouterLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-blue-400" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-slate-800/80 bg-[#030712]/98 backdrop-blur-2xl px-6 py-5 space-y-4"
            >
              <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-300">
                <a href="#purpose" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">App Purpose</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">Features</a>
                <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">Security</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">FAQ</a>
                <RouterLink to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">Privacy Policy</RouterLink>
                <RouterLink to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">Terms of Service</RouterLink>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                <RouterLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-10 text-xs font-bold border border-slate-700 bg-slate-900 text-white rounded-xl">
                    Sign In with Google
                  </Button>
                </RouterLink>
                <RouterLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-10 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
                    Get Started Free
                  </Button>
                </RouterLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero Section with 21st.dev Geometric Animated Shapes ─── */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-12 sm:pt-16 pb-14 overflow-hidden">
        {/* Ambient Glow Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 blur-3xl pointer-events-none" />

        {/* 3D Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.3}
            width={600}
            height={140}
            rotate={12}
            gradient="from-blue-500/[0.18]"
            className="left-[-15%] md:left-[-5%] top-[15%] md:top-[18%]"
          />
          <ElegantShape
            delay={0.5}
            width={500}
            height={120}
            rotate={-15}
            gradient="from-indigo-500/[0.18]"
            className="right-[-12%] md:right-[-2%] top-[65%] md:top-[70%]"
          />
          <ElegantShape
            delay={0.4}
            width={320}
            height={80}
            rotate={-8}
            gradient="from-purple-500/[0.15]"
            className="left-[5%] md:left-[8%] bottom-[8%]"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.1] backdrop-blur-md max-w-full text-center"
          >
            <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span className="text-[11px] sm:text-xs font-semibold text-slate-300 tracking-wide leading-tight">
              drive9 - Secure Google Drive Cloud Gateway & API Interface
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.12]"
          >
            Unified Cloud Storage via{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              drive9
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mx-auto max-w-3xl text-sm sm:text-lg text-slate-300 font-medium leading-relaxed px-2"
          >
            <strong className="text-white font-black">drive9</strong> adalah platform <strong>Google Drive Storage Gateway</strong> yang berfungsi untuk mengunggah file, mengorganisir folder virtual, memantau kuota penyimpanan multi-akun, dan mengintegrasikan API Key pengembang. Seluruh file yang diunggah dialirkan (streamed) secara aman langsung ke folder khusus <code className="text-blue-400 font-mono font-bold">9drive</code> di akun Google Drive pengguna.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <RouterLink to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-7 text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 transition-all rounded-xl flex items-center justify-center gap-2 ring-1 ring-white/20">
                <span>Sign In with Google</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </RouterLink>
            <RouterLink to="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-7 text-sm font-extrabold border border-slate-700 bg-slate-900/90 text-white hover:bg-slate-800 transition-all rounded-xl">
                Create Free Account
              </Button>
            </RouterLink>
          </motion.div>

          {/* Key Metrics / Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-10 sm:pt-14 border-t border-slate-800/80 text-left"
          >
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Zero Disk Storage</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                File dialirkan langsung ke folder khusus <code className="text-indigo-300 font-mono">9drive</code> di Google Drive Anda.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>AES-256 Encryption</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                OAuth token Anda disimpan terenkripsi kuat menggunakan AES-256-GCM.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Multi-Account Quota</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kelola dan pantau kuota dari beberapa akun Google Drive terhubung secara otomatis.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Public REST API</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                API Key terisolasi (<code className="text-amber-300 font-mono">files:read</code>, <code className="text-amber-300 font-mono">files:upload</code>).
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── App Purpose & Google Drive API Scope Disclosure (Google Verification Compliant) ── */}
      <section id="purpose" className="py-12 border-t border-slate-800/80 bg-slate-900/40 relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Tujuan Aplikasi drive9 (Application Purpose)</h2>
                <p className="text-xs text-blue-400 font-medium">Google OAuth Verification & Scope Transparency Disclosure</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Untuk Apa drive9 Dibuat? (What is drive9?)</span>
                </h3>
                <p className="text-slate-400">
                  <strong className="text-slate-200">drive9</strong> adalah platform gateway penyimpanan cloud yang dirancang untuk membantu pengguna mengunggah file, mengorganisir folder virtual, memantau sisa kuota penyimpanan dari beberapa akun Google Drive, serta membuat API Key untuk otomatisasi pengunggahan file dari skrip backend.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>Bagaimana drive9 Menggunakan Google Drive API?</span>
                </h3>
                <p className="text-slate-400">
                  Aplikasi <strong className="text-slate-200">drive9</strong> meminta akses scope Google Drive (<code className="text-purple-300 font-mono">https://www.googleapis.com/auth/drive</code>) khusus untuk membuat folder bernama <code className="text-indigo-300 font-mono font-bold">9drive</code> di Google Drive milik Anda dan mengalirkan file unggahan (*direct streaming*) secara otomatis tanpa pernah menyimpan data di disk fisik server kami.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12 sm:space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <Cpu className="h-4 w-4" />
              <span>Gateway Features</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Fitur & Keunggulan drive9</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Dirancang untuk manajemen penyimpanan cloud berkecepatan tinggi dengan keamanan tingkat lanjut.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-blue-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Direct Streamed Uploads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengunggah file multipart dan resumable secara langsung ke Google Drive tanpa menampung file di disk server lokal. Izin akses file publik otomatis disesuaikan.
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <FolderTree className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Folder Virtual Bersarang</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organisir file dalam struktur folder virtual bersarang. Otomatis menyelesaikan dan mensinkronkan path folder di Google Drive saat diminta oleh client.
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <KeyRound className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">Developer API Keys</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buat API Key dengan kontrol hak akses terisolasi (<code className="text-emerald-300 font-mono">files:read</code>, <code className="text-emerald-300 font-mono">files:upload</code>) untuk integrasi skrip backend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & Purpose Section ────────────────────────────── */}
      <section id="security" className="py-16 sm:py-24 border-t border-slate-800/80 bg-[#030712] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Google OAuth Security & Privacy</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Bagaimana drive9 Mengelola Data & Akses Google Drive Anda
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              <strong className="text-slate-200">drive9</strong> mengakses Google Drive semata-mata untuk membuat dan mengelola file dalam folder khusus bernama <code className="text-indigo-300 font-mono font-bold">9drive</code>. Kami menjaga privasi data Anda:
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Enkripsi OAuth:</strong> Token Access & Refresh terenkripsi dengan algoritma AES-256-GCM sebelum disimpan di database.</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <Database className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Tanpa Penyimpanan File di Server:</strong> File unggahan langsung dialirkan ke cloud storage tanpa disimpan di penyimpanan lokal server.</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Hak Pencabutan Akses:</strong> Anda dapat memutuskan koneksi akun Google kapan saja via menu Settings atau Google Security.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Informasi Aplikasi</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">drive9 v1.0</span>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-400 mb-1">Nama Aplikasi (App Name):</p>
                <p className="font-mono text-blue-400 text-sm font-black">drive9</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 mb-1">Target Google Scope:</p>
                <p className="font-mono text-purple-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all">https://www.googleapis.com/auth/drive</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 mb-1">Tujuan Folder Storage:</p>
                <p className="text-slate-300">Folder Khusus <code className="text-indigo-300 font-mono font-bold">9drive</code> di Google Drive Pengguna</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <RouterLink to="/privacy" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                <span>Kebijakan Privasi</span>
                <ExternalLink className="h-3 w-3" />
              </RouterLink>
              <RouterLink to="/terms" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                <span>Ketentuan Layanan</span>
                <ExternalLink className="h-3 w-3" />
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section (10 Frequently Asked Questions) ─────────────── */}
      <section id="faq" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-400">
              <HelpCircle className="h-4 w-4" />
              <span>Pertanyaan Sering Diajukan</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Frequently Asked Questions (FAQ)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Temukan jawaban lengkap seputar penggunaan, keamanan, dan integrasi drive9.</p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-button-${idx}`}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-bold text-xs sm:text-sm text-slate-100 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 sm:gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300',
                      openFaq === idx ? 'rotate-180 text-blue-400' : ''
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-button-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ──────────────────────────────────── */}
      <section className="py-16 sm:py-20 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#030712] to-blue-950/40 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            <Zap className="h-7 w-7 sm:h-8 sm:w-8" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">Siap Mengelola Storage Google Drive Anda?</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            Hubungkan akun Google Drive Anda dalam hitungan detik dan mulai nikmati pengalaman manajemen penyimpanan cloud modern.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <RouterLink to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 rounded-xl">
                Sign In dengan Google
              </Button>
            </RouterLink>
            <RouterLink to="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-xs font-bold border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                Daftar Akun
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-[#030712] py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="drive9 logo" width="32" height="32" loading="lazy" className="h-8 w-8 rounded-lg object-contain bg-slate-900/80 p-0.5" />
            <span className="font-extrabold text-white text-sm">drive9</span>
            <span>© 2026 drive9. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-semibold">
            <a href="#purpose" className="hover:text-slate-300 transition-colors">App Purpose</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <RouterLink to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</RouterLink>
            <RouterLink to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</RouterLink>
            <RouterLink to="/login" className="hover:text-slate-300 transition-colors">Dashboard Login</RouterLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
