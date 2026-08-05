<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\UploadController.php

class UploadController
{
    public static function uploadTokenDir()
    {
        return sys_get_temp_dir() . '/portal_upload_tokens';
    }

    public static function consumeUploadToken($token, $delete = true)
    {
        if (!is_string($token) || strlen($token) < 32) {
            return null;
        }
        $path = self::uploadTokenDir() . '/' . hash('sha256', $token);
        if (!is_file($path)) {
            return null;
        }
        $data = json_decode((string) file_get_contents($path), true);
        if (!is_array($data) || empty($data['user_id']) || empty($data['exp'])) {
            @unlink($path);
            return null;
        }
        if ((int) $data['exp'] < time()) {
            @unlink($path);
            return null;
        }
        if ($delete) {
            @unlink($path);
        }
        return $data;
    }

    public static function upload()
    {
        @set_time_limit(0);
        @ini_set('memory_limit', '-1');
        @ini_set('max_execution_time', '0');
        @ini_set('max_input_time', '-1');

        // Allow cross-origin direct uploads (e.g. portal on clouds.wn-cdn.net -> upload.wn-cdn.net)
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        if ($origin) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
        }
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            header('Content-Type: application/json');
            echo json_encode(['success' => true]);
            exit;
        }

        $handoffToken = $_POST['upload_token'] ?? $_GET['upload_token'] ?? null;
        if ($handoffToken) {
            $tokenData = self::consumeUploadToken($handoffToken);
            if (!$tokenData || !($tokenUser = UserModel::getUserById($tokenData['user_id']))) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Token unggahan tidak valid atau kedaluwarsa.']);
                exit;
            }
            AuthController::startSession();
            $_SESSION['user'] = $tokenUser;
            $_SESSION['user_role'] = 'client';
            $_SESSION['username'] = $tokenUser['username'];
        } else {
            AuthController::checkClient();
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');

            // Detect post_max_size overflow (when $_POST and $_FILES are empty but Content-Length > 0)
            $contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
            if (empty($_FILES) && empty($_POST) && $contentLength > 0) {
                $maxPost = ini_get('post_max_size');
                $sizeMb = round($contentLength / (1024 * 1024), 1);
                LoggerService::error("Upload failed: post_max_size overflow. Content length {$sizeMb} MB exceeds post_max_size {$maxPost}.");
                http_response_code(200);
                echo json_encode([
                    'success' => false,
                    'message' => "Ukuran berkas ({$sizeMb} MB) melebihi batas post_max_size PHP ({$maxPost}). Silakan atur post_max_size=10G di php.ini atau jalankan server dengan flag -d post_max_size=10G."
                ]);
                exit;
            }

            if (!isset($_FILES['file'])) {
                LoggerService::error("Upload failed: No file parameter in request.");
                echo json_encode(['success' => false, 'message' => 'Tidak ada berkas yang diunggah.']);
                exit;
            }

            $file = $_FILES['file'];

            // Check PHP upload error codes
            if (isset($file['error']) && $file['error'] !== UPLOAD_ERR_OK) {
                $errorMsg = 'Gagal mengunggah berkas.';
                switch ($file['error']) {
                    case UPLOAD_ERR_INI_SIZE:
                    case UPLOAD_ERR_FORM_SIZE:
                        $maxUpload = ini_get('upload_max_filesize');
                        $errorMsg = "Ukuran berkas melebihi batas upload_max_filesize PHP ({$maxUpload}).";
                        break;
                    case UPLOAD_ERR_PARTIAL:
                        $errorMsg = "Pengunggahan terputus di tengah jalan.";
                        break;
                    case UPLOAD_ERR_NO_FILE:
                        $errorMsg = "Tidak ada berkas yang dipilih.";
                        break;
                    case UPLOAD_ERR_CANT_WRITE:
                        $errorMsg = "Gagal menulis berkas ke disk server.";
                        break;
                }
                LoggerService::error("Upload error (Code {$file['error']}): {$errorMsg}");
                echo json_encode(['success' => false, 'message' => $errorMsg]);
                exit;
            }

            $folderId = $_POST['folderId'] ?? null;
            if ($folderId === '')
                $folderId = null;

            $replaceDuplicate = !empty($_POST['replace']) && ($_POST['replace'] === '1' || $_POST['replace'] === 'true');

            self::processUploadedFile($file, $folderId, $replaceDuplicate);
            exit;
        }
    }

    public static function uploadChunk()
    {
        @set_time_limit(0);
        @ini_set('memory_limit', '-1');
        @ini_set('max_execution_time', '0');
        @ini_set('max_input_time', '-1');

        header('Content-Type: application/json');

        $handoffToken = $_POST['upload_token'] ?? $_GET['upload_token'] ?? null;
        if ($handoffToken) {
            $tokenData = self::consumeUploadToken($handoffToken, false);
            if ($tokenData && ($tokenUser = UserModel::getUserById($tokenData['user_id']))) {
                AuthController::startSession();
                $_SESSION['user'] = $tokenUser;
                $_SESSION['user_role'] = 'client';
                $_SESSION['username'] = $tokenUser['username'];
            }
        }

        AuthController::startSession();
        if (empty($_SESSION['user'])) {
            echo json_encode(['success' => false, 'message' => 'Sesi tidak valid atau token kedaluwarsa.']);
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
            exit;
        }

        $uploadId = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['uploadId'] ?? '');
        $chunkIndex = (int) ($_POST['chunkIndex'] ?? 0);
        $totalChunks = (int) ($_POST['totalChunks'] ?? 1);
        $fileName = trim($_POST['fileName'] ?? 'file');
        $folderId = $_POST['folderId'] ?? null;
        if ($folderId === '') $folderId = null;
        $replace = !empty($_POST['replace']) && ($_POST['replace'] === '1' || $_POST['replace'] === 'true');

        if (!$uploadId || empty($_FILES['chunk'])) {
            echo json_encode(['success' => false, 'message' => 'Data chunk tidak valid.']);
            exit;
        }

        $chunkFile = $_FILES['chunk'];
        if (isset($chunkFile['error']) && $chunkFile['error'] !== UPLOAD_ERR_OK) {
            echo json_encode(['success' => false, 'message' => 'Gagal mengunggah potongan berkas ke server (Code: ' . $chunkFile['error'] . ').']);
            exit;
        }

        $tempDir = sys_get_temp_dir() . '/portal_chunks/' . $uploadId;
        if (!is_dir($tempDir)) {
            @mkdir($tempDir, 0777, true);
        }

        $chunkPath = $tempDir . '/chunk_' . sprintf('%05d', $chunkIndex);
        if (!move_uploaded_file($chunkFile['tmp_name'], $chunkPath)) {
            echo json_encode(['success' => false, 'message' => 'Gagal menyimpan potongan berkas ' . $chunkIndex]);
            exit;
        }

        $receivedChunks = glob($tempDir . '/chunk_*');
        if (count($receivedChunks) < $totalChunks) {
            if ($chunkIndex === $totalChunks - 1) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Potongan berkas tidak lengkap (hanya menerima ' . count($receivedChunks) . ' dari ' . $totalChunks . ' potongan).'
                ]);
                exit;
            }
            echo json_encode([
                'success' => true,
                'chunkIndex' => $chunkIndex,
                'totalChunks' => $totalChunks,
                'completed' => false
            ]);
            exit;
        }

        // All chunks received, assemble the final file
        sort($receivedChunks);
        $safeName = preg_replace('/[^a-zA-Z0-9_.-]/', '_', $fileName);
        $assembledPath = sys_get_temp_dir() . '/assembled_' . $uploadId . '_' . $safeName;
        $out = fopen($assembledPath, 'wb');
        foreach ($receivedChunks as $cFile) {
            $in = fopen($cFile, 'rb');
            if ($in) {
                stream_copy_to_stream($in, $out);
                fclose($in);
            }
            @unlink($cFile);
        }
        fclose($out);
        @rmdir($tempDir);

        $userId = !empty($_SESSION['user']['id']) ? $_SESSION['user']['id'] : null;

        // Register a finalize job and kick it off in a background process.
        // Uploading a large file (e.g. 500MB) to Google Drive takes longer than
        // Cloudflare's 100s proxy timeout, which would otherwise abort the last
        // chunk request with error 524. Running it in a background request
        // (internal, no Cloudflare in front) keeps the browser request fast.
        $jobId = self::registerFinalizeJob($uploadId, $assembledPath, $fileName, $folderId, $replace, $userId);
        self::spawnFinalize($jobId);

        echo json_encode([
            'success' => true,
            'chunkIndex' => $chunkIndex,
            'totalChunks' => $totalChunks,
            'completed' => true,
            'finalizing' => true,
            'jobId' => $jobId
        ]);
        exit;
    }

    // ─────────────────────────────────────────────────────────────────────
    // ASYNC FINALIZE JOBS (for files too big to finalize inside a single
    // browser request — avoids Cloudflare 524 on the last chunk).
    // ─────────────────────────────────────────────────────────────────────

    private static function finalizeJobDir()
    {
        $dir = sys_get_temp_dir() . '/portal_finalize';
        if (!is_dir($dir)) {
            @mkdir($dir, 0777, true);
        }
        return $dir;
    }

    private static function registerFinalizeJob($uploadId, $assembledPath, $fileName, $folderId, $replace, $userId)
    {
        $jobId = 'fz_' . substr(md5($uploadId . microtime(true)), 0, 10);
        $data = [
            'jobId' => $jobId,
            'uploadId' => $uploadId,
            'assembledPath' => $assembledPath,
            'fileName' => $fileName,
            'folderId' => $folderId,
            'replace' => $replace,
            'userId' => $userId,
            'status' => 'pending',
            'message' => '',
            'isDuplicate' => false,
            'replaced' => false,
            'created_at' => time(),
        ];
        file_put_contents(self::finalizeJobDir() . '/' . $jobId . '.json', json_encode($data), LOCK_EX);
        return $jobId;
    }

    private static function spawnFinalize($jobId)
    {
        $lock = self::finalizeJobDir() . '/' . $jobId . '.lck';
        if (file_exists($lock)) {
            return;
        }
        @touch($lock);

        // Internal request — fast and not throttled by Cloudflare's 100s limit.
        $port = (int) Config::get('PORTAL_PORT', 80);
        $cmd = 'curl -s --max-time 3600 "http://127.0.0.1:' . $port . '/finalize?jobId=' . rawurlencode($jobId) . '" >/dev/null 2>&1 &';
        @exec($cmd);
    }

    public static function finalizeJobStatus($jobId)
    {
        $path = self::finalizeJobDir() . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $jobId) . '.json';
        if (!is_file($path)) {
            return null;
        }
        return json_decode((string) file_get_contents($path), true);
    }

    public static function finalizeStatus()
    {
        header('Content-Type: application/json');

        $jobId = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['jobId'] ?? '');
        if (!$jobId) {
            echo json_encode(['success' => false, 'message' => 'Job ID diperlukan.']);
            exit;
        }

        $job = self::finalizeJobStatus($jobId);
        if (!$job) {
            echo json_encode(['success' => false, 'message' => 'Job tidak ditemukan.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'jobId' => $jobId,
            'status' => $job['status'] ?? 'unknown',
            'message' => $job['message'] ?? '',
            'isDuplicate' => (bool) ($job['isDuplicate'] ?? false),
            'replaced' => (bool) ($job['replaced'] ?? false),
        ]);
        exit;
    }

    public static function finalize()
    {
        @set_time_limit(0);
        @ini_set('memory_limit', '-1');
        @ini_set('max_execution_time', '0');
        @ini_set('max_input_time', '-1');

        header('Content-Type: application/json');

        $jobId = preg_replace('/[^a-zA-Z0-9_-]/', '', $_GET['jobId'] ?? '');
        $jobPath = self::finalizeJobDir() . '/' . $jobId . '.json';
        if (!$jobId || !is_file($jobPath)) {
            echo json_encode(['success' => false, 'message' => 'Job tidak ditemukan.']);
            exit;
        }

        $job = json_decode((string) file_get_contents($jobPath), true);
        if ($job['status'] === 'processing') {
            echo json_encode(['success' => false, 'message' => 'Job sudah diproses.']);
            exit;
        }

        $job['status'] = 'processing';
        $job['started_at'] = time();
        file_put_contents($jobPath, json_encode($job), LOCK_EX);

        // Rebuild a minimal session for the async worker
        if (!empty($job['userId'])) {
            $jobUser = UserModel::getUserById($job['userId']);
            if ($jobUser) {
                AuthController::startSession();
                $_SESSION['user'] = $jobUser;
                $_SESSION['user_role'] = 'client';
                $_SESSION['username'] = $jobUser['username'];
            }
        }

        $assembledFile = [
            'name' => $job['fileName'],
            'tmp_name' => $job['assembledPath'],
            'size' => is_file($job['assembledPath']) ? filesize($job['assembledPath']) : 0,
            'type' => is_file($job['assembledPath']) ? (mime_content_type($job['assembledPath']) ?: 'application/octet-stream') : 'application/octet-stream',
            'error' => UPLOAD_ERR_OK,
        ];

        $outcome = self::processUploadedFileAsync($assembledFile, $job['folderId'], (bool) $job['replace']);
        $outcome['status'] = ($outcome['success'] ?? false) ? 'done' : 'error';

        // Kick off a background cache warm so the freshly uploaded file is
        // served from local disk (fast) instead of a slow live Google stream
        // through the tunnel on first playback.
        if (!empty($outcome['success'])) {
            $upFile = $outcome['data']['file'] ?? ($outcome['data']['files'][0] ?? null);
            if (!empty($upFile['id'])) {
                $upMime = $upFile['mimeType'] ?? $job['fileName'];
                $isMedia = strpos((string) $upMime, 'video/') === 0 || strpos((string) $upMime, 'image/') === 0 || strpos((string) $upMime, 'audio/') === 0;
                if ($isMedia) {
                    DownloadProxyController::spawnCacheWarm($upFile['id']);
                }
            }
        }

        $job = array_merge($job, $outcome);
        $job['finished_at'] = time();
        file_put_contents($jobPath, json_encode($job), LOCK_EX);

        @unlink($job['assembledPath']);
        @unlink(self::finalizeJobDir() . '/' . $jobId . '.lck');

        echo json_encode(['success' => true, 'jobId' => $jobId, 'status' => 'done']);
        exit;
    }

    /**
     * Same as processUploadedFile but returns structured result instead of
     * printing JSON, so it can be used by the async finalize worker.
     */
    private static function processUploadedFileAsync($file, $folderId = null, $replaceDuplicate = false)
    {
        return self::processUploadedFile($file, $folderId, $replaceDuplicate, true);
    }

    public static function processUploadedFile($file, $folderId = null, $replaceDuplicate = false, $returnResult = false)
    {
        $gatewayUrl = Config::get('GATEWAY_API_URL', 'http://localhost:4000');
        $apiKey = Config::get('GATEWAY_API_KEY');

        $pdo = Config::getPDO();

        $currentUser = $_SESSION['user'] ?? null;
        if ($currentUser && isset($currentUser['id'])) {
            $refreshed = UserModel::getUserById($currentUser['id']);
            if ($refreshed) {
                $_SESSION['user'] = $refreshed;
                $currentUser = $refreshed;
            }
        }
        $userId = $currentUser['id'] ?? null;
        if (!$userId) {
            echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
            exit;
        }
        session_write_close();

        $limitGb = (float) ($currentUser['storage_limit_gb'] ?? 15);
        $limitBytes = $limitGb * 1024 * 1024 * 1024;

        $totalUsedBytes = 0;
        $stmt = $pdo->prepare("SELECT SUM(size_bytes) as total_size FROM files WHERE user_id = ? AND status = 'active'");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        $totalUsedBytes = (float) ($row['total_size'] ?? 0);

        if ($totalUsedBytes + $file['size'] > $limitBytes) {
            echo json_encode([
                'success' => false,
                'message' => 'Pengunggahan ditolak: Ukuran berkas melebihi sisa kuota storage Anda (' . $limitGb . ' GB). Silakan hubungi Administrator.'
            ]);
            exit;
        }

        if (empty($apiKey)) {
            $apiKey = PortalModel::getActiveApiKey($pdo);
        }

        $providerParentId = null;
        $clientRootFolderId = (!empty($currentUser) && !empty($currentUser['root_folder_id'])) ? PortalModel::extractFolderId($currentUser['root_folder_id']) : null;

        if ($folderId) {
            $folder = PortalModel::getFolder($pdo, $userId, $folderId);
            if ($folder && !empty($folder['provider_folder_id'])) {
                $providerParentId = $folder['provider_folder_id'];
            } else {
                $providerParentId = PortalModel::extractFolderId($folderId);
            }
        } else if ($clientRootFolderId) {
            $folderId = $clientRootFolderId;
            $providerParentId = $clientRootFolderId;
        }

        if (empty($providerParentId) && $clientRootFolderId) {
            $providerParentId = $clientRootFolderId;
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $mimeType = !empty($file['type']) ? $file['type'] : '';
        if ($ext === 'apk' && (empty($mimeType) || $mimeType === 'application/octet-stream')) {
            $mimeType = 'application/vnd.android.package-archive';
        }
        if (empty($mimeType)) {
            $mimeType = 'application/octet-stream';
        }

        $filesMeta = [
            [
                'fieldName' => 'file-0',
                'fileName' => $file['name'],
                'mimeType' => $mimeType,
                'sizeBytes' => (string) $file['size'],
            ]
        ];
        if ($providerParentId) {
            $filesMeta[0]['providerParentId'] = $providerParentId;
        }

        $postFields = [
            'filesMeta' => json_encode($filesMeta),
            'file-0' => new CURLFile($file['tmp_name'], $mimeType, $file['name'])
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, rtrim($gatewayUrl, '/') . '/api/v1/uploads');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 0);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $apiKey,
            'Expect:'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        header('Content-Type: application/json');
        if ($response === false) {
            $result = ['success' => false, 'message' => 'Gateway request failed: ' . $curlError];
            if ($returnResult) return $result;
            echo json_encode($result);
        } else {
            $responseData = json_decode($response, true);
            if ($httpCode >= 200 && $httpCode < 300) {
                $uploadedFile = $responseData['file'] ?? ($responseData['files'][0] ?? null);
                $isDuplicateDetected = false;
                $replaced = false;

                if ($uploadedFile && !empty($uploadedFile['id'])) {
                    $fileNameToMatch = $uploadedFile['name'] ?? $file['name'];
                    $targetDbFolderId = !empty($folderId) ? $folderId : $clientRootFolderId;

                    try {
                        if ($targetDbFolderId !== null) {
                            $stmtExist = $pdo->prepare("SELECT id, provider_file_id FROM files WHERE (user_id = ? OR user_id = ?) AND folder_id = ? AND name = ? AND status = 'active'");
                            $stmtExist->execute([$userId, PortalModel::getUserIdFromApiKey($pdo), $targetDbFolderId, $fileNameToMatch]);
                        } else {
                            $stmtExist = $pdo->prepare("SELECT id, provider_file_id FROM files WHERE (user_id = ? OR user_id = ?) AND folder_id IS NULL AND name = ? AND status = 'active'");
                            $stmtExist->execute([$userId, PortalModel::getUserIdFromApiKey($pdo), $fileNameToMatch]);
                        }
                        $existingFiles = $stmtExist->fetchAll();

                        if (!empty($existingFiles)) {
                            $isDuplicateDetected = true;
                        }

                        if ($replaceDuplicate && !empty($existingFiles)) {
                            foreach ($existingFiles as $ef) {
                                $stmtDel = $pdo->prepare("DELETE FROM files WHERE id = ?");
                                $stmtDel->execute([$ef['id']]);
                                if (!empty($ef['provider_file_id'])) {
                                    PortalModel::trashGoogleDriveItem($pdo, $userId, $ef['provider_file_id']);
                                }
                            }
                            $replaced = true;
                        }

                        $stmt = $pdo->prepare("INSERT IGNORE INTO files (id, user_id, folder_id, connected_account_id, provider, provider_file_id, name, mime_type, size_bytes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())");
                        $stmt->execute([
                            $uploadedFile['id'],
                            $userId,
                            $targetDbFolderId,
                            $uploadedFile['connectedAccountId'] ?? '',
                            $uploadedFile['provider'] ?? 'google_drive',
                            $uploadedFile['providerFileId'] ?? '',
                            $uploadedFile['name'] ?? $file['name'],
                            $uploadedFile['mimeType'] ?? $mimeType,
                            (int) ($uploadedFile['sizeBytes'] ?? $file['size']),
                        ]);
                    } catch (Exception $e) {
                        error_log('File record save failed: ' . $e->getMessage());
                    }
                }

                $msg = 'File berhasil diunggah.';
                if ($replaced) {
                    $msg = 'Berkas "' . $file['name'] . '" sudah ada dan telah diganti dengan versi baru.';
                } elseif ($isDuplicateDetected) {
                    $msg = 'Informasi: Berkas dengan nama "' . $file['name'] . '" sudah ada di folder ini.';
                }

                $result = [
                    'success' => true,
                    'completed' => true,
                    'isDuplicate' => $isDuplicateDetected,
                    'replaced' => $replaced,
                    'message' => $msg,
                    'data' => $responseData
                ];
                if ($returnResult) return $result;
                echo json_encode($result);
            } else {
                $result = [
                    'success' => false,
                    'message' => $responseData['message'] ?? 'Gateway returned error code: ' . $httpCode
                ];
                if ($returnResult) return $result;
                echo json_encode($result);
            }
        }
    }
}
