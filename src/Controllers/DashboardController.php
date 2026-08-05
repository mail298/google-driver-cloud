<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\DashboardController.php

class DashboardController
{
    public static function index()
    {
        AuthController::checkClient();

        $pdo = Config::getPDO();

        // Refresh user from UserModel to ensure latest storage limits and folder settings
        $currentUser = self::refreshSessionUser();
        $userId = $currentUser['id'] ?? null;
        if (!$userId) {
            http_response_code(500);
            echo "500 - Internal Server Error: Session user not found.";
            exit;
        }

        $limitGb = (float) ($currentUser['storage_limit_gb'] ?? 15);
        $rawClientRoot = trim($currentUser['root_folder_id'] ?? '');
        $clientRootFolderId = PortalModel::extractFolderId($rawClientRoot);

        $folderId = $_GET['folderId'] ?? null;
        if ($folderId === '') {
            $folderId = null;
        }

        // Get API key owner for connected accounts resolution
        $apiKey = Config::get('GATEWAY_API_KEY');
        $gatewayUserId = PortalModel::getUserIdFromApiKey($pdo, $apiKey);

        // Ensure client root folder is properly resolved in DB if specified
        $effectiveRootDbId = self::resolveClientRootFolder($pdo, $userId, $clientRootFolderId, $gatewayUserId);

        // Scope to client's assigned root folder if opening main root (/)
        if ($effectiveRootDbId !== null && $folderId === null) {
            $folderId = $effectiveRootDbId;
        }

        // Verify folder ownership
        if ($folderId !== null) {
            $folder = PortalModel::getFolder($pdo, $userId, $folderId);
            if (!$folder && $folderId !== $effectiveRootDbId && $folderId !== $clientRootFolderId) {
                header('Location: /');
                exit;
            }
        }

        $searchQuery = trim($_GET['q'] ?? '');

        // Fetch folders and files using PortalModel
        if ($searchQuery !== '') {
            $folders = [];
            $files = PortalModel::searchFiles($pdo, $userId, $searchQuery);
            $breadcrumbs = [];
        } else {
            $folders = PortalModel::getFolders($pdo, $userId, $folderId);
            $files = PortalModel::getFiles($pdo, $userId, $folderId);
            $breadcrumbs = PortalModel::getFolderBreadcrumbs($pdo, $userId, $folderId);
        }

        $allFoldersList = PortalModel::getAllFolders($pdo, $userId);

        // Trim breadcrumbs above client root folder if restricted
        if ($clientRootFolderId !== '' && empty($searchQuery)) {
            $breadcrumbs = self::trimBreadcrumbsAboveRoot($breadcrumbs, $clientRootFolderId);
        }

        // Calculate storage details
        $stats = PortalModel::getStorageStatsByUser($pdo, $userId);
        $photoSize = $stats['photo_bytes'];
        $videoSize = $stats['video_bytes'];
        $documentSize = $stats['document_bytes'];
        $totalUsedBytes = $photoSize + $videoSize + $documentSize;
        $limitBytes = $limitGb * 1024 * 1024 * 1024;
        $storagePercent = min(100, round(($totalUsedBytes / $limitBytes) * 100, 2));

        $uploadDirectUrl = (string) Config::get('UPLOAD_DIRECT_URL', '');
        $uploadDirectThresholdBytes = (int) Config::get('UPLOAD_DIRECT_THRESHOLD_BYTES', 10 * 1024 * 1024);

        require_once dirname(__DIR__) . '/Views/dashboard.php';
    }

    private static function refreshSessionUser(): array
    {
        $currentUser = $_SESSION['user'] ?? [];
        if (!empty($currentUser['id'])) {
            $refreshed = UserModel::getUserById($currentUser['id']);
            if ($refreshed) {
                $_SESSION['user'] = $refreshed;
                return $refreshed;
            }
        }
        return $currentUser;
    }

