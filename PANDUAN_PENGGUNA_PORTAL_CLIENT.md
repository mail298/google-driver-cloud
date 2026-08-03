# 📘 Panduan Penggunaan Portal Drive Client (User Manual)

Selamat datang di **Drive Portal Client**. Layanan cloud storage modern yang terhubung langsung dengan Google Drive dan disajikan dengan performa super cepat, domain *white-label* kustom, serta antarmuka yang bersih dan responsif.

Dokumen ini berisi panduan lengkap penggunaan seluruh fitur dan menu yang tersedia pada panel Client.

---

## 📋 Daftar Isi
1. [Ringkasan & Navigasi Utama](#1-ringkasan--navigasi-utama)
2. [Panduan Pengunggahan Berkas (Upload File)](#2-panduan-pengunggahan-berkas-upload-file)
3. [Manajemen Folder (Buat, Navigasi & Pindahkan)](#3-manajemen-folder)
4. [Menu Opsi & Aksi Berkas (Context Menu)](#4-menu-opsi--aksi-berkas)
5. [Penggunaan Tautan Gambar CDN untuk Landing Page](#5-penggunaan-tautan-gambar-cdn-untuk-landing-page)
6. [Fitur Seleksi & Penghapusan Massal (Bulk Action)](#6-fitur-seleksi--penghapusan-massal)
7. [Pengaturan Akun & Keamanan](#7-pengaturan-akun--keamanan)

---

## 1. Ringkasan & Navigasi Utama

Setelah berhasil *Sign In* ke portal client, Anda akan disambut oleh halaman dashboard utama. Tampilan terbagi menjadi 3 area utama:

- **Sidebar Kiri (Panel Navigasi & Kuota)**:
  - **Semua Berkas**: Menampilkan seluruh folder dan dokumen milik Anda.
  - **Pengaturan Akun**: Membuka profil pengguna dan formulir ubah password.
  - **Ringkasan Kuota Storage**: Menampilkan batas total ruang simpan (misal: 10 GB), jumlah terpakai, dan rincian tipe berkas (Foto, Video, Dokumen).
- **Header Atas (Pencarian & Profil)**:
  - **Bilah Pencarian (Search Bar)**: Ketik nama berkas atau dokumen untuk menyaring daftar berkas secara *instant*.
  - **Profil Akun**: Menampilkan nama *user* yang aktif.
  - **Sign Out**: Keluar dari sesi portal client secara aman.
- **Area Kerja Utama**:
  - Tombol **`+ Unggah File`** dan **`📁 Folder Baru`**.
  - Jalur navigasi (*Breadcrumb*) lokasi folder aktif.
  - Tampilan grid/tabel daftar folder dan berkas.

---

## 2. Panduan Pengunggahan Berkas (Upload File)

Anda dapat mengunggah satu berkas atau banyak berkas sekaligus hingga batas maksimal **5 GB per sesi unggah**.

### Cara Mengunggah Berkas:
1. **Metode Tombol**: Klik tombol **`↑ Unggah File`** di bagian kiri atas.
2. **Metode Drag & Drop**: Tarik (*drag*) berkas dari laptop/komputer Anda dan lepaskan (*drop*) di mana saja di area layar browser.

### Widget Antrean Upload (Floating Upload Panel):
- Begitu berkas dipilih, widget melayang di sudut kanan bawah akan otomatis muncul.
- Widget menampilkan persentase progres unggah, ukuran berkas, serta indikator status (Sedang diunggah, Selesai, atau Gagal).
- Anda dapat mengeklik tombol **`Buka Antrean`** untuk melihat rincian progres tiap berkas.

### Opsi Berkas Duplikat ("Opsi upload"):
Jika Anda mengunggah berkas yang namanya sama dengan berkas yang sudah ada di lokasi tersebut, sistem akan menampilkan dialog penanganan duplikat:
- **Ganti file yang ada**: Mengganti berkas lama dengan versi baru tanpa mengubah tautan berbagi.
- **Simpan kedua file**: Menyimpan berkas baru dengan penambahan versi angka (contoh: `gambar (1).png`).

---

## 3. Manajemen Folder

Fasilitas folder digunakan untuk mengelompokkan dokumen agar rapi dan terorganisir.

### A. Membuat Folder Baru:
1. Klik tombol **`📁 Folder Baru`** di bagian atas.
2. Ketikkan nama folder yang diinginkan (contoh: *Project 2026*).
3. Klik **`Buat Folder`**.
   > **Catatan**: Tombol ini dilengkapi proteksi anti-spam. Saat diklik, tombol otomatis terkunci (`Membuat...`) sehingga tidak akan pernah terjadi folder duplikat meskipun tombol diklik berulang kali.

### B. Navigasi Folder:
- Klik ganda (atau klik nama folder) untuk masuk ke dalam folder tersebut.
- Gunakan jalur *Breadcrumbs* di bagian atas (contoh: `Utama > Dokumen > Foto`) untuk kembali ke folder tingkat sebelumnya.

### C. Memindahkan Item (Move):
1. Klik titik tiga **`⋮`** pada folder/berkas yang ingin dipindahkan.
2. Pilih menu **`Pindahkan`**.
3. Pilih folder tujuan dari daftar dropdown, lalu klik **`Pindahkan`**.

---

## 4. Menu Opsi & Aksi Berkas

Setiap berkas dan folder memiliki tombol opsi titik tiga **`⋮`** atau dapat diklik-kanan pada area item untuk membuka **Context Menu**:

| Ikon & Menu | Deskripsi Fungsi |
| :--- | :--- |
| 👁️ **Pratinjau (Preview)** | Membuka pratinjau gambar, dokumen, atau video secara langsung di browser tanpa perlu mengunduh. |
| 📥 **Unduh (Download)** | Mengunduh berkas langsung ke perangkat Anda dengan kecepatan maksimal. |
| 🔗 **Share Link** | Menyalin tautan berbagi publik (*White-Label*) berkas tersebut. |
| ✏️ **Ubah Nama (Rename)** | Mengubah nama berkas atau folder. |
| 🚚 **Pindahkan (Move)** | Memindahkan berkas/folder ke folder tujuan lain. |
| ℹ️ **Detail** | Menampilkan rincian ukuran berkas, tipe format (*MIME type*), dan lokasi folder. |
| 🗑️ **Hapus** | Menghapus berkas atau folder. |

---

## 5. Penggunaan Tautan Gambar CDN untuk Landing Page

Salah satu keunggulan utama portal ini adalah kemampuan menyajikan gambar secara **super cepat (0ms re-load)** untuk kebutuhan *Landing Page*, website, maupun aplikasi online tanpa mengesampingkan identitas merek Anda (*White-Label*).

### Cara Menggunakan Tautan Gambar di Landing Page:
1. Klik titik tiga **`⋮`** pada gambar yang diinginkan.
2. Pilih menu **`Share Link`**.
3. Tautan yang tersalin memiliki format kustom domain Anda sendiri:
   ```text
   https://clouds.wn-cdn.net/share?id=a5dd64cd-9559-4620-9c50-66948839f60d
   ```
4. Pasang tautan tersebut secara langsung pada HTML Landing Page Anda:
   ```html
   <!-- Contoh Tag HTML Image -->
   <img src="https://clouds.wn-cdn.net/share?id=a5dd64cd-9559-4620-9c50-66948839f60d" alt="Produk Kami" />
   ```
   atau pada CSS Background:
   ```css
   /* Contoh CSS Background Image */
   .hero-banner {
       background-image: url('https://clouds.wn-cdn.net/share?id=a5dd64cd-9559-4620-9c50-66948839f60d');
   }
   ```

### Keuntungan Tautan CDN White-Label:
- **100% White-Label**: Bebas dari domain/logo Google Drive.
- **Responsif & Cepat**: Didukung oleh sistem caching cerdas browser dan Cloudflare CDN.
- **Proteksi Data**: URL asli tempat berkas disimpan terlindungi aman di sisi server.

### ⚡ Trik Optimasi Kecepatan Super Instan (0.00 ms):
Tambahkan 2 baris tag HTML ini di dalam tag `<head>` Landing Page / Website Anda agar browser melakukan koneksi awal (*preconnect & DNS prefetch*) secara otomatis sehingga gambar/video dimuat secara **0.00ms instan**:
```html
<!-- Masukkan 2 baris ini di dalam tag <head> Landing Page Anda untuk kecepatan 0.00ms instan -->
<link rel="preconnect" href="https://clouds.wn-cdn.net" crossorigin>
<link rel="dns-prefetch" href="https://clouds.wn-cdn.net">
```

---

## 6. Penggunaan Video Stream & Embed Code (BunnyStream & Cloudflare Stream Style)

Portal ini dilengkapi fitur **Self-Hosted Video CDN** untuk menyajikan video *Landing Page* tanpa watermark, tanpa iklan, dan dengan *startup speed* super instan (~0ms).

### Cara Mengambil Kode Embed Video:
1. Klik titik tiga **`⋮`** pada berkas video yang diinginkan.
2. Pilih menu **`Stream & Embed Video (HLS)`**.
3. Salin salah satu opsi sesuai kebutuhan Anda:
   - **Kode Embed Iframe HTML (Untuk Landing Page/Website)**:
     ```html
     <iframe src="https://clouds.wn-cdn.net/embed/ID_VIDEO" width="100%" height="450" frameborder="0" allowfullscreen></iframe>
     ```
   - **Tautan Stream HLS (`.m3u8`)**:
     ```text
     https://clouds.wn-cdn.net/stream/ID_VIDEO/master.m3u8
     ```
4. Tempelkan kode Iframe tersebut pada Editor HTML, Elementor, atau WordPress Landing Page Anda. Video akan langsung tampil dengan player profesional dan kontrol lengkap (kecepatan, Picture-in-Picture, dan Layar Penuh).

---

## 7. Fitur Seleksi & Penghapusan Massal (Bulk Action)

Anda dapat mengelola banyak berkas sekaligus tanpa harus menghapus satu per satu.

### Cara Menghapus Banyak Item (Batch Delete):
1. Beri tanda centang pada kotak centang (*checkbox*) di sebelah kiri nama folder/berkas.
2. Atau gunakan centang **"Pilih Semua"** di bagian atas tabel untuk memilih seluruh item di halaman tersebut.
3. Bar aksi massal (*Bulk Action Bar*) akan muncul di bagian bawah layar menampilkan jumlah item yang dipilih (misal: `5 item dipilih`).
4. Klik tombol merah **`🗑️ Hapus Terpilih`**, lalu konfirmasikan pada pop-up yang muncul.

---

## 7. Pengaturan Akun & Keamanan

Untuk menjaga keamanan akun Anda:

1. Klik menu **`⚙️ Pengaturan Akun`** di sidebar kiri.
2. Di jendela pop-up yang muncul, Anda dapat melihat:
   - Nama pengguna (*Username*).
   - Peran akun (*Client User*).
   - Batas kuota penyimpanan.
3. Untuk mengubah password:
   - Masukkan **Password Saat Ini**.
   - Masukkan **Password Baru**.
   - Ketik ulang pada **Konfirmasi Password Baru**.
   - Klik **`Simpan Password`**.

---

📌 *Dokumentasi ini dibuat untuk memudahkan penggunaan portal client. Jika Anda memiliki pertanyaan atau kendala teknis, silakan hubungi tim Administrasi.*
