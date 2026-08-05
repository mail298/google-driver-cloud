<?php
// c:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Core\Router.php

namespace App\Core;

class Router
{
    private array $routes = [];
    private array $regexRoutes = [];

    public function get(string $path, $handler): self
    {
        return $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, $handler): self
    {
        return $this->addRoute('POST', $path, $handler);
    }

    public function any(string $path, $handler): self
    {
        return $this->addRoute('ANY', $path, $handler);
    }

    public function regex(string $pattern, $handler): self
    {
        $this->regexRoutes[] = [
            'pattern' => $pattern,
            'handler' => $handler
        ];
        return $this;
    }

    private function addRoute(string $method, string $path, $handler): self
    {
        $this->routes[$method][$path] = $handler;
        return $this;
    }

    public function dispatch(string $uri, string $method)
    {
        // CSRF protection for state-changing POST requests.
        // Upload paths are exempt: they are already protected by one-time
        // handoff tokens issued by /upload-token.
        if ($method === 'POST' && !self::isCsrfExempt($uri)) {
            $token = $_POST['_csrf_token'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
            if (!\SecurityModel::validateCsrfToken($token)) {
                http_response_code(403);
                header('Content-Type: application/json');
                echo json_encode(['success' => false, 'message' => 'CSRF token tidak valid. Muat ulang halaman dan coba lagi.']);
                exit;
            }
        }

        // 1. Check Exact Regex Match First (e.g., Stream HLS routes, embed)
        foreach ($this->regexRoutes as $route) {
            if (preg_match($route['pattern'], $uri, $matches)) {
                return $this->executeHandler($route['handler'], $matches);
            }
        }

        // 2. Check Specific Method Match
        if (isset($this->routes[$method][$uri])) {
            return $this->executeHandler($this->routes[$method][$uri]);
        }

        // 3. Check ANY Method Match
        if (isset($this->routes['ANY'][$uri])) {
            return $this->executeHandler($this->routes['ANY'][$uri]);
        }

        // 4. Fallback 404
        http_response_code(404);
        echo "404 - Page Not Found";
        exit;
    }

    private static function isCsrfExempt(string $uri): bool
    {
        $exempt = ['/upload', '/upload-chunk', '/finalize'];
        return in_array($uri, $exempt, true);
    }

    private function executeHandler($handler, array $params = [])
    {
        if (is_callable($handler)) {
            return call_user_func_array($handler, $params);
        }

        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;
            if (is_string($class) && class_exists($class)) {
                $instance = new $class();
                return call_user_func_array([$instance, $method], $params);
            }
            if (is_object($class)) {
                return call_user_func_array([$class, $method], $params);
            }
        }

        throw new \InvalidArgumentException("Invalid route handler provided.");
    }
}
