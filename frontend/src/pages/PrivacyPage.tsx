import { Link } from 'react-router-dom'
import { HardDrive, ArrowLeft, ShieldCheck, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrivacyPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <ShieldCheck className="h-4 w-4" />
            <span>Privacy Policy & Google User Data Protection</span>
          </div>
          <h1 className="text-3xl font-black text-white">Privacy Policy for drive9</h1>
          <p className="text-xs text-slate-400 font-mono">Last updated: August 8, 2026</p>
        </div>

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
              If you have any questions regarding this Privacy Policy, please contact our support team at <code className="text-blue-400">wakmail262@gmail.com</code>.
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
