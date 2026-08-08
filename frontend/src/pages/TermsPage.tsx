import { Link } from 'react-router-dom'
import { HardDrive, ArrowLeft, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mr-4 text-xs font-bold">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <HardDrive className="h-4 w-4" />
            </div>
            <span className="text-lg font-black text-white">drive9</span>
          </div>
          <Link to="/login">
            <Button size="sm" className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-500 font-bold">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        <div className="space-y-3 border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
            <FileText className="h-4 w-4" />
            <span>Terms of Service</span>
          </div>
          <h1 className="text-3xl font-black text-white">Terms of Service for drive9</h1>
          <p className="text-xs text-slate-400 font-mono">Last updated: August 8, 2026</p>
        </div>

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

        <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 drive9. All rights reserved.
        </div>
      </main>
    </div>
  )
}
