import { useState, useRef, useEffect } from 'react'
import { Globe, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage, type Language } from '@/context/LanguageContext'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectLanguage(newLang: Language) {
    setLang(newLang)
    setOpen(false)
  }

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-9 px-2.5 font-bold text-xs border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm"
        aria-label={t('lang_switcher_title')}
        title={t('lang_switcher_title')}
      >
        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <span className="uppercase tracking-wider font-extrabold">{lang}</span>
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 z-[90] w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/95 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1">
            {t('lang_switcher_title')}
          </div>
          <button
            type="button"
            onClick={() => selectLanguage('id')}
            className={cn(
              'w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors select-none',
              lang === 'id'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇮🇩</span>
              <span>Bahasa Indonesia</span>
            </div>
            {lang === 'id' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
          <button
            type="button"
            onClick={() => selectLanguage('en')}
            className={cn(
              'w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors select-none',
              lang === 'en'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">🇺🇸</span>
              <span>English</span>
            </div>
            {lang === 'en' && <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
        </div>
      )}
    </div>
  )
}
