<?php
// c:\Users\ADMIN\Desktop\framework\google-drive\cliend\public\index.php

// Route static files directly if using PHP built-in server
if (preg_match('/\.(?:png|jpg|jpeg|gif|css|js|svg|ico|woff|woff2|ttf)$/', $_SERVER["REQUEST_URI"])) {
    return false;
}

// 1. Initialize Autoloader (supports Composer vendor/autoload or native Autoloader)
$vendorAutoload = dirname(__DIR__) . '/vendor/autoload.php';
if (file_exists($vendorAutoload)) {
    require_once $vendorAutoload;
}
require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/src/Core/Autoloader.php';
App\Core\Autoloader::register();

// 2. Global uncaught exception and error logger
set_exception_handler(function (\Throwable $ex) {
    LoggerService::exception($ex);
    if (!headers_sent()) {
        http_response_code(500);
    }
    echo "500 - Internal Server Error";
});

// 3. Security Headers
SecurityModel::sendSecurityHeaders();

// 4. Initialize Router & Define Routes
$router = new App\Core\Router();

// HLS & Embed Media Routes
$router->regex('/^\/embed(?:\/.*)?$/', ['StreamController', 'embed']);
$router->regex('/^\/stream\/[^\/]+\/master\.m3u8$/', ['StreamController', 'masterPlaylist']);
$router->regex('/^\/stream\/[^\/]+\/segment\/\d+$/', ['StreamController', 'streamSegment']);

// Core Routes
$router->any('/', ['DashboardController', 'index']);
$router->any('/share', ['ShareController', 'viewShare']);
$router->any('/login', ['AuthController', 'login']);
$router->any('/logout', ['AuthController', 'logout']);
$router->any('/settings/update-password', ['SettingsController', 'updatePassword']);

// File & Folder Operations
$router->any('/create-folder', ['DashboardController', 'createFolder']);
$router->any('/rename-folder', ['DashboardController', 'renameFolder']);
$router->any('/delete-folder', ['DashboardController', 'deleteFolder']);
$router->any('/rename-file', ['DashboardController', 'renameFile']);
$router->any('/delete-file', ['DashboardController', 'deleteFile']);
$router->any('/move-item', ['DashboardController', 'moveItem']);
$router->any('/folders', ['DashboardController', 'listFoldersJson']);
$router->any('/batch-move', ['DashboardController', 'batchMove']);
$router->any('/batch-delete', ['DashboardController', 'batchDelete']);
$router->any('/delete-all-files', ['DashboardController', 'deleteAllFiles']);

// Client Backup Routes
$router->any('/client/backup/zip', ['ClientBackupController', 'downloadUserZip']);
$router->any('/client/backup/csv', ['ClientBackupController', 'exportMetadataCsv']);

// Upload & Download Routes
$router->any('/upload', ['UploadController', 'upload']);
$router->any('/upload-chunk', ['UploadController', 'uploadChunk']);
$router->any('/finalize', ['UploadController', 'finalize']);
$router->any('/finalize-status', ['UploadController', 'finalizeStatus']);
$router->any('/upload-token', ['AuthController', 'uploadToken']);
$router->any('/download', ['DownloadProxyController', 'download']);

// Admin Panel & Backup Routes
$router->any('/admin', ['AdminController', 'index']);
$router->any('/admin/backup/export', ['BackupController', 'exportAdminBackup']);
$router->any('/admin/backup/restore', ['BackupController', 'restoreAdminBackup']);
$router->any('/admin/users/create', ['AdminController', 'createUser']);
$router->any('/admin/users/update', ['AdminController', 'updateUser']);

$router->post('/admin/users/delete', ['AdminController', 'deleteUser']);
$router->post('/admin/whitelist/update', ['AdminController', 'updateIpWhitelist']);

// 5. Dispatch Request
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

$router->dispatch($requestUri, $requestMethod);
