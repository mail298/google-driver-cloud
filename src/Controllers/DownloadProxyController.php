<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\DownloadProxyController.php

class DownloadProxyController
{
    // ─────────────────────────────────────────────────────────────────────
    // LOCAL DISK CACHE CONFIGURATION
    // Files served via this proxy are cached to disk after the first fetch.
    // Subsequent requests are served directly from local disk — no Google
    // API call, no network roundtrip. Speed: ~5–20ms from local SSD.
    //
    // CACHE_TTL          : 7 days. Expired files auto-purged on next access.
    // CACHE_MAX_BYTES    : Max per-file size eligible for caching (50 MB).
    // CACHE_MAX_TOTAL_MB : Total cache dir size limit (500 MB). When this is
    //                      exceeded, oldest files are evicted until usage drops
    //                      to 80% of the limit — protects disk from exhaustion.
    // ─────────────────────────────────────────────────────────────────────
    private static function getCacheDir()
    {
        $dir = dirname(__DIR__, 2) . '/storage/cache/files';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir;
    }

    private static function getCachePath($fileId, $etag)
    {
        $safe = preg_replace('/[^a-zA-Z0-9_-]/', '_', $fileId);
        $hash = substr(md5($etag), 0, 8);
        return self::getCacheDir() . '/' . $safe . '_' . $hash . '.cache';
    }

    private const CACHE_TTL          = 604800;    // 7 days per-file TTL
    private const CACHE_MAX_TOTAL_MB = 5000;      // max total cache dir size (5GB)
    private const CACHE_MAX_BYTES = 262144000; // 250 MB max per-file cache
    private const PROXY_BUF_SIZE  = 2097152;  // 2 MB streaming buffer

    // ─────────────────────────────────────────────────────────────────────

    /**
     * Return total cache directory size in MB.
     */
    private static function getCacheDirSizeMB()
    {
        $total = 0;
        foreach (glob(self::getCacheDir() . '/*.cache') as $f) {
            $total += filesize($f);
        }
        return $total / 1048576;
    }

    /**
     * Eviction: delete expired files first, then oldest-access files until
     * total cache size drops below 80% of CACHE_MAX_TOTAL_MB.
     * Run only on cache-miss writes to avoid overhead on every request.
     */
    private static function runEviction()
    {
        $cacheDir = self::getCacheDir();
        $files    = glob($cacheDir . '/*.cache');
        if (empty($files)) return;

        // Phase 1: purge TTL-expired files
        foreach ($files as $f) {
            if ((time() - filemtime($f)) > self::CACHE_TTL) {
                @unlink($f);
            }
        }

        // Phase 2: if still over 80% limit, evict oldest (by last access time)
        $targetBytes = self::CACHE_MAX_TOTAL_MB * 1048576 * 0.8;
        $files = glob($cacheDir . '/*.cache');
        if (empty($files)) return;

        $total = 0;
        $meta  = [];
        foreach ($files as $f) {
            $sz    = filesize($f);
            $total += $sz;
            $meta[] = ['path' => $f, 'size' => $sz, 'atime' => fileatime($f)];
        }

        if ($total <= $targetBytes) return;

        // Sort by oldest access time first
        usort($meta, fn($a, $b) => $a['atime'] <=> $b['atime']);
        foreach ($meta as $entry) {
            if ($total <= $targetBytes) break;
            @unlink($entry['path']);
            $total -= $entry['size'];
        }
    }

    // ─────────────────────────────────────────────────────────────────────

