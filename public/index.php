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
$router->post('/create-folder', ['DashboardController', 'createFolder']);
$router->post('/rename-folder', ['DashboardController', 'renameFolder']);
$router->post('/delete-folder', ['DashboardController', 'deleteFolder']);
$router->post('/rename-file', ['DashboardController', 'renameFile']);
$router->post('/delete-file', ['DashboardController', 'deleteFile']);
$router->post('/move-item', ['DashboardController', 'moveItem']);
$router->get('/folders', ['DashboardController', 'listFoldersJson']);
$router->post('/batch-move', ['DashboardController', 'batchMove']);
$router->post('/batch-delete', ['DashboardController', 'batchDelete']);
$router->post('/delete-all-files', ['DashboardController', 'deleteAllFiles']);

// Client Backup Routes
$router->get('/client/backup/zip', ['ClientBackupController', 'downloadUserZip']);
$router->get('/client/backup/csv', ['ClientBackupController', 'exportMetadataCsv']);

// Upload & Download Routes
$router->post('/upload', ['UploadController', 'upload']);
$router->post('/upload-chunk', ['UploadController', 'uploadChunk']);
$router->post('/finalize', ['UploadController', 'finalize']);
$router->get('/finalize-status', ['UploadController', 'finalizeStatus']);
$router->post('/upload-token', ['AuthController', 'uploadToken']);
$router->get('/download', ['DownloadProxyController', 'download']);

// Admin Panel & Backup Routes
$router->any('/admin', ['AdminController', 'index']);
$router->get('/admin/backup/export', ['BackupController', 'exportAdminBackup']);
$router->post('/admin/backup/restore', ['BackupController', 'restoreAdminBackup']);
$router->post('/admin/users/create', ['AdminController', 'createUser']);
$router->post('/admin/users/update', ['AdminController', 'updateUser']);

$router->post('/admin/users/delete', ['AdminController', 'deleteUser']);
$router->post('/admin/whitelist/update', ['AdminController', 'updateIpWhitelist']);

// 5. Dispatch Request
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

$router->dispatch($requestUri, $requestMethod);
