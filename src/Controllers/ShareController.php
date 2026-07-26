<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\ShareController.php

class ShareController {
    public static function viewShare() {
        $fileId = $_GET['id'] ?? null;
        if (!$fileId) {
            http_response_code(404);
            die("File ID tidak ditemukan.");
        }

        $pdo = Config::getPDO();
        $stmt = $pdo->prepare("SELECT * FROM files WHERE (id = ? OR provider_file_id = ?) AND status != 'deleted' LIMIT 1");
        $stmt->execute([$fileId, $fileId]);
        $file = $stmt->fetch();

        if (!$file) {
            http_response_code(404);
            die("Berkas tidak ditemukan atau telah dihapus.");
        }

        require_once dirname(__DIR__) . '/Views/share.php';
    }
}
