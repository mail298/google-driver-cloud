import { Link } from 'react-router-dom'
import { HardDrive, ShieldCheck, UploadCloud, KeyRound, FolderTree, ArrowRight, Lock, Database, Sparkles, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* ── Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-md shadow-blue-500/20">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">drive9</span>
              <span className="ml-2 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                Storage Gateway
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="h-9 px-4 text-xs font-bold border-slate-700 text-slate-200 hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20">
                Get Started
              </Button>
            </Link>
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
            <strong className="text-slate-200">drive9</strong> is a secure Google Drive storage gateway allowing users to connect Google Drive accounts, organize virtual folders, track storage quotas, and stream file uploads directly into dedicated cloud storage.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/login">
              <Button className="h-12 px-8 text-sm font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all rounded-xl flex items-center gap-2">
                <span>Sign In with Google</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="h-12 px-8 text-sm font-extrabold border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 rounded-xl">
                Create Account
              </Button>
            </Link>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-slate-800/80 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Zero File Disk Storage</span>
              </div>
              <p className="text-xs text-slate-400">Files stream directly into your Google Drive dedicated <code className="text-indigo-300 font-mono">9drive</code> folder.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>AES-256 Encryption</span>
              </div>
              <p className="text-xs text-slate-400">OAuth tokens are securely encrypted before database persistence.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Multi-Account Quota</span>
              </div>
              <p className="text-xs text-slate-400">Track and route uploads across multiple connected Google accounts.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Public REST API</span>
              </div>
              <p className="text-xs text-slate-400">Granular API Keys for server-to-server uploads & folder access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────── */}
      <section id="features" className="py-20 border-t border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-black text-white">Core Capabilities of drive9</h2>
            <p className="text-slate-400 text-sm">Designed for high-throughput cloud storage management with enterprise security.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <UploadCloud className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Streamed File Uploads</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream multipart and resumable file uploads directly to Google Drive without holding temporary files on disk. Automatically sets sharing permissions for easy access.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <FolderTree className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Virtual Folder Hierarchies</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Organize files in flexible nested virtual folders. Automatically resolves and synchronizes folder paths on Google Drive when requested by external clients.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Developer API Keys</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate secure API keys with granular scope controls (<code className="text-emerald-300 font-mono">files:read</code>, <code className="text-emerald-300 font-mono">files:upload</code>) for backend integrations.
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
              <span>Google OAuth Security & Privacy</span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight">
              How drive9 Handles Your Data & Google Drive Access
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              <strong className="text-slate-200">drive9</strong> accesses Google Drive solely to create and manage files within the user's dedicated <code className="text-indigo-300 font-mono">9drive</code> folder. We respect your data privacy:
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-3">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>OAuth Encryption:</strong> Access & Refresh tokens are encrypted using AES-256-GCM prior to database storage.</span>
              </li>
              <li className="flex items-start gap-3">
                <Database className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>No File Storage on Server:</strong> Uploaded contents are streamed directly to Google Cloud storage without storing files on disk.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <span><strong>User Revocation:</strong> Users can disconnect their Google account at any time from Settings to immediately revoke all token access.</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Application Info</span>
              <span className="text-xs font-mono font-bold text-emerald-400">drive9 v1.0</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-bold text-slate-300">App Name:</p>
                <p className="font-mono text-blue-400 text-sm font-extrabold">drive9</p>
              </div>
              <div>
                <p className="font-bold text-slate-300">Target Google Scope:</p>
                <p className="font-mono text-purple-400">https://www.googleapis.com/auth/drive</p>
              </div>
              <div>
                <p className="font-bold text-slate-300">Storage Destination:</p>
                <p className="text-slate-400">Dedicated Root Folder <code className="text-indigo-300 font-mono font-bold">9drive</code> in User's Google Drive</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <Link to="/privacy" className="text-xs text-blue-400 hover:underline font-semibold">View Privacy Policy →</Link>
              <Link to="/terms" className="text-xs text-blue-400 hover:underline font-semibold">View Terms of Service →</Link>
            </div>
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
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Dashboard Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
