<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Services\LoggerService.php

class LoggerService
{
    private static function getLogFilePath()
    {
        $dir = dirname(__DIR__, 2) . '/storage/logs';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        return $dir . '/debug.json';
    }

    /**
     * Get current active username from session or fallback
     */
    private static function getActiveUsername($fallback = 'guest')
    {
        if (session_status() === PHP_SESSION_NONE && !headers_sent()) {
            @session_start();
        }
        if (!empty($_SESSION['user']['username'])) {
            return $_SESSION['user']['username'];
        }
        if (!empty($_SESSION['username'])) {
            return $_SESSION['username'];
        }
        return $fallback;
    }

    /**
     * Log a debug error entry formatted as JSON.
     * Guaranteed JSON fields:
     * - id           : Unique event / request tracking ID
     * - username     : Username of active session or guest
     * - debug_error  : Detailed error message or stack trace
     * - timestamp    : ISO-8601 formatted timestamp
     * - level        : Log severity (ERROR, DEBUG, INFO, WARNING)
     * - ip           : Client IP address
     * - request_uri  : Request URI
     */
    public static function log($level, $message, array $context = [])
    {
        $id = $context['id'] ?? ('log_' . bin2hex(random_bytes(6)));
        $username = $context['username'] ?? self::getActiveUsername();

        $logEntry = [
            'id' => $id,
            'username' => (string)$username,
            'debug_error' => (string)$message,
            'timestamp' => date('c'),
            'level' => strtoupper((string)$level),
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'CLI'
        ];

        if (!empty($context['extra']) && is_array($context['extra'])) {
            $logEntry['extra'] = $context['extra'];
        }

        $jsonLine = json_encode($logEntry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n";
        @file_put_contents(self::getLogFilePath(), $jsonLine, FILE_APPEND | LOCK_EX);
    }

    public static function error($message, array $context = [])
    {
        self::log('ERROR', $message, $context);
    }

    public static function debug($message, array $context = [])
    {
        self::log('DEBUG', $message, $context);
    }

    public static function info($message, array $context = [])
    {
        self::log('INFO', $message, $context);
    }

    public static function warning($message, array $context = [])
    {
        self::log('WARNING', $message, $context);
    }

    /**
     * Helper to log an exception with full trace
     */
    public static function exception(\Throwable $e, array $context = [])
    {
        $errorMsg = sprintf(
            "%s in %s:%d\nStack trace:\n%s",
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        );
        self::log('ERROR', $errorMsg, $context);
    }
}
