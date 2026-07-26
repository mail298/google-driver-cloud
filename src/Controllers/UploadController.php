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

            $gatewayUrl = Config::get('GATEWAY_API_URL', 'http://localhost:4000');
            $apiKey = Config::get('GATEWAY_API_KEY');

            // Enforce storage quota limits
            require_once dirname(__DIR__) . '/Models/PortalModel.php';
            require_once dirname(__DIR__) . '/Models/UserModel.php';
            $pdo = Config::getPDO();
            if (empty($apiKey)) {
                $apiKey = PortalModel::getActiveApiKey($pdo);
            }
            $userId = PortalModel::getUserIdFromApiKey($pdo, $apiKey);

            $currentUser = $_SESSION['user'] ?? null;
            if ($currentUser && isset($currentUser['id'])) {
                $refreshed = UserModel::getUserById($currentUser['id']);
                if ($refreshed) {
                    $_SESSION['user'] = $refreshed;
                    $currentUser = $refreshed;
                }
            }
            $limitGb = (float) ($currentUser['storage_limit_gb'] ?? 15);
            $limitBytes = $limitGb * 1024 * 1024 * 1024;

            $totalUsedBytes = 0;
            if ($userId) {
                $stmt = $pdo->prepare("SELECT SUM(size_bytes) as total_size FROM files WHERE user_id = ? AND status = 'active'");
                $stmt->execute([$userId]);
                $row = $stmt->fetch();
                $totalUsedBytes = (float) ($row['total_size'] ?? 0);
            }

            if ($totalUsedBytes + $file['size'] > $limitBytes) {
                header('Content-Type: application/json');
                echo json_encode([
                    'success' => false,
                    'message' => 'Pengunggahan ditolak: Ukuran berkas melebihi sisa kuota storage Anda (' . $limitGb . ' GB). Silakan hubungi Administrator.'
                ]);
                exit;
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
            if ($folderId !== null) {
                $filesMeta[0]['folderId'] = $folderId;
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
