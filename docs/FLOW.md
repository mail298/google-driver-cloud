# Alur (Flow) Sistem Share & CDN

## Peta URL

| Path | Controller | Fungsi |
|---|---|---|
| `/` | `DashboardController` | Dashboard (login) |
| `/share?id=...` | `ShareController` | Halaman share publik |
| `/download?id=...` | `DownloadProxyController` | Download/stream file (juga thumb) |
| `/embed/{id}` | `StreamController` | Player video embed |
| `/stream/{id}/master.m3u8` | `StreamController` | Playlist HLS |
| `/stream/{id}/segment/{n}` | `StreamController` | Segmen HLS |

Host: `clouds.wn-cdn.net` (portal/dashboard) dan `img1-4.wn-cdn.net` (CDN share/download/stream). Semua mengarah ke tunnel → `localhost:7878`.

---

## FLOW A — Landing Page: Grid 1000+ Gambar (Thumbnail)

```
Browser (landing page, JS)
  │  untuk tiap file: cdnHostFor(fileId) → pilih img1..img4 (hash deterministik)
  ▼
<img src="https://imgX.wn-cdn.net/download?id=FILE&thumb=1">
  │
  ├─ CF edge cache? ── ada (HIT) ──► kirim thumbnail (~10-15KB) langsung ke browser
  │                     (Cache Everything rule, TTL 30 hari)
  │
  └─ tidak ada (MISS) ──► CF edge → tunnel → VPS
        │
        ▼
  DownloadProxyController::download()
        │  isThumb = true
        ▼
  cek disk cache: /storage/cache/files/thumb_{id}.jpg
        │
        ├─ ada & < 7 hari ──► serve (ETag 304 / 200) ──► CF edge simpan ──► browser
        │
        └─ tidak ada ──► fetch Google LH3  → https://lh3.googleusercontent.com/d/{pid}=w400
                        ▼
                  simpan ke disk cache → serve → CF edge simpan → browser
```

**Keuntungan:** browser buka 24 koneksi paralel (4 host × 6) + thumbnail kecil + edge cache → grid loading cepat. Browser hanya melihat `imgX.wn-cdn.net` (URL Google tidak bocor).

---

## FLOW B — Klik Gambar (Full Size / Inline)

```
Browser: <img src="https://imgX.wn-cdn.net/download?id=FILE&inline=1">
  (header Accept: image/* → ShareController langsung lempar ke download, tanpa halaman HTML)
  │
  ├─ CF edge cache? ── ada (HIT) ──► kirim gambar langsung dari edge
  │
  └─ MISS ──► CF → tunnel → VPS
        ▼
  DownloadProxyController::download()  (isThumb = false, isCacheEligible = true)
        │
        ├─ disk cache ada ──► serveFromDisk (ETag 304 / 200) → CF cache → browser
        │
        └─ disk cache tidak ada (COLD START) ──►
             1. cek token OAuth (getCachedAccessToken)
             2. gambar → lh3.googleusercontent.com/d/{pid}=s0  (full size)
             3. full file ter-download dulu ke VPS (tmp → cache)
             4. baru serve ke browser → CF cache → browser
```

**Catatan:** VPS yang fetch dari Google lalu serve sendiri → browser hanya melihat `imgX.wn-cdn.net`, URL Google (lh3) tidak pernah terlihat. Cold start = menunggu full file turun ke VPS (2-3 detik untuk ~500KB), setelah itu disk + edge HIT (~50ms).

---

## FLOW C — Buka Link Share di Browser (Halaman HTML)

```
Browser: https://imgX.wn-cdn.net/share?id=FILE   (Accept: text/html)
  │
  ├─ ShareController::viewShare()
  │     │  file = image? video? pdf? lainnya?
  │     ▼
  │  gambar ──► render share.php
  │     │        <img src=".../download?id=FILE&inline=1">  (Flow B)
  │     │
  │  video ──► render share.php
  │     │        <iframe src="/embed/FILE">  (relatif → host sama imgX)
  │     │
  │  pdf ──► render share.php
  │     │        <iframe src=".../download?id=FILE&inline=1">
  │     │
  │  lainnya ──► render share.php (kartu + tombol unduh)
  │
  └─ halaman dikirim (CF edge: halaman HTML tidak di-cache Cache Everything, hanya path /share dengan query image ke /download — HTML DYNAMIC)
```

**Catatan:** Halaman share tidak ke-cache di edge (DYNAMIC) — hanya file (`/download`) yang di-cache. Ini disengaja agar halaman selalu fresh.

---

