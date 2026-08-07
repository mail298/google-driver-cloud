import { Star } from 'lucide-react'

export function StarredPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-900/30">
        <Star className="h-8 w-8 text-yellow-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Starred Files</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Fitur Starred belum tersedia. Segera hadir — tandai file favorit Anda untuk akses cepat.
      </p>
    </div>
  )
}
