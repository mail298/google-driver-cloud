import { Clock } from 'lucide-react'

export function RecentPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
        <Clock className="h-8 w-8 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Recent Files</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Fitur Recent belum tersedia. Segera hadir — lihat file yang terakhir Anda buka atau ubah.
      </p>
    </div>
  )
}
