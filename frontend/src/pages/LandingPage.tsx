import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Lock,
  Database,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ExternalLink,
  Zap,
  Server,
  Menu,
  X,
  Globe,
  Video,
  Film,
  Sparkles,
  Layers,
  Calculator,
  Code2,
  Copy,
  Check,
  Play,
  HardDrive,
  Check as CheckIcon,
  Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Seo } from '@/components/common/Seo'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'

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
      className={cn('absolute pointer-events-none max-w-full overflow-hidden', className)}
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
          width: `clamp(180px, 45vw, ${width}px)`,
          height: `clamp(45px, 12vw, ${height}px)`,
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

const faqsId = [
  {
    q: '1. Apa itu drive9 dan untuk siapa platform ini dirancang?',
    a: 'drive9 adalah platform Gateway Penyimpanan Google Drive & Proxy Media CDN Berkecepatan Tinggi yang dirancang untuk pengembang web, pemilik bisnis, kreator konten, dan pengguna umum. Platform ini memungkinkan Anda menghubungkan banyak akun Google Drive via OAuth 2.0, mengunggah file tanpa menggunakan ruang disk fisik server (Zero Disk Storage), menyajikan aset media landing page via CDN, memutar video/audio streaming tanpa buffering, mengorganisasi folder virtual, serta memantau total kuota penyimpanan gabungan secara otomatis.'
  },
  {
    q: '2. Bagaimana cara drive9 berfungsi sebagai CDN Aset & Host Media untuk landing page atau website?',
    a: 'drive9 menyediakan Tautan Berbagi Publik (Public Shared Link) dan URL Tampilan Langsung (Direct View URL) berkecepatan tinggi yang dapat disematkan (embed) langsung ke tag HTML <img>, <video>, <script>, <link rel="stylesheet">, atau dokumen di landing page Anda. Permintaan media diproses melalui proxy edge drive9 yang meneruskan stream dari Google Drive dengan header caching yang dioptimalkan, mengurangi beban server web utama Anda dan menjamin uptime tinggi berbasis infrastruktur global Google.'
  },
  {
    q: '3. Bagaimana teknologi Video & Audio Streaming tanpa buffering bekerja di drive9?',
    a: 'drive9 mengimplementasikan protokol standar HTTP 206 Partial Content (Permintaan Rentang / Range Requests). Ketika pengguna memutar video HD (MP4, WebM) atau podcast audio di website Anda menggunakan pemutar media seperti Plyr atau Video HTML5 bawaan browser, drive9 mengalirkan bagian file (chunks) yang dibutuhkan saja secara instan. Pengguna dapat melompati (seek) ke detik manapun secara langsung tanpa harus mengunduh keseluruhan file atau mengalami jeda buffering.'
  },
  {
    q: '4. Apa yang dimaksud dengan arsitektur Direct Streaming (Zero Disk Storage)?',
    a: 'Berbeda dengan gateway tradisional yang menyimpan file di server lokal sebelum mengunggahnya ke cloud, drive9 menggunakan Busboy multipart streaming dan Undici pipeline HTTP stream. Data file yang Anda unggah langsung dialirkan dalam memori dari peramban/klien ke API Google Drive secara real-time. Tidak ada file fisik yang pernah ditulis atau disimpan di disk fisik server drive9, menjaga keamanan total dan kecepatan transfer maksimal.'
  },
  {
    q: '5. Bagaimana Penyeimbang Beban (Load Balancer) & Agregasi Kuota Multi-Akun bekerja?',
    a: 'Anda dapat menghubungkan lebih dari satu akun Google Drive (misalnya 3 akun gratis x 15 GB = 45 GB total penyimpanan). Ketika Anda mengunggah file baru, algoritma Kebijakan Rute Unggahan (Upload Routing Policy) drive9 secara otomatis memeriksa sisa kapasitas tiap akun terhubung dan secara cerdas mengarahkan unggahan ke akun yang memiliki sisa ruang paling banyak. Jika salah satu akun penuh, sistem otomatis mengalihkan unggahan ke akun berikutnya tanpa gangguan.'
  },
  {
    q: '6. Bagaimana cara kerja API Key untuk Pengembang (Developer REST API)?',
    a: 'Melalui halaman Manajemen API, Anda dapat membuat API Key terenkripsi dengan lingkup izin (scopes) terisolasi: files:read (untuk membaca metadata file/folder dan mengunduh) serta files:upload (untuk mengunggah file). API Key ini mengizinkan Anda mengirimkan file via permintaan POST /uploads bermodel multipart/form-data langsung dari formulir landing page, skrip otomatisasi Python/Node.js, atau aplikasi seluler.'
  },
  {
    q: '7. Apakah drive9 otomatis membuat folder di Google Drive saya?',
    a: 'Ya. Saat pertama kali Anda mengunggah file atau menghubungkan akun, drive9 akan secara otomatis membuat folder induk khusus bernama "9drive" di Google Drive Anda. Seluruh file fisik yang diunggah melalui drive9 akan disimpan dengan rapi di dalam folder "9drive" tersebut, sehingga tidak mengotori direktori utama (root) Google Drive pribadi Anda.'
  },
  {
    q: '8. Apakah perbedaan antara Folder Virtual di drive9 dan folder fisik di Google Drive?',
    a: 'Folder Virtual di drive9 adalah struktur hierarki cerdas yang dikelola di database MySQL drive9. Anda dapat membuat folder bersarang (nested folders) secara instan tanpa perlu menunggu API Google Drive membuat folder fisik secara lambat. drive9 mengaitkan lokasi file secara logis dan otomatis menyinkronkan jalur direktori saat file diakses atau diunduh oleh pengguna.'
  },
  {
    q: '9. Bagaimana drive9 mengamankan Token Akses & Data Privasi akun Google saya?',
    a: 'Keamanan data adalah prioritas utama drive9. Seluruh Token Akses dan Token Pembaruan (OAuth Access & Refresh Tokens) Anda dienkripsi secara simetris menggunakan algoritma standar industri AES-256-GCM sebelum disimpan ke dalam database. drive9 hanya meminta lingkup izin khusus untuk mengelola file di dalam folder "9drive" dan tidak akan pernah mengakses, membaca, atau mengubah file pribadi di luar folder tersebut.'
  },
  {
    q: '10. Berapa batas ukuran file maksimum yang didukung untuk pengunggahan?',
    a: 'drive9 mendukung pengunggahan file hingga ukuran 5 GB per file. Untuk mengantisipasi koneksi jaringan yang tidak stabil, drive9 mendukung mekanisme pengunggahan bertahap (resumable chunked upload) melalui busboy stream, sehingga proses pengunggahan file berukuran besar tetap dapat berjalan lancar hingga selesai.'
  },
  {
    q: '11. Bagaimana cara membagikan file dan menggunakan Token Pratinjau (Preview Token)?',
    a: 'Anda dapat membagikan file dalam 3 mode: (1) Tautan Berbagi Publik: URL permanen yang dapat diakses siapa saja, (2) Token Pratinjau Khusus: Token sementara terenkripsi dengan batas waktu kedaluwarsa untuk pratinjau dokumen/video yang aman, dan (3) Undangan Email: Memberikan hak akses baca atau tulis kepada email pengguna tertentu yang terdaftar di drive9.'
  },
  {
    q: '12. Apakah saya bisa memutuskan koneksi akun Google Drive saya kapan saja?',
    a: 'Tentu saja. Anda dapat memutuskan hubungan akun Google Drive kapan saja melalui menu Pengaturan (Settings) di dashboard drive9. Selain itu, Anda juga dapat mencabut (revoke) izin akses drive9 secara langsung dari halaman Keamanan Akun Google Anda (myaccount.google.com/permissions).'
  },
  {
    q: '13. Apa yang terjadi jika saya menghapus file di dashboard drive9?',
    a: 'Ketika Anda menghapus file di drive9, file tersebut akan dipindahkan ke Tempat Sampah (Recycle Bin) drive9 secara virtual. Anda dapat memulihkannya kapan saja atau menghapusnya secara permanen. Menghapus file secara permanen di drive9 akan menghapus catatan di database sekaligus menginstruksikan API Google Drive untuk menghapus file fisik terkait dari folder "9drive".'
  },
  {
    q: '14. Bagaimana cara kerja fitur Sinkronisasi (Sync Engine) dengan Google Drive?',
    a: 'Jika Anda mengubah, menambah, atau menghapus file secara langsung melalui aplikasi Google Drive resmi di folder "9drive", Anda dapat menekan tombol "Sinkron" di dashboard drive9. Mesin pemindai drive9 akan membandingkan data Google Drive fisik dengan database MySQL, membuat catatan file baru, memperbarui metadata yang berubah, dan memperbarui status kuota penyimpanan secara akurat.'
  },
  {
    q: '15. Apakah drive9 dapat diintegrasikan dengan formulir kontak atau landing page WordPress/React?',
    a: 'Sangat bisa! Dengan menggunakan API Key terisolasi (files:upload), Anda dapat mengirimkan file dari formulir kontak web, formulir pendaftaran, atau input file di WordPress, Next.js, React, HTML statis, maupun aplikasi mobile langsung ke akun Google Drive Anda via endpoint API drive9.'
  },
  {
    q: '16. Apakah ada biaya tersembunyi atau biaya langganan untuk menggunakan drive9?',
    a: 'drive9 dapat digunakan secara gratis memanfaatkan kuota gratis 15 GB dari setiap akun Google Drive yang Anda hubungkan. Kami tidak mengenakan biaya langganan bulanan tersembunyi untuk fitur dasar gateway, penyeimbang beban kuota, maupun proxy CDN media.'
  }
]

