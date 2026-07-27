<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\login.php -->
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drive Portal — Masuk</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        html, body {
            height: 100%;
            margin: 0;
            overflow: hidden;
            background: #06080f;
        }

        .login-page {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            width: 100%;
            padding: 20px;
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
            background:
                radial-gradient(ellipse at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                #06080f;
        }

        /* Animated mesh gradient orbs */
        .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            pointer-events: none;
            animation: orbFloat 8s ease-in-out infinite alternate;
        }

        .bg-orb-1 {
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, transparent 70%);
            top: -150px;
            left: -100px;
            animation-delay: 0s;
        }

        .bg-orb-2 {
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
            bottom: -200px;
            right: -150px;
            animation-delay: -4s;
        }

        .bg-orb-3 {
            width: 300px;
            height: 300px;
            background: radial-gradient(circle, rgba(16, 185, 129, 0.07) 0%, transparent 70%);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation-delay: -2s;
        }

        @keyframes orbFloat {
            from { transform: scale(1) translate(0, 0); }
            to { transform: scale(1.08) translate(10px, -10px); }
        }

        .login-wrapper {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 440px;
        }

        /* Brand above card */
        .brand-header {
            text-align: center;
            margin-bottom: 28px;
        }

        .brand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            border-radius: 18px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            box-shadow: 0 12px 32px rgba(59, 130, 246, 0.4), 0 0 0 1px rgba(255,255,255,0.08);
            margin-bottom: 16px;
            position: relative;
        }

        .brand-icon::after {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 19px;
            background: linear-gradient(135deg, rgba(255,255,255,0.35), transparent 50%);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        .brand-title {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.6px;
            background: linear-gradient(135deg, #fff 0%, #93c5fd 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 6px 0;
        }

        .brand-subtitle {
            font-size: 13.5px;
            color: #64748b;
            font-weight: 500;
        }

        /* Login Card */
        .login-card {
            background: rgba(13, 18, 32, 0.82);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 36px 32px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(59, 130, 246, 0.06);
            position: relative;
            overflow: hidden;
        }

        .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent 10%, rgba(59, 130, 246, 0.5) 50%, transparent 90%);
        }

        .card-heading {
            font-family: 'Outfit', sans-serif;
            font-size: 19px;
            font-weight: 800;
            color: #fff;
            margin: 0 0 6px 0;
            letter-spacing: -0.4px;
        }

        .card-subheading {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 26px 0;
        }

        /* Timeout / Rate Limit Alert */
        .login-alert {
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 22px;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            line-height: 1.5;
        }

        .login-alert.alert-error {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.25);
            color: #fca5a5;
        }

        .login-alert.alert-warning {
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.25);
            color: #fde68a;
        }

        .login-alert.alert-info {
            background: rgba(59, 130, 246, 0.08);
            border: 1px solid rgba(59, 130, 246, 0.2);
            color: #93c5fd;
        }

        .login-alert svg {
            flex-shrink: 0;
            margin-top: 1px;
        }

        /* Form Inputs */
        .field-group {
            margin-bottom: 18px;
        }

        .field-label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #94a3b8;
            margin-bottom: 7px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .input-wrap {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #4e5f74;
            pointer-events: none;
            transition: color 0.2s ease;
        }

        .field-input {
            width: 100%;
            box-sizing: border-box;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 13px 16px 13px 44px;
            color: #f1f5f9;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s ease;
        }

        .field-input:focus {
            border-color: #3b82f6;
            background: rgba(59, 130, 246, 0.06);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
        }

        .field-input:focus ~ .input-icon {
            color: #60a5fa;
        }

        .field-input::placeholder {
            color: #4e5f74;
        }

        /* Password toggle */
        .pw-toggle {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #4e5f74;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            transition: color 0.2s;
        }

        .pw-toggle:hover {
            color: #94a3b8;
        }

        /* Submit Button */
        .btn-login {
            width: 100%;
            padding: 13px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
            transition: all 0.25s ease;
            margin-top: 8px;
        }

        .btn-login:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(59, 130, 246, 0.5);
        }

        .btn-login:active:not(:disabled) {
            transform: translateY(0);
        }

        .btn-login:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: rgba(100, 116, 139, 0.4);
            box-shadow: none;
        }

        /* Security Badges Footer */
        .security-badges {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            margin-top: 20px;
        }

        .sec-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 10.5px;
            color: #4e5f74;
            font-weight: 600;
        }

        /* Rate limit indicator bar */
        .attempt-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 8px;
        }

        .attempt-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            transition: background 0.3s;
        }

        .attempt-dot.used {
            background: #ef4444;
        }
    </style>
