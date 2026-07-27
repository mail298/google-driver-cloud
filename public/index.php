<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\public\index.php

// Route static files directly if using PHP built-in server
if (preg_match('/\.(?:png|jpg|jpeg|gif|css|js|svg)$/', $_SERVER["REQUEST_URI"])) {
    return false; // let the built-in server handle the request
}

require_once dirname(__DIR__) . '/config/database.php';
require_once dirname(__DIR__) . '/src/Controllers/AuthController.php';
require_once dirname(__DIR__) . '/src/Controllers/DashboardController.php';
require_once dirname(__DIR__) . '/src/Controllers/UploadController.php';
require_once dirname(__DIR__) . '/src/Controllers/DownloadProxyController.php';
require_once dirname(__DIR__) . '/src/Controllers/ShareController.php';
require_once dirname(__DIR__) . '/src/Controllers/AdminController.php';
require_once dirname(__DIR__) . '/src/Controllers/SettingsController.php';

// Simple Router
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($requestUri) {
    case '/':
        DashboardController::index();
        break;
    case '/share':
        ShareController::viewShare();
        break;
    case '/login':
        AuthController::login();
        break;
    case '/logout':
        AuthController::logout();
        break;
    case '/settings/update-password':
        SettingsController::updatePassword();
        break;
    case '/create-folder':
        DashboardController::createFolder();
        break;
    case '/rename-folder':
        DashboardController::renameFolder();
        break;
    case '/delete-folder':
        DashboardController::deleteFolder();
        break;
    case '/rename-file':
        DashboardController::renameFile();
        break;
    case '/delete-file':
        DashboardController::deleteFile();
        break;
    case '/move-item':
        DashboardController::moveItem();
        break;
    case '/batch-delete':
        DashboardController::batchDelete();
        break;
    case '/upload':
        UploadController::upload();
        break;
    case '/download':
        DownloadProxyController::download();
        break;
    case '/admin':
        AdminController::index();
        break;
    case '/admin/users/create':
        AdminController::createUser();
        break;
    case '/admin/users/update':
        AdminController::updateUser();
        break;
    case '/admin/users/delete':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }
        AdminController::deleteUser();
        break;
    case '/admin/whitelist/update':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            exit;
        }
        AdminController::updateIpWhitelist();
        break;
    default:
        http_response_code(404);
        echo "404 - Page Not Found";
        break;
}