const faqsEn = [
  {
    q: '1. What is drive9 and who is it designed for?',
    a: 'drive9 is a Google Drive Storage Gateway & High-Speed CDN Media Proxy platform designed for web developers, business owners, content creators, and everyday users. It enables you to connect multiple Google Drive accounts via OAuth 2.0, stream file uploads without consuming physical server disk space (Zero Server Disk Storage), serve landing page media assets via CDN, stream video/audio buffer-free, organize virtual folders, and track aggregate storage quotas automatically.'
  },
  {
    q: '2. How does drive9 function as a CDN Asset & Media Host for landing pages or websites?',
    a: 'drive9 provides high-speed Public Shared Links and Direct View URLs that can be embedded directly into HTML tags like <img>, <video>, <script>, <link rel="stylesheet">, or documents on your landing page. Media requests are proxied through drive9 edge server with optimized caching headers, reducing load on your main web server while guaranteeing high uptime backed by Google global infrastructure.'
  },
  {
    q: '3. How does buffer-free Video & Audio Streaming technology work in drive9?',
    a: 'drive9 implements standard HTTP 206 Partial Content (Range Requests). When a user plays an HD video (MP4, WebM) or audio podcast on your website using media players like Plyr or browser native HTML5 Video, drive9 streams only the requested byte ranges instantly. Users can seek to any timestamp smoothly without waiting for whole file downloads or buffering pauses.'
  },
  {
    q: '4. What is meant by Direct Streaming (Zero Server Disk Storage) architecture?',
    a: 'Unlike traditional storage gateways that cache uploads on local server disks before uploading to the cloud, drive9 utilizes Busboy multipart streaming and Undici HTTP stream pipelines. Upload data streams in-memory from client browsers straight to the Google Drive API in real time. Zero physical files are ever written to drive9 server disks, ensuring absolute security and maximum throughput speed.'
  },
  {
    q: '5. How does Multi-Account Load Balancing & Storage Aggregation work?',
    a: 'You can connect multiple Google Drive accounts (e.g. 3 free accounts x 15 GB = 45 GB combined storage pool). When you upload a new file, drive9 Upload Routing Policy automatically inspects remaining storage across all connected accounts and intelligently routes the upload to the account with the most available space. If one account fills up, the system seamlessly fails over to another connected account.'
  },
  {
    q: '6. How do Developer REST API Keys work?',
    a: 'From the API Management page, you can generate encrypted API Keys with isolated scope permissions: files:read (read file/folder metadata & downloads) and files:upload (upload files). These API Keys allow you to send multipart uploads via POST /uploads directly from landing page forms, automated Python/Node.js scripts, or mobile applications.'
  },
  {
    q: '7. Does drive9 automatically create a folder in my Google Drive?',
    a: 'Yes. Upon your first upload or Google connection, drive9 automatically creates a dedicated root folder named "9drive" in your Google Drive. All physical files uploaded via drive9 are stored neatly inside this "9drive" folder, ensuring your personal Google Drive root directory remains untouched and organized.'
  },
  {
    q: '8. What is the difference between Virtual Folders in drive9 and physical Google Drive folders?',
    a: 'Virtual Folders in drive9 are intelligent hierarchical structures managed in drive9 MySQL database. You can build deeply nested folder trees instantly without waiting for slow physical Google Drive API folder creations. drive9 maps file paths logically and automatically resolves directory structures whenever files are accessed or downloaded.'
  },
  {
    q: '9. How does drive9 secure my OAuth Access Tokens & Google account privacy?',
    a: 'Data security is drive9 highest priority. All OAuth Access Tokens and Refresh Tokens are encrypted using industry-standard AES-256-GCM symmetric encryption before storage in the database. drive9 requests restricted permissions solely to manage files inside the dedicated "9drive" folder and will never read, access, or modify private files outside it.'
  },
  {
    q: '10. What is the maximum file size limit supported for uploads?',
    a: 'drive9 supports file uploads up to 5 GB per file. To handle unstable network conditions, drive9 provides resumable chunked streaming via busboy pipelines, ensuring large media uploads complete smoothly without data corruption.'
  },
  {
    q: '11. How can I share files and use Preview Tokens?',
    a: 'You can share files in 3 modes: (1) Public Shared Link: Permanent public URL accessible by anyone, (2) Custom Preview Token: Time-limited encrypted token for secure document/video viewing, and (3) Email Invitation: Granting explicit read/write access to specific registered drive9 user emails.'
  },
  {
    q: '12. Can I disconnect my Google Drive account at any time?',
    a: 'Absolutely. You can disconnect your Google Drive account at any time from the Settings menu in the drive9 dashboard. Furthermore, you can revoke drive9 access permissions directly from your Google Account Security page (myaccount.google.com/permissions).'
  },
  {
    q: '13. What happens when I delete a file in the drive9 dashboard?',
    a: 'When you delete a file in drive9, it is moved to drive9 virtual Recycle Bin. You can restore it anytime or delete it permanently. Permanently deleting a file removes the database record and instructs Google Drive API to erase the physical file from the "9drive" folder.'
  },
  {
    q: '14. How does the Sync Engine feature work with Google Drive?',
    a: 'If you modify, add, or delete files directly inside the "9drive" folder via official Google Drive apps, simply click the "Sync" button in drive9 dashboard. drive9 scanner compares physical Drive files with the MySQL database, registers newly found files, updates modified metadata, and recalculates storage quota accurately.'
  },
  {
    q: '15. Can drive9 be integrated with contact forms or WordPress/React landing pages?',
    a: 'Highly customizable! Using an isolated API Key (files:upload), you can submit file uploads from web contact forms, registration forms, or file inputs in WordPress, Next.js, React, static HTML, or mobile apps directly into your Google Drive accounts via drive9 API endpoint.'
  },
  {
    q: '16. Are there any hidden fees or subscription costs to use drive9?',
    a: 'drive9 is free to use leveraging the 15 GB free quota provided by each connected Google Drive account. We do not charge hidden monthly subscription fees for core gateway functions, quota load balancing, or media CDN proxying.'
  }
]