    private static function resolveClientRootFolder($pdo, $userId, string $clientRootFolderId, $gatewayUserId): ?string
    {
        if ($clientRootFolderId === '') {
            return null;
        }

        PortalModel::syncFolderOwner($pdo, $userId, $clientRootFolderId);
        PortalModel::assignOrphanFiles($pdo, $userId, $clientRootFolderId);

        $rootFolderObj = PortalModel::getFolder($pdo, $userId, $clientRootFolderId);
        if ($rootFolderObj) {
            return $rootFolderObj['id'];
        }

        PortalModel::autoCreateClientRootFolder($pdo, $userId, $clientRootFolderId, $gatewayUserId);
        return $clientRootFolderId;
    }

    private static function trimBreadcrumbsAboveRoot(array $breadcrumbs, string $clientRootFolderId): array
    {
        $startIndex = -1;
        foreach ($breadcrumbs as $index => $crumb) {
            if ($crumb['id'] === $clientRootFolderId) {
                $startIndex = $index;
                break;
            }
        }
        if ($startIndex !== -1) {
            return array_slice($breadcrumbs, $startIndex + 1);
        }
        return $breadcrumbs;
    }

    public static function listFoldersJson()
    {
        AuthController::checkClient();

        $pdo = Config::getPDO();
        $currentUser = $_SESSION['user'] ?? null;
        $userId = $currentUser['id'] ?? null;

        if (!$userId) {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'folders' => []]);
            exit;
        }

        $folders = PortalModel::getAllFolders($pdo, $userId);
        $clientRootId = (!empty($currentUser) && !empty($currentUser['root_folder_id']))
            ? PortalModel::extractFolderId($currentUser['root_folder_id'])
            : '';

        $result = [];
        foreach ($folders as $f) {
            if ($f['name'] === 'Folder Klien')
                continue;
            if ($clientRootId !== '' && ($f['id'] === $clientRootId || ($f['provider_folder_id'] ?? '') === $clientRootId))
                continue;
            $result[] = [
                'id' => $f['id'],
                'name' => $f['name'],
                'parent_id' => $f['parent_id'],
                'provider_folder_id' => $f['provider_folder_id'] ?? null,
            ];
        }

        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'folders' => $result]);
        exit;
    }

    public static function createFolder()
    {
        AuthController::checkClient();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;

            if (!$userId) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
                exit;
            }

            $name = trim($_POST['name'] ?? '');
            $parentId = $_POST['parentId'] ?? null;
            if ($parentId === '')
                $parentId = null;

            if ($name === '') {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'Folder name is required.']);
                exit;
            }

            try {
                $id = PortalModel::createFolder($pdo, $userId, $parentId, $name);
                header('Content-Type: application/json');
                echo json_encode(['success' => true, 'id' => $id]);
            } catch (Exception $e) {
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function renameFolder()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;
            $id = $_POST['id'] ?? '';
            $name = trim($_POST['name'] ?? '');

            if (!$userId || !$id || $name === '') {
                echo json_encode(['success' => false, 'message' => 'Parameter tidak lengkap.']);
                exit;
            }

            try {
                PortalModel::renameFolder($pdo, $userId, $id, $name);
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function deleteFolder()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;
            $id = $_POST['id'] ?? '';

            if (!$userId || !$id) {
                echo json_encode(['success' => false, 'message' => 'Parameter tidak lengkap.']);
                exit;
            }

            try {
                PortalModel::deleteFolder($pdo, $userId, $id);
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function renameFile()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;
            $id = $_POST['id'] ?? '';
            $name = trim($_POST['name'] ?? '');

            if (!$userId || !$id || $name === '') {
                echo json_encode(['success' => false, 'message' => 'Parameter tidak lengkap.']);
                exit;
            }

            try {
                PortalModel::renameFile($pdo, $userId, $id, $name);
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function deleteFile()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;
            $id = $_POST['id'] ?? '';

            if (!$userId || !$id) {
                echo json_encode(['success' => false, 'message' => 'Parameter tidak lengkap.']);
                exit;
            }

            try {
                PortalModel::deleteFile($pdo, $userId, $id);
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function moveItem()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;
            $type = $_POST['type'] ?? 'file';
            $id = $_POST['id'] ?? '';
            $targetFolderId = $_POST['targetFolderId'] ?? null;

            if (!$userId || !$id) {
                echo json_encode(['success' => false, 'message' => 'Parameter tidak lengkap.']);
                exit;
            }

            try {
                PortalModel::moveItem($pdo, $userId, $type, $id, $targetFolderId);
                echo json_encode(['success' => true]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function batchDelete()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;

            $rawItems = $_POST['items'] ?? '[]';
            $items = json_decode($rawItems, true);

            if (!$userId || !is_array($items) || empty($items)) {
                echo json_encode(['success' => false, 'message' => 'Tidak ada item yang dipilih.']);
                exit;
            }

            $deletedCount = 0;
            foreach ($items as $item) {
                $type = $item['type'] ?? 'file';
                $id = $item['id'] ?? '';
                if (empty($id))
                    continue;

                try {
                    if ($type === 'folder') {
                        PortalModel::deleteFolder($pdo, $userId, $id);
                    } else {
                        PortalModel::deleteFile($pdo, $userId, $id);
                    }
                    $deletedCount++;
                } catch (Exception $e) {
                    // Continue with next
                }
            }

            echo json_encode(['success' => true, 'count' => $deletedCount]);
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function deleteAllFiles()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;

            if (!$userId) {
                echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
                exit;
            }

            // Exclude Admin-assigned Root Folder from deletion
            $rawClientRoot = trim($currentUser['root_folder_id'] ?? '');
            $clientRootFolderId = PortalModel::extractFolderId($rawClientRoot);

            try {
                // Delete all active files for user
                $stmtFiles = $pdo->prepare("SELECT id FROM files WHERE user_id = ? AND status = 'active'");
                $stmtFiles->execute([$userId]);
                $allFiles = $stmtFiles->fetchAll();

                $deletedCount = 0;
                foreach ($allFiles as $f) {
                    try {
                        PortalModel::deleteFile($pdo, $userId, $f['id']);
                        $deletedCount++;
                    } catch (Exception $e) {
                    }
                }

                // Delete all active sub-folders for user (EXCEPT the assigned root folder)
                $stmtFolders = $pdo->prepare("SELECT id, provider_folder_id FROM folders WHERE user_id = ? AND deleted_at IS NULL");
                $stmtFolders->execute([$userId]);
                $allFolders = $stmtFolders->fetchAll();

                foreach ($allFolders as $f) {
                    // Do NOT delete the admin-assigned root folder!
                    if ($clientRootFolderId !== '') {
                        if ($f['id'] === $clientRootFolderId || $f['provider_folder_id'] === $clientRootFolderId) {
                            continue;
                        }
                    }

                    try {
                        PortalModel::deleteFolder($pdo, $userId, $f['id']);
                    } catch (Exception $e) {
                    }
                }

                echo json_encode(['success' => true, 'count' => $deletedCount]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }

    public static function batchMove()
    {
        AuthController::checkClient();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            header('Content-Type: application/json');
            $pdo = Config::getPDO();
            $currentUser = $_SESSION['user'] ?? null;
            $userId = $currentUser['id'] ?? null;

            $rawItems = $_POST['items'] ?? '[]';
            $items = json_decode($rawItems, true);
            $targetFolderId = $_POST['targetFolderId'] ?? null;

            if (!$userId || !is_array($items) || empty($items)) {
                echo json_encode(['success' => false, 'message' => 'Tidak ada item yang dipilih.']);
                exit;
            }

            try {
                $count = PortalModel::batchMoveItems($pdo, $userId, $items, $targetFolderId);
                echo json_encode(['success' => true, 'count' => $count]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
        http_response_code(405);
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Metode request tidak diizinkan.']);
        exit;
    }
}
