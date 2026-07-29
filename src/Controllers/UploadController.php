<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\UploadController.php

class UploadController
{
    public static function upload()
    {
        AuthController::checkClient();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!isset($_FILES['file'])) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'No file uploaded.']);
                exit;
            }

            $file = $_FILES['file'];
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
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
                exit;
            }

            $limitGb = (float) ($currentUser['storage_limit_gb'] ?? 15);
            $limitBytes = $limitGb * 1024 * 1024 * 1024;

            $totalUsedBytes = 0;
            $stmt = $pdo->prepare("SELECT SUM(size_bytes) as total_size FROM files WHERE user_id = ? AND status = 'active'");
            $stmt->execute([$userId]);
            $row = $stmt->fetch();
            $totalUsedBytes = (float) ($row['total_size'] ?? 0);

            if ($totalUsedBytes + $file['size'] > $limitBytes) {
                header('Content-Type: application/json');
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

            // Resolve Google Drive parent folder ID
            $providerParentId = null;
            if ($folderId) {
                $folder = PortalModel::getFolder($pdo, $userId, $folderId);
                if ($folder && !empty($folder['provider_folder_id'])) {
                    $providerParentId = $folder['provider_folder_id'];
                } else {
                    $providerParentId = PortalModel::extractFolderId($folderId);
                }
            }
            if (empty($providerParentId) && $currentUser && !empty($currentUser['root_folder_id'])) {
                $providerParentId = PortalModel::extractFolderId($currentUser['root_folder_id']);
            }

            // 1. Prepare filesMeta
            $mimeType = !empty($file['type']) ? $file['type'] : 'application/octet-stream';
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

            // 3. Make cURL request to  API
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, rtrim($gatewayUrl, '/') . '/api/v1/uploads');
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postFields);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $apiKey
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
                    if ($uploadedFile && !empty($uploadedFile['id'])) {
                        try {
                            if ($replaceDuplicate) {
                                $fileNameToMatch = $uploadedFile['name'] ?? $file['name'];
                                if ($folderId !== null) {
                                    $stmtExist = $pdo->prepare("SELECT id, provider_file_id FROM files WHERE user_id = ? AND folder_id = ? AND name = ? AND status = 'active'");
                                    $stmtExist->execute([$userId, $folderId, $fileNameToMatch]);
                                } else {
                                    $stmtExist = $pdo->prepare("SELECT id, provider_file_id FROM files WHERE user_id = ? AND folder_id IS NULL AND name = ? AND status = 'active'");
                                    $stmtExist->execute([$userId, $fileNameToMatch]);
                                }
                                $existingFiles = $stmtExist->fetchAll();
                                foreach ($existingFiles as $ef) {
                                    $stmtDel = $pdo->prepare("DELETE FROM files WHERE id = ?");
                                    $stmtDel->execute([$ef['id']]);
                                    if (!empty($ef['provider_file_id'])) {
                                        PortalModel::trashGoogleDriveItem($pdo, $userId, $ef['provider_file_id']);
                                    }
                                }
                            }

                            $stmt = $pdo->prepare("INSERT IGNORE INTO files (id, user_id, folder_id, connected_account_id, provider, provider_file_id, name, mime_type, size_bytes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())");
                            $stmt->execute([
                                $uploadedFile['id'],
                                $userId,
                                !empty($folderId) ? $folderId : null,
                                $uploadedFile['connectedAccountId'] ?? '',
                                $uploadedFile['provider'] ?? 'google_drive',
                                $uploadedFile['providerFileId'] ?? '',
                                $uploadedFile['name'] ?? $file['name'],
                                $uploadedFile['mimeType'] ?? $mimeType,
                                (int)($uploadedFile['sizeBytes'] ?? $file['size']),
                            ]);
                        } catch (Exception $e) {
                            error_log('File record save failed: ' . $e->getMessage());
                        }

                        // Automatically move uploaded file to client's designated Google Drive folder
                        $providerFileId = $uploadedFile['providerFileId'] ?? '';
                        if (!empty($providerParentId) && !empty($providerFileId)) {
                            PortalModel::moveGoogleDriveItem($pdo, $userId, $providerFileId, $providerParentId);
                        }
                    }
                    echo json_encode(['success' => true, 'data' => $responseData]);
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
