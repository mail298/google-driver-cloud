<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\config\database.php

class Config
{
    private static $env = null;
    private static $pdoInstance = null;

    public static function loadEnv()
    {
        if (self::$env !== null)
            return;
        self::$env = [];
        $envPath = dirname(__DIR__) . '/.env';
        if (file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $trimmed = trim($line);
                if (empty($trimmed) || strpos($trimmed, '#') === 0)
                    continue;
                if (strpos($trimmed, '=') === false)
                    continue;
                list($name, $value) = explode('=', $trimmed, 2);
                $name = trim($name);
                $value = trim($value);
                // Strip quotes if any
                $value = trim($value, '"\'');
                self::$env[$name] = $value;
                $_ENV[$name] = $value;
            }
        }
    }

    public static function get($key, $default = null)
    {
        self::loadEnv();
        return isset(self::$env[$key]) ? self::$env[$key] : $default;
    }

    public static function getPDO()
    {
        if (self::$pdoInstance !== null) {
            return self::$pdoInstance;
        }

        self::loadEnv();
        $host = self::get('DB_HOST', 'localhost');
        $port = self::get('DB_PORT', '3306');
        $dbname = self::get('DB_NAME', '9drive');
        if (empty($dbname)) {
            $dbname = '9drive';
        }
        $user = self::get('DB_USER', 'root');
        $pass = self::get('DB_PASS', '');

        try {
            $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 1,
            ]);
            self::$pdoInstance = $pdo;
            return self::$pdoInstance;
        } catch (PDOException $e) {
            if ($host === 'db') {
                $exposePort = self::get('DB_EXPOSE_PORT', '3307');
                try {
                    $pdo = new PDO("mysql:host=127.0.0.1;port=$exposePort;dbname=$dbname;charset=utf8mb4", $user, $pass, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false,
                        PDO::ATTR_TIMEOUT => 2,
                    ]);
                    self::$pdoInstance = $pdo;
                    return self::$pdoInstance;
                } catch (PDOException $e2) {}
            }
            die("Database connection failed: " . $e->getMessage());
        }
    }
}

