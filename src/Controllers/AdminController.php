<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\AdminController.php

class AdminController
{
    public static function getMasterCapacityGb()
    {
        try {
            $pdo = Config::getPDO();
            $apiKey = Config::get('GATEWAY_API_KEY');
            $userId = PortalModel::getUserIdFromApiKey($pdo, $apiKey);
            return PortalModel::getMasterStorageCapacityGb($pdo, $userId);
        } catch (Exception $e) {
            return (float) Config::get('GATEWAY_MASTER_STORAGE_GB', 100);
        }
    }

    public static function index()
    {
        AuthController::checkAdmin();
        $users = UserModel::getAllUsers();

        $pdo = Config::getPDO();
        $apiKey = Config::get('GATEWAY_API_KEY');
        $userId = PortalModel::getUserIdFromApiKey($pdo, $apiKey);

        // Dynamic Master Gateway Storage Capacity (fetches 5.00 TB / 5120 GB from Gateway API)
        $limitGb = self::getMasterCapacityGb();
        $totalAllocatedGb = UserModel::getTotalAllocatedStorageGb();
        $availablePoolGb = UserModel::getAdminAvailableStorageGb($limitGb);

        $totalUsedBytes = 0;
        $photoSize = 0;
        $videoSize = 0;
        $documentSize = 0;
        $userUsageMap = [];

        $allFolders = [];

        // Aggregate file statistics across ALL active files (not just gateway user)
        $stmt = $pdo->query("
            SELECT
                SUM(CASE WHEN mime_type LIKE 'image/%' THEN size_bytes ELSE 0 END) AS photo_bytes,
                SUM(CASE WHEN mime_type LIKE 'video/%' THEN size_bytes ELSE 0 END) AS video_bytes,
                SUM(CASE WHEN mime_type NOT LIKE 'image/%' AND mime_type NOT LIKE 'video/%' THEN size_bytes ELSE 0 END) AS document_bytes
            FROM files WHERE status = 'active'
        ");
        $row = $stmt->fetch();
        $photoSize    = (float) ($row['photo_bytes']    ?? 0);
        $videoSize    = (float) ($row['video_bytes']    ?? 0);
        $documentSize = (float) ($row['document_bytes'] ?? 0);
        $totalUsedBytes = $photoSize + $videoSize + $documentSize;

        // Usage map per user
        $stmt = $pdo->query("SELECT user_id, SUM(size_bytes) as used_bytes, COUNT(*) as file_count FROM files WHERE status = 'active' GROUP BY user_id");
        while ($row = $stmt->fetch()) {
            $userUsageMap[$row['user_id']] = [
                'used_bytes' => (float) $row['used_bytes'],
                'file_count' => (int) $row['file_count']
            ];
        }

        // Fetch detected folders for Admin selection dropdown (from gateway user)
        if ($userId) {
            $stmt = $pdo->prepare("SELECT id, name, provider_folder_id FROM folders WHERE user_id = ? AND deleted_at IS NULL ORDER BY name ASC");
            $stmt->execute([$userId]);
            $allFolders = $stmt->fetchAll();
        }

        $allocatedPercent = min(100, round(($totalAllocatedGb / $limitGb) * 100, 1));
        $storagePercent = min(100, round(($totalUsedBytes / ($limitGb * 1024 * 1024 * 1024)) * 100, 2));

        // Fetch IP Whitelist Configuration
        $ipConfig = IpWhitelistModel::getConfig();
        $clientIp = IpWhitelistModel::getClientIp();

        // Fetch security status summary
        $securityStatus = SecurityModel::getSecurityStatus();
        $csrfToken = SecurityModel::getCsrfToken();

        require_once dirname(__DIR__) . '/Views/admin.php';
    }

    public static function createUser()
    {
        AuthController::checkAdmin();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = trim($_POST['username'] ?? '');
            $password = trim($_POST['password'] ?? '');
            $role = $_POST['role'] ?? 'client';
            $limitGb = (float) ($_POST['storage_limit_gb'] ?? 15);
            $rawRootFolder = trim($_POST['root_folder_id'] ?? '');
            $rootFolderId = PortalModel::extractFolderId($rawRootFolder);

            if ($username === '' || $password === '') {
                header('Location: /admin?error=Username+dan+Password+wajib+diisi');
                exit;
            }

            $masterGb = self::getMasterCapacityGb();
            try {
                UserModel::createUser($username, $password, $role, $limitGb, $rootFolderId, $masterGb);
                header('Location: /admin?success=Pengguna+berhasil+didaftarkan');
            } catch (Exception $e) {
                header('Location: /admin?error=' . urlencode($e->getMessage()));
            }
            exit;
        }
    }

