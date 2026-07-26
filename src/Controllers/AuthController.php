<?php
// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Controllers\AuthController.php

require_once dirname(__DIR__) . '/Models/UserModel.php';

class AuthController {
    public static function startSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    public static function checkClient() {
        self::startSession();
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
        $role = is_string($_SESSION['user_role'] ?? null) ? $_SESSION['user_role'] : null;
        if (!in_array($role, ['client', 'admin'], true)) {
            header('Location: /login');
            exit;
        }
    }

    public static function login() {
        self::startSession();
        
        // If already logged in, redirect to respective dashboard
        $role = is_string($_SESSION['user_role'] ?? null) ? $_SESSION['user_role'] : null;
        if ($role === 'admin') {
            header('Location: /admin');
            exit;
        } elseif ($role === 'client') {
            header('Location: /');
            exit;
        }

        $error = '';
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = trim($_POST['username'] ?? '');
            $password = trim($_POST['password'] ?? '');

            $user = UserModel::getUserByUsername($username);

            // Support both hashed (password_hash) and legacy plain text passwords
            $passwordValid = false;
            if ($user) {
                if (password_get_info($user['password'])['algoName'] !== 'unknown') {
                    // Hashed password
                    $passwordValid = password_verify($password, $user['password']);
                } else {
                    // Legacy plain text (upgrade on next save)
                    $passwordValid = ($user['password'] === $password);
                }
            }

            if ($passwordValid) {
                // Regenerate session ID to prevent session fixation attack
                session_regenerate_id(true);
                $_SESSION['user'] = $user;
                $_SESSION['user_role'] = $user['role'];

                if ($user['role'] === 'admin') {
                    header('Location: /admin');
                } else {
                    header('Location: /');
                }
                exit;
            } else {
                $error = 'Username atau password salah.';
            }
        }

        require_once dirname(__DIR__) . '/Views/login.php';
    }

    public static function logout() {
        self::startSession();
        session_destroy();
        header('Location: /login');
        exit;
    }
}
