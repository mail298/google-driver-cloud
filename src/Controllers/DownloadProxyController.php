<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\DownloadProxyController.php

class DownloadProxyController
{
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
     * Resolve a short-lived Google Drive direct CDN URL for inline media.
     * Uses the Drive v3 webContentLink (for download) or constructs a
     * direct ?alt=media link with the access token embedded in query string.
     * Returns a URL string or null on failure.
     */
    private static function resolveGoogleDirectUrl($providerFileId, $accessToken)
    {
        if (empty($accessToken)) return null;

        // Google Drive v3: ?alt=media streams raw bytes directly from Google CDN
        // This URL is valid as long as the access token (TTL ~1h) is alive.
        return "https://www.googleapis.com/drive/v3/files/{$providerFileId}?alt=media&supportsAllDrives=true&access_token=" . urlencode($accessToken);
    }

    /**
     * Determine if a MIME type should be served via CDN redirect (not proxied).
     * Images, videos and audio benefit most — browser renders them inline and
     * they are large enough for the proxy overhead to matter.
     */
    private static function isCdnEligible($mime)
    {
        if (empty($mime)) return false;
        $streamable = ['image/', 'video/', 'audio/'];
        foreach ($streamable as $prefix) {
            if (strpos($mime, $prefix) === 0) return true;
        }
        return false;
    }

    public static function download()
    {
        $fileId = $_GET['id'] ?? null;
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

        // ─────────────────────────────────────────────────────────────────────
        // HTTP 304 Not Modified — 0ms cache hit for returning visitors
        // ─────────────────────────────────────────────────────────────────────
        $etag = '"' . md5($file['id'] . '_' . ($file['updated_at'] ?? '') . '_' . $file['size_bytes']) . '"';
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
            header('HTTP/1.1 304 Not Modified');
            header('Cache-Control: public, max-age=31536000, immutable');
            header('ETag: ' . $etag);
            exit;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Resolve OAuth access token
        // ─────────────────────────────────────────────────────────────────────
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
        $accessToken   = $account ? self::decryptText($account['access_token_encrypted'], $encryptionKey) : null;
        $clientId      = Config::get('GOOGLE_CLIENT_ID');
        $clientSecret  = Config::get('GOOGLE_CLIENT_SECRET');

        // Auto-refresh token before streaming headers are sent
        if ($account && !empty($account['refresh_token_encrypted'])) {
            $refreshToken = self::decryptText($account['refresh_token_encrypted'], $encryptionKey);
            if ($clientId && $clientSecret && $refreshToken) {
                $newToken = self::refreshAccessToken($clientId, $clientSecret, $refreshToken);
                if ($newToken) {
                    $accessToken = $newToken;
                }
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // SPEED OPTIMISATION: Images / Video / Audio → 302 Redirect to Google CDN
        // For media files, we redirect the browser straight to Google's CDN edge.
        // The browser downloads at Google's full CDN speed — no PHP bottleneck.
        // Documents and archives still go through the proxy (they need headers).
        // ─────────────────────────────────────────────────────────────────────
        if (self::isCdnEligible($mime) && !empty($file['provider_file_id']) && $accessToken && !isset($_SERVER['HTTP_RANGE'])) {
            $cdnUrl = self::resolveGoogleDirectUrl($file['provider_file_id'], $accessToken);
            if ($cdnUrl) {
                while (ob_get_level()) { ob_end_clean(); }
                header('Cache-Control: public, max-age=3600');
                header('ETag: ' . $etag);
                header('Location: ' . $cdnUrl, true, 302);
                exit;
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // SPEED OPTIMISATION: HTTP Range Request Support (video seek / resume)
        // Allows browsers to request specific byte ranges. Essential for video
        // players and large documents (seek without re-download from start).
        // ─────────────────────────────────────────────────────────────────────
        $fileSize  = (int) ($file['size_bytes'] ?? 0);
        $rangeStart = 0;
        $rangeEnd   = $fileSize > 0 ? $fileSize - 1 : 0;
        $isPartial  = false;

        if ($fileSize > 0 && isset($_SERVER['HTTP_RANGE'])) {
            preg_match('/bytes=(\d*)-(\d*)/', $_SERVER['HTTP_RANGE'], $matches);
            $rangeStart = ($matches[1] !== '') ? (int) $matches[1] : 0;
            $rangeEnd   = ($matches[2] !== '') ? (int) $matches[2] : $rangeEnd;
            $rangeEnd   = min($rangeEnd, $fileSize - 1);
            $isPartial  = true;
        }

        // ─────────────────────────────────────────────────────────────────────
        // Clean output buffers — prevents byte-prefix corruption
        // ─────────────────────────────────────────────────────────────────────
        while (ob_get_level()) {
            ob_end_clean();
        }

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
        header('ETag: ' . $etag);

        @set_time_limit(0);

        // Build upstream URL with optional byte-range
        $upstreamUrl = "https://www.googleapis.com/drive/v3/files/" . $file['provider_file_id'] . "?alt=media";

        $curlHeaders = [];
        if ($accessToken) {
            $curlHeaders[] = "Authorization: Bearer $accessToken";
        }
        if ($isPartial) {
            $curlHeaders[] = "Range: bytes={$rangeStart}-{$rangeEnd}";
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $upstreamUrl);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_BUFFERSIZE, 131072); // 128 KB chunk — reduces PHP loop overhead
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
}
