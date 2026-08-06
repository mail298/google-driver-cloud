<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Models\PortalModel.php

require_once dirname(__DIR__) . '/Models/UserModel.php';

class PortalModel
{
    public static function generateUuid()
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40); // version 4
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80); // variant RFC 4122
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    public static function getUserIdFromApiKey($pdo, $apiKey = null)
    {
        // Explicitly provided key wins
        if (!empty($apiKey)) {
            $prefix = substr($apiKey, 0, 16);
            $stmt = $pdo->prepare("SELECT user_id FROM api_keys WHERE key_prefix = ? AND status = 'active' LIMIT 1");
            $stmt->execute([$prefix]);
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        }

        // Fallback 1: The configured GATEWAY_API_KEY maps to the gateway user.
        // This is deterministic and avoids attributing arbitrary users' files
        // to a client when no key is passed in.
        $configKey = Config::get('GATEWAY_API_KEY', '');
        if (!empty($configKey)) {
            $prefix = substr($configKey, 0, 16);
            $stmt = $pdo->prepare("SELECT user_id FROM api_keys WHERE key_prefix = ? AND status = 'active' LIMIT 1");
            $stmt->execute([$prefix]);
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        }

        // Fallback 2: The gateway user may be the most recent key in the table.
        // Only used when no GATEWAY_API_KEY is configured at all.
        try {
            $stmt = $pdo->query("SELECT user_id FROM api_keys WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        } catch (Exception $e) {
        }

        // Fallback 3: Any connected account
        try {
            $stmt = $pdo->query("SELECT user_id FROM connected_accounts WHERE status = 'connected' ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            if ($row && !empty($row['user_id'])) {
                return $row['user_id'];
            }
        } catch (Exception $e) {
        }

        return null;
    }

    public static function getActiveApiKey($pdo)
    {
        $apiKey = Config::get('GATEWAY_API_KEY');
        if (!empty($apiKey))
            return $apiKey;

        try {
            $stmt = $pdo->query("SELECT key_prefix FROM api_keys WHERE status = 'active' ORDER BY created_at DESC LIMIT 1");
            $row = $stmt->fetch();
            return $row ? $row['key_prefix'] : '';
        } catch (Exception $e) {
            return '';
        }
    }

    public static function getMasterStorageCapacityGb($pdo, $userId = null)
    {
        if ($userId) {
            $stmt = $pdo->prepare("
                SELECT COALESCE(SUM(sa.total_bytes), 0) as total 
                FROM storage_accounts sa 
                JOIN connected_accounts ca ON sa.connected_account_id = ca.id 
                WHERE ca.user_id = ? AND ca.status = 'connected'
            ");
            $stmt->execute([$userId]);
            $bytes = (float) ($stmt->fetch()['total'] ?? 0);
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
        $bytes = (float) ($stmt->fetch()['total'] ?? 0);
        if ($bytes > 0) {
            return round($bytes / (1024 * 1024 * 1024), 2);
        }

        return (float) Config::get('GATEWAY_MASTER_STORAGE_GB', 100);
    }

    public static function getFirstConnectedAccountId($pdo, $userId)
    {
        $stmt = $pdo->prepare("SELECT id FROM connected_accounts WHERE user_id = ? AND status = 'connected' LIMIT 1");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return $row ? $row['id'] : null;
    }

    public static function extractFolderId($input)
    {
        $input = trim((string) $input);
        if (empty($input))
            return '';

        // Extract raw ID if input is a full Google Drive URL like https://drive.google.com/drive/folders/1IDuwu4B...
        if (preg_match('/\/folders\/([a-zA-Z0-9_-]+)/', $input, $matches)) {
            return $matches[1];
        }
        if (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $input, $matches)) {
            return $matches[1];
        }

        return $input;
    }

    public static function getFolders($pdo, $userId, $parentId)
    {
        if ($parentId === null) {
            // At root level: exclude the Folder Klien container (it's a root wrapper, not a user folder)
            $stmt = $pdo->prepare("SELECT * FROM folders WHERE user_id = ? AND parent_id IS NULL AND name != 'Folder Klien' AND deleted_at IS NULL ORDER BY name ASC");
            $stmt->execute([$userId]);
        } else {
            $cleanParentId = self::extractFolderId($parentId);
            $parentFolder = self::getFolder($pdo, $userId, $cleanParentId);

            $parentIds = array_values(array_filter(array_unique([
                $cleanParentId,
                $parentFolder ? $parentFolder['id'] : null,
                $parentFolder ? ($parentFolder['provider_folder_id'] ?? null) : null
            ])));

            $placeholders = implode(',', array_fill(0, count($parentIds), '?'));
            $params = array_merge([$userId], $parentIds);

            // Inside a folder: show direct children, excluding any Folder Klien wrappers
            $stmt = $pdo->prepare("SELECT * FROM folders WHERE user_id = ? AND parent_id IN ($placeholders) AND name != 'Folder Klien' AND deleted_at IS NULL ORDER BY name ASC");
            $stmt->execute($params);
        }
        return $stmt->fetchAll();
    }

    public static function getAllFolders($pdo, $userId)
    {
        $stmt = $pdo->prepare("SELECT * FROM folders WHERE user_id = ? AND name != 'Folder Klien' AND deleted_at IS NULL ORDER BY name ASC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public static function getFolder($pdo, $userId, $folderId)
    {
        if (!$folderId)
            return null;
        $cleanId = self::extractFolderId($folderId);

        $stmt = $pdo->prepare("
            SELECT * FROM folders 
            WHERE user_id = ? AND (id = ? OR provider_folder_id = ?) AND deleted_at IS NULL 
            LIMIT 1
        ");
        $stmt->execute([$userId, $cleanId, $cleanId]);
        return $stmt->fetch();
    }

    public static function getFiles($pdo, $userId, $folderId)
    {
        if ($folderId === null) {
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND folder_id IS NULL AND status = 'active' ORDER BY name ASC");
            $stmt->execute([$userId]);
        } else {
            $cleanFolderId = self::extractFolderId($folderId);
            $targetFolder = self::getFolder($pdo, $userId, $cleanFolderId);

            $folderIds = array_values(array_filter(array_unique([
                $cleanFolderId,
                $targetFolder ? $targetFolder['id'] : null,
                $targetFolder ? ($targetFolder['provider_folder_id'] ?? null) : null
            ])));

            $placeholders = implode(',', array_fill(0, count($folderIds), '?'));
            $params = array_merge([$userId], $folderIds);

            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND folder_id IN ($placeholders) AND status = 'active' ORDER BY name ASC");
            $stmt->execute($params);
        }
        return $stmt->fetchAll();
    }

    public static function searchFiles($pdo, $userId, string $query): array
    {
        $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND status = 'active' AND name LIKE ? ORDER BY name ASC");
        $stmt->execute([$userId, '%' . $query . '%']);
        return $stmt->fetchAll();
    }

    public static function syncFolderOwner($pdo, $userId, $folderId): void
    {
        try {
            $stmt = $pdo->prepare("UPDATE folders SET user_id = ? WHERE provider_folder_id = ? OR id = ?");
            $stmt->execute([$userId, $folderId, $folderId]);
        } catch (Exception $e) {
        }
    }

    public static function assignOrphanFiles($pdo, $userId, $folderId): void
    {
        try {
            $stmt = $pdo->prepare("UPDATE files SET folder_id = ? WHERE user_id = ? AND (folder_id IS NULL OR folder_id = '')");
            $stmt->execute([$folderId, $userId]);
        } catch (Exception $e) {
        }
    }

    public static function autoCreateClientRootFolder($pdo, $userId, $clientRootFolderId, $gatewayUserId): void
    {
        try {
            $connectedAccountId = self::getFirstConnectedAccountId($pdo, $gatewayUserId);
            $stmt = $pdo->prepare("INSERT INTO folders (id, user_id, parent_id, connected_account_id, provider, provider_folder_id, name, color, created_at, updated_at) VALUES (?, ?, NULL, ?, 'google_drive', ?, 'Folder Klien', 'text-amber-500', NOW(), NOW()) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), provider_folder_id = VALUES(provider_folder_id), deleted_at = NULL, updated_at = NOW()");
            $stmt->execute([$clientRootFolderId, $userId, $connectedAccountId, $clientRootFolderId]);
        } catch (Exception $e) {
        }
    }

    public static function getStorageStatsByUser($pdo, $userId): array
    {
        $stmt = $pdo->prepare("
            SELECT
                SUM(CASE WHEN mime_type LIKE 'image/%' THEN size_bytes ELSE 0 END) AS photo_bytes,
                SUM(CASE WHEN mime_type LIKE 'video/%' THEN size_bytes ELSE 0 END) AS video_bytes,
                SUM(CASE WHEN mime_type NOT LIKE 'image/%' AND mime_type NOT LIKE 'video/%' THEN size_bytes ELSE 0 END) AS document_bytes
            FROM files WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        return [
            'photo_bytes'    => (float) ($row['photo_bytes'] ?? 0),
            'video_bytes'    => (float) ($row['video_bytes'] ?? 0),
            'document_bytes' => (float) ($row['document_bytes'] ?? 0),
        ];
    }

    public static function encryptText($plaintext, $secret)
    {
        $key = hash('sha256', $secret, true);
        $iv = openssl_random_pseudo_bytes(12);
        $tag = '';
        $encrypted = openssl_encrypt($plaintext, 'aes-256-gcm', $key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($iv) . ':' . base64_encode($tag) . ':' . base64_encode($encrypted);
    }

    public static function decryptText($payload, $secret)
    {
        $parts = explode(':', $payload);
        if (count($parts) !== 3)
            return null;
        list($ivBase64, $tagBase64, $encryptedBase64) = $parts;
        $key = hash('sha256', $secret, true);
        return openssl_decrypt(base64_decode($encryptedBase64), 'aes-256-gcm', $key, OPENSSL_RAW_DATA, base64_decode($ivBase64), base64_decode($tagBase64));
    }

    private static $cacheMemory = [];

    private static function cacheFetch($key)
    {
        if (function_exists('apcu_fetch')) {
            return apcu_fetch($key);
        }
        return isset(self::$cacheMemory[$key]) ? self::$cacheMemory[$key] : false;
    }

    private static function cacheStore($key, $var, $ttl = 0)
    {
        if (function_exists('apcu_store')) {
            return apcu_store($key, $var, $ttl);
        }
        self::$cacheMemory[$key] = $var;
        return true;
    }

    public static function cacheDelete($key)
    {
        if (function_exists('apcu_delete')) {
            return apcu_delete($key);
        }
        unset(self::$cacheMemory[$key]);
        return true;
    }

    public static function getGoogleDriveToken($pdo, $userId)
    {
        $cacheKey = 'gdrive_token_' . $userId;
        $cached = self::cacheFetch($cacheKey);
        if ($cached !== false)
            return $cached;

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

        if (!$acc)
            return null;

        $accessToken = !empty($acc['access_token_encrypted']) ? self::decryptText($acc['access_token_encrypted'], $encryptionKey) : null;
        $refreshToken = !empty($acc['refresh_token_encrypted']) ? self::decryptText($acc['refresh_token_encrypted'], $encryptionKey) : null;

        $tokenExpired = true;
        if (!empty($acc['token_expires_at'])) {
            $expiresAt = strtotime($acc['token_expires_at']);
            $tokenExpired = $expiresAt === false || $expiresAt <= (time() + 120);
        }

        if ($accessToken && !$tokenExpired) {
            $result = ['token' => $accessToken, 'connected_account_id' => $acc['id']];
            self::cacheStore($cacheKey, $result, 1500);
            return $result;
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
                $newExpiresAt = isset($data['expires_in']) ? date('Y-m-d H:i:s', time() + (int)$data['expires_in']) : null;
                $encryptedNew = self::encryptText($data['access_token'], $encryptionKey);
                $stmt = $pdo->prepare("UPDATE connected_accounts SET access_token_encrypted = ?, token_expires_at = ?, updated_at = NOW() WHERE id = ?");
                $stmt->execute([$encryptedNew, $newExpiresAt, $acc['id']]);
                self::cacheStore($cacheKey, $result, 1500);
                return $result;
            }
        }

        return null;
    }

    public static function createFolderOnGoogleDrive($pdo, $userId, $parentId, $name)
    {
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

            $ch = curl_init("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true");
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

    public static function createFolder($pdo, $userId, $parentId, $name)
    {
        $effectiveParentId = $parentId;
        if (empty($effectiveParentId)) {
            $user = UserModel::getUserById($userId);
            if ($user && !empty($user['root_folder_id'])) {
                $effectiveParentId = self::extractFolderId($user['root_folder_id']);
            }
        }

        // Duplicate folder spam protection: return existing active folder ID if folder with same name exists under parent
        if (!empty($effectiveParentId)) {
            $stmtCheck = $pdo->prepare("SELECT id FROM folders WHERE user_id = ? AND parent_id = ? AND name = ? AND deleted_at IS NULL LIMIT 1");
            $stmtCheck->execute([$userId, $effectiveParentId, $name]);
            $existing = $stmtCheck->fetch();
            if ($existing) {
                return $existing['id'];
            }
        } else {
            $stmtCheck = $pdo->prepare("SELECT id FROM folders WHERE user_id = ? AND parent_id IS NULL AND name = ? AND deleted_at IS NULL LIMIT 1");
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
        $stmt->execute([$id, $userId, $effectiveParentId, $connectedAccountId, $providerFolderId, $name]);
        return $id;
    }

    public static function getFolderBreadcrumbs($pdo, $userId, $folderId)
    {
        $crumbs = [];
        $currentId = $folderId;
        while ($currentId !== null) {
            $folder = self::getFolder($pdo, $userId, $currentId);
            if (!$folder)
                break;
            array_unshift($crumbs, $folder);
            $currentId = $folder['parent_id'];
        }
        return $crumbs;
    }

    public static function updateGoogleDriveItemName($pdo, $userId, $providerId, $newName)
    {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token']))
                return false;

            $ch = curl_init("https://www.googleapis.com/drive/v3/files/" . urlencode($providerId) . "?supportsAllDrives=true");
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

    public static function trashGoogleDriveItem($pdo, $userId, $providerId)
    {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token']))
                return false;

            $ch = curl_init("https://www.googleapis.com/drive/v3/files/" . urlencode($providerId) . "?supportsAllDrives=true");
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

    public static function renameFolder($pdo, $userId, $folderId, $newName)
    {
        $folder = self::getFolder($pdo, $userId, $folderId);
        if ($folder && !empty($folder['provider_folder_id'])) {
            self::updateGoogleDriveItemName($pdo, $userId, $folder['provider_folder_id'], $newName);
        }
        $stmt = $pdo->prepare("UPDATE folders SET name = ?, updated_at = NOW() WHERE user_id = ? AND (id = ? OR provider_folder_id = ?)");
        return $stmt->execute([$newName, $userId, $folderId, $folderId]);
    }

    public static function deleteFolder($pdo, $userId, $folderId)
    {
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

    public static function renameFile($pdo, $userId, $fileId, $newName)
    {
        $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND id = ? LIMIT 1");
        $stmt->execute([$userId, $fileId]);
        $file = $stmt->fetch();
        if ($file && !empty($file['provider_file_id'])) {
            self::updateGoogleDriveItemName($pdo, $userId, $file['provider_file_id'], $newName);
        }
        // Purge disk cache so renamed file metadata is refreshed on next request
        if ($file) {
            $etag = '"' . md5($file['id'] . '_' . ($file['updated_at'] ?? '') . '_' . $file['size_bytes']) . '"';
            DownloadProxyController::invalidateCache($file['id'], $etag);
        }
        $stmt = $pdo->prepare("UPDATE files SET name = ?, updated_at = NOW() WHERE user_id = ? AND id = ?");
        return $stmt->execute([$newName, $userId, $fileId]);
    }

    public static function deleteFile($pdo, $userId, $fileId)
    {
        $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND id = ? LIMIT 1");
        $stmt->execute([$userId, $fileId]);
        $file = $stmt->fetch();
        if ($file && !empty($file['provider_file_id'])) {
            self::trashGoogleDriveItem($pdo, $userId, $file['provider_file_id']);
        }
        // Purge local disk cache immediately so stale files don't occupy disk for up to 7 days
        if ($file) {
            $etag = '"' . md5($file['id'] . '_' . ($file['updated_at'] ?? '') . '_' . $file['size_bytes']) . '"';
            DownloadProxyController::invalidateCache($file['id'], $etag);
        }
        $stmt = $pdo->prepare("UPDATE files SET status = 'deleted', deleted_at = NOW() WHERE user_id = ? AND id = ?");
        return $stmt->execute([$userId, $fileId]);
    }

    public static function moveItem($pdo, $userId, $type, $id, $targetFolderId)
    {
        if (empty($targetFolderId)) {
            $user = UserModel::getUserById($userId);
            if ($user && !empty($user['root_folder_id'])) {
                $targetFolderId = self::extractFolderId($user['root_folder_id']);
            } else {
                $targetFolderId = null;
            }
        }

        if ($type === 'folder') {
            $folder = self::getFolder($pdo, $userId, $id);
            if (!$folder)
                return false;

            if (!empty($folder['provider_folder_id'])) {
                self::moveGoogleDriveItem($pdo, $userId, $folder['provider_folder_id'], $targetFolderId);
            }

            $stmt = $pdo->prepare("UPDATE folders SET parent_id = ?, updated_at = NOW() WHERE user_id = ? AND (id = ? OR provider_folder_id = ?)");
            return $stmt->execute([$targetFolderId, $userId, $id, $id]);
        } else {
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND id = ? LIMIT 1");
            $stmt->execute([$userId, $id]);
            $file = $stmt->fetch();
            if (!$file)
                return false;

            if (!empty($file['provider_file_id'])) {
                self::moveGoogleDriveItem($pdo, $userId, $file['provider_file_id'], $targetFolderId);
            }

            $stmt = $pdo->prepare("UPDATE files SET folder_id = ?, updated_at = NOW() WHERE user_id = ? AND id = ?");
            return $stmt->execute([$targetFolderId, $userId, $id]);
        }
    }

    public static function moveGoogleDriveItem($pdo, $userId, $providerId, $targetParentId)
    {
        try {
            $tokenInfo = self::getGoogleDriveToken($pdo, $userId);
            if (!$tokenInfo || empty($tokenInfo['token']))
                return false;

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
            if (!empty($cleanTargetId))
                $queryParams['addParents'] = $cleanTargetId;
            if (!empty($previousParents))
                $queryParams['removeParents'] = $previousParents;

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

    public static function batchMoveItems($pdo, $userId, $items, $targetFolderId)
    {
        if (empty($targetFolderId)) {
            $user = UserModel::getUserById($userId);
            if ($user && !empty($user['root_folder_id'])) {
                $targetFolderId = self::extractFolderId($user['root_folder_id']);
            } else {
                $targetFolderId = null;
            }
        }

        $targetFolder = null;
        if ($targetFolderId !== null) {
            $targetFolder = self::getFolder($pdo, $userId, $targetFolderId);
            if (!$targetFolder) return 0;
        }

        $movedCount = 0;
        if (!is_array($items)) return 0;

        foreach ($items as $item) {
            $type = $item['type'] ?? 'file';
            $id = $item['id'] ?? '';
            if (empty($id)) continue;

            // Prevent moving a folder into itself
            if ($type === 'folder') {
                if ($id === $targetFolderId) continue;
                if ($targetFolder && ($targetFolder['id'] === $id || ($targetFolder['provider_folder_id'] ?? '') === $id)) continue;
            }

            try {
                if (self::moveItem($pdo, $userId, $type, $id, $targetFolderId)) {
                    $movedCount++;
                }
            } catch (Exception $e) {
                // Continue with remaining items
            }
        }
        return $movedCount;
    }
}
