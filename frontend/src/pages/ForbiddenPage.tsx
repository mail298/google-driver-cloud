import { ShieldAlert, Lock, Server } from 'lucide-react'

export function ForbiddenPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-8 overflow-hidden select-none font-sans">
      {/* Dynamic ambient glowing backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-slate-900/40 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border border-rose-500/20 bg-slate-900/60 p-8 sm:p-10 text-center backdrop-blur-2xl shadow-2xl shadow-rose-950/30 transition-all duration-300">
        
        {/* Top Floating Badge & Shield Icon */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-rose-500/20 to-red-600/10 border border-rose-500/30 shadow-lg shadow-rose-500/10">
          <div className="absolute -inset-1 rounded-2xl bg-rose-500/20 blur-sm animate-pulse" />
          <ShieldAlert className="relative h-10 w-10 text-rose-500" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-rose-400 uppercase mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          403 Access Denied
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
          Akses IP Dibatasi
        </h1>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            Whitelist Enforced
          </span>
          <span className="flex items-center gap-1.5">
            <Server className="h-3.5 w-3.5 text-slate-400" />
            9Drive Security System
          </span>
        </div>
      </div>
    </main>
  )
}
