# Google Drive Cloud - Implementation Plan & Fixes

## Architecture Overview

- **Portal** — Apache+PHP (port 7878) — client upload/download UI
- **Backend** — Node.js/Express/TypeScript (port 4001) — Google Drive API proxy
- **Frontend** — Nginx+Serve SPA (port 5174) — modern upload UI
- **MySQL** — port 3306 — relational storage
- **Cloudflared** — proxies 3 domains via tunnel:
  - `clouds.wn-cdn.net → localhost:7878` (portal)
  - `googledrivefrontendbackend.wn-cdn.net → localhost:5174` (frontend SPA)
  - `googledrivecloudbackend.wn-cdn.net → localhost:4001` (backend API)

## Problems Found & Fixes

### 1. Sync Function Resurrection Bug
**File:** `backend/src/modules/google/google.service.ts`
**Symptom:** `syncGoogleAppFolderFiles()` reset `status='active'` and `deletedAt=null` on soft-deleted files, resurrecting them.
**Fix:** Modified the sync query — only update metadata fields (name, mimeType, size, folderId, updatedAt) on duplicate key; status and deletedAt are preserved.

### 2. Large File Upload Hangs (Backend)
**File:** `backend/src/modules/uploads/upload.routes.ts`
**Symptom:** Uploads > ~50 MB would hang or crash due to RAM buffering and `maxBodyLength`/`maxContentLength` options.
**Fix:** Removed `maxBodyLength`/`maxContentLength` from axios config. Stream uploads to temp file on disk instead of keeping in RAM.

### 3. Portal → Backend Communication
**Config:** `.env` → `GATEWAY_API_URL`
**Before:** `https://googledrivecloudbackend.wn-cdn.net` (via Cloudflare public)
**After:** `http://backend:4000` (internal Docker network)
**Result:** PHP portal now bypasses Cloudflare when proxying uploads to backend. Large uploads that reach the portal proceed to Google Drive without Cloudflare interference.

### 4. Cloudflare Free Plan Upload Limit
**Root Cause:** Cloudflare free plan limits request body to **100 MB** at the edge. Chunks > 100 MB are rejected before reaching the origin server.
**Affected Flows:**
- Browser → Cloudflare → Portal:7878 → Backend API (portal upload)
- Browser → Cloudflare → Frontend:5174 → Backend API (SPA upload)

### 5. Direct Upload Proxy (Bypass Cloudflare)
**Solution:** Nginx container on port **8443** with self-signed SSL, proxying to the portal's internal port.

- **Config:** `/home/server1/ssl/nginx-upload.conf`
- **SSL Certs:** `/home/server1/ssl/upload.crt`, `/home/server1/ssl/upload.key`
- **Container:** `upload-proxy` (nginx:alpine)
- **Network:** `google-driver-cloud_default` (same as portal/backend)
- `client_max_body_size: 10G`
- Request/body timeouts: 3600s
- Buffering disabled for streaming uploads

**How to use:**
1. Open `https://<SERVER_IP>:8443` in browser
2. Accept self-signed cert warning
3. Log in with portal credentials
4. Upload files — bypasses Cloudflare entirely

**Blocked:** Port 8443 needs to be opened in the hosting provider's firewall/security group.

### 6. Soft-Delete Cleanup
- Restored clienA root folder (`1sn1wvMv2iwoUOCptMly7eXb9DRGH8TDh`)
- Fixed `ON DUPLICATE KEY UPDATE` in `DashboardController::index()` to clear `deleted_at = NULL`
- Phantom duplicate entries removed

### 7. PHP Config Tweaks
- `upload_max_filesize = 10G`, `post_max_size = 10G` via `.user.ini`
- `max_execution_time = 300` via `.user.ini`
- APCu + OPcache enabled
- `users.json` ownership set to `www-data:www-data` after each `docker cp`

### 8. CDN Caching for Images
- PHP portal redirects image downloads through CDN URL
- Backend applies `Cache-Control: public, max-age=86400` headers
- ZIP generation parallelized via `curl_multi` (8 concurrent) — reduced from ~2 min to ~10-15 s

## Remaining Work

1. **Open port 8443** in hosting provider firewall
2. **Test** upload 500 MB+ through `https://<IP>:8443`
3. **Test** upload via SPA frontend directly (backend on internal network already works for < 100 MB)
4. **Update AGENTS.md** with all configuration notes
