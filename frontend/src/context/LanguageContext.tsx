import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export type Language = 'id' | 'en'

type Dictionary = Record<string, { id: string; en: string }>

export const translations: Dictionary = {
  // Navigation & Menu
  nav_all_files: { id: 'Semua File', en: 'All Files' },
  nav_quota: { id: 'Pemantau Kuota', en: 'Quota Tracker' },
  nav_shared: { id: 'Dibagikan ke Saya', en: 'Shared With Me' },
  nav_starred: { id: 'Berbintang', en: 'Starred' },
  nav_trash: { id: 'Tempat Sampah', en: 'Recycle Bin' },
  nav_activity: { id: 'Log Aktivitas', en: 'Activity Log' },
  nav_setting: { id: 'Pengaturan', en: 'Setting' },
  nav_api_keys: { id: 'API Keys', en: 'API Keys' },
  nav_user_guide: { id: 'Petunjuk Penggunaan', en: 'User Guide' },
  nav_logout: { id: 'Keluar', en: 'Log Out' },
  nav_connected_accounts: { id: 'Akun Terhubung', en: 'Connected Accounts' },
  nav_connect_manage: { id: 'Hubungkan / Kelola Akun', en: 'Connect / Manage Accounts' },
  nav_no_accounts: { id: 'Belum ada akun Google Drive terhubung', en: 'No Google Drive accounts connected yet' },

  // Header & Search
  header_search_placeholder: { id: 'Cari Dokumen', en: 'Search Documents' },
  header_advanced_filters: { id: 'Filter Pencarian Lanjutan', en: 'Advanced Search Filters' },
  header_clear_all: { id: 'Hapus Semua', en: 'Clear All' },
  header_file_type: { id: 'Jenis File', en: 'File Type' },
  header_all_types: { id: 'Semua Jenis', en: 'All Types' },
  header_connected_account: { id: 'Akun Terhubung', en: 'Connected Account' },
  header_all_accounts: { id: 'Semua Akun', en: 'All Accounts' },
  header_size_range: { id: 'Rentang Ukuran (MB)', en: 'Size Range (MB)' },
  header_date_range: { id: 'Rentang Tanggal', en: 'Date Range' },
  header_cancel: { id: 'Batal', en: 'Cancel' },
  header_apply_filters: { id: 'Terapkan Filter', en: 'Apply Filters' },

  // Toolbar & Selection
  toolbar_upload: { id: 'Upload', en: 'Upload' },
  toolbar_new_folder: { id: 'Folder Baru', en: 'New Folder' },
  toolbar_sync: { id: 'Sinkron', en: 'Sync' },
  toolbar_syncing: { id: 'Menyinkronkan...', en: 'Syncing...' },
  toolbar_select_all: { id: 'Pilih Semua', en: 'Select All' },
  toolbar_recents: { id: 'Terbaru', en: 'Recents' },
  toolbar_starred: { id: 'Berbintang', en: 'Starred' },
  toolbar_items_selected: { id: 'item terpilih', en: 'items selected' },
  toolbar_file: { id: 'file', en: 'file' },
  toolbar_folder: { id: 'folder', en: 'folder' },
  toolbar_move: { id: 'Pindahkan', en: 'Move' },
  toolbar_delete: { id: 'Hapus', en: 'Delete' },
  toolbar_clear: { id: 'Bersihkan', en: 'Clear' },

  // Folder Grid & Headers
  folder_header_folders: { id: 'Folder', en: 'Folders' },
  folder_header_more_folders: { id: 'Folder Lainnya', en: 'More Folders' },
  folder_no_folders: { id: 'Belum ada folder. Klik Folder Baru untuk mengorganisasi file.', en: 'No folders yet. Click New Folder to organize uploads.' },

  // Move Modal
  move_modal_title: { id: 'Pindahkan ke Folder', en: 'Move to Folder' },
  move_modal_moving: { id: 'Memindahkan...', en: 'Moving...' },
  move_modal_current_folder: { id: 'Folder saat ini', en: 'Current folder' },
  move_modal_selected_folder: { id: 'Folder terpilih', en: 'Selected folder' },
  move_modal_subfolder: { id: 'Subfolder dari item terpilih', en: 'Subfolder of selected item' },
  move_modal_root: { id: 'Semua File (Root)', en: 'All Files (Root)' },
  move_modal_cancel: { id: 'Batal', en: 'Cancel' },
  move_modal_submit: { id: 'Pindahkan', en: 'Move' },

  // Delete Modal
  delete_modal_title: { id: 'Hapus Item Terpilih', en: 'Delete Selected Items' },
  delete_modal_confirm: { id: 'Apakah Anda yakin ingin memindahkan item ini ke Tempat Sampah?', en: 'Are you sure you want to move these items to Recycle Bin?' },
  delete_modal_cancel: { id: 'Batal', en: 'Cancel' },
  delete_modal_submit: { id: 'Hapus', en: 'Delete' },

  // Upload Overlay
  upload_drop_title: { id: 'Lepaskan file di sini untuk mengupload secara langsung', en: 'Drop files here to upload instantly' },
  upload_destination: { id: 'Tujuan', en: 'Destination' },
  upload_target_storage: { id: 'Penyimpanan Target', en: 'Target Storage' },
  upload_automatic: { id: 'Otomatis (Default)', en: 'Automatic (Default)' },

  // System Info Dropdown
  sys_info_title: { id: 'Status & Info Workspace', en: 'Workspace Status & Info' },
  sys_info_subtitle: { id: 'Ringkasan koneksi & petunjuk', en: 'Overview of your connections & guidelines' },
  sys_info_conn_status: { id: 'Status Koneksi', en: 'Connection Status' },
  sys_info_google_accounts: { id: 'Akun Google Drive', en: 'Google Drive accounts' },
  sys_info_storage_engine: { id: 'Mesin Penyimpanan', en: 'Storage Engine' },
  sys_info_tips: { id: 'Tips Penggunaan', en: 'Usage Tips' },

  // Language Switcher Label
  lang_switcher_title: { id: 'Bahasa / Language', en: 'Language / Bahasa' },
  lang_indonesian: { id: 'Bahasa Indonesia', en: 'Indonesian' },
  lang_english: { id: 'English', en: 'English' }
}

type LanguageContextType = {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('9drive:lang')
    if (saved === 'en' || saved === 'id') return saved
    return 'id'
  })

  useEffect(() => {
    localStorage.setItem('9drive:lang', lang)
  }, [lang])

  function setLang(newLang: Language) {
    setLangState(newLang)
  }

  function t(key: string): string {
    const item = translations[key]
    if (!item) return key
    return item[lang] || item.id || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
