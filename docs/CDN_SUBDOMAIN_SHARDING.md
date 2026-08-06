# CDN Sendiri via Subdomain Sharding (Landing Page 1000+ Gambar)

## Masalah

Landing page menampilkan 1000+ gambar (~536 KB/file). Browser membatasi **6 koneksi paralel per hostname** (HTTP/1.1). Jika semua gambar berasal dari satu hostname (`clouds.wn-cdn.net`), koneksi mengantre dan halaman menjadi lambat. Solusi CDN berbayar (Bunny/Cloudflare) tidak diinginkan.

## Trik: 1 Server, Banyak Hostname

Browser menghitung limit koneksi per-hostname, **bukan per-IP**. Karena itu kita memakai banyak subdomain yang semuanya menunjuk ke server yang sama:

```
img1.wn-cdn.net ─┐
img2.wn-cdn.net ├─→ Cloudflare tunnel ──→ portal (port 7878) ──→ DownloadProxyController
img3.wn-cdn.net ─┤                                             └─→ Google Drive (di-cache disk)
img4.wn-cdn.net ─┘
```

- 4 subdomain × 6 koneksi = **24 koneksi paralel** dari browser.
- Gambar grid memakai `?thumb=1` (10–15 KB dari Google LH3, disk cache + ETag immutable) → loading cepat.
- Klik gambar baru fetch full size (`/download?id=...&inline=1`).

## Routing (End-to-End)

1. **DNS** — 4 CNAME:
   - `img1.wn-cdn.net` → `6983fd5d-93e0-42b7-a772-0bd2c2ea02a9.cfargotunnel.com`
   - `img2.wn-cdn.net` → sama
   - `img3.wn-cdn.net` → sama
   - `img4.wn-cdn.net` → sama
   - Proxy status: **Proxied** (orange cloud).

2. **Cloudflare tunnel (Zero Trust → Networks → Tunnels → `google-driver-cloud`)**
   - Tambah 4 **Public Hostname** (Service = HTTP, URL = `localhost:7878`):
     `img1.wn-cdn.net`, `img2.wn-cdn.net`, `img3.wn-cdn.net`, `img4.wn-cdn.net`.
   - Catatan: tunnel ini memakai **remote config dari dashboard**, bukan file lokal. Hostname yang tidak terdaftar di dashboard otomatis dibuang oleh daemon, jadi registrasi di dashboard adalah wajib. (`/home/server1/.cloudflared/google-driver-cloud.yml` sudah diperbarui sebagai dokumentasi/fallback.)

3. **Cloudflare edge** memilih lokasi terdekat → 1000 gambar disajikan dari CDN Cloudflare (gratis, sudah termasuk tunnel) + disk cache di server → Google Drive hanya dipanggil sekali per file.

## Di Sisi Kode (Rotasi Hostname)

- `portal.js` menyimpan daftar host:
  `['img1.wn-cdn.net', 'img2.wn-cdn.net', 'img3.wn-cdn.net', 'img4.wn-cdn.net']`
- Saat generate URL gambar, pilih host secara **round-robin** atau **hash dari file ID** (konsisten per file).
- Contoh hasil:
  `https://img2.wn-cdn.net/download?id=abc123&thumb=1`
- `DownloadProxyController` sudah membaca `HTTP_HOST` secara dinamis (DownloadProxyController.php:48), sehingga hostname mana pun yang masuk tetap dilayani dengan benar.

## Kenapa Ini Bagus

- **Gratis** — tidak perlu CDN berbayar; Cloudflare tunnel sudah meng-cache aset statik di edge.
- **Privasi** — file disajikan via proxy; URL asli Google Drive tidak pernah bocor.
- **Kecepatan** — browser membuka 24 koneksi sekaligus; thumbnail kecil di-cache immutable (ETag 304, `max-age=31536000`).

## Checklist Pending

- [x] Buat 4 CNAME `img1-4.wn-cdn.net` → tunnel (Proxied) — selesai via API.
- [x] Tambah 4 Public Hostname (img1–4 → `localhost:7878`) di tunnel (remote config v5) — selesai via API.
- [x] Implementasi rotasi hostname:
  - `src/Core/CdnHelper.php` — helper PHP (`CdnHelper::url()` / `hostFor()`), host dipilih via `crc32(fileId) % n` (deterministik).
  - `portal.js` — helper JS `cdnUrl()` / `cdnHostFor()` (dipilih via hash file ID).
  - Diterapkan di `dashboard.php` (thumbnail grid + list), `share.php` (halaman publik), `embed.php` (video), `ClientBackupController.php` (CSV link).
  - Daftar host dari env `CDN_HOSTS` (default `img1-4.wn-cdn.net`), di-ekspos ke JS via `CDN_HOST_LIST`.
- [x] Verifikasi end-to-end: `img1-4.wn-cdn.net` → HTTP 200, thumbnail PNG valid, md5 identik di semua host, deterministik per file.
