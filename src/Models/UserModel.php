<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Models\UserModel.php

class UserModel {
    private static function getFilePath() {
        return dirname(dirname(__DIR__)) . '/config/users.json';
    }

    public static function getAllUsers() {
        $path = self::getFilePath();
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            if (is_array($data)) {
                return $data;
            }
        }
        return [
            [
                'id' => 'admin-1',
                'username' => 'admin',
                'password' => 'adminpass',
                'role' => 'admin',
                'storage_limit_gb' => 100,
                'root_folder_id' => ''
            ],
            [
                'id' => 'client-1',
                'username' => 'client',
                'password' => 'clientpass',
                'role' => 'client',
                'storage_limit_gb' => 15,
                'root_folder_id' => ''
            ]
        ];
    }

    public static function saveAllUsers($users) {
        $path = self::getFilePath();
        file_put_contents($path, json_encode(array_values($users), JSON_PRETTY_PRINT));
    }

    public static function getUserByUsername($username) {
        $users = self::getAllUsers();
        foreach ($users as $user) {
            if (strtolower($user['username']) === strtolower($username)) {
                return $user;
            }
        }
        return null;
    }

    public static function getUserById($id) {
        $users = self::getAllUsers();
        foreach ($users as $user) {
            if ($user['id'] === $id) {
                return $user;
            }
        }
        return null;
    }

    public static function getTotalAllocatedStorageGb() {
        $users = self::getAllUsers();
        $total = 0;
        foreach ($users as $user) {
            if (($user['role'] ?? 'client') === 'client') {
                $total += (float)($user['storage_limit_gb'] ?? 0);
            }
        }
        return $total;
    }

    public static function getAdminAvailableStorageGb($masterLimitGb = 100) {
        return max(0, (float)$masterLimitGb - self::getTotalAllocatedStorageGb());
    }

    public static function createUser($username, $password, $role, $storageLimitGb, $rootFolderId, $masterLimitGb = 100) {
        $users = self::getAllUsers();
        
        // Check if username exists
        foreach ($users as $u) {
            if (strtolower($u['username']) === strtolower($username)) {
                throw new Exception("Username sudah terdaftar.");
            }
        }

        $targetRole = in_array($role, ['admin', 'client']) ? $role : 'client';
        $requestedGb = (float)$storageLimitGb;

        if ($targetRole === 'client') {
            $availableGb = self::getAdminAvailableStorageGb($masterLimitGb);
            if ($requestedGb > $availableGb) {
                throw new Exception("Gagal: Alokasi kuota storage ({$requestedGb} GB) melebihi sisa kapasitas Admin pool ({$availableGb} GB tersedia).");
            }
        }

        $newUser = [
            'id' => 'user-' . uniqid(),
            'username' => trim($username),
            'password' => password_hash(trim($password), PASSWORD_BCRYPT),
            'role' => $targetRole,
            'storage_limit_gb' => $requestedGb,
            'root_folder_id' => trim($rootFolderId)
        ];

        $users[] = $newUser;
        self::saveAllUsers($users);
        return $newUser;
    }

    public static function deleteUser($id) {
        $users = self::getAllUsers();
        $filtered = array_filter($users, function($u) use ($id) {
            return $u['id'] !== $id;
        });

        // Ensure at least one admin remains
        $adminCount = 0;
        foreach ($filtered as $u) {
            if ($u['role'] === 'admin') $adminCount++;
        }
        if ($adminCount === 0) {
            throw new Exception("Tidak dapat menghapus akun admin terakhir.");
        }

        self::saveAllUsers($filtered);
    }

    public static function updateUser($id, $storageLimitGb, $role = null, $rootFolderId = null, $password = null, $masterLimitGb = 100, $username = null) {
        $users = self::getAllUsers();
        $targetIndex = null;
        
        foreach ($users as $index => $u) {
            if ($u['id'] === $id) {
                $targetIndex = $index;
                break;
            }
        }

        if ($targetIndex === null) {
            throw new Exception("User tidak ditemukan.");
        }

        $currentUser = $users[$targetIndex];

        if (!empty($username) && strtolower(trim($username)) !== strtolower($currentUser['username'])) {
            foreach ($users as $u) {
                if ($u['id'] !== $id && strtolower($u['username'] ?? '') === strtolower(trim($username))) {
                    throw new Exception("Username '$username' sudah digunakan pengguna lain.");
                }
            }
        }

        $targetRole = ($role !== null && in_array($role, ['admin', 'client'])) ? $role : $currentUser['role'];
        $newQuotaGb = (float)$storageLimitGb;

        if ($targetRole === 'client') {
            $oldQuotaGb = ($currentUser['role'] === 'client') ? (float)($currentUser['storage_limit_gb'] ?? 0) : 0;
            $availableGb = self::getAdminAvailableStorageGb($masterLimitGb);
            $netDifference = $newQuotaGb - $oldQuotaGb;

            if ($netDifference > $availableGb) {
                throw new Exception("Gagal: Penambahan kuota storage ({$newQuotaGb} GB) melebihi sisa kapasitas Admin pool ({$availableGb} GB tersedia).");
            }
        }

        if (!empty($username)) {
            $users[$targetIndex]['username'] = trim($username);
        }
        $users[$targetIndex]['storage_limit_gb'] = $newQuotaGb;
        $users[$targetIndex]['role'] = $targetRole;
        if ($rootFolderId !== null) {
            $users[$targetIndex]['root_folder_id'] = trim($rootFolderId);
        }
        if (!empty($password)) {
            $users[$targetIndex]['password'] = password_hash(trim($password), PASSWORD_BCRYPT);
        }

        // Ensure at least one admin remains
        $adminCount = 0;
        foreach ($users as $u) {
            if (($u['role'] ?? '') === 'admin') $adminCount++;
        }
        if ($adminCount === 0) {
            throw new Exception("Minimal satu akun administrator harus tetap ada.");
        }

        self::saveAllUsers($users);
    }

    public static function updateUserPassword($userId, $oldPassword, $newPassword) {
        $users = self::getAllUsers();
        $targetIndex = null;

        foreach ($users as $index => $user) {
            if ($user['id'] === $userId) {
                $targetIndex = $index;
                break;
            }
        }

        if ($targetIndex === null) {
            throw new Exception("User tidak ditemukan.");
        }

        $user = $users[$targetIndex];

        // Support both hashed and plain text legacy passwords
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

        $users[$targetIndex]['password'] = password_hash(trim($newPassword), PASSWORD_BCRYPT);
        self::saveAllUsers($users);
        return true;
    }
}
