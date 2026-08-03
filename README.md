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
│         SuperDriver Gateway API (Port 4000)        │  │       MySQL Database (SuperDriver)   │
│  - Multi-account Storage Router              │  │  - storage_accounts            │
│  - Auto-fallback Akun Penuh                  │  │  - files & folders metadata    │
└──────────────────────────┬───────────────────┘  └────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              GOOGLE DRIVE CLOUD STORAGE                          │
│   Akun 1: [EMAIL_ADDRESS] (5 TB)                                      │
│   Akun 2: [EMAIL_ADDRESS] (15 GB)                                     │
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

## 🐳 Deployment dengan Docker

### Prasyarat
- [Docker](https://docs.docker.com/get-docker/) ≥ 20.x
- [Docker Compose](https://docs.docker.com/compose/install/) ≥ 2.x

### Langkah Deploy

**1. Salin dan Konfigurasi `.env`:**
```bash
cp .env.example .env
# Edit .env dengan kredensial yang sesuai
```

**2. Bangun dan Jalankan Container:**
```bash
docker compose up -d --build
```

**3. Akses Portal:**
Portal akan berjalan di **`http://localhost:7878`** (default, sesuai `PORTAL_PORT` di `.env`).

### Variabel Docker Penting

| Variabel | Default | Keterangan |
|---|---|---|
| `PORTAL_PORT` | `7878` | Port host untuk mengakses portal |
| `DB_HOST` | `db` | Nama service MySQL di Docker network |
| `DB_EXPOSE_PORT` | `3307` | Port MySQL yang diekspos ke host |
| `GATEWAY_API_URL` | `http://gateway:4000` | URL 9drive Gateway di dalam network |

### Integrasi dengan 9drive (Satu Network)

Jika 9drive dan cliend dijalankan terpisah namun ingin saling terhubung, hubungkan keduanya ke external network yang sama:

```yaml
# Di docker-compose.yml cliend, tambahkan:
networks:
  default:
    external:
      name: superdriver-network
```

```bash
# Buat network terlebih dahulu
docker network create superdriver-network

# Jalankan 9drive dulu, lalu cliend
docker compose -f ../9drive/docker-compose.yml up -d
docker compose up -d --build
```

Lalu di `.env` cliend, set:
```env
GATEWAY_API_URL=http://backend:4000
DB_HOST=db
```

### Perintah Docker Berguna
```bash
# Lihat status container
docker compose ps

# Lihat log real-time
docker compose logs -f portal

# Stop semua container
docker compose down

# Stop dan hapus semua data (volume)
docker compose down -v
```

---

## 🔑 Kredensial Default

- **Admin Portal**: `http://localhost:7878/login`
  - Username: `admin`
  - Password: `adminpass`
- **Client Portal**: `http://localhost:7878/login`
  - Username: `clientA`
  - Password: `clientpass`

---

## 🚀 CDN & Media Delivery Architecture

- **Google Image Edge CDN (`lh3.googleusercontent.com`)**: Gambar dan pratinjau dikirimkan langsung dari Google Edge CDN tanpa membebankan bandwidth server lokal.
- **Adaptive Video & Audio Streaming (HLS & HTTP 206)**: Dukungan streaming video adaptif HLS master playlist (`.m3u8`) serta HTTP 206 Partial Content dengan penguraian chunk 4MB untuk *instant video startup*.
- **Direct Upload CDN**: Upload file berukuran besar melampaui `UPLOAD_DIRECT_THRESHOLD_BYTES` dialihkan langsung ke endpoint CDN (`UPLOAD_DIRECT_URL`) untuk menghindari kendala `post_max_size` PHP.
- **Local Disk Cache**: Aset media hingga 30MB disimpankan ke `storage/cache/files` dengan strategi *eviction* otomatis hingga batas 1GB.

---

## 📊 JSON Debug Logging System

Sistem mencatat setiap error dan event debug ke dalam berkas `storage/logs/debug.json` dalam format JSON yang terstruktur per baris (*JSON Lines*):

```json
{
  "id": "log_66b2a1f09c8a1",
  "username": "client",
  "debug_error": "Download failed: File not found or access denied for ID '123'",
  "timestamp": "2026-08-03T15:18:00+07:00",
  "level": "ERROR",
  "ip": "127.0.0.1",
  "request_uri": "/download?id=123"
}
```

---

## 📁 Struktur Direktori Project

```
cliend/
├── config/
│   └── users.json            # Penyimpanan data pengguna portal
├── public/
│   ├── assets/               # CSS, JS (portal.js), dan aset visual
│   └── index.php             # Front controller, routing, & exception handler
├── src/
│   ├── Controllers/
│   │   ├── AdminController.php         # Manajemen admin & pengguna
│   │   ├── AuthController.php          # Otentikasi, sesi, & rate limiting
│   │   ├── DashboardController.php     # Tampilan dashboard & kuota
│   │   ├── DownloadProxyController.php # Proxy download & CDN image engine
│   │   ├── StreamController.php        # Streaming video HLS & embed player
│   │   └── UploadController.php        # Handler upload ke gateway & CDN
│   ├── Services/
│   │   └── LoggerService.php           # Service logging debug berformat JSON
│   ├── Models/
│   │   ├── IpWhitelistModel.php        # Model IP Whitelist
│   │   ├── PortalModel.php             # Operasi database & token GDrive
│   │   ├── SecurityModel.php           # Proteksi CSRF & Rate Limit
│   │   └── UserModel.php               # Manajemen pengguna
│   └── Views/
│       ├── admin.php                   # Tampilan Dashboard Admin
│       ├── dashboard.php               # Tampilan Dashboard Client
│       ├── embed.php                   # Pemutar Video Embed
│       └── login.php                   # Tampilan Halaman Login
├── storage/
│   ├── cache/                # Cache berkas media lokal (SSD)
│   └── logs/                 # Berkas log JSON (debug.json)
├── .env.example              # Template konfigurasi environment
├── .env                      # File variabel lingkungan aktif
└── README.md                 # Dokumentasi resmi project
```

---

## 🛡️ Lisensi & Kontribusi
Dikembangkan untuk mendukung integrasi penyatuan cloud storage multi-account yang aman dan skalabel.
