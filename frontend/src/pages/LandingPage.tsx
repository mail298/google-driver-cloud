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
  Info,
  Globe,
  Video,
  Film,
  Sparkles,
  Layers,
  Share2
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
    q: '8. Apa perbedaan antara Folder Virtual di drive9 dan folder fisik di Google Drive?',
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

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      <Seo title={lang === 'id' ? 'drive9 - Gateway CDN, Streaming Video & Cloud Storage Virtual' : 'drive9 - CDN Gateway, Video Streaming & Cloud Storage Gateway'} />

      {/* ── Navigation Bar (Fully Mobile & Desktop Optimized) ───────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#030712]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Brand Logo */}
          <RouterLink to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="drive9 logo - Google Drive Storage & CDN Gateway"
              width="40"
              height="40"
              fetchPriority="high"
              loading="eager"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl object-contain shadow-lg shadow-blue-500/20 ring-1 ring-white/10 bg-slate-900/90 p-1 transition-transform group-hover:scale-105"
            />
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">drive9</span>
              <span className="hidden xl:inline-flex text-[10px] font-extrabold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                {lang === 'id' ? 'Gateway CDN & Cloud' : 'CDN & Cloud Gateway'}
              </span>
            </div>
          </RouterLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs lg:text-sm font-medium text-slate-300">
            <a href="#purpose" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Tujuan' : 'Purpose'}</a>
            <a href="#cdn-streaming" className="hover:text-white hover:font-semibold transition-colors">CDN & Streaming</a>
            <a href="#features" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Fitur' : 'Features'}</a>
            <a href="#security" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Keamanan' : 'Security'}</a>
            <a href="#faq" className="hover:text-white hover:font-semibold transition-colors">FAQ</a>
            <RouterLink to="/terms" className="hover:text-white hover:font-semibold transition-colors">{lang === 'id' ? 'Syarat & Privasi' : 'Terms & Privacy'}</RouterLink>
          </nav>

          {/* Desktop CTA & Language Switcher */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <RouterLink to="/login">
              <Button variant="outline" className="h-9 px-4 text-xs font-bold border border-slate-700/80 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white transition-all rounded-xl shadow-sm">
                {lang === 'id' ? 'Masuk' : 'Sign In'}
              </Button>
            </RouterLink>
            <RouterLink to="/register">
              <Button className="h-9 px-4 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all rounded-xl">
                {lang === 'id' ? 'Mulai Gratis' : 'Get Started'}
              </Button>
            </RouterLink>
          </div>

          {/* Mobile Actions & Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSwitcher />
            <RouterLink to="/login">
              <Button size="sm" className="h-8 px-3 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm">
                {lang === 'id' ? 'Masuk' : 'Sign In'}
              </Button>
            </RouterLink>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/90 border border-slate-800 focus:outline-none transition-colors"
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
                <a href="#purpose" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Tujuan Aplikasi' : 'App Purpose'}</a>
                <a href="#cdn-streaming" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'CDN & Streaming Video' : 'CDN & Video Streaming'}</a>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Fitur & Keunggulan' : 'Features & Benefits'}</a>
                <a href="#security" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Keamanan Data' : 'Data Security'}</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">FAQ</a>
                <RouterLink to="/privacy" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</RouterLink>
                <RouterLink to="/terms" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-400 py-1 transition-colors">{lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}</RouterLink>
              </div>
              <div className="pt-3 border-t border-slate-800/80 flex flex-col gap-2.5">
                <RouterLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-10 text-xs font-bold border border-slate-700 bg-slate-900 text-white rounded-xl">
                    {lang === 'id' ? 'Masuk ke Dashboard' : 'Sign In to Dashboard'}
                  </Button>
                </RouterLink>
                <RouterLink to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-10 text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md shadow-blue-600/30">
                    {lang === 'id' ? 'Daftar Akun Gratis' : 'Get Started Free'}
                  </Button>
                </RouterLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero Section with 21st.dev Geometric Animated Shapes ─── */}
      <section className="relative min-h-[85vh] flex items-center justify-center pt-12 sm:pt-16 pb-14 overflow-hidden">
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
              {lang === 'id' ? 'drive9 - Gateway CDN Cepat, Stream Video & Gateway Cloud' : 'drive9 - High-Speed CDN Gateway, Video Streaming & Cloud Gateway'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-[1.12]"
          >
            {lang === 'id' ? 'Penyimpanan Cloud & Gateway CDN Terpadu via ' : 'Unified Cloud Storage & CDN Gateway via '}
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
            <strong className="text-white font-black text-base sm:text-xl">
              {lang === 'id' ? 'Lebih Dari Sekadar Penyimpanan Cloud:' : 'More Than Just Cloud Storage:'}
            </strong><br />
            <span className="text-slate-200">
              {lang === 'id'
                ? 'drive9 adalah platform Gateway Penyimpanan Google Drive & Proxy Streaming Media CDN. Selain menyimpan dan mengorganisasi file dalam folder virtual, drive9 mengizinkan Anda menyajikan aset landing page/website via CDN, streaming video & audio tanpa buffering (HTTP 206), memantau kuota multi-akun, dan mengalirkan file langsung ke folder '
                : 'drive9 is a Google Drive Storage Gateway & High-Speed CDN Media Streaming Proxy platform. Beyond storing files in virtual folders, drive9 empowers you to deliver landing page media via CDN, stream video & audio buffer-free (HTTP 206), manage multi-account storage pools, and stream uploads directly to '}
              <code className="text-blue-400 font-mono font-bold">9drive</code>
              {lang === 'id'
                ? ' di akun Google Drive Anda.'
                : ' in your Google Drive accounts.'}
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <RouterLink to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-7 text-sm font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/25 transition-all rounded-xl flex items-center justify-center gap-2 ring-1 ring-white/20">
                <span>{lang === 'id' ? 'Masuk dengan Google' : 'Sign In with Google'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </RouterLink>
            <RouterLink to="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-7 text-sm font-extrabold border border-slate-700 bg-slate-900/90 text-white hover:bg-slate-800 transition-all rounded-xl">
                {lang === 'id' ? 'Buat Akun Gratis' : 'Create Free Account'}
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
                <Globe className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Host CDN Landing Page' : 'Landing Page CDN Host'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Sajikan gambar, dokumen & aset statis landing page via link publik cepat.' : 'Serve landing page images, docs & static media assets via fast public URLs.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-purple-500/40 transition-colors">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1.5">
                <Video className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Streaming Tanpa Buffering' : 'Buffer-Free Streaming'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Dukungan HTTP 206 Partial Content untuk pemutaran video MP4 & audio tanpa jeda.' : 'HTTP 206 Partial Content support for instant, zero-buffer video & audio playback.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1.5">
                <Layers className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Pool Multi-Akun' : 'Multi-Account Pool'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Gabungkan kapasitas beberapa akun Google Drive secara otomatis dengan penyeimbang beban.' : 'Aggregate multi-account Google Drive storage with intelligent load balancing.'}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
                <KeyRound className="h-4 w-4 shrink-0" />
                <span>{lang === 'id' ? 'Gateway API REST' : 'REST API Gateway'}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'API Key terisolasi (' : 'Isolated API Keys ('}
                <code className="text-amber-300 font-mono">files:read</code>, <code className="text-amber-300 font-mono">files:upload</code>
                {lang === 'id' ? ') untuk skrip & aplikasi web.' : ') for scripts & web apps.'}
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
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {lang === 'id' ? 'Tujuan Utama Aplikasi drive9' : 'drive9 Main Application Purpose'}
                </h2>
                <p className="text-xs text-blue-400 font-medium">
                  {lang === 'id' ? 'Transparansi Scope & Verifikasi OAuth Google' : 'Google OAuth Verification & Scope Transparency Disclosure'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{lang === 'id' ? 'Untuk Apa drive9 Dibuat?' : 'What is drive9 built for?'}</span>
                </h3>
                <p className="text-slate-400">
                  <strong className="text-slate-200">drive9</strong> {lang === 'id' ? 'adalah platform gateway penyimpanan cloud & proxy media CDN yang membantu pengguna mengunggah file, menyajikan aset website/landing page, memutar video streaming tanpa buffering, mengorganisir folder virtual, memantau sisa kuota multi-akun, serta mengelola API Key terenkripsi.' : 'is a cloud storage gateway & CDN media proxy platform designed to help users upload files, serve website/landing page assets, stream videos without buffering, organize virtual folders, monitor multi-account storage limits, and manage encrypted API Keys.'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                  <span>{lang === 'id' ? 'Bagaimana drive9 Menggunakan API Google Drive?' : 'How does drive9 use Google Drive API?'}</span>
                </h3>
                <p className="text-slate-400">
                  {lang === 'id' ? 'Aplikasi ' : 'The '}
                  <strong className="text-slate-200">drive9</strong>
                  {lang === 'id' ? ' meminta akses scope Google Drive (' : ' app requests Google Drive scope access ('}
                  <code className="text-purple-300 font-mono">https://www.googleapis.com/auth/drive</code>
                  {lang === 'id' ? ') khusus untuk membuat folder bernama ' : ') solely to create a folder named '}
                  <code className="text-indigo-300 font-mono font-bold">9drive</code>
                  {lang === 'id' ? ' di Google Drive Anda dan mengalirkan file secara langsung (streaming langsung) tanpa pernah menyimpan file fisik di disk server.' : ' in your Google Drive and stream files directly without ever saving physical files on server disk.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CDN & Video Streaming Showcase Section ────────────────────────────── */}
      <section id="cdn-streaming" className="py-16 sm:py-24 border-t border-slate-800/80 bg-gradient-to-b from-[#030712] via-slate-950 to-[#030712] relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>{lang === 'id' ? 'Keunggulan Utama di Luar Storage' : 'Beyond Storage Advantages'}</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {lang === 'id' ? 'Solusi CDN, Streaming Video & Hosting Aset Media Web' : 'CDN, Video Streaming & Web Asset Hosting Solutions'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-base leading-relaxed">
              {lang === 'id'
                ? 'Gunakan drive9 untuk kebutuhan media web modern. Nikmati jaringan pengiriman aset berkecepatan tinggi, pemutaran video streaming tanpa buffering, dan integrasi API yang mudah.'
                : 'Use drive9 for modern web media requirements. Enjoy high-speed asset delivery, buffer-free video streaming playback, and seamless API integrations.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CDN Feature Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-3xl border border-blue-500/30 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Globe className="h-32 w-32 text-blue-400" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Globe className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {lang === 'id' ? 'Host Aset CDN & Landing Page' : 'CDN & Landing Page Asset Host'}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {lang === 'id' ? 'Hosting Aset Landing Page & Website' : 'Landing Page & Website Asset Hosting'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'id'
                  ? 'Sajikan gambar banner, grafik, foto produk, CSS, JS, dan dokumen langsung ke landing page atau aplikasi web Anda via tautan publik permanen. Mengurangi beban server utama Anda dengan keandalan bandwidth Google.'
                  : 'Serve hero banners, product photos, graphics, CSS, JS, and docs directly to your landing page or web app via permanent public URLs. Relieve your main server load using Google reliable bandwidth.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-300">
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300">
                  {lang === 'id' ? 'Link Sematan Publik' : 'Public Embed Link'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                  {lang === 'id' ? 'URL Gambar Langsung' : 'Direct Image URL'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
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
              className="p-8 rounded-3xl border border-purple-500/30 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Film className="h-32 w-32 text-purple-400" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Video className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  HTTP 206 Partial Content
                </span>
                <h3 className="text-2xl font-black text-white">
                  {lang === 'id' ? 'Streaming Video & Audio Tanpa Buffering' : 'Buffer-Free Video & Audio Streaming'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'id'
                  ? 'Diototatisasi dengan dukungan permintaan rentang HTTP (206 Partial Content). Pengunjung dapat langsung memutar video resolusi tinggi (MP4, WebM) atau podcast audio pada pemutar media (Plyr / Video HTML5) tanpa menunggu unduhan selesai.'
                  : 'Automated with HTTP Range request (206 Partial Content) support. Viewers can instantly stream HD videos (MP4, WebM) or audio podcasts on web players (Plyr / HTML5 Video) without waiting for whole downloads.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-300">
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
                  HTTP 206 Range
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300">
                  {lang === 'id' ? 'Siap Pemutar Plyr' : 'Plyr Player Ready'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                  {lang === 'id' ? 'Tanpa Buffering' : 'Zero Buffering'}
                </span>
              </div>
            </motion.div>

            {/* Smart Multi-Drive Quota Balancing Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="p-8 rounded-3xl border border-emerald-500/30 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <Layers className="h-32 w-32 text-emerald-400" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Layers className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {lang === 'id' ? 'Penyeimbang Beban Cerdas' : 'Smart Load Balancer'}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {lang === 'id' ? 'Agregasi Kuota Penyimpanan Multi-Akun' : 'Multi-Account Storage Aggregation'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'id'
                  ? 'Hubungkan banyak akun Google Drive dan kumpulkan kapasitas gratisnya (misal 15 GB + 15 GB + 15 GB) menjadi satu kelompok penyimpanan masif. Algoritma cerdas drive9 otomatis mengarahkan unggahan ke akun yang paling senggang.'
                  : 'Connect multiple Google Drive accounts and pool their free quota (e.g. 15 GB + 15 GB + 15 GB) into a massive storage cluster. drive9 smart algorithm automatically routes uploads to the account with the most available space.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-300">
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                  {lang === 'id' ? 'Satu Pool Penyimpanan' : 'Unified Storage Pool'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300">
                  {lang === 'id' ? 'Rute Unggah Otomatis' : 'Auto Route Uploads'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-purple-300">
                  {lang === 'id' ? 'Pemantau Kuota' : 'Quota Monitor'}
                </span>
              </div>
            </motion.div>

            {/* Developer API Integration Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="p-8 rounded-3xl border border-amber-500/30 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 space-y-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <KeyRound className="h-32 w-32 text-amber-400" />
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <KeyRound className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {lang === 'id' ? 'API Key REST Pengembang' : 'Developer REST API Keys'}
                </span>
                <h3 className="text-2xl font-black text-white">
                  {lang === 'id' ? 'Gateway API Form Unggah & Otomatisasi' : 'API Gateway for Upload Forms & Automation'}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lang === 'id'
                  ? 'Gunakan API Key terisolasi (files:upload & files:read) untuk mengintegrasikan formulir unggah file landing page, otomatisasi pencadangan skrip backend, atau pengiriman media aplikasi seluler dengan dokumentasi JSON interaktif.'
                  : 'Use isolated API Keys (files:upload & files:read) to integrate landing page file upload forms, automated backend backup scripts, or mobile app media delivery with interactive JSON documentation.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono font-bold text-slate-300">
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300">
                  {lang === 'id' ? 'API Key Terisolasi' : 'Scoped API Keys'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-blue-300">
                  {lang === 'id' ? 'Endpoint Form Unggah' : 'Form Upload Endpoint'}
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-emerald-300">
                  {lang === 'id' ? 'Respon JSON' : 'JSON Responses'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/60 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12 sm:space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <Cpu className="h-4 w-4" />
              <span>{lang === 'id' ? 'Fitur Gateway' : 'Gateway Features'}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              {lang === 'id' ? 'Fitur & Keunggulan Lengkap drive9' : 'Complete drive9 Features & Capabilities'}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {lang === 'id' ? 'Dirancang untuk manajemen penyimpanan cloud berkecepatan tinggi dengan keamanan tingkat lanjut.' : 'Built for high-speed cloud storage management with advanced security.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-blue-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <UploadCloud className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Unggahan Direct Streaming' : 'Direct Streamed Uploads'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Mengunggah file multipart dan resumable secara langsung ke Google Drive tanpa menampung file di disk server lokal. Izin akses file publik otomatis disesuaikan.' : 'Upload multipart and resumable files directly to Google Drive without holding files on local server disk. Public file access permissions are automatically configured.'}
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-purple-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Video className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Streaming Media Tanpa Buffering' : 'Buffer-Free Media Streaming'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Streaming video MP4/WebM dan audio secara efisien menggunakan permintaan rentang HTTP. Kompatibel dengan pemutar video populer seperti Plyr.' : 'Stream MP4/WebM videos and audio efficiently using HTTP Range requests. Fully compatible with modern video players like Plyr.'}
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-emerald-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Host Aset CDN Landing Page' : 'CDN Landing Page Asset Host'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Sajikan gambar banner, dokumen, dan media visual secara publik untuk landing page atau website tanpa membebankan server fisik Anda.' : 'Serve hero banners, docs, and visual media publicly for landing pages or websites without burdening your physical server.'}
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-indigo-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <FolderTree className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Folder Virtual Bersarang' : 'Nested Virtual Folders'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Organisir file dalam struktur folder virtual bersarang. Otomatis menyelesaikan dan mensinkronkan path folder di Google Drive saat diminta oleh client.' : 'Organize files in nested virtual folder structures. Automatically resolves and syncs folder paths in Google Drive upon request.'}
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-amber-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <KeyRound className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'API Key Pengembang' : 'Developer API Keys'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Buat API Key dengan kontrol hak akses terisolasi (' : 'Generate API Keys with isolated access scope controls ('}
                <code className="text-amber-300 font-mono">files:read</code>, <code className="text-amber-300 font-mono">files:upload</code>
                {lang === 'id' ? ') untuk integrasi skrip backend.' : ') for backend script integration.'}
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-cyan-500/40 transition-all duration-300 space-y-4">
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Share2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {lang === 'id' ? 'Tautan Berbagi & Token Pratinjau' : 'Shared Links & Preview Tokens'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {lang === 'id' ? 'Buat Tautan Publik (Public Link), Token Pratinjau Terbatas (Preview Token), atau undang email pengguna lain dengan izin baca/tulis.' : 'Generate Public Shared Links, secure Preview Tokens, or invite users by email with read/write access.'}
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
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'id' ? 'Enkripsi OAuth:' : 'OAuth Encryption:'}</strong> {lang === 'id' ? 'Token Akses & Pembaruan terenkripsi dengan algoritma AES-256-GCM sebelum disimpan di database.' : 'Access & Refresh tokens are encrypted with AES-256-GCM before saving to database.'}
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <Database className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'id' ? 'Tanpa Penyimpanan File Server:' : 'Zero Server File Storage:'}</strong> {lang === 'id' ? 'File unggahan langsung dialirkan ke penyimpanan cloud tanpa disimpan di penyimpanan lokal server.' : 'Uploaded files stream directly to cloud storage without saving to local server storage.'}
                </span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'id' ? 'Hak Pencabutan Akses:' : 'Access Revocation Rights:'}</strong> {lang === 'id' ? 'Anda dapat memutuskan koneksi akun Google kapan saja via menu Pengaturan atau Keamanan Google.' : 'You can disconnect your Google account anytime via Settings or Google Security.'}
                </span>
              </li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">{lang === 'id' ? 'Informasi Aplikasi' : 'Application Information'}</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">drive9 v1.0</span>
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-400 mb-1">{lang === 'id' ? 'Nama Aplikasi:' : 'App Name:'}</p>
                <p className="font-mono text-blue-400 text-sm font-black">drive9</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 mb-1">{lang === 'id' ? 'Target Scope Google:' : 'Target Google Scope:'}</p>
                <p className="font-mono text-purple-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800 break-all">https://www.googleapis.com/auth/drive</p>
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

      {/* ── FAQ Section (16 Frequently Asked Questions) ─────────────── */}
      <section id="faq" className="py-16 sm:py-24 border-t border-slate-800/80 bg-slate-950/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10 sm:space-y-12">
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
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {lang === 'id' ? 'Siap Menggunakan drive9 Gateway CDN & Storage?' : 'Ready to Use drive9 CDN & Storage Gateway?'}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            {lang === 'id' ? 'Hubungkan akun Google Drive Anda dalam hitungan detik dan mulai nikmati pengalaman manajemen penyimpanan cloud, hosting aset CDN & streaming video modern.' : 'Connect your Google Drive accounts in seconds and start enjoying a modern cloud storage management, CDN asset hosting & video streaming experience.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <RouterLink to="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-12 px-8 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 rounded-xl">
                {lang === 'id' ? 'Masuk dengan Google' : 'Sign In with Google'}
              </Button>
            </RouterLink>
            <RouterLink to="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-xs font-bold border border-slate-700 bg-slate-900 text-white hover:bg-slate-800 rounded-xl">
                {lang === 'id' ? 'Daftar Akun' : 'Create Account'}
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
            <a href="#purpose" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Tujuan Aplikasi' : 'App Purpose'}</a>
            <a href="#cdn-streaming" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'CDN & Streaming' : 'CDN & Streaming'}</a>
            <a href="#features" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Fitur' : 'Features'}</a>
            <RouterLink to="/privacy" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Kebijakan Privasi' : 'Privacy Policy'}</RouterLink>
            <RouterLink to="/terms" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Ketentuan Layanan' : 'Terms of Service'}</RouterLink>
            <RouterLink to="/login" className="hover:text-slate-300 transition-colors">{lang === 'id' ? 'Masuk Dashboard' : 'Dashboard Login'}</RouterLink>
          </div>
        </div>
      </footer>
    </div>
  )
}
