<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\DownloadProxyController.php

class DownloadProxyController {
    private static function decryptText($value, $encryptionKey) {
        $parts = explode(':', $value);
        if (count($parts) < 3) return null;
        $iv = base64_decode($parts[0]);
        $tag = base64_decode($parts[1]);
        $encrypted = base64_decode($parts[2]);
        $key = hash('sha256', $encryptionKey, true);
        return openssl_decrypt($encrypted, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    }

    private static function refreshAccessToken($clientId, $clientSecret, $refreshToken) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'refresh_token' => $refreshToken,
            'grant_type' => 'refresh_token'
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

    public static function download() {
        $fileId = $_GET['id'] ?? null;
        if (!$fileId) {
            die("File ID is required.");
        }

        $pdo = Config::getPDO();

        // Get file details (supports both internal ID and provider_file_id)
        $stmt = $pdo->prepare("SELECT * FROM files WHERE (id = ? OR provider_file_id = ?) AND status != 'deleted' LIMIT 1");
        $stmt->execute([$fileId, $fileId]);
        $file = $stmt->fetch();
        if (!$file) {
            die("File not found or access denied.");
        }

        $isImage = !empty($file['mime_type']) && strpos($file['mime_type'], 'image/') === 0;
        $isInline = isset($_GET['inline']) || isset($_GET['cdn']) || $isImage;

        // Direct Google Edge CDN redirect (0ms response time for landing page images)
        if (isset($_GET['cdn']) || isset($_GET['redirect']) || (isset($_GET['raw']) && $_GET['raw'] == '1')) {
            if (!empty($file['provider_file_id'])) {
                header("Location: https://lh3.googleusercontent.com/d/" . $file['provider_file_id'] . "=s0");
                exit;
            }
        }

        // Support HTTP 304 Not Modified browser caching for 0ms re-loads
        $etag = '"' . md5($file['id'] . '_' . ($file['updated_at'] ?? '') . '_' . $file['size_bytes']) . '"';
        if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
            header('HTTP/1.1 304 Not Modified');
            header('Cache-Control: public, max-age=31536000, immutable');
            header('ETag: ' . $etag);
            exit;
        }

        // Get connected account for the token
        $account = null;
        if (!empty($file['connected_account_id'])) {
            $stmt = $pdo->prepare("SELECT * FROM connected_accounts WHERE id = ? LIMIT 1");
            $stmt->execute([$file['connected_account_id']]);
            $account = $stmt->fetch();
        }

        if (!$account) {
            $stmt = $pdo->query("SELECT * FROM connected_accounts WHERE provider = 'google_drive' AND status = 'connected' ORDER BY created_at DESC LIMIT 1");
            $account = $stmt->fetch();
        }

        $encryptionKey = Config::get('TOKEN_ENCRYPTION_KEY', 'change-this-encryption-key-32bytes!');
        $accessToken = $account ? self::decryptText($account['access_token_encrypted'], $encryptionKey) : null;

        $url = "https://www.googleapis.com/drive/v3/files/" . $file['provider_file_id'] . "?alt=media";

        $disposition = $isInline ? 'inline' : 'attachment';

        header('Content-Type: ' . ($file['mime_type'] ?: 'application/octet-stream'));
        header('Content-Disposition: ' . $disposition . '; filename="' . $file['name'] . '"');
        header('Cache-Control: public, max-age=31536000, immutable');
        header('ETag: ' . $etag);
        if (!empty($file['size_bytes'])) {
            header('Content-Length: ' . $file['size_bytes']);
        }

        @set_time_limit(0);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
        curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) {
            echo $chunk;
            if (ob_get_level() > 0) ob_flush();
            flush();
            return strlen($chunk);
        });

        if ($accessToken) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $accessToken
            ]);
        }

        curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        // If 401 token expired, attempt refresh
        if ($httpCode === 401 && $account && !empty($account['refresh_token_encrypted'])) {
            $refreshToken = self::decryptText($account['refresh_token_encrypted'], $encryptionKey);
            $clientId = Config::get('GOOGLE_CLIENT_ID');
            $clientSecret = Config::get('GOOGLE_CLIENT_SECRET');

            if ($clientId && $clientSecret && $refreshToken) {
                $newAccessToken = self::refreshAccessToken($clientId, $clientSecret, $refreshToken);
                if ($newAccessToken) {
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
                    curl_setopt($ch, CURLOPT_WRITEFUNCTION, function($ch, $chunk) {
                        echo $chunk;
                        if (ob_get_level() > 0) ob_flush();
                        flush();
                        return strlen($chunk);
                    });
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        "Authorization: Bearer " . $newAccessToken
                    ]);
                    curl_exec($ch);
                    curl_close($ch);
                }
            }
        }
        exit;
    }

    private static function encryptText($value, $encryptionKey) {
        $iv = openssl_random_pseudo_bytes(12);
        $key = hash('sha256', $encryptionKey, true);
        $encrypted = openssl_encrypt($value, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($iv) . ':' . base64_encode($tag) . ':' . base64_encode($encrypted);
    }
}
