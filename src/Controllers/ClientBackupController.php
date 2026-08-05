<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\ClientBackupController.php

class ClientBackupController
{
    public static function exportMetadataCsv()
    {
        AuthController::checkClient();

        $currentUser = $_SESSION['user'] ?? null;
        $userId = $currentUser['id'] ?? null;
        if (!$userId) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
            exit;
        }

        $pdo = Config::getPDO();
        $gatewayUserId = PortalModel::getUserIdFromApiKey($pdo);

        $stmt = $pdo->prepare("SELECT * FROM files WHERE (user_id = ? OR user_id = ?) AND status = 'active' ORDER BY name ASC");
        $stmt->execute([$userId, $gatewayUserId]);
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
        $gatewayUserId = PortalModel::getUserIdFromApiKey($pdo);

        $rawIds = $_GET['ids'] ?? $_POST['ids'] ?? '';
        $selectedIds = array_filter(array_map('trim', explode(',', $rawIds)));

        if (!empty($selectedIds)) {
            $placeholders = implode(',', array_fill(0, count($selectedIds), '?'));
            $params = array_merge([$userId, $gatewayUserId], $selectedIds);
            $stmt = $pdo->prepare("SELECT * FROM files WHERE (user_id = ? OR user_id = ?) AND status = 'active' AND id IN ($placeholders)");
            $stmt->execute($params);
        } else {
            // Default: all files for this client
            $stmt = $pdo->prepare("SELECT * FROM files WHERE (user_id = ? OR user_id = ?) AND status = 'active'");
            $stmt->execute([$userId, $gatewayUserId]);
        }

        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($files)) {
            header('Location: /?error=Tidak+ada+berkas+untuk+diunduh.');
            exit;
        }

        @set_time_limit(0);

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

        // ─────────────────────────────────────────────────────────────────
        // DOWNLOAD FILES IN PARALLEL BATCHES using curl_multi
        // Google Drive sequential downloads are too slow (≈2–3 s/file).
        // Batches of 8 concurrent streams cut total time dramatically.
        // ─────────────────────────────────────────────────────────────────
        $addedNames = [];
        $batchSize = 8;
        $fileChunks = array_chunk($files, $batchSize);

        foreach ($fileChunks as $chunk) {
            $curlHandles = [];
            $downloads = [];

            foreach ($chunk as $i => $file) {
                if (empty($file['provider_file_id'])) continue;

                $fileName = $file['name'];
                $baseName = pathinfo($fileName, PATHINFO_FILENAME);
                $ext = pathinfo($fileName, PATHINFO_EXTENSION);
                $extStr = $ext ? '.' . $ext : '';
                $counter = 1;
                while (in_array($fileName, $addedNames)) {
                    $fileName = $baseName . "_{$counter}" . $extStr;
                    $counter++;
                }
                $addedNames[] = $fileName;

                $tmpPath = $tmpDir . '/' . $fileName;
                $fp = fopen($tmpPath, 'w');

                $url = "https://www.googleapis.com/drive/v3/files/" . $file['provider_file_id'] . "?alt=media";
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, $url);
                curl_setopt($ch, CURLOPT_FILE, $fp);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($ch, CURLOPT_TIMEOUT, 30);
                if ($accessToken) {
                    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $accessToken"]);
                }

                $curlHandles[] = $ch;
                $downloads[] = ['file' => $file, 'tmp_path' => $tmpPath, 'fp' => $fp, 'name' => $fileName];
            }

            if (empty($curlHandles)) continue;

            $mh = curl_multi_init();
            foreach ($curlHandles as $ch) {
                curl_multi_add_handle($mh, $ch);
            }

            $active = null;
            do {
                $status = curl_multi_exec($mh, $active);
            } while ($status === CURLM_CALL_MULTI_PERFORM || $active);

            foreach ($curlHandles as $ch) {
                curl_multi_remove_handle($mh, $ch);
                curl_close($ch);
            }
            curl_multi_close($mh);

            foreach ($downloads as $d) {
                fclose($d['fp']);
                if (filesize($d['tmp_path']) > 0) {
                    $zip->addFile($d['tmp_path'], $d['name']);
                }
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
