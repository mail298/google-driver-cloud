# ☁️ Drive Portal Client (cliend)

Sistem Portal Klien & Management User yang terintegrasi dengan **9drive Gateway**. Menghubungkan dan menggabungkan banyak akun Google Drive menjadi **Satu Master Storage Pool** yang dapat dialokasikan dan dikelola secara aman untuk masing-masing pengguna (Client User).

---

## 🌟 Fitur Utama

### 👥 1. Manajemen Pengguna & Alokasi Kuota (Admin Dashboard)
- **Master Storage Pooling**: Secara otomatis membaca dan menggabungkan total kapasitas dari seluruh akun Google Drive yang terhubung di 9drive.
- **Kalkulator Alokasi Real-Time**: Menghitung secara presisi sisa *pool storage* yang tersedia saat mendaftarkan pengguna baru atau mengedit kuota.
- **Target Root Folder Per User**: Mendukung pengikatan pengguna ke *Root Folder ID* spesifik di Google Drive untuk isolasi berkas antar klien.
- **Manajemen Akun Lengkap**: Tambah, edit username/password, ubah role (Admin / Client), ubah kuota storage, dan hapus pengguna.

### 📁 2. Storage & Workspace Dashboard (Client User)
- **Upload & Storage Pooling**: Upload berkas langsung terdistribusi otomatis ke akun Google Drive yang memiliki sisa kapasitas terbesar.
- **Navigasi Folder & Breadcrumb**: Pengorganisasian berkas dalam hirarki folder yang rapi dan responsif.
- **Preview & Streaming Media**: Dukungan pratinjau gambar, video, dokumen, dan musik secara langsung.
- **Download Proxy**: Akses unduh cepat langsung dari Google Drive dengan penanganan dekripsi token secara aman.
- **Aksi Massal (Bulk Operations)**: Hapus banyak berkas sekaligus dan manajemen tautan berbagi (*Share Link*).

### 🛡️ 3. Keamanan Tingkat Tinggi (Security Suite)
- **Admin IP Whitelist**: Pembatasan akses Admin Dashboard berdasarkan alamat IP client yang diizinkan.
- **Proteksi CSRF**: Token Anti-CSRF pada setiap formulir POST.
- **Rate Limiting & Lockout**: Proteksi *brute-force* login dengan penguncian otomatis setelah batas batas gagal tercapai.
- **Enkripsi Token AES-256-GCM**: Dekripsi token akses Google Drive secara aman di memori server.

---

## 🏗️ Arsitektur Sistem

```
                      ┌─────────────────────────────────────────┐
                      │            ADMIN / CLIENT USER          │
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                             DRIVE PORTAL (cliend - PHP)                          │
│  - Dashboard UI                                  - User & Quota Management       │
│  - Admin Controls & IP Whitelist                 - Storage Capacity Calculator   │
└──────────────────────────┬───────────────────────────────┬───────────────────────┘
                           │                               │
                           ▼ (Upload Stream)               ▼ (Metadata & Quota)
┌──────────────────────────────────────────────┐  ┌────────────────────────────────┐
│         9drive Gateway API (Port 4000)        │  │       MySQL Database (9drive)   │
│  - Multi-account Storage Router              │  │  - storage_accounts            │
│  - Auto-fallback Akun Penuh                  │  │  - files & folders metadata    │
└──────────────────────────┬───────────────────┘  └────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE DRIVE CLOUD STORAGE                          │
│   Akun 1: windrinofedri944@gmail.com (5 TB)                                      │
│   Akun 2: windrinofedri123@gmail.com (15 GB)                                     │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Persyaratan Sistem

- **PHP**: `>= 8.0` (membutuhkan ekstensi `curl`, `pdo_mysql`, `openssl`, `mbstring`)
- **MySQL**: `>= 5.7` / MariaDB
- **Web Server**: Apache / Nginx / PHP Built-in CLI Server
- **Node.js Gateway**: Server **9drive** berjalan di `http://localhost:4000`

---

## ⚙️ Panduan Instalasi & Pengaturan

### 1. Kloning Repository
```bash
git clone https://github.com/mail298/google-driver-cloud.git
cd cliend
```

### 2. Salin Konfigurasi `.env`
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```

### 3. Konfigurasi File `.env`
Sesuaikan variabel di `.env` dengan kredensial sistem kamu:
```env
# Database MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=9drive
DB_USER=root
DB_PASS=

# 9drive Gateway Integration
GATEWAY_API_URL=http://localhost:4000
GATEWAY_API_KEY=9d_live_your_api_key_here
GATEWAY_MASTER_STORAGE_GB=5120

# Google OAuth Credentials & Token Decryption Key
TOKEN_ENCRYPTION_KEY=change-this-encryption-key-32bytes!
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Keamanan Admin IP Whitelist
ADMIN_IP_WHITELIST_ENABLED=false
ADMIN_ALLOWED_IPS=127.0.0.1,::1
```

### 4. Jalankan Web Server
Gunakan server PHP bawaan untuk pengembangan lokal:
```bash
php -S 0.0.0.0:7878 -t public
```
Akses portal melalui browser di **`http://localhost:7878`**.

---

## 🔑 Kredensial Default

- **Admin Portal**: `http://localhost:7878/login`
  - Username: `admin`
  - Password: `adminpass`
- **Client Portal**: `http://localhost:7878/login`
  - Username: `clientA`
  - Password: `clientpass`

---

## 📁 Struktur Direktori Project

```
cliend/
├── config/
│   └── users.json            # Penyimpanan data pengguna portal
├── public/
│   ├── assets/               # CSS, JS (portal.js), dan aset visual
│   └── index.php             # Front controller & routing utama
├── src/
│   ├── Controllers/
│   │   ├── AdminController.php         # Manajemen admin & pengguna
│   │   ├── AuthController.php          # Otentikasi & sesi
│   │   ├── DashboardController.php     # Tampilan dashboard & kuota
│   │   ├── DownloadProxyController.php # Proxy download berkas
│   │   └── UploadController.php        # Handler upload ke gateway
│   ├── Models/
│   │   ├── IpWhitelistModel.php        # Model IP Whitelist
│   │   ├── PortalModel.php             # Operasi database & token GDrive
│   │   ├── SecurityModel.php           # Proteksi CSRF & Rate Limit
│   │   └── UserModel.php               # Manajemen pengguna
│   └── Views/
│       ├── admin.php                   # Tampilan Dashboard Admin
│       ├── dashboard.php               # Tampilan Dashboard Client
│       └── login.php                   # Tampilan Halaman Login
├── .env.example              # Template konfigurasi environment
├── .env                      # File variabel lingkungan aktif
└── README.md                 # Dokumentasi resmi project
```

---

## 🛡️ Lisensi & Kontribusi
Dikembangkan untuk mendukung integrasi penyatuan cloud storage multi-account yang aman dan skalabel.