    public static function deleteUser()
    {
        AuthController::checkAdmin();

        $id = $_POST['user_id'] ?? $_POST['id'] ?? null;
        if ($id) {
            try {
                UserModel::deleteUser($id);
                header('Location: /admin?success=Akun+berhasil+dihapus');
            } catch (Exception $e) {
                header('Location: /admin?error=' . urlencode($e->getMessage()));
            }
            exit;
        }
        header('Location: /admin?error=User+ID+wajib+diisi');
        exit;
    }

    public static function updateUser()
    {
        AuthController::checkAdmin();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $id = $_POST['user_id'] ?? $_POST['id'] ?? '';
            $username = trim($_POST['username'] ?? '');
            $storageLimitGb = (float) ($_POST['storage_limit_gb'] ?? 15);
            $role = $_POST['role'] ?? null;
            $rawRootFolder = $_POST['root_folder_id'] ?? null;
            $rootFolderId = ($rawRootFolder !== null) ? PortalModel::extractFolderId($rawRootFolder) : null;
            $password = trim($_POST['password'] ?? '');

            if ($id === '') {
                header('Location: /admin?error=User+ID+wajib+diisi');
                exit;
            }

            $masterGb = self::getMasterCapacityGb();
            try {
                UserModel::updateUser($id, $storageLimitGb, $role, $rootFolderId, $password, $masterGb, $username);
                if (isset($_SESSION['user']['id']) && $_SESSION['user']['id'] === $id) {
                    $refreshed = UserModel::getUserById($id);
                    if ($refreshed) {
                        $_SESSION['user'] = $refreshed;
                        $_SESSION['user_role'] = $refreshed['role'];
                    }
                }
                header('Location: /admin?success=Pengaturan+dan+kuota+storage+pengguna+berhasil+diperbarui');
            } catch (Exception $e) {
                header('Location: /admin?error=' . urlencode($e->getMessage()));
            }
            exit;
        }
    }

    public static function updateIpWhitelist()
    {
        AuthController::checkAdmin();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $action = $_POST['whitelist_action'] ?? '';
            try {
                if ($action === 'toggle') {
                    $enabled = (bool)($_POST['enabled'] ?? false);
                    IpWhitelistModel::toggleEnabled($enabled);
                    $statusMsg = $enabled ? 'Keamanan Admin IP Whitelist BERHASIL DIAKTIFKAN' : 'Admin IP Whitelist NONAKTIF';
                    header('Location: /admin?success=' . urlencode($statusMsg));
                    exit;
                } elseif ($action === 'add') {
                    $ip = trim($_POST['ip'] ?? $_POST['ip_address'] ?? '');
                    IpWhitelistModel::addIp($ip);
                    header('Location: /admin?success=' . urlencode("Alamat IP $ip berhasil ditambahkan ke Whitelist"));
                    exit;
                } elseif ($action === 'add_current') {
                    $currentIp = IpWhitelistModel::getClientIp();
                    IpWhitelistModel::addIp($currentIp);
                    header('Location: /admin?success=' . urlencode("IP Anda ($currentIp) berhasil ditambahkan ke Whitelist"));
                    exit;
                } elseif ($action === 'remove') {
                    $ip = trim($_POST['ip'] ?? $_POST['ip_address'] ?? '');
                    IpWhitelistModel::removeIp($ip);
                    header('Location: /admin?success=' . urlencode("Alamat IP $ip berhasil dihapus dari Whitelist"));
                    exit;
                }
            } catch (Exception $e) {
                header('Location: /admin?error=' . urlencode($e->getMessage()));
                exit;
            }
        }
        header('Location: /admin');
        exit;
    }
}
