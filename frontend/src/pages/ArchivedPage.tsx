import { Archive } from 'lucide-react'

export function ArchivedPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
        <Archive className="h-8 w-8 text-orange-500" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Archived Files</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        Fitur Archive belum tersedia. Segera hadir — simpan file lama tanpa mengotori workspace aktif Anda.
      </p>
    </div>
  )
}
