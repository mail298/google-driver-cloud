<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Models\UserModel.php

require_once dirname(__DIR__, 2) . '/config/database.php';

class UserModel
{
    private static function getPdo()
    {
        return Config::getPDO();
    }

    public static function ensureTable()
    {
        static $initialized = false;
        if ($initialized) return;
        $initialized = true;

        $pdo = self::getPdo();
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS portal_users (
                id VARCHAR(64) PRIMARY KEY,
                username VARCHAR(191) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(32) NOT NULL DEFAULT 'client',
                storage_limit_gb DECIMAL(10,2) NOT NULL DEFAULT 15.00,
                root_folder_id VARCHAR(255) NOT NULL DEFAULT '',
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");

        $stmt = $pdo->query("SELECT COUNT(*) FROM portal_users");
        $count = (int)$stmt->fetchColumn();

        if ($count === 0) {
            $jsonPath = dirname(__DIR__, 2) . '/config/users.json';
            $migrated = false;
            if (file_exists($jsonPath)) {
                $raw = file_get_contents($jsonPath);
                $users = json_decode($raw, true);
                if (is_array($users) && !empty($users)) {
                    $insertStmt = $pdo->prepare("
                        INSERT IGNORE INTO portal_users (id, username, password, role, storage_limit_gb, root_folder_id, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ");
                    foreach ($users as $u) {
                        $insertStmt->execute([
                            $u['id'] ?? ('user-' . bin2hex(random_bytes(8))),
                            trim($u['username']),
                            $u['password'],
                            in_array($u['role'] ?? '', ['admin', 'client']) ? $u['role'] : 'client',
                            (float)($u['storage_limit_gb'] ?? 15),
                            trim($u['root_folder_id'] ?? '')
                        ]);
                    }
                    $migrated = true;
                }
            }

            if (!$migrated) {
                $stmtCheck = $pdo->query("SELECT COUNT(*) FROM portal_users");
                if ((int)$stmtCheck->fetchColumn() === 0) {
                    $insertStmt = $pdo->prepare("
                        INSERT INTO portal_users (id, username, password, role, storage_limit_gb, root_folder_id, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
                    ");
                    $insertStmt->execute(['admin-1', 'admin', password_hash('adminpass', PASSWORD_BCRYPT), 'admin', 100.0, '']);
                    $insertStmt->execute(['client-1', 'client', password_hash('clientpass', PASSWORD_BCRYPT), 'client', 15.0, '']);
                }
            }
        }
    }

    public static function getAllUsers()
    {
        self::ensureTable();
        $stmt = self::getPdo()->query("SELECT id, username, password, role, storage_limit_gb, root_folder_id, created_at, updated_at FROM portal_users ORDER BY created_at ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(function ($row) {
            $row['storage_limit_gb'] = (float)$row['storage_limit_gb'];
            return $row;
        }, $rows);
    }

    public static function getUserByUsername($username)
    {
        self::ensureTable();
        $stmt = self::getPdo()->prepare("SELECT id, username, password, role, storage_limit_gb, root_folder_id, created_at, updated_at FROM portal_users WHERE LOWER(username) = LOWER(?) LIMIT 1");
        $stmt->execute([trim($username)]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $row['storage_limit_gb'] = (float)$row['storage_limit_gb'];
            return $row;
        }
        return null;
    }

    public static function getUserById($id)
    {
        self::ensureTable();
        $stmt = self::getPdo()->prepare("SELECT id, username, password, role, storage_limit_gb, root_folder_id, created_at, updated_at FROM portal_users WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $row['storage_limit_gb'] = (float)$row['storage_limit_gb'];
            return $row;
        }
        return null;
    }

    public static function getTotalAllocatedStorageGb()
    {
        self::ensureTable();
        $stmt = self::getPdo()->query("SELECT COALESCE(SUM(storage_limit_gb), 0) FROM portal_users WHERE role = 'client'");
        return (float)$stmt->fetchColumn();
    }

    public static function getAdminAvailableStorageGb($masterLimitGb = 100)
    {
        return max(0, (float)$masterLimitGb - self::getTotalAllocatedStorageGb());
    }

    public static function createUser($username, $password, $role, $storageLimitGb, $rootFolderId, $masterLimitGb = 100)
    {
        self::ensureTable();
        $username = trim($username);
        $password = trim($password);

        if (self::getUserByUsername($username)) {
            throw new Exception("Username sudah terdaftar.");
        }

        $targetRole = in_array($role, ['admin', 'client']) ? $role : 'client';
        $requestedGb = (float)$storageLimitGb;

        if ($targetRole === 'client') {
            $availableGb = self::getAdminAvailableStorageGb($masterLimitGb);
            if ($requestedGb > $availableGb) {
                throw new Exception("Gagal: Alokasi kuota storage ({$requestedGb} GB) melebihi sisa kapasitas Admin pool ({$availableGb} GB tersedia).");
            }
        }

        $id = 'user-' . bin2hex(random_bytes(8));
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $rootFolderId = trim($rootFolderId);

        $stmt = self::getPdo()->prepare("
            INSERT INTO portal_users (id, username, password, role, storage_limit_gb, root_folder_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        ");
        $stmt->execute([$id, $username, $hashedPassword, $targetRole, $requestedGb, $rootFolderId]);

        return self::getUserById($id);
    }

    public static function deleteUser($id)
    {
        self::ensureTable();
        $user = self::getUserById($id);
        if (!$user) {
            throw new Exception("User tidak ditemukan.");
        }

        if ($user['role'] === 'admin') {
            $stmt = self::getPdo()->query("SELECT COUNT(*) FROM portal_users WHERE role = 'admin'");
            $adminCount = (int)$stmt->fetchColumn();
            if ($adminCount <= 1) {
                throw new Exception("Tidak dapat menghapus akun admin terakhir.");
            }
        }

        $stmt = self::getPdo()->prepare("DELETE FROM portal_users WHERE id = ?");
        $stmt->execute([$id]);
    }

    public static function updateUser($id, $storageLimitGb, $role = null, $rootFolderId = null, $password = null, $masterLimitGb = 100, $username = null)
    {
        self::ensureTable();
        $currentUser = self::getUserById($id);
        if (!$currentUser) {
            throw new Exception("User tidak ditemukan.");
        }

        if (!empty($username) && strtolower(trim($username)) !== strtolower($currentUser['username'])) {
            $existing = self::getUserByUsername(trim($username));
            if ($existing && $existing['id'] !== $id) {
                throw new Exception("Username '$username' sudah digunakan pengguna lain.");
            }
        }

        $targetRole = ($role !== null && in_array($role, ['admin', 'client'])) ? $role : $currentUser['role'];
        $newQuotaGb = (float)$storageLimitGb;

        if ($targetRole === 'client') {
            $oldQuotaGb = ($currentUser['role'] === 'client') ? (float)$currentUser['storage_limit_gb'] : 0;
            $availableGb = self::getAdminAvailableStorageGb($masterLimitGb);
            $netDifference = $newQuotaGb - $oldQuotaGb;

            if ($netDifference > $availableGb) {
                throw new Exception("Gagal: Penambahan kuota storage ({$newQuotaGb} GB) melebihi sisa kapasitas Admin pool ({$availableGb} GB tersedia).");
            }
        }

        if ($currentUser['role'] === 'admin' && $targetRole !== 'admin') {
            $stmt = self::getPdo()->query("SELECT COUNT(*) FROM portal_users WHERE role = 'admin'");
            $adminCount = (int)$stmt->fetchColumn();
            if ($adminCount <= 1) {
                throw new Exception("Minimal satu akun administrator harus tetap ada.");
            }
        }

        $newUsername = !empty($username) ? trim($username) : $currentUser['username'];
        $newRootFolder = ($rootFolderId !== null) ? trim($rootFolderId) : $currentUser['root_folder_id'];
        $newPassword = !empty($password) ? password_hash(trim($password), PASSWORD_BCRYPT) : $currentUser['password'];

        $stmt = self::getPdo()->prepare("
            UPDATE portal_users
            SET username = ?, password = ?, role = ?, storage_limit_gb = ?, root_folder_id = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$newUsername, $newPassword, $targetRole, $newQuotaGb, $newRootFolder, $id]);
    }

    public static function updateUserPassword($userId, $oldPassword, $newPassword)
    {
        self::ensureTable();
        $user = self::getUserById($userId);
        if (!$user) {
            throw new Exception("User tidak ditemukan.");
        }

        $isHashed = password_get_info($user['password'])['algoName'] !== 'unknown';
        $oldPasswordValid = $isHashed
            ? password_verify($oldPassword, $user['password'])
            : ($user['password'] === $oldPassword);

        if (!$oldPasswordValid) {
            throw new Exception("Password lama Anda tidak cocok.");
        }
        if (empty(trim($newPassword))) {
            throw new Exception("Password baru tidak boleh kosong.");
        }

        $hashedPassword = password_hash(trim($newPassword), PASSWORD_BCRYPT);
        $stmt = self::getPdo()->prepare("UPDATE portal_users SET password = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$hashedPassword, $userId]);
        return true;
    }
}
