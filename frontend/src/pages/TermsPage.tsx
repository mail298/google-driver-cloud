import { Link } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Seo } from '@/components/common/Seo'
import { LanguageSwitcher } from '@/components/drive/LanguageSwitcher'
import { useLanguage } from '@/context/LanguageContext'

export function TermsPage() {
  const { lang } = useLanguage()

  const isId = lang === 'id'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Seo
        title={isId ? "Ketentuan Layanan - drive9 Google Drive Gateway" : "Terms of Service - drive9 Google Drive Gateway"}
        description={isId ? "Ketentuan penggunaan layanan drive9 untuk pengelolaan cloud storage Google Drive dan API Key pengembang." : "Terms of service for drive9 Google Drive storage gateway and developer API keys."}
        canonicalUrl="https://drive9.wn-cdn.net/terms"
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
                "name": isId ? "Ketentuan Layanan" : "Terms of Service",
                "item": "https://drive9.wn-cdn.net/terms"
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
              {isId ? 'Ketentuan Layanan' : 'Terms of Service'}
            </li>
          </ol>
        </nav>

        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            <FileText className="h-4 w-4" />
            <span>{isId ? 'Ketentuan Layanan' : 'Terms of Service'}</span>
          </div>
          <h1 className="text-3xl font-black text-white">
            {isId ? 'Ketentuan Layanan drive9' : 'Terms of Service for drive9'}
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            {isId ? 'Terakhir diperbarui: 8 Agustus 2026' : 'Last updated: August 8, 2026'}
          </p>
        </div>

        {isId ? (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">1. Penerimaan Ketentuan</h2>
              <p className="text-xs text-slate-300">
                Dengan mengakses atau menggunakan <strong>drive9</strong>, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan layanan kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. Deskripsi Layanan</h2>
              <p className="text-xs text-slate-300">
                drive9 menyediakan platform gateway penyimpanan Google Drive yang memungkinkan pengguna terdaftar menghubungkan akun Google, mengelola streaming file, mengorganisasi folder virtual, dan menggunakan endpoint REST API developer.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. Tanggung Jawab Pengguna</h2>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                <li>Pengguna bertanggung jawab penuh dalam menjaga kerahasiaan kredensial akun dan API key mereka.</li>
                <li>Pengguna setuju untuk tidak mengunggah konten ilegal, berbahaya, atau melanggar hak cipta pihak ketiga melalui drive9.</li>
                <li>Pengguna wajib mematuhi Ketentuan Layanan resmi Google Drive saat menghubungkan akun Google.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Batasan Tanggung Jawab</h2>
              <p className="text-xs text-slate-300">
                drive9 disediakan atas dasar "SEBAGAIMANA ADANYA" (AS IS) dan "SEBAGAIMANA TERSEDIA" (AS AVAILABLE). Kami tidak bertanggung jawab atas kehilangan data, gangguan layanan, atau kendala akun pihak ketiga di luar kendali langsung kami.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Perubahan Ketentuan</h2>
              <p className="text-xs text-slate-300">
                Kami berhak memperbarui Ketentuan Layanan ini sewaktu-waktu. Penggunaan berkelanjutan atas drive9 setelah pembaruan menandakan persetujuan Anda terhadap ketentuan yang telah dimodifikasi.
              </p>
            </section>
          </div>
        ) : (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
              <p className="text-xs text-slate-300">
                By accessing or using <strong>drive9</strong>, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">2. Description of Service</h2>
              <p className="text-xs text-slate-300">
                drive9 provides a Google Drive storage gateway allowing registered users to connect Google accounts, manage file streaming, organize virtual folders, and interact with developer API endpoints.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">3. User Responsibilities</h2>
              <ul className="list-disc pl-5 space-y-2 text-xs text-slate-300">
                <li>Users are responsible for maintaining the confidentiality of their account credentials and API keys.</li>
                <li>Users agree not to upload illegal, harmful, or infringing content through drive9.</li>
                <li>Users must comply with Google Drive Terms of Service when connecting Google accounts.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">4. Limitation of Liability</h2>
              <p className="text-xs text-slate-300">
                drive9 is provided on an "AS IS" and "AS AVAILABLE" basis. We are not liable for data loss, service interruptions, or third-party storage account issues beyond our direct control.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Changes to Terms</h2>
              <p className="text-xs text-slate-300">
                We reserve the right to update these Terms of Service at any time. Continued use of drive9 following updates constitutes acceptance of modified terms.
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
