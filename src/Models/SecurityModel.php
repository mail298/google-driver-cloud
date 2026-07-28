<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Models\SecurityModel.php

class SecurityModel
{
    // =============================================
    // SECURITY HEADERS
    // =============================================

    public static function sendSecurityHeaders()
    {
        if (!headers_sent()) {
            header('X-Frame-Options: SAMEORIGIN');
            header('X-Content-Type-Options: nosniff');
            header('Referrer-Policy: strict-origin-when-cross-origin');
            header('X-XSS-Protection: 1; mode=block');
            header("Permissions-Policy: camera=(), microphone=(), geolocation=()");

            // Force HTTPS in production
            if (Config::get('FORCE_HTTPS', 'false') === 'true') {
                $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
                    || (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
                if (!$isHttps) {
                    $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? 'localhost';
                    $url = 'https://' . $host . $_SERVER['REQUEST_URI'];
                    header('Location: ' . $url, true, 301);
                    exit;
                }
                header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
            }
        }
    }

    // =============================================
    // SESSION TIMEOUT
    // =============================================

    public static function enforceSessionTimeout()
    {
        $timeoutMinutes = (int) Config::get('SESSION_TIMEOUT_MINUTES', 60);
        if ($timeoutMinutes <= 0) {
            return; // timeout disabled
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Check last activity
        if (isset($_SESSION['last_activity'])) {
            $idleSeconds = time() - $_SESSION['last_activity'];
            if ($idleSeconds > ($timeoutMinutes * 60)) {
                // Session expired — destroy and redirect
                $role = $_SESSION['user_role'] ?? null;
                session_unset();
                session_destroy();

                if ($role === 'admin') {
                    header('Location: /login?timeout=1&role=admin');
                } else {
                    header('Location: /login?timeout=1');
                }
                exit;
            }
        }

        // Refresh last activity
        $_SESSION['last_activity'] = time();
    }

    public static function getSessionTimeoutMinutes()
    {
        return (int) Config::get('SESSION_TIMEOUT_MINUTES', 60);
    }

    public static function getSessionRemainingSeconds()
    {
        $timeoutMinutes = self::getSessionTimeoutMinutes();
        if ($timeoutMinutes <= 0) return PHP_INT_MAX;

        $lastActivity = $_SESSION['last_activity'] ?? time();
        $expiresAt = $lastActivity + ($timeoutMinutes * 60);
        return max(0, $expiresAt - time());
    }

    // =============================================
    // CSRF TOKEN
    // =============================================

    public static function generateCsrfToken()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }

        return $_SESSION['csrf_token'];
    }

    public static function getCsrfToken()
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($_SESSION['csrf_token'])) {
            return self::generateCsrfToken();
        }
        return $_SESSION['csrf_token'];
    }

    public static function validateCsrfToken($token)
    {
        if (Config::get('CSRF_PROTECTION_ENABLED', 'true') !== 'true') {
            return true; // disabled
        }

        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        $stored = $_SESSION['csrf_token'] ?? '';
        return $stored !== '' && hash_equals($stored, (string)$token);
    }

    public static function csrfInputField()
    {
        $token = self::getCsrfToken();
        return '<input type="hidden" name="_csrf_token" value="' . htmlspecialchars($token, ENT_QUOTES, 'UTF-8') . '">';
    }

    // =============================================
    // LOGIN RATE LIMITING
    // =============================================

    private static function getRateLimitFilePath($identifier)
    {
        $safeId = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $identifier);
        $dir = dirname(dirname(__DIR__)) . '/config/rate_limits';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir . '/rl_' . $safeId . '.json';
    }

    public static function recordFailedLogin($identifier)
    {
        $filePath = self::getRateLimitFilePath($identifier);
        $data = [];

        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            $data = json_decode($content, true) ?: [];
        }

        $now = time();
        $lockoutSeconds = (int) Config::get('LOGIN_LOCKOUT_MINUTES', 15) * 60;

        // Prune old attempts outside lockout window
        $data['attempts'] = array_filter(
            $data['attempts'] ?? [],
            fn($ts) => ($now - $ts) < $lockoutSeconds
        );
        $data['attempts'][] = $now;

        file_put_contents($filePath, json_encode($data), LOCK_EX);
    }

    public static function isLoginLockedOut($identifier)
    {
        $filePath = self::getRateLimitFilePath($identifier);
        if (!file_exists($filePath)) return false;

        $content = file_get_contents($filePath);
        $data = json_decode($content, true);
        if (!$data) return false;

        $now = time();
        $maxAttempts = (int) Config::get('LOGIN_MAX_ATTEMPTS', 5);
        $lockoutSeconds = (int) Config::get('LOGIN_LOCKOUT_MINUTES', 15) * 60;

        $recentAttempts = array_filter(
            $data['attempts'] ?? [],
            fn($ts) => ($now - $ts) < $lockoutSeconds
        );

        return count($recentAttempts) >= $maxAttempts;
    }

    public static function getLockoutRemainingSeconds($identifier)
    {
        $filePath = self::getRateLimitFilePath($identifier);
        if (!file_exists($filePath)) return 0;

        $content = file_get_contents($filePath);
        $data = json_decode($content, true);
        if (!$data || empty($data['attempts'])) return 0;

        $lockoutSeconds = (int) Config::get('LOGIN_LOCKOUT_MINUTES', 15) * 60;
        $lastAttemptTime = max($data['attempts']);
        $remainingSeconds = max(0, ($lastAttemptTime + $lockoutSeconds) - time());
        return $remainingSeconds;
    }

    public static function clearLoginAttempts($identifier)
    {
        $filePath = self::getRateLimitFilePath($identifier);
        if (file_exists($filePath)) {
            unlink($filePath);
        }
    }

    public static function getLoginAttemptCount($identifier)
    {
        $filePath = self::getRateLimitFilePath($identifier);
        if (!file_exists($filePath)) return 0;

        $content = file_get_contents($filePath);
        $data = json_decode($content, true);
        if (!$data) return 0;

        $now = time();
        $lockoutSeconds = (int) Config::get('LOGIN_LOCKOUT_MINUTES', 15) * 60;

        $recentAttempts = array_filter(
            $data['attempts'] ?? [],
            fn($ts) => ($now - $ts) < $lockoutSeconds
        );

        return count($recentAttempts);
    }

    // =============================================
    // SECURITY STATUS SUMMARY (for Admin Panel)
    // =============================================

    public static function getSecurityStatus()
    {
        return [
            'csrf_enabled'            => Config::get('CSRF_PROTECTION_ENABLED', 'true') === 'true',
            'session_timeout'         => (int) Config::get('SESSION_TIMEOUT_MINUTES', 60),
            'login_max_attempts'      => (int) Config::get('LOGIN_MAX_ATTEMPTS', 5),
            'login_lockout_minutes'   => (int) Config::get('LOGIN_LOCKOUT_MINUTES', 15),
            'ip_whitelist_enabled'    => IpWhitelistModel::getConfig()['enabled'],
            'ip_whitelist_count'      => count(IpWhitelistModel::getConfig()['allowed_ips'] ?? []),
            'force_https'             => Config::get('FORCE_HTTPS', 'false') === 'true',
        ];
    }
}
