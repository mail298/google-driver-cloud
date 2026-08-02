<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\UploadController.php

class UploadController
{
    public static function uploadTokenDir()
    {
        return sys_get_temp_dir() . '/portal_upload_tokens';
    }

    public static function consumeUploadToken($token)
    {
        if (!is_string($token) || strlen($token) < 32) {
            return null;
        }
        $path = self::uploadTokenDir() . '/' . hash('sha256', $token);
        if (!is_file($path)) {
            return null;
        }
        $data = json_decode((string) file_get_contents($path), true);
        @unlink($path);
        if (!is_array($data) || empty($data['user_id']) || empty($data['exp'])) {
            return null;
        }
        if ((int) $data['exp'] < time()) {
            return null;
        }
        return $data;
    }

    public static function upload()
    {
        @set_time_limit(0);
        @ini_set('memory_limit', '-1');
        @ini_set('max_execution_time', '0');
        @ini_set('max_input_time', '-1');

        $handoffToken = $_POST['upload_token'] ?? $_GET['upload_token'] ?? null;
        if ($handoffToken) {
            require_once dirname(__DIR__) . '/Models/UserModel.php';
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
                http_response_code(200);
                echo json_encode([
                    'success' => false,
                    'message' => "Ukuran berkas ({$sizeMb} MB) melebihi batas post_max_size PHP ({$maxPost}). Silakan atur post_max_size=10G di php.ini atau jalankan server dengan flag -d post_max_size=10G."
                ]);
                exit;
            }

            if (!isset($_FILES['file'])) {
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
                echo json_encode(['success' => false, 'message' => $errorMsg]);
                exit;
            }

            $folderId = $_POST['folderId'] ?? null;
            if ($folderId === '')
                $folderId = null;

            $replaceDuplicate = !empty($_POST['replace']) && ($_POST['replace'] === '1' || $_POST['replace'] === 'true');

            $gatewayUrl = Config::get('GATEWAY_API_URL', 'http://localhost:4000');
            $apiKey = Config::get('GATEWAY_API_KEY');

            // Enforce storage quota limits per user (from session, not API key)
            require_once dirname(__DIR__) . '/Models/PortalModel.php';
            require_once dirname(__DIR__) . '/Models/UserModel.php';
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
            // Immediately release session file lock so PHP does not block concurrent uploads or requests
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

            // Resolve API key owner for gateway upload
            if (empty($apiKey)) {
                $apiKey = PortalModel::getActiveApiKey($pdo);
            }

            // Resolve Google Drive parent folder ID & enforce client root folder isolation
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

            // 1. Prepare filesMeta & auto-detect APK / binary MIME types
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

            // 2. Prepare post fields for cURL
            $postFields = [
                'filesMeta' => json_encode($filesMeta),
                'file-0' => new CURLFile($file['tmp_name'], $mimeType, $file['name'])
            ];

            // 3. Make cURL request to Gateway API with unlimited timeout for large 500MB+ files
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, rtrim($gatewayUrl, '/') . '/api/v1/uploads');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 0); // No timeout for large video uploads
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
                echo json_encode(['success' => false, 'message' => 'Gateway request failed: ' . $curlError]);
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
                            // Check if a file with the same name already exists in this folder
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

                        // Gateway API already uploaded the file into $providerParentId via filesMeta.
                        // Skip redundant Google Drive move API call to save 2-3s of network latency per upload.
                    }

                    $msg = 'File berhasil diunggah.';
                    if ($replaced) {
                        $msg = 'Berkas "' . $file['name'] . '" sudah ada dan telah diganti dengan versi baru.';
                    } elseif ($isDuplicateDetected) {
                        $msg = 'Informasi: Berkas dengan nama "' . $file['name'] . '" sudah ada di folder ini.';
                    }

                    echo json_encode([
                        'success' => true,
                        'isDuplicate' => $isDuplicateDetected,
                        'replaced' => $replaced,
                        'message' => $msg,
                        'data' => $responseData
                    ]);
                } else {
                    echo json_encode([
                        'success' => false,
                        'message' => $responseData['message'] ?? 'Gateway returned error code: ' . $httpCode
                    ]);
                }
            }
            exit;
        }
    }
}