</head>
<body>
    <div class="login-page">
        <!-- Background orbs -->
        <div class="bg-orb bg-orb-1"></div>
        <div class="bg-orb bg-orb-2"></div>
        <div class="bg-orb bg-orb-3"></div>

        <div class="login-wrapper">
            <!-- Brand Header -->
            <div class="brand-header">
                <div class="brand-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                    </svg>
                </div>
                <h1 class="brand-title">Drive Portal</h1>
                <p class="brand-subtitle">Secure Cloud Storage Gateway</p>
            </div>

            <!-- Login Card -->
            <div class="login-card">
                <h2 class="card-heading">Selamat Datang</h2>
                <p class="card-subheading">Masuk ke akun Anda untuk mengakses storage</p>

                <!-- Session Timeout Notice -->
                <?php if (isset($timeoutExpired) && $timeoutExpired): ?>
                    <div class="login-alert alert-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <span>Sesi Anda telah berakhir karena tidak aktif. Silakan masuk kembali.</span>
                    </div>
                <?php endif; ?>

                <!-- Error Alert -->
                <?php if (!empty($error)): ?>
                    <div class="login-alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                        <span><?= htmlspecialchars($error) ?></span>
                    </div>
                <?php endif; ?>

                <form action="/login" method="POST" autocomplete="off" id="login-form">
                    <?= SecurityModel::csrfInputField() ?>

                    <div class="field-group">
                        <label for="username" class="field-label">Username</label>
                        <div class="input-wrap">
                            <input type="text" id="username" name="username" class="field-input" placeholder="Masukkan username" required autocomplete="off" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
                            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                    </div>

                    <div class="field-group">
                        <label for="password" class="field-label">Password</label>
                        <div class="input-wrap">
                            <input type="password" id="password" name="password" class="field-input" placeholder="••••••••" required style="padding-right: 48px;">
                            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            <button type="button" class="pw-toggle" id="pw-toggle" aria-label="Tampilkan password" onclick="togglePw()">
                                <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                        </div>
                        <?php
                            $maxAttempts = (int)($maxAttempts ?? 5);
                            $loginAttempts = (int)($loginAttempts ?? 0);
                        ?>
                        <?php if ($loginAttempts > 0): ?>
                            <div class="attempt-indicator">
                                <?php for ($i = 0; $i < $maxAttempts; $i++): ?>
                                    <div class="attempt-dot <?= $i < $loginAttempts ? 'used' : '' ?>"></div>
                                <?php endfor; ?>
                                <span style="font-size: 11px; color: #ef4444; font-weight: 600;"><?= $loginAttempts ?>/<?= $maxAttempts ?> percobaan</span>
                            </div>
                        <?php endif; ?>
                    </div>

                    <button type="submit" class="btn-login" id="btn-login" <?= isset($lockoutRemaining) && $lockoutRemaining > 0 ? 'disabled' : '' ?>>
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                        <span>Masuk ke Portal</span>
                    </button>
                </form>

                <!-- Security Badges -->
                <div class="security-badges">
                    <span class="sec-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        CSRF Protected
                    </span>
                    <span class="sec-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        Rate Limited
                    </span>
                    <span class="sec-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        Encrypted Session
                    </span>
                </div>
            </div>
        </div>
    </div>

    <script>
        function togglePw() {
            const input = document.getElementById('password');
            const icon = document.getElementById('eye-icon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" x2="23" y1="1" y2="23"/>';
            } else {
                input.type = 'password';
                icon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
            }
        }

        // Focus first empty input
        document.addEventListener('DOMContentLoaded', () => {
            const uField = document.getElementById('username');
            const pField = document.getElementById('password');
            if (uField.value === '') {
                uField.focus();
            } else {
                pField.focus();
            }
        });
    </script>
</body>
</html>