    private static function decryptText($value, $encryptionKey)
    {
        $parts = explode(':', $value);
        if (count($parts) < 3) return null;
        $iv        = base64_decode($parts[0]);
        $tag       = base64_decode($parts[1]);
        $encrypted = base64_decode($parts[2]);
        $key       = hash('sha256', $encryptionKey, true);
        return openssl_decrypt($encrypted, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    }

    private static function refreshAccessToken($clientId, $clientSecret, $refreshToken)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type'    => 'refresh_token',
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);
            return $data['access_token'] ?? null;
        }
        return null;
    }

    /**
     * Determine if a MIME type should be locally cached and served from disk.
     * Images, videos and audio benefit most — they are large, frequently
     * re-requested, and don't need byte-range partial content for initial view.
     */
    private static function isCacheEligible($mime, $fileSize)
    {
        if (empty($mime)) return false;
        if ($fileSize > self::CACHE_MAX_BYTES) return false; // too large, stream live
        $cacheable = ['image/', 'video/', 'audio/'];
        foreach ($cacheable as $prefix) {
            if (strpos($mime, $prefix) === 0) return true;
        }
        return false;
    }

    /**
     * Download a file from Google Drive to a local path.
     * Returns true on success, false on failure.
     */
    private static function fetchToFile($url, $headers, $destPath)
    {
        $fp = fopen($destPath, 'wb');
        if (!$fp) return false;

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_TCP_NODELAY, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_BUFFERSIZE, self::PROXY_BUF_SIZE);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_TIMEOUT, 120);
        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fp);

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        }

        @unlink($destPath);
        return false;
    }

    /**
     * Stream a local file to the client with full Range request support.
     */
    private static function serveFromDisk($path, $mime, $fileName, $etag, $fileSize, $isInline)
    {
        $disposition = $isInline ? 'inline' : 'attachment';

        // Range request support for video seek
        $rangeStart = 0;
        $rangeEnd   = $fileSize - 1;
        $isPartial  = false;

        if (isset($_SERVER['HTTP_RANGE'])) {
            preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $m);
            $rangeStart = ($m[1] !== '') ? (int)$m[1] : 0;
            $rangeEnd   = ($m[2] !== '') ? (int)$m[2] : $rangeEnd;
            $rangeEnd   = min($rangeEnd, $fileSize - 1);
            $isPartial  = true;
        }

        while (ob_get_level()) { ob_end_clean(); }

        if ($isPartial) {
            http_response_code(206);
            header('Content-Range: bytes ' . $rangeStart . '-' . $rangeEnd . '/' . $fileSize);
            header('Content-Length: ' . ($rangeEnd - $rangeStart + 1));
        } else {
            header('Content-Length: ' . $fileSize);
        }

        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . $disposition . '; filename="' . rawurlencode($fileName) . '"');
        header('Accept-Ranges: bytes');
        header('Cache-Control: public, max-age=86400');
        header('ETag: ' . $etag);
        header('X-Cache: HIT'); // useful for debugging — indicates local cache hit

        @set_time_limit(0);

        $fp = fopen($path, 'rb');
        if (!$fp) { http_response_code(500); exit; }

        if ($isPartial) {
            fseek($fp, $rangeStart);
            $remaining = $rangeEnd - $rangeStart + 1;
            while ($remaining > 0 && !feof($fp)) {
                $chunk = fread($fp, min(self::PROXY_BUF_SIZE, $remaining));
                echo $chunk;
                flush();
                $remaining -= strlen($chunk);
            }
        } else {
            while (!feof($fp)) {
                echo fread($fp, self::PROXY_BUF_SIZE);
                flush();
            }
        }

        fclose($fp);
        exit;
    }

    private static function getCachedAccessToken($account, $clientId, $clientSecret, $encryptionKey)
    {
        if (!$account) return null;

        $cacheFile = sys_get_temp_dir() . '/gdrive_token_' . md5($account['id'] ?? 'default') . '.json';
        if (is_file($cacheFile)) {
            $data = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($data) && !empty($data['token']) && !empty($data['expires_at']) && $data['expires_at'] > time()) {
                return $data['token'];
            }
        }

        $accessToken = !empty($account['access_token_encrypted']) ? self::decryptText($account['access_token_encrypted'], $encryptionKey) : null;
        $refreshToken = !empty($account['refresh_token_encrypted']) ? self::decryptText($account['refresh_token_encrypted'], $encryptionKey) : null;

        if ($clientId && $clientSecret && $refreshToken) {
            $newToken = self::refreshAccessToken($clientId, $clientSecret, $refreshToken);
            if ($newToken) {
                $accessToken = $newToken;
            }
        }

        if ($accessToken) {
            @file_put_contents($cacheFile, json_encode([
                'token' => $accessToken,
                'expires_at' => time() + 3000
            ]));
        }

        return $accessToken;
    }

    public static function download()
    {
        $fileId = $_GET['id'] ?? null;
        if (!$fileId) {
            $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
            if (preg_match('/^\/(?:embed|stream|download)\/([^\/]+)/i', $uri, $m)) {
                $fileId = trim($m[1]);
            }
        }

        if (!$fileId) {
            http_response_code(400);
            die("File ID is required.");
        }

        $pdo = Config::getPDO();

        // Get file details (supports both internal ID and provider_file_id)
        $stmt = $pdo->prepare("SELECT * FROM files WHERE (id = ? OR provider_file_id = ?) AND status != 'deleted' LIMIT 1");
        $stmt->execute([$fileId, $fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            die("File not found or access denied.");
        }

        $mime     = $file['mime_type'] ?: 'application/octet-stream';
        $isImage  = strpos($mime, 'image/') === 0;
        $isInline = isset($_GET['inline']) || isset($_GET['cdn']) || $isImage;
        $fileSize = (int)($file['size_bytes'] ?? 0);

        // ─────────────────────────────────────────────────────────────────
        // HTTP 304 Not Modified — 0ms cache hit for returning visitors
        // ─────────────────────────────────────────────────────────────────
        $etag = '"' . md5($file['id'] . '_' . ($file['updated_at'] ?? '') . '_' . $file['size_bytes']) . '"';
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
            header('HTTP/1.1 304 Not Modified');
            header('Cache-Control: public, max-age=86400');
            header('ETag: ' . $etag);
            exit;
        }

        // ─────────────────────────────────────────────────────────────────
        // LOCAL DISK CACHE: Check if file is already cached on disk
        // Cache-eligible: images, video, audio under 50MB
        // ─────────────────────────────────────────────────────────────────
        if (self::isCacheEligible($mime, $fileSize)) {
            $cachePath = self::getCachePath($file['id'], $etag);

            // Serve from cache if exists and still fresh
            if (file_exists($cachePath) && (time() - filemtime($cachePath)) < self::CACHE_TTL) {
                $cachedSize = filesize($cachePath);
                self::serveFromDisk($cachePath, $mime, $file['name'], $etag, $cachedSize, $isInline);
                return; // serveFromDisk calls exit
            }
        }

        // ─────────────────────────────────────────────────────────────────
        // Resolve OAuth access token
        // ─────────────────────────────────────────────────────────────────
        $account = null;
        if (!empty($file['connected_account_id'])) {
            $stmt = $pdo->prepare("SELECT * FROM connected_accounts WHERE id = ? LIMIT 1");
            $stmt->execute([$file['connected_account_id']]);
            $account = $stmt->fetch();
        }
        if (!$account) {
            $stmt    = $pdo->query("SELECT * FROM connected_accounts WHERE provider = 'google_drive' AND status = 'connected' ORDER BY created_at DESC LIMIT 1");
            $account = $stmt->fetch();
        }

        $encryptionKey = Config::get('TOKEN_ENCRYPTION_KEY', 'change-this-encryption-key-32bytes!');
        $clientId      = Config::get('GOOGLE_CLIENT_ID');
        $clientSecret  = Config::get('GOOGLE_CLIENT_SECRET');

        $accessToken = self::getCachedAccessToken($account, $clientId, $clientSecret, $encryptionKey);

        $upstreamUrl = "https://www.googleapis.com/drive/v3/files/" . $file['provider_file_id'] . "?alt=media&supportsAllDrives=true";
        $curlHeaders = $accessToken ? ["Authorization: Bearer $accessToken"] : [];

        // ─────────────────────────────────────────────────────────────────
        // LOCAL DISK CACHE: Download to disk first, then serve (cache-miss)
        // On the first request for a cacheable file, we download it to
        // local storage and then serve it from disk. Next requests: instant.
        // ─────────────────────────────────────────────────────────────────
        if (self::isCacheEligible($mime, $fileSize) && !empty($file['provider_file_id']) && $accessToken && !isset($_SERVER['HTTP_RANGE'])) {
            $cachePath = self::getCachePath($file['id'], $etag);
            $tmpPath   = $cachePath . '.tmp';

            // Guard: run eviction if disk cache is at or over the total size limit
            if (self::getCacheDirSizeMB() >= self::CACHE_MAX_TOTAL_MB) {
                self::runEviction();
            }

            if (self::fetchToFile($upstreamUrl, $curlHeaders, $tmpPath)) {
                rename($tmpPath, $cachePath);
                $cachedSize = filesize($cachePath);
                self::serveFromDisk($cachePath, $mime, $file['name'], $etag, $cachedSize, $isInline);
                return;
            }
            // Cache write failed — fall through to live stream below
            @unlink($tmpPath);
        }

        // ─────────────────────────────────────────────────────────────────
        // FALLBACK: Live proxy stream (docs, archives, large files, Range)
        // ─────────────────────────────────────────────────────────────────
        $rangeStart = 0;
        $rangeEnd   = $fileSize > 0 ? $fileSize - 1 : 0;
        $isPartial  = false;

        if ($fileSize > 0 && isset($_SERVER['HTTP_RANGE'])) {
            preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches);
            $rangeStart = ($matches[1] !== '') ? (int)$matches[1] : 0;
            $reqEnd     = ($matches[2] !== '') ? (int)$matches[2] : null;

            // Fast Video CDN Trick: Cap open-ended video range requests to 4MB chunks for 0ms instant startup
            if ($isInline && $reqEnd === null) {
                $rangeEnd = min($rangeStart + 4194303, $fileSize - 1);
            } else {
                $rangeEnd = $reqEnd !== null ? min($reqEnd, $fileSize - 1) : ($fileSize - 1);
            }

            $isPartial  = true;
        } elseif ($isInline && $fileSize > 4194304) {
            // Force 206 Partial Content for inline video requests to trigger instant metadata loading
            $rangeStart = 0;
            $rangeEnd   = min(4194303, $fileSize - 1);
            $isPartial  = true;
        }

        while (ob_get_level()) { ob_end_clean(); }

        $disposition = $isInline ? 'inline' : 'attachment';

        if ($isPartial) {
            http_response_code(206);
            header('Content-Range: bytes ' . $rangeStart . '-' . $rangeEnd . '/' . $fileSize);
            header('Content-Length: ' . ($rangeEnd - $rangeStart + 1));
        } elseif ($fileSize > 0) {
            header('Content-Length: ' . $fileSize);
        }

        header('Content-Type: ' . $mime);
        header('Content-Disposition: ' . $disposition . '; filename="' . rawurlencode($file['name']) . '"');
        header('Accept-Ranges: bytes');
        header('Cache-Control: public, max-age=31536000, immutable');
        header('Cloudflare-CDN-Cache-Control: max-age=31536000');
        header('ETag: ' . $etag);
        header('X-Cache: MISS');

        @set_time_limit(0);

        if ($isPartial) {
            $curlHeaders[] = "Range: bytes={$rangeStart}-{$rangeEnd}";
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $upstreamUrl);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
        curl_setopt($ch, CURLOPT_TCP_NODELAY, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_BUFFERSIZE, self::PROXY_BUF_SIZE);
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $chunk) {
            echo $chunk;
            if (ob_get_level() > 0) ob_flush();
            flush();
            return strlen($chunk);
        });
        if (!empty($curlHeaders)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $curlHeaders);
        }
        curl_exec($ch);
        curl_close($ch);
        exit;
    }

    private static function encryptText($value, $encryptionKey)
    {
        $iv        = openssl_random_pseudo_bytes(12);
        $key       = hash('sha256', $encryptionKey, true);
        $encrypted = openssl_encrypt($value, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($iv) . ':' . base64_encode($tag) . ':' . base64_encode($encrypted);
    }

    /**
     * Invalidate cached file — called when a file is deleted or renamed.
     */
    public static function invalidateCache($fileId, $etag)
    {
        $pattern = self::getCacheDir() . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $fileId) . '_*.cache';
        foreach (glob($pattern) as $f) {
            @unlink($f);
        }
    }
}
