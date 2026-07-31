<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\admin_login.php -->
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal — Masuk</title>
    <link rel="icon" type="image/png" href="/assets/image/favicon/favicon-clouds.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background:
                radial-gradient(ellipse at 20% 20%, rgba(239, 68, 68, 0.1) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                #06080f;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
            position: relative;
        }

        .bg-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
            pointer-events: none;
        }
        .bg-orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(239, 68, 68, 0.12) 0%, transparent 70%); top: -150px; left: -100px; animation: orbFloat 8s ease-in-out infinite alternate; }
        .bg-orb-2 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(139, 92, 246, 0.09) 0%, transparent 70%); bottom: -200px; right: -150px; animation: orbFloat 9s ease-in-out infinite alternate-reverse; }

        @keyframes orbFloat {
            from { transform: scale(1); }
            to { transform: scale(1.06) translate(8px, -8px); }
        }

        .login-wrapper {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 420px;
        }

        .brand-header {
            text-align: center;
            margin-bottom: 28px;
        }

        .brand-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 58px;
            height: 58px;
            border-radius: 17px;
            background: linear-gradient(135deg, #ef4444 0%, #8b5cf6 100%);
            box-shadow: 0 12px 32px rgba(239, 68, 68, 0.45);
            margin-bottom: 14px;
        }

        .brand-title {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #fff 0%, #fca5a5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0 0 5px 0;
        }

        .brand-subtitle {
            font-size: 13px;
            color: #64748b;
        }

        .admin-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 3px 10px;
            border-radius: 20px;
            margin-top: 6px;
        }

        .login-card {
            background: rgba(12, 16, 30, 0.85);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 36px 32px;
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.8);
            position: relative;
            overflow: hidden;
        }

        .login-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            background: linear-gradient(90deg, #ef4444, #8b5cf6);
        }

        .card-heading {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            font-weight: 800;
            color: #fff;
            margin: 0 0 5px 0;
            letter-spacing: -0.3px;
        }

        .card-subheading {
            font-size: 12.5px;
            color: #64748b;
            margin: 0 0 24px 0;
        }

        /* IP Whitelist notice */
        .whitelist-notice {
            background: rgba(59, 130, 246, 0.08);
            border: 1px solid rgba(59, 130, 246, 0.2);
            border-radius: 10px;
            padding: 10px 14px;
            margin-bottom: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12px;
            color: #93c5fd;
            font-weight: 600;
        }

        .whitelist-notice code {
            font-family: 'JetBrains Mono', monospace;
            font-size: 11.5px;
            background: rgba(59, 130, 246, 0.15);
            padding: 2px 7px;
            border-radius: 5px;
        }

        .login-alert {
            padding: 11px 14px;
            border-radius: 11px;
            margin-bottom: 20px;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: flex-start;
            gap: 9px;
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

        .login-alert svg { flex-shrink: 0; margin-top: 2px; }

        .field-group { margin-bottom: 16px; }

        .field-label {
            display: block;
            font-size: 11.5px;
            font-weight: 700;
            color: #94a3b8;
            margin-bottom: 7px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .input-wrap { position: relative; }

        .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #4e5f74;
            pointer-events: none;
            transition: color 0.2s;
        }

        .field-input {
            width: 100%;
            box-sizing: border-box;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            padding: 12px 16px 12px 44px;
            color: #f1f5f9;
            font-size: 14px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s ease;
        }

        .field-input:focus {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.04);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .field-input::placeholder { color: #4e5f74; }

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

        .pw-toggle:hover { color: #94a3b8; }

        .btn-login {
            width: 100%;
            padding: 13px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #ef4444 0%, #8b5cf6 100%);
            color: #fff;
            font-size: 14.5px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.35);
            transition: all 0.25s ease;
            margin-top: 6px;
        }

        .btn-login:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(239, 68, 68, 0.5);
        }

        .btn-login:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            box-shadow: none;
        }

        .security-badges {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 14px;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .sec-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 10px;
            color: #4e5f74;
            font-weight: 600;
            white-space: nowrap;
        }

        @media (max-width: 480px) {
            .login-card {
                padding: 28px 20px;
                border-radius: 20px;
            }
            .security-badges {
                gap: 10px 14px;
            }
        }

        .attempt-indicator {
            display: flex;
            align-items: center;
            gap: 5px;
            margin-top: 8px;
        }

        .attempt-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
        }

        .attempt-dot.used { background: #ef4444; }
    </style>
</head>
<body>
    <div class="bg-orb bg-orb-1"></div>
    <div class="bg-orb bg-orb-2"></div>

    <div class="login-wrapper">
        <!-- Brand Header -->
        <div class="brand-header">
            <div class="brand-icon" style="background: transparent; box-shadow: none;">
                <img src="/assets/image/logo.png" alt="Logo" class="logo-img" style="height: 48px; width: auto; object-fit: contain;">
            </div>
            <h1 class="brand-title">Master Control</h1>
            <div class="brand-subtitle">Administrator Access Portal</div>
            <div class="admin-badge">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Admin Only
            </div>
        </div>

        <div class="login-card">
            <h2 class="card-heading">Login Administrator</h2>
            <p class="card-subheading">Akses terbatas untuk administrator sistem</p>

            <!-- IP Whitelist Protection Notice -->
            <?php
                $ipWhitelistConfig = IpWhitelistModel::getConfig();
                $currentIpAddr = IpWhitelistModel::getClientIp();
            ?>
            <?php if (!empty($ipWhitelistConfig['enabled'])): ?>
                <div class="whitelist-notice">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>IP Whitelist aktif. IP Anda: <code><?= htmlspecialchars($currentIpAddr) ?></code></span>
                </div>
            <?php endif; ?>

            <!-- Timeout Notice -->
            <?php if (isset($timeoutExpired) && $timeoutExpired): ?>
                <div class="login-alert alert-warning">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>Sesi Admin berakhir. Silakan login kembali.</span>
                </div>
            <?php endif; ?>

            <!-- Error Alert -->
            <?php if (!empty($error)): ?>
                <div class="login-alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span><?= htmlspecialchars($error) ?></span>
                </div>
            <?php endif; ?>

            <form action="/login" method="POST" autocomplete="off">
                <?= SecurityModel::csrfInputField() ?>

                <div class="field-group">
                    <label for="username" class="field-label">Username Admin</label>
                    <div class="input-wrap">
                        <input type="text" id="username" name="username" class="field-input" placeholder="admin username" required autocomplete="off" value="<?= htmlspecialchars($_POST['username'] ?? '') ?>">
                        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                </div>

                <div class="field-group">
                    <label for="password" class="field-label">Password</label>
                    <div class="input-wrap">
                        <input type="password" id="password" name="password" class="field-input" placeholder="••••••••" required style="padding-right: 48px;">
                        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        <button type="button" class="pw-toggle" onclick="togglePw()">
                            <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                    </div>
                    <?php
                        $maxAttempts = (int) Config::get('LOGIN_MAX_ATTEMPTS', 5);
                        $loginAttempts = (int)($loginAttempts ?? 0);
                    ?>
                    <?php if ($loginAttempts > 0): ?>
                        <div class="attempt-indicator">
                            <?php for ($i = 0; $i < $maxAttempts; $i++): ?>
                                <div class="attempt-dot <?= $i < $loginAttempts ? 'used' : '' ?>"></div>
                            <?php endfor; ?>
                            <span style="font-size: 11px; color: #ef4444; font-weight: 600;"><?= $loginAttempts ?>/<?= $maxAttempts ?></span>
                        </div>
                    <?php endif; ?>
                </div>

                <button type="submit" class="btn-login" <?= isset($lockoutRemaining) && $lockoutRemaining > 0 ? 'disabled' : '' ?>>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Masuk sebagai Administrator</span>
                </button>
            </form>

            <div class="security-badges">
                <span class="sec-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    CSRF Protected
                </span>
                <span class="sec-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" x2="19.07" y1="4.93" y2="19.07"/></svg>
                    Rate Limited
                </span>
                <span class="sec-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2H3v16h5v4l4-4h4l5-5V2z"/></svg>
                    IP Whitelist
                </span>
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
    </script>
</body>
</html>
