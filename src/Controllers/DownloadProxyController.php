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
            AuthController::checkAny();
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

        // Get connected account for the token
        $stmt = $pdo->prepare("SELECT * FROM connected_accounts WHERE id = ? LIMIT 1");
        $stmt->execute([$file['connected_account_id']]);
        $account = $stmt->fetch();
        if (!$account) {
            die("Connected storage account not found.");
        }

        $encryptionKey = Config::get('TOKEN_ENCRYPTION_KEY', 'change-this-encryption-key-32bytes!');
        $accessToken = self::decryptText($account['access_token_encrypted'], $encryptionKey);

        // Download from Google Drive
        $url = "https://www.googleapis.com/drive/v3/files/" . $file['provider_file_id'] . "?alt=media";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer " . $accessToken
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);

        // If access token is expired (401), try to refresh it
        if ($httpCode === 401 && !empty($account['refresh_token_encrypted'])) {
            $refreshToken = self::decryptText($account['refresh_token_encrypted'], $encryptionKey);
            $clientId = Config::get('GOOGLE_CLIENT_ID');
            $clientSecret = Config::get('GOOGLE_CLIENT_SECRET');

            if ($clientId && $clientSecret && $refreshToken) {
                $newAccessToken = self::refreshAccessToken($clientId, $clientSecret, $refreshToken);
                if ($newAccessToken) {
                    // Update database with new access token
                    $encryptedNewToken = self::encryptText($newAccessToken, $encryptionKey);
                    $stmt = $pdo->prepare("UPDATE connected_accounts SET access_token_encrypted = ?, token_expires_at = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?");
                    $stmt->execute([$encryptedNewToken, $account['id']]);

                    // Retry download
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_HEADER, true);
                    curl_setopt($ch, CURLOPT_HTTPHEADER, [
                        "Authorization: Bearer " . $newAccessToken
                    ]);
                    $response = curl_exec($ch);
                    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
                    $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
                    curl_close($ch);
                }
            }
        }

        if ($httpCode === 200) {
            $body = substr($response, $headerSize);
            
            $disposition = isset($_GET['inline']) ? 'inline' : 'attachment';
            
            header('Content-Description: File Transfer');
            header('Content-Type: ' . ($file['mime_type'] ?: 'application/octet-stream'));
            header('Content-Disposition: ' . $disposition . '; filename="' . $file['name'] . '"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . strlen($body));
            echo $body;
            exit;
        } else {
            die("Failed to download file from Google Drive. HTTP Code: " . $httpCode);
        }
    }

    private static function encryptText($value, $encryptionKey) {
        $iv = openssl_random_pseudo_bytes(12);
        $key = hash('sha256', $encryptionKey, true);
        $encrypted = openssl_encrypt($value, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($iv) . ':' . base64_encode($tag) . ':' . base64_encode($encrypted);
    }
}