export function LandingPage() {
  const { lang } = useLanguage()
  const faqs = lang === 'id' ? faqsId : faqsEn
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Interactive Storage Calculator State
  const [accountCount, setAccountCount] = useState<number>(3)
  const totalStorageGb = accountCount * 15
  const estimatedS3Monthly = (totalStorageGb * 0.023).toFixed(2)

  // Interactive Code Snippet Tabs State
  const [activeCodeTab, setActiveCodeTab] = useState<'video' | 'curl' | 'js' | 'python'>('video')
  const [copiedCode, setCopiedCode] = useState(false)

  // Live Mockup Active State
  const [mockActiveTab, setMockActiveTab] = useState<'files' | 'stream' | 'quota'>('files')

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const codeSnippets = {
    video: `<!-- Stream Video Tanpa Buffering (HTTP 206 Partial Content) -->
<video controls width="100%" poster="https://drive9.wn-cdn.net/logo.png">
  <source src="https://drive9.wn-cdn.net/share/files/pub_demo_video_token/preview" type="video/mp4" />
  Browser Anda tidak mendukung tag video.
</video>`,
    curl: `# Unggah File Langsung via REST API Key (Zero Server Disk)
curl -X POST https://drive9.wn-cdn.net/api/v1/uploads \\
  -H "X-API-Key: d9_live_sec_abc123xyz" \\
  -F "file=@/path/to/hero-banner.jpg" \\
  -F "folderId=fld_landing_assets"`,
    js: `// Upload dari Frontend / Form JavaScript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://drive9.wn-cdn.net/api/v1/uploads', {
  method: 'POST',
  headers: {
    'X-API-Key': 'd9_live_sec_abc123xyz'
  },
  body: formData
});
const data = await response.json();
console.log('Public CDN URL:', data.viewUrl);`,
    python: `# Python Automation / Database Backup Script
import requests

with open('backup_database_2026.sql.gz', 'rb') as f:
    r = requests.post(
        'https://drive9.wn-cdn.net/api/v1/uploads',
        headers={'X-API-Key': 'd9_live_sec_abc123xyz'},
        files={'file': f}
    )
print('Uploaded:', r.json())`
  }

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Seo title={lang === 'id' ? 'drive9 - Google Drive Gateway, CDN Media & Video Streaming HTTP 206' : 'drive9 - Google Drive Gateway, CDN Media & HTTP 206 Video Streaming'} />

      {/* ── Navigation Bar (Fully Mobile & Desktop Optimized) ───────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#030712]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-3 sm:py-3.5">
          {/* Brand Logo */}
          <RouterLink to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
            <img
              src="/logo-sm.webp"
              alt="drive9 logo - Google Drive Storage & CDN Gateway"
              width="36"
              height="36"
              fetchPriority="high"
              loading="eager"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain shadow-lg shadow-blue-500/20 ring-1 ring-white/10 bg-slate-900/90 p-1 transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">drive9</span>
              <span className="hidden xl:inline-flex text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                {lang === 'id' ? 'Gateway CDN & Cloud' : 'CDN & Cloud Gateway'}
              </span>
            </div>
          </RouterLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-7 text-xs lg:text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Cara Kerja' : 'How It Works'}</a>
            <a href="#calculator" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Kalkulator Kuota' : 'Quota Calculator'}</a>
            <a href="#cdn-streaming" className="hover:text-white hover:font-semibold transition-colors">CDN & Streaming</a>
            <a href="#comparison" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Perbandingan' : 'Comparison'}</a>
            <a href="#use-cases" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Solusi' : 'Use Cases'}</a>
            <a href="#faq" className="hover:text-white hover:font-semibold transition-colors">FAQ</a>
          </nav>

          {/* Desktop CTA & Language Switcher */}
          <div className="hidden md:flex items-center gap-2.5 lg:gap-3 shrink-0">
            <LanguageSwitcher />
            <RouterLink to="/login">
              <Button variant="outline" className="h-9 px-3.5 lg:px-4 text-xs font-bold border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white transition-all rounded-xl shadow-sm">
                {lang === 'id' ? 'Masuk' : 'Sign In'}
              </Button>
            </RouterLink>
            <RouterLink to="/register">
              <Button className="h-9 px-3.5 lg:px-4 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all rounded-xl">
                {lang === 'id' ? 'Mulai Gratis' : 'Get Started'}
              </Button>
            </RouterLink>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageSwitcher />
            <RouterLink to="/login">
              <Button size="sm" className="h-8 px-2.5 sm:px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm">
                {lang === 'id' ? 'Masuk' : 'Sign In'}
              </Button>
            </RouterLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/90 border border-slate-800 focus:outline-none transition-colors"
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
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-slate-800/80 bg-[#030712]/98 backdrop-blur-2xl px-5 py-4 space-y-3.5"
            >
              <div className="flex flex-col space-y-2.5 text-sm font-semibold text-slate-300">
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Cara Kerja (3 Langkah)' : 'How It Works'}</a>
                <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Kalkulator Kuota Multi-Akun' : 'Storage Calculator'}</a>
                <a href="#cdn-streaming" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'CDN & Streaming Video' : 'CDN & Video Streaming'}</a>
                <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Tabel Perbandingan' : 'Comparison Table'}</a>
                <a href="#use-cases" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Solusi & Kasus Penggunaan' : 'Use Cases'}</a>
                <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Keamanan & Kepatuhan' : 'Data Security'}</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">FAQ</a>
                <RouterLink to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</RouterLink>
                <RouterLink to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}</RouterLink>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
                <RouterLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-9 text-xs font-bold border border-slate-700 bg-slate-900 text-white rounded-xl">
                    {lang === 'id' ? 'Masuk ke Dashboard' : 'Sign In to Dashboard'}
                  </Button>
                </RouterLink>
                <RouterLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-9 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30">
                    {lang === 'id' ? 'Daftar Akun Gratis' : 'Get Started Free'}
                  </Button>
                </RouterLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero Section with 21st.dev Geometric Animated Shapes ─── */}
      <section className="relative min-h-[80vh] sm:min-h-[85vh] flex items-center justify-center pt-8 sm:pt-16 pb-12 sm:pb-16 overflow-hidden w-full">
        {/* Ambient Glow Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-transparent to-purple-600/10 blur-3xl pointer-events-none" />

        {/* 3D Floating Geometric Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <ElegantShape
            delay={0.1}
            width={550}
            height={130}
            rotate={12}
            gradient="from-blue-500/[0.18]"
            className="left-[-10%] md:left-[-5%] top-[10%] md:top-[18%]"
          />
          <ElegantShape
            delay={0.2}
            width={450}
            height={110}
            rotate={-15}
            gradient="from-indigo-500/[0.18]"
            className="right-[-10%] md:right-[-2%] top-[65%] md:top-[70%]"
          />
          <ElegantShape
            delay={0.15}
            width={300}
            height={75}
            rotate={-8}
            gradient="from-purple-500/[0.15]"
            className="left-[2%] md:left-[8%] bottom-[5%] md:bottom-[8%]"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-5 sm:space-y-7 w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] backdrop-blur-md max-w-full text-center shadow-inner"
          >
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-xs font-semibold text-slate-300 tracking-wide leading-tight break-words">
              {lang === 'id' ? '🔥 Multi-Google Drive Gateway • HTTP 206 Streaming • CDN Media' : '🔥 Multi-Google Drive Gateway • HTTP 206 Video Streaming • Media CDN'}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15] break-words"
          >
            {lang === 'id' ? 'Google Drive Gateway, CDN & ' : 'Google Drive Gateway, CDN & '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent block sm:inline">
              {lang === 'id' ? 'Streaming Tanpa Batas' : 'Unlimited Streaming'}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="mx-auto max-w-3xl text-xs sm:text-base md:text-lg text-slate-300 font-medium leading-relaxed px-1 sm:px-2"
          >
            {lang === 'id'
              ? 'Gabungkan kuota beberapa akun Google Drive menjadi satu pool penyimpanan besar. Streaming video resolusi tinggi tanpa buffering (HTTP 206), sajikan aset gambar landing page via direct CDN link, dan unggah langsung tanpa menyentuh disk server fisik.'
              : 'Unify multiple Google Drive accounts into one massive cloud storage cluster. Stream HD videos buffer-free (HTTP 206), deliver landing page media via direct CDN links, and upload directly without consuming server disk space.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none mx-auto"
          >
            <RouterLink to="/register" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs sm:text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 transition-all rounded-xl flex items-center justify-center gap-2 ring-1 ring-white/20">
                <span>{lang === 'id' ? 'Mulai Gratis Sekarang' : 'Start Free Today'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </RouterLink>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-7 text-xs sm:text-sm font-extrabold border border-slate-700 bg-slate-900/90 text-white hover:bg-slate-800 transition-all rounded-xl">
                {lang === 'id' ? 'Pelajari Cara Kerja' : 'See How It Works'}
              </Button>
            </a>
          </motion.div>

          {/* ── LIVE INTERACTIVE PRODUCT MOCKUP / DASHBOARD PREVIEW ── */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="mt-8 sm:mt-10 mx-auto w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-slate-800/90 bg-slate-950/90 shadow-[0_20px_50px_rgba(37,99,235,0.15)] backdrop-blur-2xl overflow-hidden text-left"
          >
            {/* Mockup Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/90 bg-slate-900/80 p-3 sm:px-4 sm:py-3 gap-2.5">
              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-400 truncate max-w-[200px] sm:max-w-none">
                  drive9.wn-cdn.net/dashboard
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setMockActiveTab('files')}
                  className={cn(
                    'whitespace-nowrap px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition-colors shrink-0',
                    mockActiveTab === 'files' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/40'
                  )}
                >
                  {lang === 'id' ? 'Virtual Folder' : 'Virtual Folders'}
                </button>
                <button
                  type="button"
                  onClick={() => setMockActiveTab('stream')}
                  className={cn(
                    'whitespace-nowrap px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition-colors shrink-0',
                    mockActiveTab === 'stream' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/40'
                  )}
                >
                  {lang === 'id' ? 'Stream Player' : 'Stream Player'}
                </button>
                <button
                  type="button"
                  onClick={() => setMockActiveTab('quota')}
                  className={cn(
                    'whitespace-nowrap px-2.5 py-1 text-[11px] sm:text-xs rounded-lg font-bold transition-colors shrink-0',
                    mockActiveTab === 'quota' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/40'
                  )}
                >
                  {lang === 'id' ? 'Pool Multi-Akun' : 'Multi-Drive Pool'}
                </button>
              </div>
            </div>

            {/* Mockup Body Content */}
            <div className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4">
              {mockActiveTab === 'files' && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="font-bold text-slate-200 truncate">/ 9drive / landingpage-assets /</span>
                    <span className="text-emerald-400 font-mono font-semibold shrink-0">● 3 Akun (45 GB Total)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Video className="h-5 w-5 text-purple-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 truncate">demo-hero-4k.mp4</p>
                          <p className="text-[10px] text-slate-400">142 MB • HTTP 206</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono font-bold shrink-0">CDN Stream</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Globe className="h-5 w-5 text-blue-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 truncate">banner-promo.webp</p>
                          <p className="text-[10px] text-slate-400">1.2 MB • Edge Cached</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono font-bold shrink-0">Direct URL</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Database className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-200 truncate">db-backup.sql.gz</p>
                          <p className="text-[10px] text-slate-400">850 MB • Scoped API</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold shrink-0">AES-256</span>
                    </div>
                  </div>
                </div>
              )}

              {mockActiveTab === 'stream' && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 sm:gap-4">
                  <div className="h-32 sm:h-28 w-full sm:w-48 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden group shrink-0">
                    <div className="h-10 w-10 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg">
                      <Play className="h-5 w-5 ml-0.5" />
                    </div>
                    <span className="absolute bottom-1 right-2 text-[9px] font-mono bg-black/80 px-1.5 py-0.5 rounded text-white">04:30 / 1080p</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-left min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-white text-sm">HTTP 206 Range Active</span>
                      <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded font-mono font-bold">Zero Buffering</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      {lang === 'id'
                        ? 'Pengguna dapat melompat (seek) ke bagian video mana saja. Server hanya mengalirkan chunk byte yang diminta secara instan tanpa mengunduh keseluruhan file.'
                        : 'Instant timestamp seeking without downloading full files. Streams only the requested byte chunk over standard HTTP Range headers.'}
                    </p>
                    <code className="text-[10px] text-purple-300 font-mono bg-slate-950 px-2 py-1 rounded block overflow-x-auto no-scrollbar">
                      Range: bytes=1048576-2097151 ➔ 206 Partial Content
                    </code>
                  </div>
                </div>
              )}

              {mockActiveTab === 'quota' && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <span className="font-bold text-white">Smart Upload Routing Engine</span>
                    <span className="text-emerald-400 font-mono font-bold">Total Pool: 45 GB (11.2 GB Used)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
                    <div className="h-full bg-blue-500 w-[15%]" title="Account 1" />
                    <div className="h-full bg-indigo-500 w-[10%]" title="Account 2" />
                    <div className="h-full bg-purple-500 w-[8%]" title="Account 3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-blue-400">Akun #1:</span> 15 GB (2.3 GB Digunakan)
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-indigo-400">Akun #2:</span> 15 GB (4.8 GB Digunakan)
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="font-bold text-purple-400">Akun #3:</span> 15 GB (4.1 GB Digunakan)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 4 Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-8 sm:pt-10 border-t border-slate-800/80 text-left"
          >
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 transition-colors">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1.5">
                <Globe className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Host CDN Landing Page' : 'Landing Page CDN Host'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Sajikan gambar, dokumen & aset statis landing page via link publik cepat.' : 'Serve landing page images, docs & static media assets via fast public URLs.'}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1.5">
                <Video className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Streaming HTTP 206' : 'HTTP 206 Streaming'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Putar video MP4 & audio tanpa buffering dan bisa seek ke detik mana saja.' : 'Instant zero-buffer MP4 video and audio playback with timestamp seeking.'}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                <Layers className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Pool Multi-Akun' : 'Multi-Account Pool'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Gabungkan kapasitas beberapa akun Google Drive secara otomatis dengan load balancer.' : 'Aggregate multi-account Google Drive storage with intelligent load balancing.'}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <KeyRound className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'REST API Developer' : 'REST API Gateway'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'API Key terisolasi (files:read, files:upload) untuk skrip & formulir website.' : 'Isolated API Keys (files:read, files:upload) for scripts & web forms.'}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SECTION 1: HOW IT WORKS (3-Step Workflow) ────────────────────────────── */}
      <section id="how-it-works" className="py-14 sm:py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <Sparkles className="h-4 w-4" />
              <span>{lang === 'id' ? 'Sederhana & Cepat' : 'Simple & Instant'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'id' ? 'Cara Kerja drive9 dalam 3 Langkah Mudah' : 'How drive9 Works in 3 Easy Steps'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id' ? 'Tidak perlu konfigurasi server rumit. Mulai dalam waktu kurang dari 60 detik.' : 'No complex server configuration needed. Get started in less than 60 seconds.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="relative p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-blue-500/40 transition-all duration-300 space-y-3.5 sm:space-y-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Hubungkan Akun Google Drive' : 'Connect Google Drive Accounts'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Tautkan 1 atau lebih akun Google Drive Anda melalui OAuth 2.0 resmi. Token Anda dienkripsi simetris menggunakan AES-256-GCM.'
                  : 'Link 1 or multiple Google Drive accounts via official OAuth 2.0. Your tokens are securely encrypted using symmetric AES-256-GCM.'}
              </p>
            </div>

            <div className="relative p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all duration-300 space-y-3.5 sm:space-y-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Unggah File via Direct Streaming' : 'Upload Files via Direct Streaming'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Unggah file multipart atau resumable. File langsung dialirkan ke folder khusus "9drive" di cloud tanpa pernah disimpan di disk server fisik.'
                  : 'Upload multipart or resumable files. Files stream directly to the dedicated "9drive" cloud folder without touching local server disks.'}
              </p>
            </div>

            <div className="relative p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all duration-300 space-y-3.5 sm:space-y-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Sematkan CDN & Stream Video' : 'Embed CDN & Stream Media'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Dapatkan link publik permanen untuk gambar/dokumen landing page atau putar video streaming tanpa jeda buffering via HTTP 206 Range.'
                  : 'Get permanent public links for landing page assets or play zero-buffer streaming videos powered by HTTP 206 Partial Content.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: INTERACTIVE STORAGE CALCULATOR ────────────────────────────── */}
      <section id="calculator" className="py-14 sm:py-24 border-t border-slate-800/80 bg-gradient-to-b from-[#030712] via-slate-950 to-[#030712] relative">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <Calculator className="h-4 w-4" />
              <span>{lang === 'id' ? 'Simulasi Kapasitas & Hemat Biaya' : 'Storage Simulation & Savings'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'id' ? 'Kalkulator Kuota Multi-Akun Google Drive' : 'Multi-Account Storage Calculator'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id'
                ? 'Hitung berapa total kapasitas penyimpanan cloud yang Anda dapatkan dengan menggabungkan akun Google Drive gratis.'
                : 'Calculate how much combined cloud storage pool you unlock by connecting free Google Drive accounts.'}
            </p>
          </div>

          <div className="p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border-2 border-emerald-500/30 bg-slate-900/90 shadow-2xl backdrop-blur-xl space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
                <label htmlFor="account-slider" className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'id' ? 'Jumlah Akun Google Drive Terhubung:' : 'Connected Google Drive Accounts:'}</span>
                </label>
                <span className="self-start xs:self-auto text-lg sm:text-xl font-black font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 sm:py-1 rounded-xl">
                  {accountCount} {lang === 'id' ? 'Akun' : 'Accounts'}
                </span>
              </div>
              <input
                id="account-slider"
                type="range"
                min="1"
                max="20"
                value={accountCount}
                onChange={(e) => setAccountCount(Number(e.target.value))}
                className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] sm:text-xs font-mono text-slate-500">
                <span>1 (15 GB)</span>
                <span>5 (75 GB)</span>
                <span>10 (150 GB)</span>
                <span>20 (300 GB)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-slate-800">
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-400">{lang === 'id' ? 'Total Kapasitas Cloud Pool' : 'Total Cloud Storage Pool'}</span>
                <p className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  {totalStorageGb} GB
                </p>
                <span className="text-[10px] text-emerald-400 font-medium">{lang === 'id' ? '100% Gratis Tanpa Batas Waktu' : '100% Free Forever'}</span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-1">
                <span className="text-xs font-semibold text-slate-400">{lang === 'id' ? 'Estimasi Biaya S3 / Wasabi' : 'Est. AWS S3 / Wasabi Cost'}</span>
                <p className="text-2xl sm:text-4xl font-black text-rose-400 line-through">
                  ${estimatedS3Monthly} <span className="text-xs font-normal text-slate-400">/ bln</span>
                </p>
                <span className="text-[10px] text-emerald-400 font-bold">{lang === 'id' ? 'Hemat 100% dengan drive9' : 'Save 100% with drive9'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: CDN & STREAMING MEDIA SHOWCASE ────────────────────────────── */}
      <section id="cdn-streaming" className="py-14 sm:py-24 border-t border-slate-800/80 bg-slate-950/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>{lang === 'id' ? 'Keunggulan Utama Media Web' : 'Web Media Advantages'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
              {lang === 'id' ? 'Solusi CDN, Streaming Video & Hosting Aset Media Web' : 'CDN, Video Streaming & Web Asset Hosting Solutions'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-base leading-relaxed">
              {lang === 'id'
                ? 'Gunakan drive9 untuk kebutuhan media web modern. Nikmati jaringan pengiriman aset berkecepatan tinggi, pemutaran video streaming tanpa buffering, dan integrasi API yang mudah.'
                : 'Use drive9 for modern web media requirements. Enjoy high-speed asset delivery, buffer-free video streaming playback, and seamless API integrations.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* CDN Feature Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-blue-500/30 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Globe className="h-28 sm:h-32 w-28 sm:w-32 text-blue-400" />
              </div>
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Globe className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 inline-block">
                  {lang === 'id' ? 'Host Aset CDN & Landing Page' : 'CDN & Landing Page Asset Host'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'id' ? 'Hosting Aset Landing Page & Website' : 'Landing Page & Website Asset Hosting'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'id'
                  ? 'Sajikan gambar banner, grafik, foto produk, CSS, JS, dan dokumen langsung ke landing page atau aplikasi web Anda via tautan publik permanen. Mengurangi beban server utama Anda dengan keandalan bandwidth Google.'
                  : 'Serve hero banners, product photos, graphics, CSS, JS, and docs directly to your landing page or web app via permanent public URLs. Relieve your main server load using Google reliable bandwidth.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300 text-[11px]">
                  {lang === 'id' ? 'Link Sematan Publik' : 'Public Embed Link'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 text-[11px]">
                  {lang === 'id' ? 'URL Gambar Langsung' : 'Direct Image URL'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 text-[11px]">
                  {lang === 'id' ? 'Proxy Edge Cepat' : 'Fast Edge Proxy'}
                </span>
              </div>
            </motion.div>

            {/* Video Streaming Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <Film className="h-28 sm:h-32 w-28 sm:w-32 text-purple-400" />
              </div>
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Video className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 inline-block">
                  HTTP 206 Partial Content
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'id' ? 'Streaming Video & Audio Tanpa Buffering' : 'Buffer-Free Video & Audio Streaming'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'id'
                  ? 'Diototatisasi dengan dukungan permintaan rentang HTTP (206 Partial Content). Pengunjung dapat langsung memutar video resolusi tinggi (MP4, WebM) atau podcast audio pada pemutar media (Plyr / Video HTML5) tanpa menunggu unduhan selesai.'
                  : 'Automated with HTTP Range request (206 Partial Content) support. Viewers can instantly stream HD videos (MP4, WebM) or audio podcasts on web players (Plyr / HTML5 Video) without waiting for whole downloads.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-300">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300 text-[11px]">
                  HTTP 206 Range
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300 text-[11px]">
                  {lang === 'id' ? 'Siap Pemutar Plyr' : 'Plyr Player Ready'}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300 text-[11px]">
                  {lang === 'id' ? 'Tanpa Buffering' : 'Zero Buffering'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: COMPARISON MATRIX (drive9 vs GDrive Standar vs AWS S3 vs Cloudinary) ─── */}
      <section id="comparison" className="py-14 sm:py-24 border-t border-slate-800/80 bg-slate-900/30 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <Layers className="h-4 w-4" />
              <span>{lang === 'id' ? 'Mengapa Memilih drive9' : 'Why Choose drive9'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'id' ? 'Tabel Perbandingan Fitur & Efisiensi' : 'Feature & Efficiency Comparison'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id' ? 'Lihat bagaimana drive9 memberikan keunggulan fleksibilitas dan efisiensi biaya dibandingkan opsi lainnya.' : 'See how drive9 delivers superior flexibility and cost efficiency compared to alternatives.'}
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
            <table className="w-full min-w-[620px] text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-slate-300 font-bold">
                <tr>
                  <th className="p-3.5 sm:p-5">{lang === 'id' ? 'Fitur / Kebutuhan' : 'Feature / Capability'}</th>
                  <th className="p-3.5 sm:p-5 text-blue-400 font-black text-sm sm:text-base">drive9</th>
                  <th className="p-3.5 sm:p-5 text-slate-400">Google Drive Biasa</th>
                  <th className="p-3.5 sm:p-5 text-slate-400">AWS S3 / Wasabi</th>
                  <th className="p-3.5 sm:p-5 text-slate-400">Cloudinary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 sm:p-5 font-semibold text-white">
                    {lang === 'id' ? 'Agregasi Kuota Multi-Akun' : 'Multi-Account Quota Aggregation'}
                  </td>
                  <td className="p-3.5 sm:p-5 font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 shrink-0" /> <span>{lang === 'id' ? 'Otomatis & Cerdas' : 'Smart Auto'}</span>
                  </td>
                  <td className="p-3.5 sm:p-5 text-slate-500"><Minus className="h-4 w-4" /></td>
                  <td className="p-3.5 sm:p-5 text-slate-500"><Minus className="h-4 w-4" /></td>
                  <td className="p-3.5 sm:p-5 text-slate-500"><Minus className="h-4 w-4" /></td>
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 sm:p-5 font-semibold text-white">
                    {lang === 'id' ? 'Video Streaming HTTP 206 (Tanpa Buffering)' : 'HTTP 206 Video Streaming (Zero Buffer)'}
                  </td>
                  <td className="p-3.5 sm:p-5 font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 shrink-0" /> <span>{lang === 'id' ? 'Bawaan (Range Request)' : 'Native Range'}</span>
                  </td>
                  <td className="p-3.5 sm:p-5 text-rose-400 text-xs">{lang === 'id' ? 'Sering Limit' : 'Quota Limited'}</td>
                  <td className="p-3.5 sm:p-5 text-slate-300">{lang === 'id' ? 'Ya (Bayar Egress)' : 'Yes (Costly Egress)'}</td>
                  <td className="p-3.5 sm:p-5 text-slate-300">{lang === 'id' ? 'Ya (Batas Kuota)' : 'Yes (Strict Limits)'}</td>
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 sm:p-5 font-semibold text-white">
                    {lang === 'id' ? 'Zero Server Disk Storage (Streaming Langsung)' : 'Zero Server Disk Storage (Direct Stream)'}
                  </td>
                  <td className="p-3.5 sm:p-5 font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 shrink-0" /> <span>{lang === 'id' ? '100% Dalam Memori' : '100% In-Memory'}</span>
                  </td>
                  <td className="p-3.5 sm:p-5 text-slate-500"><Minus className="h-4 w-4" /></td>
                  <td className="p-3.5 sm:p-5 text-slate-300">{lang === 'id' ? 'Perlu Konfigurasi' : 'Needs Config'}</td>
                  <td className="p-3.5 sm:p-5 text-slate-300">{lang === 'id' ? 'Perlu SDK Khusus' : 'Requires SDK'}</td>
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 sm:p-5 font-semibold text-white">
                    {lang === 'id' ? 'Folder Virtual Tanpa Delay API' : 'Instant Virtual Folders (No API Delay)'}
                  </td>
                  <td className="p-3.5 sm:p-5 font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckIcon className="h-4 w-4 shrink-0" /> <span>{lang === 'id' ? 'Cepat via MySQL' : 'Fast MySQL Nested'}</span>
                  </td>
                  <td className="p-3.5 sm:p-5 text-slate-400">{lang === 'id' ? 'Folder Fisik Lambat' : 'Slow Physical'}</td>
                  <td className="p-3.5 sm:p-5 text-slate-400">{lang === 'id' ? 'Prefix Key S3' : 'Key Prefix Only'}</td>
                  <td className="p-3.5 sm:p-5 text-slate-400">{lang === 'id' ? 'Tag Terbatas' : 'Limited Tags'}</td>
                </tr>

                <tr className="hover:bg-slate-800/30">
                  <td className="p-3.5 sm:p-5 font-semibold text-white">
                    {lang === 'id' ? 'Biaya Berlangganan Dasar' : 'Base Subscription Cost'}
                  </td>
                  <td className="p-3.5 sm:p-5 font-black text-emerald-400">
                    {lang === 'id' ? 'GRATIS (15GB/Akun)' : 'FREE (15GB/Account)'}
                  </td>
                  <td className="p-3.5 sm:p-5 text-slate-300">Gratis (15GB Single)</td>
                  <td className="p-3.5 sm:p-5 text-rose-400 font-mono">Bayar per GB + Egress</td>
                  <td className="p-3.5 sm:p-5 text-rose-400 font-mono">Tier Gratis Terbatas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: USE CASES & SOLUTIONS ────────────────────────────── */}
      <section id="use-cases" className="py-14 sm:py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-400">
              <Zap className="h-4 w-4" />
              <span>{lang === 'id' ? 'Kasus Penggunaan Riil' : 'Real-World Use Cases'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'id' ? 'Dirancang untuk Berbagai Kebutuhan Digital' : 'Engineered for Diverse Digital Workloads'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id' ? 'Lihat bagaimana drive9 memecahkan masalah penyimpanan dan pengiriman media Anda.' : 'Discover how drive9 solves modern storage and content delivery challenges.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-blue-500/40 transition-all duration-300 space-y-3.5 sm:space-y-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Web Developer & Pemilik Landing Page' : 'Web Developers & Landing Pages'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Host gambar banner, aset grafis produk, dan media web langsung via link publik permanen tanpa membebani hosting utama Anda.'
                  : 'Host hero banners, product graphics, and website media via permanent public URLs without consuming web hosting bandwidth.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all duration-300 space-y-3.5 sm:space-y-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Film className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Kreator Video & Podcast Streaming' : 'Video Creators & Podcast Streaming'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Sematkan video ke pemutar Plyr atau tag HTML5 video. Nikmati pemutaran instan dengan lompatan menit (timestamp seeking) tanpa buffering.'
                  : 'Embed videos directly to Plyr or HTML5 players. Enjoy zero buffering with instantaneous timestamp seeking powered by HTTP 206.'}
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 sm:space-y-4">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Database className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Otomatisasi Backup & Skrip Backend' : 'Automated Backups & Script Uploads'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {lang === 'id'
                  ? 'Gunakan API Key terisolasi (files:upload) untuk mengirimkan file backup database, log server, atau unggahan formulir website secara otomatis.'
                  : 'Use isolated API Keys (files:upload) to send automated database backups, server logs, or contact form uploads straight to Google Drive.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 6: INTERACTIVE API & CODE SNIPPETS ────────────────────────────── */}
      <section className="py-14 sm:py-24 border-t border-slate-800/80 bg-[#030712] relative">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-8 sm:space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <Code2 className="h-4 w-4" />
              <span>{lang === 'id' ? 'Integrasi Cepat Pengembang' : 'Developer-First Integration'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'id' ? 'Sematkan & Integrasikan dalam Hitungan Baris' : 'Embed & Integrate in Just a Few Lines'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id' ? 'Contoh cuplikan kode siap pakai untuk HTML, cURL, JavaScript, dan Python.' : 'Ready-to-use code snippets for HTML, cURL, JavaScript, and Python.'}
            </p>
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            {/* Code Tabs Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 bg-slate-900/80 p-3 sm:px-6 sm:py-3 gap-2.5">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('video')}
                  className={cn(
                    'whitespace-nowrap px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0',
                    activeCodeTab === 'video' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/50'
                  )}
                >
                  HTML Video (HTTP 206)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('curl')}
                  className={cn(
                    'whitespace-nowrap px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0',
                    activeCodeTab === 'curl' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/50'
                  )}
                >
                  cURL Upload
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('js')}
                  className={cn(
                    'whitespace-nowrap px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0',
                    activeCodeTab === 'js' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/50'
                  )}
                >
                  JavaScript / Fetch
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCodeTab('python')}
                  className={cn(
                    'whitespace-nowrap px-3 py-1.5 text-xs rounded-xl font-bold transition-all shrink-0',
                    activeCodeTab === 'python' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white bg-slate-950/50'
                  )}
                >
                  Python
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySnippet(codeSnippets[activeCodeTab])}
                className="self-end sm:self-auto shrink-0 h-8 px-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg gap-1.5"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? (lang === 'id' ? 'Tersalin!' : 'Copied!') : (lang === 'id' ? 'Salin Kode' : 'Copy Code')}</span>
              </Button>
            </div>

            {/* Code Content */}
            <div className="p-3.5 sm:p-6 overflow-x-auto">
              <pre className="font-mono text-xs sm:text-sm text-blue-300 leading-relaxed">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 7: SECURITY & GOOGLE OAUTH TRANSPARENCY ────────────────────────────── */}
      <section id="security" className="py-14 sm:py-24 border-t border-slate-800/80 bg-slate-950/40 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              <span>{lang === 'id' ? 'Keamanan & Privasi OAuth Google' : 'Google OAuth Security & Privacy'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {lang === 'id' ? 'Bagaimana drive9 Mengelola Data & Akses Google Drive Anda' : 'How drive9 Manages Your Data & Google Drive Access'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              <strong className="text-slate-200">drive9</strong> {lang === 'id' ? 'mengakses Google Drive semata-mata untuk membuat dan mengelola file dalam folder khusus bernama ' : 'accesses Google Drive solely to create and manage files in a dedicated folder named '}
              <code className="text-indigo-300 font-mono font-bold">9drive</code>. {lang === 'id' ? 'Kami menjaga privasi data Anda:' : 'We safeguard your data privacy:'}
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'id' ? 'Enkripsi OAuth:' : 'OAuth Encryption:'}</strong> {lang === 'id' ? 'Token Akses & Pembaruan terenkripsi dengan algoritma AES-256-GCM sebelum disimpan di database.' : 'Access & Refresh tokens are encrypted with AES-256-GCM before saving to database.'}
                </span>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <Database className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'id' ? 'Tanpa Penyimpanan File Server:' : 'Zero Server File Storage:'}</strong> {lang === 'id' ? 'File unggahan langsung dialirkan ke penyimpanan cloud tanpa disimpan di penyimpanan lokal server.' : 'Uploaded files stream directly to cloud storage without saving to local server storage.'}
                </span>
              </li>
              <li className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'id' ? 'Hak Pencabutan Akses:' : 'Access Revocation Rights:'}</strong> {lang === 'id' ? 'Anda dapat memutuskan koneksi akun Google kapan saja via menu Pengaturan atau Keamanan Google.' : 'You can disconnect your Google account anytime via Settings or Google Security.'}
                </span>
              </li>
            </ul>
          </div>

          <div className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5 sm:space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">{lang === 'id' ? 'Informasi Kepatuhan Aplikasi' : 'Application Compliance Info'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">drive9 Gateway</span>
            </div>
            <div className="space-y-3.5 sm:space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-400 mb-1">{lang === 'id' ? 'Nama Aplikasi Resmi:' : 'Official App Name:'}</p>
                <p className="font-mono text-blue-400 text-sm font-black">drive9</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 mb-1">{lang === 'id' ? 'Target Scope Google Drive:' : 'Target Google Scope:'}</p>
                <p className="font-mono text-purple-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all text-[11px] sm:text-xs">https://www.googleapis.com/auth/drive</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 mb-1">{lang === 'id' ? 'Tujuan Folder Penyimpanan:' : 'Target Storage Folder:'}</p>
                <p className="text-slate-300">
                  {lang === 'id' ? 'Folder Khusus ' : 'Dedicated '}
                  <code className="text-indigo-300 font-mono font-bold">9drive</code>
                  {lang === 'id' ? ' di Google Drive Pengguna' : ' Folder in User Google Drive'}
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <RouterLink to="/privacy" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                <span>{lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</span>
                <ExternalLink className="h-3 w-3" />
              </RouterLink>
              <RouterLink to="/terms" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
                <span>{lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}</span>
                <ExternalLink className="h-3 w-3" />
              </RouterLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 8: FAQ (16 Frequently Asked Questions) ─────────────── */}
      <section id="faq" className="py-14 sm:py-24 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8 sm:space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-400">
              <HelpCircle className="h-4 w-4" />
              <span>{lang === 'id' ? 'Pertanyaan Sering Diajukan' : 'Frequently Asked Questions'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">Frequently Asked Questions (FAQ)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id' ? 'Temukan jawaban mendalam dan detail seputar teknis, CDN, streaming video, keamanan, dan integrasi drive9.' : 'Find in-depth detailed answers regarding technical specs, CDN, video streaming, security, and drive9 integration.'}
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl sm:rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-button-${idx}`}
                  className="w-full p-3.5 sm:p-5 text-left flex items-start justify-between gap-3 sm:gap-4 font-bold text-xs sm:text-sm text-slate-100 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                    <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 text-[11px] sm:text-xs font-mono font-bold border border-blue-500/20 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-snug">{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 mt-1',
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
                      <div className="px-3.5 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/50">
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

      {/* ── SECTION 9: CALL TO ACTION BANNER ──────────────────────────────────── */}
      <section className="py-14 sm:py-20 border-t border-slate-800/80 bg-gradient-to-b from-slate-950 via-[#030712] to-blue-950/40 relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-5 sm:space-y-6 relative z-10">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 ring-1 ring-white/20">
            <Zap className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {lang === 'id' ? 'Siap Menggunakan drive9 Gateway CDN & Storage?' : 'Ready to Use drive9 CDN & Storage Gateway?'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            {lang === 'id' ? 'Hubungkan akun Google Drive Anda dalam hitungan detik dan mulai nikmati pengalaman manajemen penyimpanan cloud, hosting aset CDN & streaming video modern.' : 'Connect your Google Drive accounts in seconds and start enjoying a modern cloud storage management, CDN asset hosting & video streaming experience.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none mx-auto">
            <RouterLink to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 rounded-xl">
                {lang === 'id' ? 'Masuk dengan Google' : 'Sign In with Google'}
              </Button>
            </RouterLink>
            <RouterLink to="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-xs font-bold border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                {lang === 'id' ? 'Daftar Akun Gratis' : 'Create Free Account'}
              </Button>
            </RouterLink>
          </div>
        </div>
      </section>

      {/* ── SECTION 10: FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 bg-[#030712] py-8 sm:py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src="/logo-sm.webp" alt="drive9 logo" width="32" height="32" loading="lazy" className="h-8 w-8 rounded-lg object-contain bg-slate-900/80 p-0.5 shrink-0" />
            <span className="font-extrabold text-white text-sm">drive9</span>
            <span>© 2026 drive9. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5 sm:gap-6 font-semibold">
            <a href="#how-it-works" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Cara Kerja' : 'How It Works'}</a>
            <a href="#calculator" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Kalkulator' : 'Calculator'}</a>
            <a href="#cdn-streaming" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'CDN & Streaming' : 'CDN & Streaming'}</a>
            <a href="#comparison" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Perbandingan' : 'Comparison'}</a>
            <a href="#use-cases" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Solusi' : 'Use Cases'}</a>
            <RouterLink to="/privacy" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</RouterLink>
            <RouterLink to="/terms" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}</RouterLink>
            <RouterLink to="/login" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Masuk Dashboard' : 'Dashboard Login'}</RouterLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
