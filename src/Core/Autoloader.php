<?php
// c:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Core\Autoloader.php

namespace App\Core;

class Autoloader
{
    private static $registered = false;

    public static function register()
    {
        if (self::$registered) {
            return;
        }

        spl_autoload_register([self::class, 'autoload']);
        self::$registered = true;
    }

    public static function autoload($className)
    {
        $baseDir = dirname(__DIR__, 2);

        // Standard PSR-4 for App\ namespace
        if (strpos($className, 'App\\') === 0) {
            $relativeClass = substr($className, 4);
            $file = $baseDir . '/src/' . str_replace('\\', '/', $relativeClass) . '.php';
            if (file_exists($file)) {
                require_once $file;
                return true;
            }
        }

        // Direct classmap lookup for legacy root classes
        $directories = [
            $baseDir . '/src/Core/',
            $baseDir . '/src/Controllers/',
            $baseDir . '/src/Models/',
            $baseDir . '/src/Services/',
            $baseDir . '/src/Middlewares/',
            $baseDir . '/config/',
        ];

        $cleanClass = ltrim($className, '\\');
        // Handle namespaced class basename fallback
        if (($lastNsPos = strrpos($cleanClass, '\\')) !== false) {
            $cleanClass = substr($cleanClass, $lastNsPos + 1);
        }

        foreach ($directories as $dir) {
            $file = $dir . $cleanClass . '.php';
            if (file_exists($file)) {
                require_once $file;
                return true;
            }
        }

        return false;
    }
}
