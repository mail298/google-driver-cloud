<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\ClientBackupController.php

require_once dirname(__DIR__) . '/Models/UserModel.php';
require_once dirname(__DIR__) . '/Models/PortalModel.php';
require_once dirname(__DIR__) . '/Models/SecurityModel.php';
require_once __DIR__ . '/AuthController.php';
require_once __DIR__ . '/DownloadProxyController.php';

class ClientBackupController
{
    public static function exportMetadataCsv()
    {
        AuthController::checkClient();

        $currentUser = $_SESSION['user'] ?? null;
        $userId = $currentUser['id'] ?? null;
        if (!$userId) {
            die("Error: Sesi tidak valid.");
        }

        $pdo = Config::getPDO();
        $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND status = 'active' ORDER BY name ASC");
        $stmt->execute([$userId]);
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $timestamp = date('Ymd_His');
        $csvFilename = "laporan_inventaris_berkas_{$timestamp}.csv";

        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $csvFilename . '"');
        header('Cache-Control: no-cache, no-store, must-revalidate');

        $output = fopen('php://output', 'w');

        // Output UTF-8 BOM for Excel compatibility
        fputs($output, "\xEF\xBB\xBF");

        // CSV Header
        fputcsv($output, ['ID Berkas', 'Nama Berkas', 'Ukuran (Bytes)', 'Ukuran Diformat', 'Tipe MIME', 'Tanggal Unggah', 'Tautan White-Label CDN']);

        $domain = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . ($_SERVER['HTTP_HOST'] ?? 'localhost');

        foreach ($files as $file) {
            $bytes = (int) ($file['size_bytes'] ?? 0);
            $formattedSize = self::formatBytes($bytes);
            $cdnUrl = $domain . '/share?id=' . $file['id'];

            fputcsv($output, [
                $file['id'],
                $file['name'],
                $bytes,
                $formattedSize,
                $file['mime_type'],
                $file['created_at'],
                $cdnUrl
            ]);
        }

        fclose($output);
        exit;
    }

    public static function downloadUserZip()
    {
        AuthController::checkClient();

        $currentUser = $_SESSION['user'] ?? null;
        $userId = $currentUser['id'] ?? null;
        if (!$userId) {
            die("Error: Sesi tidak valid.");
        }

        $pdo = Config::getPDO();

        $rawIds = $_GET['ids'] ?? $_POST['ids'] ?? '';
        $selectedIds = array_filter(array_map('trim', explode(',', $rawIds)));

        if (!empty($selectedIds)) {
            $placeholders = implode(',', array_fill(0, count($selectedIds), '?'));
            $params = array_merge([$userId], $selectedIds);
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND status = 'active' AND id IN ($placeholders)");
            $stmt->execute($params);
        } else {
            // Default: all files for this client
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$userId]);
        }

        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($files)) {
            header('Location: /?error=Tidak+ada+berkas+untuk+diunduh.');
            exit;
        }

        $timestamp = date('Ymd_His');
        $zipFilename = "cadangan_berkas_9drive_{$timestamp}.zip";

        $tmpDir = sys_get_temp_dir() . '/client_zip_' . uniqid();
        if (!is_dir($tmpDir)) {
            mkdir($tmpDir, 0777, true);
        }

        $zipPath = $tmpDir . '/' . $zipFilename;
        $zip = new ZipArchive();

        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            die("Gagal memproses pembuat berkas ZIP.");
        }

        // Fetch OAuth credentials to stream files into zip
        $account = $pdo->query("SELECT * FROM connected_accounts WHERE provider = 'google_drive' AND status = 'connected' ORDER BY created_at DESC LIMIT 1")->fetch();
        $encryptionKey = Config::get('TOKEN_ENCRYPTION_KEY', 'change-this-encryption-key-32bytes!');
        $accessToken = $account ? self::decryptText($account['access_token_encrypted'], $encryptionKey) : null;

        $addedNames = [];

        foreach ($files as $file) {
            if (empty($file['provider_file_id'])) continue;

            $fileName = $file['name'];
            // Ensure unique filenames inside zip
            $baseName = pathinfo($fileName, PATHINFO_FILENAME);
            $ext = pathinfo($fileName, PATHINFO_EXTENSION);
            $extStr = $ext ? '.' . $ext : '';

            $counter = 1;
            while (in_array($fileName, $addedNames)) {
                $fileName = $baseName . "_{$counter}" . $extStr;
                $counter++;
            }
            $addedNames[] = $fileName;

            // Stream file bytes from Google Drive API
            $url = "https://www.googleapis.com/drive/v3/files/" . $file['provider_file_id'] . "?alt=media";
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            if ($accessToken) {
                curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $accessToken"]);
            }
            $fileContent = curl_exec($ch);
            curl_close($ch);

            if ($fileContent !== false) {
                $zip->addFromString($fileName, $fileContent);
            }
        }

        $zip->close();

        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
        header('Content-Length: ' . filesize($zipPath));
        header('Cache-Control: no-cache, no-store, must-revalidate');

        readfile($zipPath);

        @unlink($zipPath);
        @rmdir($tmpDir);
        exit;
    }

    private static function decryptText($value, $encryptionKey)
    {
        $parts = explode(':', $value);
        if (count($parts) < 3) return null;
        $iv = base64_decode($parts[0]);
        $tag = base64_decode($parts[1]);
        $encrypted = base64_decode($parts[2]);
        $key = hash('sha256', $encryptionKey, true);
        return openssl_decrypt($encrypted, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
    }

    private static function formatBytes($bytes, $precision = 2)
    {
        if ($bytes >= 1073741824) return round($bytes / 1073741824, $precision) . ' GB';
        if ($bytes >= 1048576) return round($bytes / 1048576, $precision) . ' MB';
        if ($bytes >= 1024) return round($bytes / 1024, $precision) . ' KB';
        return $bytes . ' B';
    }
}
