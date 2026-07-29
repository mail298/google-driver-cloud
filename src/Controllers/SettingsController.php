<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\SettingsController.php

require_once dirname(__DIR__) . '/Models/UserModel.php';
require_once dirname(__DIR__) . '/Models/PortalModel.php';
require_once __DIR__ . '/AuthController.php';

class SettingsController {
    public static function updatePassword() {
        AuthController::checkClient();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $currentUser = $_SESSION['user'] ?? null;
            if (!$currentUser || !isset($currentUser['id'])) {
                header('Location: /login');
                exit;
            }

            $oldPassword = $_POST['old_password'] ?? '';
            $newPassword = $_POST['new_password'] ?? '';
            $confirmPassword = $_POST['confirm_password'] ?? '';

            if ($newPassword !== $confirmPassword) {
                header('Location: /?settings_error=' . urlencode('Konfirmasi password baru tidak cocok.'));
                exit;
            }

            try {
                UserModel::updateUserPassword($currentUser['id'], $oldPassword, $newPassword);
                // Refresh session user from storage to reflect the new hashed password
                $refreshed = UserModel::getUserById($currentUser['id']);
                if ($refreshed) {
                    $_SESSION['user'] = $refreshed;
                }
                header('Location: /?settings_success=' . urlencode('Password akun Anda berhasil diperbarui.'));
                exit;
            } catch (Exception $e) {
                header('Location: /?settings_error=' . urlencode($e->getMessage()));
                exit;
            }
        }
    }
}