## FLOW D — Video (Embed + HLS)

```
Browser: https://imgX.wn-cdn.net/embed/VIDEO
  │
  ├─ StreamController::embed()
  │     │  hotlink protection: referer diizinkan? (sama-host / whitelist)
  │     │  → render embed.php
  │     ▼
  embed.php:
  │  <video src="https://imgY.wn-cdn.net/download?id=VIDEO&inline=1"
  │         poster="...&thumb=1">
  │  hlsUrl = "/stream/VIDEO/master.m3u8"   (relatif → host imgX yang sama)
  │
  ├─ video src (MP4) ──► FLOW B (disk/edge cache)
  │
  └─ HLS ──► /stream/VIDEO/master.m3u8  (StreamController::masterPlaylist)
       │       │ hotlink: referer imgX = host imgX → allowed
       │       ▼
       │   render playlist → setiap segmen: /stream/VIDEO/segment/{n}
       │       ▼
       │   StreamController::streamSegment → proxy dari Google Drive (live)
       │       └─ segmen TIDAK di-cache disk (live) → tiap segmen fetch Google Drive via VPS
       ▼
  browser play video (progressive / HLS)
```

**Catatan penting (kenapa terasa beda dari Google Drive):**
- Segmen HLS (`/stream/.../segment/{n}`) di-stream **live** dari Google Drive setiap segmen — tidak ada disk cache, tidak ada edge cache untuk segmen (kecuali CF `s-maxage` pada playlist). Video besar → tiap 6 detik ada fetch Google Drive.
- Google Drive langsung: file sudah di CDN Google, streaming progresif, nol hop tambahan.
- MP4 inline (jika di-set) bisa di-cache disk + edge → jauh lebih cepat, tapi tidak mendukung seek-atau-besar di atas 2GB (CACHE_MAX_BYTES).

---

## FLOW E — Copy Link di Dashboard

```
Browser (dashboard clouds.wn-cdn.net), klik "Copy Link" pada file
  │  cmActionCopyLink() di portal.js
  │
  ├─ file → cdnUrl(id, {path:'share'})  →  https://imgX.wn-cdn.net/share?id=FILE
  │         (host img1-4 dipilih hash)
  │
  ├─ folder → window.location.origin + "/?folderId=..."  (clouds)
  │
  └─ invite → window.location.origin                       (clouds)
```

---

## Ringkasan Performa

| Skenario | Sebelum Cache Rule | Sesudah Cache Rule |
|---|---|---|
| Halaman share (HTML) | ~0.3s TTFB | ~0.3s TTFB (DYNAMIC) |
| Gambar thumb, sudah pernah dibuka | 0.6s (disk) | ~50ms (edge HIT) |
| Gambar full, sudah pernah dibuka | 0.6s (disk) | ~50ms (edge HIT) |
| Gambar cold start (file baru) | 2.3s (fetch Google Drive) | 2.3s sekali, lalu cepat |
| Video MP4 inline (cacheable) | — | disk + edge |
| Video HLS segmen | live fetch per segmen | live fetch per segmen |

## Tetap Dinamis Saat File Diganti (Auto Version)

Edge cache menyimpan URL 30 hari. Jika file di Google Drive **diganti** dengan konten baru, URL yang sama akan tetap menyajikan versi lama. Solusi: parameter versi otomatis.

- Semua URL konten file (thumb/inline/download di dashboard, share.php, embed.php) sekarang menyertakan `&v=<8-char hash updated_at>`.
- Saat file diganti/diperbarui (mis. re-upload, edit di Google Drive), `updated_at` di DB berubah → `v` berubah → **URL baru** → cache CDN lama otomatis ter-bypass, file versi baru ter-fetch.
- File yang tidak berubah → `v` tetap → edge cache tetap HIT (tidak ada kerugian performa).
- Implementasi: `CdnHelper::url(..., ['version' => $file['updated_at']])` dan `cdnUrl(id, {version})` di `portal.js`.
- Parameter `v` **tidak divalidasi server** — fungsinya hanya memecah cache key CDN; kebenaran isi tetap dijamin ETag (id + updated_at + size) di disk cache.

## Cara Baca Debug

- `cf-cache-status: HIT` → dilayani edge Cloudflare (paling cepat).
- `cf-cache-status: MISS` → baru diambil origin, akan jadi HIT untuk request berikutnya dari POP yang sama.
- `cf-cache-status: DYNAMIC` → sengaja tidak di-cache (halaman HTML / bukan /share /download).
- Header `X-Cache: HIT` (dari VPS) → dilayani disk cache portal.
