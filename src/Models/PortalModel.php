<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Models\PortalModel.php

class PortalModel {
    public static function generateUuid() {
        return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
    }

    public static function getUserIdFromApiKey($pdo, $apiKey = null) {
        if (!empty($apiKey)) {
            $prefix = substr($apiKey, 0, 16);
            $stmt = $pdo->prepare("SELECT user_id FROM api_keys WHERE key_prefix = ? AND status = 'active' LIMIT 1");
            $stmt->execute([$prefix]);
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        }

        // Fallback 1: Any active key in api_keys table
        try {
            $stmt = $pdo->query("SELECT user_id FROM api_keys WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        } catch (Exception $e) {}

        // Fallback 2: Any connected account
        try {
            $stmt = $pdo->query("SELECT user_id FROM connected_accounts WHERE status = 'connected' ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        } catch (Exception $e) {}

        // Fallback 3: Any file record
        try {
            $stmt = $pdo->query("SELECT user_id FROM files ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        } catch (Exception $e) {}

        return null;
    }

    public static function getActiveApiKey($pdo) {
        $apiKey = Config::get('GATEWAY_API_KEY');
        if (!empty($apiKey)) return $apiKey;

        try {
            $stmt = $pdo->query("SELECT key_prefix FROM api_keys WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            return $row ? $row['key_prefix'] : '';
        } catch (Exception $e) {
            return '';
        }
    }

    public static function getMasterStorageCapacityGb($pdo, $userId = null) {
        if ($userId) {
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(sa.total_bytes), 0) as total 
                FROM storage_accounts sa 
                JOIN connected_accounts ca ON sa.connected_account_id = ca.id 
                WHERE ca.user_id = ? AND ca.status = 'connected'
            ");
            $stmt->execute([$userId]);
            $bytes = (float)($stmt->fetch()['total'] ?? 0);
            if ($bytes > 0) {
                return round($bytes / (1024 * 1024 * 1024), 2);
            }
        }
        
        $stmt = $pdo->query("
            SELECT COALESCE(SUM(sa.total_bytes), 0) as total 
            FROM storage_accounts sa 
            JOIN connected_accounts ca ON sa.connected_account_id = ca.id 
            WHERE ca.status = 'connected'
        ");
        $bytes = (float)($stmt->fetch()['total'] ?? 0);
        if ($bytes > 0) {
            return round($bytes / (1024 * 1024 * 1024), 2);
        }

        return (float)Config::get('GATEWAY_MASTER_STORAGE_GB', 100);
    }

    public static function getFirstConnectedAccountId($pdo, $userId) {
        $stmt = $pdo->prepare("SELECT id FROM connected_accounts WHERE user_id = ? AND status = 'connected' LIMIT 1");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ? $row['id'] : null;
    }

    public static function extractFolderId($input) {
        $input = trim((string)$input);
        if (empty($input)) return '';
        
        // Extract raw ID if input is a full Google Drive URL like https://drive.google.com/drive/folders/1IDuwu4B...
        if (preg_match('/\/folders\/([a-zA-Z0-9_-]+)/', $input, $matches)) {
            return $matches[1];
        }
        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $input, $matches)) {
            return $matches[1];
        }
        
        return $input;
    }

    public static function getFolders($pdo, $userId, $parentId) {
        if ($parentId === null) {
            $stmt = $pdo->prepare("SELECT * FROM folders WHERE user_id = ? AND parent_id IS NULL AND deleted_at IS NULL ORDER BY name ASC");
            $stmt->execute([$userId]);
        } else {
            $cleanParentId = self::extractFolderId($parentId);
            $parentFolder = self::getFolder($pdo, $userId, $cleanParentId);
            $effectiveDbParentId = $parentFolder ? $parentFolder['id'] : $cleanParentId;

            $stmt = $pdo->prepare("SELECT * FROM folders WHERE user_id = ? AND (parent_id = ? OR parent_id = ?) AND deleted_at IS NULL ORDER BY name ASC");
            $stmt->execute([$userId, $cleanParentId, $effectiveDbParentId]);
        }
        return $stmt->fetchAll();
    }

    public static function getAllFolders($pdo, $userId) {
        $stmt = $pdo->prepare("SELECT * FROM folders WHERE user_id = ? AND deleted_at IS NULL ORDER BY name ASC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function getFolder($pdo, $userId, $folderId) {
        if (!$folderId) return null;
        $cleanId = self::extractFolderId($folderId);
        
        $stmt = $pdo->prepare("
            SELECT * FROM folders 
            WHERE user_id = ? AND (id = ? OR provider_folder_id = ?) AND deleted_at IS NULL 
            LIMIT 1
        ");
        $stmt->execute([$userId, $cleanId, $cleanId]);
        return $stmt->fetch();
    }

    public static function getFiles($pdo, $userId, $folderId) {
        if ($folderId === null) {
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND folder_id IS NULL AND status = 'active' ORDER BY name ASC");
            $stmt->execute([$userId]);
        } else {
            $cleanFolderId = self::extractFolderId($folderId);
            $targetFolder = self::getFolder($pdo, $userId, $cleanFolderId);
            $effectiveDbFolderId = $targetFolder ? $targetFolder['id'] : $cleanFolderId;

            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND (folder_id = ? OR folder_id = ?) AND status = 'active' ORDER BY name ASC");
            $stmt->execute([$userId, $cleanFolderId, $effectiveDbFolderId]);
        }
        return $stmt->fetchAll();
    }

    public static function decryptText($payload, $secret) {
        $parts = explode(':', $payload);
        if (count($parts) !== 3) return null;
        list($ivBase64, $tagBase64, $encryptedBase64) = $parts;
        $key = hash('sha256', $secret, true);
        return openssl_decrypt(base64_decode($encryptedBase64), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, base64_decode($ivBase64), base64_decode($tagBase64));
    }

    public static function getGoogleDriveToken($pdo, $userId) {
        $cacheKey = 'gdrive_token_' . $userId;
        $cached = apcu_fetch($cacheKey);
        if ($cached !== false) return $cached;

        $encryptionKey = Config::get('TOKEN_ENCRYPTION_KEY');
        $clientId = Config::get('GOOGLE_CLIENT_ID');
        $clientSecret = Config::get('GOOGLE_CLIENT_SECRET');

        $stmt = $pdo->prepare("SELECT * FROM connected_accounts WHERE user_id = ? AND provider = 'google_drive' AND status = 'connected' ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$userId]);
        $acc = $stmt->fetch();

        if (!$acc) {
            $gatewayUserId = self::getUserIdFromApiKey($pdo);
            if ($gatewayUserId && $gatewayUserId !== $userId) {
                $stmt = $pdo->prepare("SELECT * FROM connected_accounts WHERE user_id = ? AND provider = 'google_drive' AND status = 'connected' ORDER BY created_at DESC LIMIT 1");
                $stmt->execute([$gatewayUserId]);
                $acc = $stmt->fetch();
            }
        }

        if (!$acc) {
            $stmt = $pdo->query("SELECT * FROM connected_accounts WHERE provider = 'google_drive' AND status = 'connected' ORDER BY created_at DESC LIMIT 1");
            $acc = $stmt->fetch();
        }

        if (!$acc) return null;

        $accessToken = !empty($acc['access_token_encrypted']) ? self::decryptText($acc['access_token_encrypted'], $encryptionKey) : null;
        $refreshToken = !empty($acc['refresh_token_encrypted']) ? self::decryptText($acc['refresh_token_encrypted'], $encryptionKey) : null;

        if ($accessToken) {
            $ch = curl_init("https://www.googleapis.com/drive/v3/files?pageSize=1");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $accessToken"]);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($code === 200) {
                $result = ['token' => $accessToken, 'connected_account_id' => $acc['id']];
                apcu_store($cacheKey, $result, 1500);
                return $result;
            }
        }

        if ($refreshToken && $clientId && $clientSecret) {
            $ch = curl_init("https://oauth2.googleapis.com/token");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'refresh_token' => $refreshToken,
                'grant_type' => 'refresh_token'
            ]));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $res = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($res, true);
            if (isset($data['access_token'])) {
                $result = ['token' => $data['access_token'], 'connected_account_id' => $acc['id']];
                apcu_store($cacheKey, $result, 1500);
                return $result;
            }
        }

        return null;
    }

    public static function createFolderOnGoogleDrive($pdo, $userId, $parentId, $name) {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token'])) {
                return null;
            }

            $parents = [];
            if (!empty($parentId)) {
                $cleanParentId = self::extractFolderId($parentId);
                $parentFolder = self::getFolder($pdo, $userId, $cleanParentId);
                if ($parentFolder && !empty($parentFolder['provider_folder_id'])) {
                    $parents[] = $parentFolder['provider_folder_id'];
                } else {
                    $parents[] = $cleanParentId;
                }
            }

            $requestBody = [
                'name' => $name,
                'mimeType' => 'application/vnd.google-apps.folder'
            ];
            if (!empty($parents)) {
                $requestBody['parents'] = $parents;
            }

            $ch = curl_init("https://www.googleapis.com/drive/v3/files");
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $tokenInfo['token'],
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode >= 200 && $httpCode < 300) {
                $data = json_decode($response, true);
                return [
                    'provider_folder_id' => $data['id'] ?? null,
                    'connected_account_id' => $tokenInfo['connected_account_id']
                ];
            }
        } catch (Exception $e) {
            // Ignore
        }
        return null;
    }

    public static function createFolder($pdo, $userId, $parentId, $name) {
        $effectiveParentId = $parentId;
        if (empty($effectiveParentId)) {
            $stmtUser = $pdo->prepare("SELECT root_folder_id FROM users WHERE id = ? LIMIT 1");
            $stmtUser->execute([$userId]);
            $userRow = $stmtUser->fetch();
            if ($userRow && !empty($userRow['root_folder_id'])) {
                $effectiveParentId = self::extractFolderId($userRow['root_folder_id']);
            }
        }

        // Duplicate folder spam protection: return existing folder ID if folder with same name exists under parent
        if (!empty($effectiveParentId)) {
            $stmtCheck = $pdo->prepare("SELECT id FROM folders WHERE user_id = ? AND parent_id = ? AND name = ? LIMIT 1");
            $stmtCheck->execute([$userId, $effectiveParentId, $name]);
            $existing = $stmtCheck->fetch();
            if ($existing) {
                return $existing['id'];
            }
        } else {
            $stmtCheck = $pdo->prepare("SELECT id FROM folders WHERE user_id = ? AND parent_id IS NULL AND name = ? LIMIT 1");
            $stmtCheck->execute([$userId, $name]);
            $existing = $stmtCheck->fetch();
            if ($existing) {
                return $existing['id'];
            }
        }

        $id = self::generateUuid();
        $connectedAccountId = self::getFirstConnectedAccountId($pdo, $userId);

        $gdriveResult = self::createFolderOnGoogleDrive($pdo, $userId, $effectiveParentId, $name);
        $providerFolderId = $gdriveResult['provider_folder_id'] ?? null;
        if (!empty($gdriveResult['connected_account_id'])) {
            $connectedAccountId = $gdriveResult['connected_account_id'];
        }

        $stmt = $pdo->prepare("INSERT INTO folders (id, user_id, parent_id, connected_account_id, provider, provider_folder_id, name, color, created_at, updated_at) VALUES (?, ?, ?, ?, 'google_drive', ?, ?, 'text-blue-500', NOW(), NOW())");
        $stmt->execute([$id, $userId, $parentId, $connectedAccountId, $providerFolderId, $name]);
        return $id;
    }

    public static function getFolderBreadcrumbs($pdo, $userId, $folderId) {
        $crumbs = [];
        $currentId = $folderId;
        while ($currentId !== null) {
            $folder = self::getFolder($pdo, $userId, $currentId);
            if (!$folder) break;
            array_unshift($crumbs, $folder);
            $currentId = $folder['parent_id'];
        }
        return $crumbs;
    }

    public static function updateGoogleDriveItemName($pdo, $userId, $providerId, $newName) {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token'])) return false;

            $ch = curl_init("https://www.googleapis.com/drive/v3/files/" . urlencode($providerId));
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $tokenInfo['token'],
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['name' => $newName]));
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return ($code >= 200 && $code < 300);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function trashGoogleDriveItem($pdo, $userId, $providerId) {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token'])) return false;

            $ch = curl_init("https://www.googleapis.com/drive/v3/files/" . urlencode($providerId));
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $tokenInfo['token'],
                "Content-Type: application/json"
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['trashed' => true]));
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return ($code >= 200 && $code < 300);
        } catch (Exception $e) {
            return false;
        }
    }

    public static function renameFolder($pdo, $userId, $folderId, $newName) {
        $folder = self::getFolder($pdo, $userId, $folderId);
        if ($folder && !empty($folder['provider_folder_id'])) {
            self::updateGoogleDriveItemName($pdo, $userId, $folder['provider_folder_id'], $newName);
        }
        $stmt = $pdo->prepare("UPDATE folders SET name = ?, updated_at = NOW() WHERE user_id = ? AND (id = ? OR provider_folder_id = ?)");
        return $stmt->execute([$newName, $userId, $folderId, $folderId]);
    }

    public static function deleteFolder($pdo, $userId, $folderId) {
        // Protect admin-assigned Root Folder from being deleted
        $user = UserModel::getUserById($userId);
        if ($user && !empty($user['root_folder_id'])) {
            $rootId = self::extractFolderId($user['root_folder_id']);
            if (!empty($rootId)) {
                $folderObj = self::getFolder($pdo, $userId, $folderId);
                if ($folderId === $rootId || ($folderObj && ($folderObj['id'] === $rootId || $folderObj['provider_folder_id'] === $rootId))) {
                    // Root folder protected - cannot be deleted by client
                    return false;
                }
            }
        }

        $folder = self::getFolder($pdo, $userId, $folderId);
        if ($folder && !empty($folder['provider_folder_id'])) {
            self::trashGoogleDriveItem($pdo, $userId, $folder['provider_folder_id']);
        }
        $stmt = $pdo->prepare("UPDATE folders SET deleted_at = NOW() WHERE user_id = ? AND (id = ? OR provider_folder_id = ?)");
        return $stmt->execute([$userId, $folderId, $folderId]);
    }

    public static function renameFile($pdo, $userId, $fileId, $newName) {
        $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND id = ? LIMIT 1");
        $stmt->execute([$userId, $fileId]);
        $file = $stmt->fetch();
        if ($file && !empty($file['provider_file_id'])) {
            self::updateGoogleDriveItemName($pdo, $userId, $file['provider_file_id'], $newName);
        }
        $stmt = $pdo->prepare("UPDATE files SET name = ?, updated_at = NOW() WHERE user_id = ? AND id = ?");
        return $stmt->execute([$newName, $userId, $fileId]);
    }

    public static function deleteFile($pdo, $userId, $fileId) {
        $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND id = ? LIMIT 1");
        $stmt->execute([$userId, $fileId]);
        $file = $stmt->fetch();
        if ($file && !empty($file['provider_file_id'])) {
            self::trashGoogleDriveItem($pdo, $userId, $file['provider_file_id']);
        }
        $stmt = $pdo->prepare("UPDATE files SET status = 'deleted', deleted_at = NOW() WHERE user_id = ? AND id = ?");
        return $stmt->execute([$userId, $fileId]);
    }

    public static function moveItem($pdo, $userId, $type, $id, $targetFolderId) {
        if ($targetFolderId === '') $targetFolderId = null;

        if ($type === 'folder') {
            $folder = self::getFolder($pdo, $userId, $id);
            if (!$folder) return false;

            if (!empty($folder['provider_folder_id'])) {
                self::moveGoogleDriveItem($pdo, $userId, $folder['provider_folder_id'], $targetFolderId);
            }

            $stmt = $pdo->prepare("UPDATE folders SET parent_id = ?, updated_at = NOW() WHERE user_id = ? AND (id = ? OR provider_folder_id = ?)");
            return $stmt->execute([$targetFolderId, $userId, $id, $id]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND id = ? LIMIT 1");
            $stmt->execute([$userId, $id]);
            $file = $stmt->fetch();
            if (!$file) return false;

            if (!empty($file['provider_file_id'])) {
                self::moveGoogleDriveItem($pdo, $userId, $file['provider_file_id'], $targetFolderId);
            }

            $stmt = $pdo->prepare("UPDATE files SET folder_id = ?, updated_at = NOW() WHERE user_id = ? AND id = ?");
            return $stmt->execute([$targetFolderId, $userId, $id]);
        }
    }

    public static function moveGoogleDriveItem($pdo, $userId, $providerId, $targetParentId) {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token'])) return false;

            $ch = curl_init("https://www.googleapis.com/drive/v3/files/" . urlencode($providerId) . "?fields=parents");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $tokenInfo['token']]);
            $res = curl_exec($ch);
            curl_close($ch);
            $data = json_decode($res, true);
            $previousParents = implode(',', $data['parents'] ?? []);

            $cleanTargetId = self::extractFolderId($targetParentId);
            if ($cleanTargetId) {
                $targetFolder = self::getFolder($pdo, $userId, $cleanTargetId);
                if ($targetFolder && !empty($targetFolder['provider_folder_id'])) {
                    $cleanTargetId = $targetFolder['provider_folder_id'];
                }
            }

            $url = "https://www.googleapis.com/drive/v3/files/" . urlencode($providerId);
            $queryParams = [];
            if (!empty($cleanTargetId)) $queryParams['addParents'] = $cleanTargetId;
            if (!empty($previousParents)) $queryParams['removeParents'] = $previousParents;

            if (!empty($queryParams)) {
                $url .= '?' . http_build_query($queryParams);
            }

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $tokenInfo['token'],
                "Content-Type: application/json"
            ]);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return ($code >= 200 && $code < 300);
        } catch (Exception $e) {
            return false;
        }
    }
}
