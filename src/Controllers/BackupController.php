<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\BackupController.php

require_once dirname(__DIR__) . '/Models/UserModel.php';
require_once dirname(__DIR__) . '/Models/PortalModel.php';
require_once dirname(__DIR__) . '/Models/SecurityModel.php';
require_once __DIR__ . '/AuthController.php';

class BackupController
{
    public static function exportAdminBackup()
    {
        AuthController::checkAdmin();

        $pdo = Config::getPDO();
        $timestamp = date('Ymd_His');
        $zipFilename = "backup_system_9drive_{$timestamp}.zip";

        // Create temporary directory in workspace
        $tmpDir = sys_get_temp_dir() . '/backup_' . uniqid();
        if (!is_dir($tmpDir)) {
            mkdir($tmpDir, 0777, true);
        }

        // 1. Generate SQL Dump of all database tables
        $tables = ['files', 'folders', 'connected_accounts', 'storage_accounts', 'api_keys'];
        $sqlDump = "-- 9Drive System Backup\n-- Generated at: " . date('Y-m-d H:i:s') . "\n\n";
        $sqlDump .= "SET FOREIGN_KEY_CHECKS=0;\n\n";

        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
                $createRow = $stmt->fetch(PDO::FETCH_NUM);
                if ($createRow) {
                    $sqlDump .= "DROP TABLE IF EXISTS `{$table}`;\n";
                    $sqlDump .= $createRow[1] . ";\n\n";
                }

                $rowsStmt = $pdo->query("SELECT * FROM `{$table}`");
                $rows = $rowsStmt->fetchAll(PDO::FETCH_ASSOC);

                if (!empty($rows)) {
                    foreach ($rows as $row) {
                        $keys = array_map(function ($k) { return "`{$k}`"; }, array_keys($row));
                        $vals = array_map(function ($v) use ($pdo) {
                            if ($v === null) return "NULL";
                            return $pdo->quote($v);
                        }, array_values($row));

                        $sqlDump .= "INSERT INTO `{$table}` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $vals) . ");\n";
                    }
                    $sqlDump .= "\n";
                }
            } catch (Exception $e) {
                // Table might not exist, continue
            }
        }
        $sqlDump .= "SET FOREIGN_KEY_CHECKS=1;\n";

        $sqlFilePath = $tmpDir . "/database_dump.sql";
        file_put_contents($sqlFilePath, $sqlDump);

        // 2. Package into ZIP file with JSON configs
        $zipPath = $tmpDir . '/' . $zipFilename;
        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
            $zip->addFile($sqlFilePath, 'database_dump.sql');

            $usersJson = dirname(dirname(__DIR__)) . '/config/users.json';
            if (file_exists($usersJson)) {
                $zip->addFile($usersJson, 'users.json');
            }

            $whitelistJson = dirname(dirname(__DIR__)) . '/config/ip_whitelist.json';
            if (file_exists($whitelistJson)) {
                $zip->addFile($whitelistJson, 'ip_whitelist.json');
            }

            $zip->close();
        } else {
            die("Gagal membuat arsip cadangan (ZIP).");
        }

        // 3. Send file download response
        while (ob_get_level()) {
            ob_end_clean();
        }

        header('Content-Type: application/zip');
        header('Content-Disposition: attachment; filename="' . $zipFilename . '"');
        header('Content-Length: ' . filesize($zipPath));
        header('Cache-Control: no-cache, no-store, must-revalidate');

        readfile($zipPath);

        // Cleanup temporary files
        @unlink($sqlFilePath);
        @unlink($zipPath);
        @rmdir($tmpDir);
        exit;
    }

    public static function restoreAdminBackup()
    {
        AuthController::checkAdmin();

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (!isset($_FILES['backup_zip']) || $_FILES['backup_zip']['error'] !== UPLOAD_ERR_OK) {
                header('Location: /admin?error=File+cadangan+ZIP+tidak+valid+atau+gagal+diunggah.');
                exit;
            }

            $zipFile = $_FILES['backup_zip']['tmp_name'];
            $zip = new ZipArchive();

            if ($zip->open($zipFile) !== true) {
                header('Location: /admin?error=File+yang+diunggah+bukan+arsip+ZIP+yang+valid.');
                exit;
            }

            $extractPath = sys_get_temp_dir() . '/restore_' . uniqid();
            if (!is_dir($extractPath)) {
                mkdir($extractPath, 0777, true);
            }

            $zip->extractTo($extractPath);
            $zip->close();

            $sqlFile = $extractPath . '/database_dump.sql';
            $usersFile = $extractPath . '/users.json';
            $whitelistFile = $extractPath . '/ip_whitelist.json';

            if (!file_exists($sqlFile)) {
                header('Location: /admin?error=Arsip+backup+tidak+memiliki+database_dump.sql.');
                exit;
            }

            $pdo = Config::getPDO();
            try {
                // Execute SQL restoration script
                $sqlContent = file_get_contents($sqlFile);
                $pdo->exec($sqlContent);

                // Restore users.json if present
                if (file_exists($usersFile)) {
                    $targetUsers = dirname(dirname(__DIR__)) . '/config/users.json';
                    copy($usersFile, $targetUsers);
                    if (function_exists('apcu_delete')) {
                        apcu_delete('users_all');
                    }
                }

                // Restore ip_whitelist.json if present
                if (file_exists($whitelistFile)) {
                    $targetWhitelist = dirname(dirname(__DIR__)) . '/config/ip_whitelist.json';
                    copy($whitelistFile, $targetWhitelist);
                }

                header('Location: /admin?success=Pemulihan+data+sistem+(Restore)+berhasil+dilakukan.');
            } catch (Exception $e) {
                header('Location: /admin?error=' . urlencode('Gagal memulihkan database: ' . $e->getMessage()));
            }

            // Cleanup
            @unlink($sqlFile);
            @unlink($usersFile);
            @unlink($whitelistFile);
            @rmdir($extractPath);
            exit;
        }
    }
}
