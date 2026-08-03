<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\StreamController.php

class StreamController
{
    private static function resolveFileId()
    {
        if (!empty($_GET['id'])) {
            return trim($_GET['id']);
        }
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
        if (preg_match('/^\/(?:embed|stream)\/([^\/]+)/i', $uri, $m)) {
            return trim($m[1]);
        }
        return null;
    }

    /**
     * Render the embeddable video player page (/embed/{id})
     */
    public static function embed()
    {
        $fileId = self::resolveFileId();

        if (!$fileId) {
            http_response_code(404);
            die("ID Video tidak ditemukan.");
        }

        $pdo = Config::getPDO();
        $stmt = $pdo->prepare("SELECT * FROM files WHERE (id = ? OR provider_file_id = ?) AND status != 'deleted' LIMIT 1");
        $stmt->execute([$fileId, $fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            die("Video tidak ditemukan atau telah dihapus.");
        }

        $mime = strtolower($file['mime_type'] ?? '');
        $isAudio = strpos($mime, 'audio/') === 0;
        $isVideo = strpos($mime, 'video/') === 0 || in_array(pathinfo($file['name'], PATHINFO_EXTENSION), ['mp4', 'mkv', 'mov', 'avi', 'webm', 'ts', 'm3u8', 'flv']);

        if (!$isVideo && !$isAudio) {
            http_response_code(400);
            die("Berkas ini bukan berupa video atau audio.");
        }

        // Domain Whitelist / Hotlink Protection check
        if (!self::checkReferrerAllowed($file)) {
            http_response_code(403);
            die("Akses pemutaran video ditolak: Domain ini tidak diizinkan (Hotlink Protected).");
        }

        require_once dirname(__DIR__) . '/Views/embed.php';
    }

    /**
     * Generate HLS Master Playlist (.m3u8) for adaptive bitrate streaming
     */
    public static function masterPlaylist()
    {
        $fileId = self::resolveFileId();

        if (!$fileId) {
            http_response_code(404);
            die("ID Video tidak ditemukan.");
        }

        $pdo = Config::getPDO();
        $stmt = $pdo->prepare("SELECT * FROM files WHERE (id = ? OR provider_file_id = ?) AND status != 'deleted' LIMIT 1");
        $stmt->execute([$fileId, $fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            die("Video tidak ditemukan.");
        }

        if (!self::checkReferrerAllowed($file)) {
            http_response_code(403);
            die("Hotlink protected.");
        }

        $fileSize = (int) ($file['size_bytes'] ?? 0);
        $segmentDuration = 6; // 6 seconds per segment
        $estimatedDuration = $fileSize > 0 ? max(10, round($fileSize / (312500))) : 300;
        $totalSegments = max(1, ceil($estimatedDuration / $segmentDuration));

        header('Content-Type: application/vnd.apple.mpegurl');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Range');

        echo "#EXTM3U\n";
        echo "#EXT-X-VERSION:3\n";
        echo "#EXT-X-TARGETDURATION:" . $segmentDuration . "\n";
        echo "#EXT-X-MEDIA-SEQUENCE:0\n";
        echo "#EXT-X-PLAYLIST-TYPE:VOD\n\n";

        for ($i = 0; $i < $totalSegments; $i++) {
            $duration = ($i === $totalSegments - 1) ? max(1, $estimatedDuration - ($i * $segmentDuration)) : $segmentDuration;
            echo "#EXTINF:" . sprintf("%.2f", $duration) . ",\n";
            echo "/stream/" . urlencode($file['id']) . "/segment/" . $i . "\n";
        }
        echo "#EXT-X-ENDLIST\n";
        exit;
    }

    /**
     * Stream a specific HLS video segment via Range request
     */
    public static function streamSegment()
    {
        $fileId = self::resolveFileId();
        $segmentIdx = 0;

        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
        if (preg_match('/\/segment\/(\d+)/i', $uri, $m)) {
            $segmentIdx = (int) $m[1];
        }

        if (!$fileId) {
            http_response_code(404);
            die("Segment not found.");
        }

        $pdo = Config::getPDO();
        $stmt = $pdo->prepare("SELECT * FROM files WHERE (id = ? OR provider_file_id = ?) AND status != 'deleted' LIMIT 1");
        $stmt->execute([$fileId, $fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            die("File not found.");
        }

        $fileSize = (int) ($file['size_bytes'] ?? 0);
        $segmentDuration = 6;
        $estimatedDuration = $fileSize > 0 ? max(10, round($fileSize / (312500))) : 300;
        $totalSegments = max(1, ceil($estimatedDuration / $segmentDuration));

        if ($fileSize > 0 && $totalSegments > 0) {
            $bytesPerSegment = ceil($fileSize / $totalSegments);
            $start = $segmentIdx * $bytesPerSegment;
            $end = min($fileSize - 1, $start + $bytesPerSegment - 1);
            $_SERVER['HTTP_RANGE'] = "bytes={$start}-{$end}";
        }

        DownloadProxyController::download();
    }

    /**
     * Check HTTP Referrer against user's allowed domain whitelist
     */
    private static function checkReferrerAllowed($file)
    {
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        if (empty($referer)) {
            return true;
        }

        $parsed = parse_url($referer);
        $refererHost = strtolower($parsed['host'] ?? '');
        $currentHost = strtolower($_SERVER['HTTP_HOST'] ?? '');

        if ($refererHost === $currentHost || empty($refererHost)) {
            return true;
        }

        $pdo = Config::getPDO();
        $userId = $file['user_id'] ?? null;
        if (!$userId) return true;

        $stmt = $pdo->prepare("SELECT allowed_domains FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        $allowedDomainsRaw = trim($user['allowed_domains'] ?? '');
        if (empty($allowedDomainsRaw)) {
            return true;
        }

        $domains = array_map('trim', explode(',', strtolower($allowedDomainsRaw)));
        foreach ($domains as $domain) {
            if ($domain && (strpos($refererHost, $domain) !== false || $refererHost === $domain)) {
                return true;
            }
        }

        return false;
    }
}
