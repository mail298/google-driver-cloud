<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\AuthController.php

class AuthController {
    public static function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
                || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => $isHttps,
                'httponly' => true,
                'samesite' => 'Lax'
            ]);
            session_start();
        }
    }

    public static function checkClient() {
        self::startSession();
        SecurityModel::enforceSessionTimeout();

        $role = is_string($_SESSION['user_role'] ?? null) ? $_SESSION['user_role'] : null;
        if ($role === 'admin') {
            header('Location: /admin');
            exit;
        }
        if ($role !== 'client') {
            header('Location: /login');
            exit;
        }
    }

    public static function checkAdmin() {
        self::startSession();
        SecurityModel::enforceSessionTimeout();

        // Enforce IP Whitelist Security
        if (!IpWhitelistModel::isIpAllowed()) {
            http_response_code(403);
            $clientIp = IpWhitelistModel::getClientIp();
            require_once dirname(__DIR__) . '/Views/admin_403.php';
            exit;
        }

        $role = is_string($_SESSION['user_role'] ?? null) ? $_SESSION['user_role'] : null;
        if ($role === 'client') {
            header('Location: /');
            exit;
        }
        if ($role !== 'admin') {
            header('Location: /login');
            exit;
        }
    }

    public static function checkAny() {
        self::startSession();
        SecurityModel::enforceSessionTimeout();

        $role = is_string($_SESSION['user_role'] ?? null) ? $_SESSION['user_role'] : null;
        if (!in_array($role, ['client', 'admin'], true)) {
            header('Location: /login');
            exit;
        }
    }

    public static function uploadToken() {
        self::checkClient();

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
            exit;
        }

        $user = $_SESSION['user'] ?? null;
        $userId = is_array($user) ? ($user['id'] ?? null) : null;
        if (!$userId) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Sesi tidak valid.']);
            exit;
        }

        $token = bin2hex(random_bytes(32));
        $dir = UploadController::uploadTokenDir();
        if (!is_dir($dir)) {
            mkdir($dir, 0777, true);
        }
        file_put_contents($dir . '/' . hash('sha256', $token), json_encode([
            'user_id' => $userId,
            'exp' => time() + 600
        ]), LOCK_EX);

        echo json_encode(['success' => true, 'token' => $token]);
        exit;
    }

    public static function login() {
        self::startSession();

        // If already logged in, redirect to respective dashboard
        $role = is_string($_SESSION['user_role'] ?? null) ? $_SESSION['user_role'] : null;
        if ($role === 'admin') {
            if (!IpWhitelistModel::isIpAllowed()) {
                http_response_code(403);
                $clientIp = IpWhitelistModel::getClientIp();
                require_once dirname(__DIR__) . '/Views/admin_403.php';
                exit;
            }
            header('Location: /admin');
            exit;
        } elseif ($role === 'client') {
            header('Location: /');
            exit;
        }

        $error = '';
        $lockoutRemaining = 0;
        $loginAttempts = 0;
        $maxAttempts = (int) Config::get('LOGIN_MAX_ATTEMPTS', 5);
        $sessionTimeout = (int) Config::get('SESSION_TIMEOUT_MINUTES', 60);
        $timeoutExpired = isset($_GET['timeout']) && $_GET['timeout'] === '1';

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            // CSRF validation
            $csrfToken = $_POST['_csrf_token'] ?? '';
            if (!SecurityModel::validateCsrfToken($csrfToken)) {
                $error = 'Sesi tidak valid. Silakan refresh halaman dan coba lagi.';
            } else {
                $clientIp  = IpWhitelistModel::getClientIp();
                $username  = trim($_POST['username'] ?? '');
                $password  = trim($_POST['password'] ?? '');
                $identifier = $clientIp . '_' . strtolower($username);

                // Rate limit check
                if (SecurityModel::isLoginLockedOut($identifier)) {
                    $lockoutRemaining = SecurityModel::getLockoutRemainingSeconds($identifier);
                    $minutesLeft = ceil($lockoutRemaining / 60);
                    $error = "Terlalu banyak percobaan login yang gagal. Coba lagi dalam {$minutesLeft} menit.";
                    LoggerService::error("Login locked out for user '{$username}' from IP '{$clientIp}'.", ['username' => $username]);
                } else {
                    $user = UserModel::getUserByUsername($username);

                    // Support both hashed and legacy plain text passwords
                    $passwordValid = false;
                    if ($user) {
                        if (password_get_info($user['password'])['algoName'] !== 'unknown') {
                            $passwordValid = password_verify($password, $user['password']);
                        } else {
                            $passwordValid = ($user['password'] === $password);
                        }
                    }

                    if ($passwordValid) {
                        if ($user['role'] === 'admin' && !IpWhitelistModel::isIpAllowed()) {
                            $ip = $clientIp;
                            $error = "Akses Admin ditolak: IP Anda ({$ip}) tidak terdaftar dalam Admin IP Whitelist.";
                            LoggerService::error("Admin access denied by IP whitelist for user '{$username}' from IP '{$ip}'.", ['username' => $username]);
                        } else {
                            // Clear rate limit on successful login
                            SecurityModel::clearLoginAttempts($identifier);

                            // Regenerate session ID to prevent session fixation
                            session_regenerate_id(true);
                            $_SESSION['user']          = $user;
                            $_SESSION['user_role']     = $user['role'];
                            $_SESSION['last_activity'] = time();

                            if ($user['role'] === 'admin') {
                                header('Location: /admin');
                            } else {
                                header('Location: /');
                            }
                            exit;
                        }
                    } else {
                        // Record failed attempt
                        if ($username !== '') {
                            SecurityModel::recordFailedLogin($identifier);
                        }
                        $loginAttempts = SecurityModel::getLoginAttemptCount($identifier);
                        $remaining = $maxAttempts - $loginAttempts;
                        if ($remaining > 0) {
                            $error = 'Username atau password salah.' . ($remaining < $maxAttempts ? " Sisa percobaan: {$remaining}." : '');
                        } else {
                            $lockoutRemaining = SecurityModel::getLockoutRemainingSeconds($identifier);
                            $minutesLeft = ceil($lockoutRemaining / 60);
                            $error = "Akun terkunci. Terlalu banyak percobaan gagal. Coba lagi dalam {$minutesLeft} menit.";
                        }
                        LoggerService::error("Failed login attempt for username '{$username}' from IP '{$clientIp}'. Error: {$error}", ['username' => $username]);
                    }
                }
            }
        }

        require_once dirname(__DIR__) . '/Views/login.php';
    }

    public static function logout() {
        self::startSession();
        session_unset();
        session_destroy();
        header('Location: /login');
        exit;
    }
}
