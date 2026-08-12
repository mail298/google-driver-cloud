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
  lang_english: { id: 'English', en: 'English' },

  // API Keys Page
  api_gateway_badge: { id: 'DEVELOPER API GATEWAY v1', en: 'DEVELOPER API GATEWAY v1' },
  api_title: { id: 'API Keys & Dokumentasi Developer', en: 'API Keys & Developer Documentation' },
  api_subtitle: { id: 'Integrasikan 9Drive ke aplikasi web, script, atau landing page Anda. Upload file langsung ke folder virtual tanpa konfigurasi.', en: 'Integrate 9Drive into your web apps, scripts, or landing pages. Upload files directly into virtual folders with zero config.' },
  api_btn_create: { id: 'Buat API Key', en: 'Create API Key' },
  api_stat_active: { id: 'Key Aktif', en: 'Active Keys' },
  api_stat_used: { id: 'Key Digunakan', en: 'Used Keys' },
  api_stat_endpoints: { id: 'Endpoint Siap', en: 'Endpoints Ready' },
  api_toast_copied: { id: 'Berhasil disalin ke clipboard! ✨', en: 'Copied to clipboard! ✨' },
  api_toast_copy_fail: { id: 'Gagal menyalin.', en: 'Failed to copy.' },
  api_secret_title: { id: 'Salin Secret API Key Anda Sekarang!', en: 'Copy Your Secret API Key Now!' },
  api_secret_desc: { id: 'Key ini hanya ditampilkan SATU KALI. Simpan di environment variable yang aman sebelum menutup.', en: 'This key will only be shown ONCE. Store it in a secure environment variable.' },
  api_secret_btn_copy: { id: 'Salin Secret Key', en: 'Copy Secret Key' },
  api_keys_card_title: { id: 'API Keys Anda', en: 'Your API Keys' },
  api_keys_card_desc: { id: 'Key memberikan izin ke aplikasi eksternal untuk mengupload dan mengelola file.', en: 'Keys give external apps permission to upload and manage files.' },
  api_keys_btn_new: { id: '+ Baru', en: '+ New' },
  api_keys_empty_title: { id: 'Belum ada API Key', en: 'No API keys yet' },
  api_keys_empty_desc: { id: 'Buat API key pertama Anda untuk mulai berintegrasi.', en: 'Create your first API key to start integrating.' },
  api_keys_created: { id: 'Dibuat:', en: 'Created:' },
  api_keys_last_used: { id: 'Terakhir dipakai:', en: 'Last used:' },
  api_keys_never: { id: 'Belum pernah', en: 'Never' },
  api_auth_headers_title: { id: 'Header Autentikasi yang Didukung', en: 'Supported Auth Headers' },
  api_auth_headers_desc: { id: 'Anda dapat mengirimkan API key dalam salah satu format header:', en: 'You can send your API key in either header format:' },
  api_docs_title: { id: 'Dokumentasi API', en: 'API Documentation' },
  api_docs_desc: { id: 'Spesifikasi interaktif & contoh code snippet.', en: 'Interactive specs & code snippets.' },
  api_tab_upload: { id: 'POST Upload', en: 'POST Upload' },
  api_tab_files: { id: 'GET Files', en: 'GET Files' },
  api_tab_folders: { id: 'GET Folders', en: 'GET Folders' },
  api_upload_params: { id: 'Parameter Upload', en: 'Upload Parameters' },
  api_upload_auto_folder: { id: '✨ Otomatis buat folder', en: '✨ Auto-creates folders' },
  api_table_field: { id: 'Field', en: 'Field' },
  api_table_param: { id: 'Param', en: 'Param' },
  api_table_type: { id: 'Tipe', en: 'Type' },
  api_table_status: { id: 'Status', en: 'Status' },
  api_table_description: { id: 'Deskripsi', en: 'Description' },
  api_query_params: { id: 'Query Parameter', en: 'Query Parameters' },
  api_response_fields: { id: 'Field Response', en: 'Response Fields' },
  api_response_example: { id: 'Contoh Response (JSON)', en: 'Response Example (JSON)' },
  api_btn_copy: { id: 'Salin', en: 'Copy' },
  api_modal_create_title: { id: 'Buat API Key', en: 'Create API Key' },
  api_modal_create_desc: { id: 'API key mengizinkan aplikasi eksternal mengupload dan mengelola file.', en: 'API keys allow external applications to upload and manage files.' },
  api_modal_key_name: { id: 'Nama Key', en: 'Key Name' },
  api_modal_placeholder: { id: 'contoh: Form Landing Page, Script Backup', en: 'e.g. Landing Page Form, Backup Script' },
  api_modal_cancel: { id: 'Batal', en: 'Cancel' },
  api_modal_creating: { id: 'Membuat...', en: 'Creating...' },
  api_modal_submit: { id: 'Buat API Key', en: 'Create API Key' },
  api_modal_expiration: { id: 'Masa Berlaku (Expiration)', en: 'Key Expiration' },
  api_modal_scopes: { id: 'Hak Akses (Scopes)', en: 'Permissions (Scopes)' },
  api_scope_read: { id: 'Baca File & Folder (files:read)', en: 'Read Files & Folders (files:read)' },
  api_scope_upload: { id: 'Upload File (files:upload)', en: 'Upload Files (files:upload)' },
  api_expiration_never: { id: 'Selamanya (Tidak pernah kadaluarsa)', en: 'Never (No expiration)' },
  api_expiration_7d: { id: '7 Hari', en: '7 Days' },
  api_expiration_30d: { id: '30 Hari', en: '30 Days' },
  api_expiration_90d: { id: '90 Hari', en: '90 Days' },
  api_expiration_1y: { id: '1 Tahun', en: '1 Year' },
  api_status_active: { id: 'Aktif', en: 'Active' },
  api_status_revoked: { id: 'Dicabut', en: 'Revoked' },

  // Quota Tracker
  quota_title: { id: 'Pemantau Kuota', en: 'Quota Tracker' },
  quota_desc: { id: 'Pantau dan kelola batas penyimpanan penyedia terhubung.', en: 'Track and manage connected provider storage limits.' },
  quota_auto_refresh: { id: 'Auto-refresh', en: 'Auto-refresh' },
  quota_on: { id: 'Aktif', en: 'On' },
  quota_off: { id: 'Nonaktif', en: 'Off' },
  quota_refresh: { id: 'Perbarui', en: 'Refresh' },
  quota_refreshing: { id: 'Memperbarui...', en: 'Refreshing...' },
  quota_connect_drive: { id: 'Hubungkan Drive', en: 'Connect Drive' },
  quota_total_storage: { id: 'Total Penyimpanan', en: 'Total Storage' },
  quota_used_storage: { id: 'Terpakai', en: 'Used Storage' },
  quota_available: { id: 'Tersedia', en: 'Available' },
  quota_accounts: { id: 'Akun Terhubung', en: 'Connected Accounts' },

  // Change Password Form & Messages
  pwd_title: { id: 'Ubah Password Akun', en: 'Change Account Password' },
  pwd_desc: { id: 'Perbarui password akun 9Drive Anda agar bisa digunakan untuk login manual via email.', en: 'Update your 9Drive account password to enable manual email login.' },
  pwd_google_info_title: { id: 'Petunjuk Pengguna Google / Gmail:', en: 'Tip for Google / Gmail Users:' },
  pwd_google_info_desc: { id: 'Jika Anda daftar via Continue with Google, Anda belum memiliki password manual. Kolom Password Saat Ini bisa dikosongkan. Setelah disimpan, Anda dapat login secara manual (Email & Password) maupun via tombol Google.', en: 'If you signed up via Continue with Google, you do not have a manual password yet. Leave Current Password empty. Once saved, you can log in using either Email & Password or Google.' },
  pwd_current_label: { id: 'Password Saat Ini (opsional jika login awal via Google)', en: 'Current Password (optional if initial login via Google)' },
  pwd_new_label: { id: 'Password Baru (min. 8 karakter)', en: 'New Password (min. 8 characters)' },
  pwd_confirm_label: { id: 'Konfirmasi Password Baru', en: 'Confirm New Password' },
  pwd_btn_save: { id: 'Simpan Password Baru', en: 'Save New Password' },
  pwd_btn_saving: { id: 'Menyimpan...', en: 'Saving...' },
  pwd_err_min: { id: 'Password baru minimal 8 karakter.', en: 'New password must be at least 8 characters long.' },
  pwd_err_mismatch: { id: 'Konfirmasi password tidak cocok.', en: 'Password confirmation does not match.' },
  pwd_err_current_required: { id: 'Password saat ini wajib diisi.', en: 'Current password is required to update your password.' },
  pwd_err_current_invalid: { id: 'Password saat ini tidak cocok.', en: 'Current password does not match.' },
  pwd_success: { id: 'Password berhasil diperbarui!', en: 'Password updated successfully!' },
  pwd_hint_current: { id: '💡 Kosongkan jika Anda daftar via Google dan ini pertama kali membuat password.', en: '💡 Leave blank if you signed up via Google and this is your first time setting a password.' },
  pwd_hint_new: { id: '🔒 Gunakan minimal 8 karakter.', en: '🔒 Must be at least 8 characters long.' },
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
