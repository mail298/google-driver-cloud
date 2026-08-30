import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/common/Seo'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'

export function PrivacyPage() {
  const { lang } = useLanguage()

  const isId = lang === 'id'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Seo
        title={isId ? "Kebijakan Privasi - drive9 Google Drive Gateway" : "Privacy Policy - drive9 Google Drive Gateway"}
        description={isId ? "Kebijakan privasi resmi drive9 dalam perlindungan data akun Google Drive pengguna dan enkripsi OAuth AES-256." : "Official drive9 privacy policy regarding user Google Drive data protection and AES-256 OAuth encryption."}
        canonicalUrl="https://drive9.wn-cdn.net/privacy"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": isId ? "Beranda" : "Home",
                "item": "https://drive9.wn-cdn.net/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": isId ? "Kebijakan Privasi" : "Privacy Policy",
                "item": "https://drive9.wn-cdn.net/privacy"
              }
            ]
          }
        ]}
      />
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mr-4 text-xs font-bold">
              <ArrowLeft className="h-4 w-4" />
              <span>{isId ? 'Kembali ke Beranda' : 'Back to Home'}</span>
            </Link>
            <img src="/logo-sm.webp" alt="drive9 logo" width="36" height="36" className="h-9 w-9 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800" />
            <span className="text-lg font-black text-white">drive9</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/login">
              <Button size="sm" className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500 font-bold">
                {isId ? 'Masuk' : 'Sign In'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        {/* Semantic Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link to="/" className="hover:text-blue-400 transition-colors">
                {isId ? 'Beranda' : 'Home'}
              </Link>
            </li>
            <li aria-hidden="true" className="text-slate-600">/</li>
            <li className="text-slate-200 font-semibold" aria-current="page">
              {isId ? 'Kebijakan Privasi' : 'Privacy Policy'}
            </li>
          </ol>
        </nav>

        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>{isId ? 'Kebijakan Privasi & Perlindungan Data Pengguna Google' : 'Privacy Policy & Google User Data Protection'}</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            {isId ? 'Kebijakan Privasi drive9' : 'Privacy Policy for drive9'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {isId ? 'Terakhir diperbarui: 8 Agustus 2026' : 'Last updated: August 8, 2026'}
          </p>
        </div>

        {isId ? (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" />
                1. Ringkasan & Penggunaan Data Pengguna Google
              </h2>
              <p>
                <strong>drive9</strong> ("kami", "milik kami", atau "kita") menyediakan gateway penyimpanan Google Drive yang memungkinkan pengguna mengelola unggahan file, mengorganisasi folder virtual, dan memantau kuota penyimpanan. Kebijakan Privasi ini menjelaskan bagaimana kami mengelola data pengguna dan secara eksplisit mematuhi <strong className="text-white">Google API Services User Data Policy</strong>, termasuk persyaratan Penggunaan Terbatas (*Limited Use requirements*).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. Informasi yang Kami Kumpulkan</h2>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                <li><strong>Kredensial Akun:</strong> Alamat email dan kata sandi yang telah di-hash dengan Argon2 untuk pengguna yang terdaftar.</li>
                <li><strong>Token Google OAuth:</strong> Token Akses & Token Pembaruan (OAuth Access & Refresh Tokens) yang dienkripsi khusus untuk berkomunikasi dengan API Google Drive atas nama Anda.</li>
                <li><strong>Metadata File:</strong> Nama file, ukuran dalam byte, tipe MIME, dan struktur folder virtual yang dibuat di dalam drive9.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. Bagaimana Kami Menggunakan Akses Google Drive</h2>
              <p className="text-xs text-slate-300">
                drive9 meminta akses ke Google Drive secara ketat hanya untuk tujuan-tujuan berikut:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                <li>Membuat folder induk khusus yang terisolasi bernama <code className="text-indigo-300 font-mono">9drive</code> di Google Drive pengguna.</li>
                <li>Mengalirkan (*streaming*) file unggahan yang diminta pengguna secara langsung ke penyimpanan Google Drive tanpa perantara disk lokal server.</li>
                <li>Mengambil informasi kuota penyimpanan untuk menampilkan kapasitas yang tersedia di seluruh akun yang terhubung.</li>
              </ul>
              <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                Kami TIDAK MEMBACA, MEMINDAI, MENYIMPAN, ATAU MENJUAL file pribadi, dokumen, atau data apa pun di luar operasi yang secara eksplisit diminta oleh pengguna drive9.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Enkripsi Data & Keamanan</h2>
              <p className="text-xs text-slate-300">
                Keamanan adalah prioritas tertinggi kami. Seluruh token Google OAuth yang tersimpan dalam basis data kami dienkripsi menggunakan standar industri <strong>enkripsi AES-256-GCM</strong>. File yang diunggah dialirkan melalui saluran HTTPS yang aman langsung ke Google Drive dan tidak pernah disimpan di disk fisik server lokal.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Kendali Pengguna & Penghapusan Data</h2>
              <p className="text-xs text-slate-300">
                Pengguna memegang kendali penuh atas akun Google yang terhubung. Anda dapat memutuskan koneksi akun Google Anda kapan saja langsung melalui menu Pengaturan drive9 atau mencabut izin akses secara langsung melalui halaman <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-blue-400 underline">Pengaturan Keamanan Akun Google</a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">6. Hubungi Kami</h2>
              <p className="text-xs text-slate-300">
                Jika Anda memiliki pertanyaan seputar Kebijakan Privasi ini, silakan hubungi tim dukungan kami melalui email di <code className="text-blue-400">windrinofedri944@gmail.com</code>.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400" />
                1. Overview & Google User Data Usage
              </h2>
              <p>
                <strong>drive9</strong> ("we", "our", or "us") provides a Google Drive storage gateway allowing users to manage file uploads, organize virtual folders, and monitor storage quotas. This Privacy Policy outlines how we handle user data and explicitly complies with the <strong className="text-white">Google API Services User Data Policy</strong>, including Limited Use requirements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                <li><strong>Account Credentials:</strong> Email address and hashed passwords for registered users.</li>
                <li><strong>Google OAuth Tokens:</strong> Encrypted Google OAuth Access & Refresh Tokens used exclusively to communicate with Google Drive APIs on your behalf.</li>
                <li><strong>Metadata:</strong> File names, size bytes, MIME types, and virtual folder structures created within drive9.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. How We Use Google Drive Access</h2>
              <p className="text-xs text-slate-300">
                drive9 requests access to Google Drive strictly for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                <li>Creating a dedicated, isolated root folder named <code className="text-indigo-300 font-mono">9drive</code> in the user's Google Drive.</li>
                <li>Streaming file uploads requested by the user directly to Google Drive storage.</li>
                <li>Fetching storage quota information to display available space across connected accounts.</li>
              </ul>
              <p className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                We DO NOT read, scan, store, or sell any personal files, documents, or data outside the user-requested drive9 operations.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Data Encryption & Security</h2>
              <p className="text-xs text-slate-300">
                Security is our highest priority. All Google OAuth tokens stored in our database are encrypted using industry-standard <strong>AES-256-GCM encryption</strong>. Uploaded files are streamed through secure HTTPS channels directly to Google Drive and are never stored on local server disks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. User Control & Data Deletion</h2>
              <p className="text-xs text-slate-300">
                Users retain full ownership and control over their connected Google accounts. You can disconnect your Google account or revoke access at any time directly through the drive9 Settings page or via the <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer" className="text-blue-400 underline">Google Security Settings</a> page.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">6. Contact Us</h2>
              <p className="text-xs text-slate-300">
                If you have any questions regarding this Privacy Policy, please contact our support team at <code className="text-blue-400">windrinofedri944@gmail.com</code>.
              </p>
            </section>
          </div>
        )}

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 drive9. {isId ? 'Seluruh hak cipta dilindungi.' : 'All rights reserved.'}
        </div>
      </main>
    </div>
  )
}
