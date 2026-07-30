<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\DashboardController.php

require_once dirname(__DIR__) . '/Models/PortalModel.php';
require_once dirname(__DIR__) . '/Models/UserModel.php';
require_once dirname(__DIR__) . '/Models/SecurityModel.php';

class DashboardController {
    public static function index() {
        AuthController::checkClient();
        
        $pdo = Config::getPDO();

        // Read user-specific limits and folder restrictions (always refreshed from UserModel)
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
            die("Error: Session user not found.");
        }

        $limitGb = (float)($currentUser['storage_limit_gb'] ?? 15);
        $rawClientRoot = trim($currentUser['root_folder_id'] ?? '');
        $clientRootFolderId = PortalModel::extractFolderId($rawClientRoot);

        $folderId = $_GET['folderId'] ?? null;
        if ($folderId === '') $folderId = null;

        // Get API key owner for connected accounts resolution
        $apiKey = Config::get('GATEWAY_API_KEY');
        $gatewayUserId = PortalModel::getUserIdFromApiKey($pdo, $apiKey);

        // Ensure client root folder is properly resolved in DB if specified
        $effectiveRootDbId = null;
        if ($clientRootFolderId !== '') {
            try {
                // Move files that have no folder assigned into the root folder
                $stmtFix = $pdo->prepare("UPDATE files SET folder_id = ? WHERE user_id = ? AND (folder_id IS NULL OR folder_id = '')");
                $stmtFix->execute([$clientRootFolderId, $userId]);
            } catch (Exception $e) {}

            $rootFolderObj = PortalModel::getFolder($pdo, $userId, $clientRootFolderId);
            if ($rootFolderObj) {
                $effectiveRootDbId = $rootFolderObj['id'];
            } else {
                // Auto-create folder record in DB so client files/folders are isolated to this root
                try {
                    $connectedAccountId = PortalModel::getFirstConnectedAccountId($pdo, $gatewayUserId);
                    $stmt = $pdo->prepare("INSERT INTO folders (id, user_id, parent_id, connected_account_id, provider, provider_folder_id, name, color, created_at, updated_at) VALUES (?, ?, NULL, ?, 'google_drive', ?, 'Folder Klien', 'text-amber-500', NOW(), NOW()) ON DUPLICATE KEY UPDATE provider_folder_id = VALUES(provider_folder_id), deleted_at = NULL, updated_at = NOW()");
                    $stmt->execute([$clientRootFolderId, $userId, $connectedAccountId, $clientRootFolderId]);
                    $effectiveRootDbId = $clientRootFolderId;
                } catch (Exception $e) {
                    $effectiveRootDbId = $clientRootFolderId;
                }
            }
        }

        // If client root folder is configured and client opens main root (/), scope to their assigned root folder
        if ($effectiveRootDbId !== null && $folderId === null) {
            $folderId = $effectiveRootDbId;
        }

        // Verify folder belongs to user
        if ($folderId !== null) {
            $folder = PortalModel::getFolder($pdo, $userId, $folderId);
            if (!$folder && $folderId !== $effectiveRootDbId && $folderId !== $clientRootFolderId) {
                header('Location: /');
                exit;
            }
        }

        $searchQuery = trim($_GET['q'] ?? '');

        // Fetch folders and files
        if ($searchQuery !== '') {
            // If searching, show matching files across all folders
            $folders = []; // disable folder navigation during search
            $stmt = $pdo->prepare("SELECT * FROM files WHERE user_id = ? AND status = 'active' AND name LIKE ? ORDER BY name ASC");
            $stmt->execute([$userId, '%' . $searchQuery . '%']);
            $files = $stmt->fetchAll();
            $breadcrumbs = [];
        } else {
            $folders = PortalModel::getFolders($pdo, $userId, $folderId);
            $files = PortalModel::getFiles($pdo, $userId, $folderId);
            $breadcrumbs = PortalModel::getFolderBreadcrumbs($pdo, $userId, $folderId);
        }

        $allFoldersList = PortalModel::getAllFolders($pdo, $userId);

        // If restricted to a subfolder, trim breadcrumbs above it
        if ($clientRootFolderId !== '' && empty($searchQuery)) {
            $startIndex = -1;
            foreach ($breadcrumbs as $index => $crumb) {
                if ($crumb['id'] === $clientRootFolderId) {
                    $startIndex = $index;
                    break;
                }
            }
            if ($startIndex !== -1) {
                $breadcrumbs = array_slice($breadcrumbs, $startIndex + 1);
            }
        }

        // Calculate storage details (single aggregated query for efficiency)
        $limitBytes = $limitGb * 1024 * 1024 * 1024;

        $stmt = $pdo->prepare("
            SELECT
                SUM(CASE WHEN mime_type LIKE 'image/%' THEN size_bytes ELSE 0 END) AS photo_bytes,
                SUM(CASE WHEN mime_type LIKE 'video/%' THEN size_bytes ELSE 0 END) AS video_bytes,
                SUM(CASE WHEN mime_type NOT LIKE 'image/%' AND mime_type NOT LIKE 'video/%' THEN size_bytes ELSE 0 END) AS document_bytes
            FROM files WHERE user_id = ? AND status = 'active'
        ");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        $photoSize    = (float)($row['photo_bytes']    ?? 0);
        $videoSize    = (float)($row['video_bytes']    ?? 0);
        $documentSize = (float)($row['document_bytes'] ?? 0);

        $totalUsedBytes = $photoSize + $videoSize + $documentSize;
        $storagePercent = min(100, round(($totalUsedBytes / $limitBytes) * 100, 2));

        require_once dirname(__DIR__) . '/Views/dashboard.php';
    }

    public static function createFolder() {
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
            if ($parentId === '') $parentId = null;

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
    }

    public static function renameFolder() {
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
    }

    public static function deleteFolder() {
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
    }

    public static function renameFile() {
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
    }

    public static function deleteFile() {
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
    }

    public static function moveItem() {
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
    }

    public static function batchDelete() {
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
                if (empty($id)) continue;

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
    }

    public static function deleteAllFiles() {
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
                    } catch (Exception $e) {}
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
                    } catch (Exception $e) {}
                }

                echo json_encode(['success' => true, 'count' => $deletedCount]);
            } catch (Exception $e) {
                echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            }
            exit;
        }
    }
}
