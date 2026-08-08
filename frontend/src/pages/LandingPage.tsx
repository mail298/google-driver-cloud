import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  HardDrive,
  ShieldCheck,
  UploadCloud,
  KeyRound,
  FolderTree,
  ArrowRight,
  Lock,
  Database,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    q: 'Apa itu drive9?',
    a: 'drive9 adalah platform Google Drive Storage Gateway yang memungkinkan Anda menghubungkan akun Google Drive, mengunggah dan mengelola file dalam folder khusus "9drive", melacak kuota penyimpanan, serta membuat API Key untuk integrasi aplikasi eksternal.'
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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* ── Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">drive9</span>
              <span className="ml-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                Storage Gateway
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <RouterLink to="/privacy" className="hover:text-white transition-colors">Privacy Policy</RouterLink>
            <RouterLink to="/terms" className="hover:text-white transition-colors">Terms of Service</RouterLink>
          </nav>

          <div className="flex items-center gap-3">
            <RouterLink to="/login">
              <Button variant="outline" className="h-9 px-4 text-xs font-bold border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white transition-all rounded-xl">
                Sign In
              </Button>
            </RouterLink>
            <RouterLink to="/register">
              <Button className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 rounded-xl">
                Get Started
              </Button>
            </RouterLink>
          </div>
        </div>
      </header>

      {/* ── Hero Section ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-5xl px-6 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-extrabold text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span>Official Google Drive Storage Gateway & Virtual Cloud Management</span>
          </div>

          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.1]">
            Unified Cloud Storage via <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">drive9</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
            <strong className="text-slate-200">drive9</strong> adalah platform gateway penyimpanan Google Drive yang memungkinkan pengguna menghubungkan akun Google Drive, mengorganisir folder virtual, memantau kuota penyimpanan, dan mengunggah file langsung ke cloud storage secara aman.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <RouterLink to="/login">
              <Button className="h-12 px-8 text-sm font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all rounded-xl flex items-center gap-2">
                <span>Sign In with Google</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </RouterLink>
            <RouterLink to="/register">
              <Button variant="outline" className="h-12 px-8 text-sm font-extrabold border border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 hover:text-white rounded-xl">
                Create Free Account
              </Button>
            </RouterLink>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero Disk Persistence</span>
              </div>
              <p className="text-xs text-slate-400">File langsung dialirkan ke folder khusus <code className="text-indigo-300 font-mono">9drive</code> di Google Drive Anda.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Enkripsi AES-256</span>
              </div>
              <p className="text-xs text-slate-400">OAuth Access & Refresh Token terenkripsi kuat di database.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Multi-Account Quota</span>
              </div>
              <p className="text-xs text-slate-400">Pantau dan kelola kapasitas kuota dari beberapa akun Google sekaligus.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Public REST API</span>
              </div>
              <p className="text-xs text-slate-400">API Key dengan scope terisolasi (<code className="text-amber-300 font-mono">files:read</code>, <code className="text-amber-300 font-mono">files:upload</code>).</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-white">Fitur & Keunggulan drive9</h2>
            <p className="text-slate-400 text-sm">Dirancang untuk manajemen penyimpanan cloud berkecepatan tinggi dengan keamanan tingkat lanjut.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Direct Streamed Uploads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mengunggah file multipart dan resumable secara langsung ke Google Drive tanpa menampung file di disk server local. Izin akses file publik otomatis disesuaikan.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FolderTree className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Folder Virtual Bersarang</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organisir file dalam struktur folder virtual bersarang. Otomatis menyelesaikan dan mensinkronkan path folder di Google Drive saat diminta oleh client.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 hover:border-slate-700 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Developer API Keys</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Buat API Key dengan kontrol hak akses terisolasi (<code className="text-emerald-300 font-mono">files:read</code>, <code className="text-emerald-300 font-mono">files:upload</code>) untuk integrasi skrip backend.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & Purpose Section ────────────────────────────── */}
      <section id="security" className="py-20 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Google OAuth Security & Data Privacy</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              Bagaimana drive9 Mengelola Data & Akses Google Drive Anda
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              <strong className="text-slate-200">drive9</strong> mengakses Google Drive semata-mata untuk membuat dan mengelola file dalam folder khusus bernama <code className="text-indigo-300 font-mono">9drive</code>. Kami menjaga privasi data Anda:
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Enkripsi OAuth:</strong> Token Access & Refresh terenkripsi dengan algoritma AES-256-GCM sebelum disimpan di database.</span>
              </li>
              <li className="flex items-start gap-3">
                <Database className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Tanpa Penyimpanan File di Server:</strong> File unggahan langsung dialirkan ke cloud storage tanpa disimpan di penyimpanan lokal server.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>Hak Pencabutan Akses:</strong> Anda dapat memutuskan koneksi akun Google kapan saja via menu Settings atau Google Security.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Informasi Aplikasi</span>
              <span className="text-xs font-mono font-bold text-emerald-400">drive9 v1.0</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-300">Nama Aplikasi (App Name):</p>
                <p className="font-mono text-blue-400 text-sm font-extrabold">drive9</p>
              </div>
              <div>
                <p className="font-bold text-slate-300">Target Google Scope:</p>
                <p className="font-mono text-purple-400">https://www.googleapis.com/auth/drive</p>
              </div>
              <div>
                <p className="font-bold text-slate-300">Tujuan Folder Storage:</p>
                <p className="text-slate-400">Folder Khusus <code className="text-indigo-300 font-mono font-bold">9drive</code> di Google Drive Pengguna</p>
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
      <section id="faq" className="py-20 border-t border-slate-800/80 bg-slate-900/20">
        <div className="mx-auto max-w-4xl px-6 space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-400">
              <HelpCircle className="h-4 w-4" />
              <span>Pertanyaan Sering Diajukan</span>
            </div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Frequently Asked Questions (FAQ)</h2>
            <p className="text-slate-400 text-sm">Temukan jawaban lengkap seputar penggunaan, keamanan, dan integrasi drive9.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-100 hover:text-blue-400 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 text-xs font-mono font-bold border border-blue-500/20">
                      {idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-blue-400' : ''
                    }`}
                  />
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50 animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner ──────────────────────────────────── */}
      <section className="py-16 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 to-blue-950/30">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-xl">
            <Layers className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-black text-white sm:text-4xl">Siap Mengelola Storage Google Drive Anda?</h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Hubungkan akun Google Drive Anda dalam hitungan detik dan mulai nikmati pengalaman manajemen penyimpanan cloud modern.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <RouterLink to="/login">
              <Button className="h-11 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 rounded-xl">
                Sign In dengan Google
              </Button>
            </RouterLink>
            <RouterLink to="/register">
              <Button variant="outline" className="h-11 px-6 text-xs font-bold border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 hover:text-white rounded-xl">
                Daftar Akun
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-12 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              <HardDrive className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-white text-sm">drive9</span>
            <span>© 2026 drive9. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold">
            <a href="#faq" className="hover:text-slate-300 transition-colors">FAQ</a>
            <RouterLink to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</RouterLink>
            <RouterLink to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</RouterLink>
            <RouterLink to="/login" className="hover:text-slate-300 transition-colors">Dashboard Login</RouterLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
