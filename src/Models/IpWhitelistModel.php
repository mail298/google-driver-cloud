<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Models\IpWhitelistModel.php

class IpWhitelistModel
{
    private static function getFilePath()
    {
        return dirname(dirname(__DIR__)) . '/config/ip_whitelist.json';
    }

    public static function getConfig()
    {
        $filePath = self::getFilePath();
        if (file_exists($filePath)) {
            $content = file_get_contents($filePath);
            $data = json_decode($content, true);
            if (is_array($data)) {
                return [
                    'enabled' => (bool) ($data['enabled'] ?? false),
                    'allowed_ips' => is_array($data['allowed_ips'] ?? null) ? array_values(array_unique($data['allowed_ips'])) : ['127.0.0.1', '::1']
                ];
            }
        }

        // Fallback: read from .env configuration
        $envEnabled = Config::get('ADMIN_IP_WHITELIST_ENABLED', 'false') === 'true';
        $envIps = Config::get('ADMIN_ALLOWED_IPS', '127.0.0.1,::1');
        $allowedIps = array_values(array_filter(array_map('trim', explode(',', $envIps))));
        if (empty($allowedIps)) {
            $allowedIps = ['127.0.0.1', '::1'];
        }

        return [
            'enabled' => $envEnabled,
            'allowed_ips' => $allowedIps
        ];
    }

    public static function saveConfig($config)
    {
        $filePath = self::getFilePath();
        $dir = dirname($filePath);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $config['allowed_ips'] = array_values(array_unique(array_filter($config['allowed_ips'] ?? [])));
        file_put_contents($filePath, json_encode($config, JSON_PRETTY_PRINT));
        return true;
    }

    public static function getClientIp()
    {
        if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ips = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ips[0]);
            if (filter_var($ip, FILTER_VALIDATE_IP)) {
                return $ip;
            }
        }

        if (!empty($_SERVER['HTTP_CLIENT_IP']) && filter_var($_SERVER['HTTP_CLIENT_IP'], FILTER_VALIDATE_IP)) {
            return $_SERVER['HTTP_CLIENT_IP'];
        }

        $remote = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        return $remote === '::1' ? '127.0.0.1' : $remote;
    }

    public static function isIpAllowed($clientIp = null)
    {
        $config = self::getConfig();
        if (!$config['enabled']) {
            return true;
        }

        if ($clientIp === null) {
            $clientIp = self::getClientIp();
        }

        foreach ($config['allowed_ips'] as $pattern) {
            $pattern = trim($pattern);
            if ($pattern === '') continue;

            // Exact match
            if ($clientIp === $pattern) {
                return true;
            }

            // Localhost aliases
            if (($clientIp === '127.0.0.1' || $clientIp === '::1') && ($pattern === '127.0.0.1' || $pattern === '::1' || strtolower($pattern) === 'localhost')) {
                return true;
            }

            // Wildcard matching (e.g. 192.168.3.* or 10.0.*)
            if (strpos($pattern, '*') !== false) {
                $regex = '/^' . str_replace('\*', '[0-9]+', preg_quote($pattern, '/')) . '$/';
                if (preg_match($regex, $clientIp)) {
                    return true;
                }
            }

            // CIDR matching (e.g. 192.168.1.0/24)
            if (strpos($pattern, '/') !== false) {
                list($subnet, $bits) = explode('/', $pattern, 2);
                if (filter_var($subnet, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) && is_numeric($bits)) {
                    $ipLong = ip2long($clientIp);
                    $subnetLong = ip2long($subnet);
                    if ($ipLong !== false && $subnetLong !== false) {
                        $mask = -1 << (32 - (int)$bits);
                        if (($ipLong & $mask) === ($subnetLong & $mask)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    public static function addIp($ip)
    {
        $config = self::getConfig();
        $ip = trim($ip);

        // Allow IP, CIDR, or Wildcard IP (e.g. 192.168.1.*)
        if ($ip === '') {
            throw new Exception('Alamat IP tidak boleh kosong.');
        }

        if (!in_array($ip, $config['allowed_ips'], true)) {
            $config['allowed_ips'][] = $ip;
            self::saveConfig($config);
        }
        return true;
    }

    public static function removeIp($ip)
    {
        $config = self::getConfig();
        $ip = trim($ip);

        $index = array_search($ip, $config['allowed_ips'], true);
        if ($index !== false) {
            unset($config['allowed_ips'][$index]);
            // Ensure 127.0.0.1 or at least one IP remains if list becomes empty
            if (empty($config['allowed_ips'])) {
                $config['allowed_ips'] = ['127.0.0.1'];
            }
            self::saveConfig($config);
        }
        return true;
    }

    public static function toggleEnabled($enabled)
    {
        $config = self::getConfig();
        $config['enabled'] = (bool)$enabled;
        
        // Safety check: if enabling, ensure current client IP is in whitelist so admin doesn't lock themselves out!
        if ($config['enabled']) {
            $currentIp = self::getClientIp();
            if (!self::isIpAllowed($currentIp)) {
                if (!in_array($currentIp, $config['allowed_ips'], true)) {
                    $config['allowed_ips'][] = $currentIp;
                }
            }
        }

        self::saveConfig($config);
        return true;
    }
}
