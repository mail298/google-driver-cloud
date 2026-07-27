<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\admin_login.php -->
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Portal - Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        html, body.login-page {
            background-color: #080c14 !important;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%) !important;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            overflow-y: auto !important;
        }

        .login-card {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            padding: 36px 32px;
            width: 420px;
            max-width: 100%;
            box-shadow: 0 24px 60px -10px rgba(0, 0, 0, 0.6);
            position: relative;
            overflow: hidden;
        }

        .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        }

        .brand-logo-admin {
            width: 54px;
            height: 54px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #60a5fa;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px auto;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.25);
        }

        .brand h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #fff;
            margin: 0 0 6px 0;
            letter-spacing: -0.5px;
        }

        .brand p {
            font-size: 13px;
            color: #94a3b8;
            margin: 0 0 24px 0;
        }

        .input-wrapper {
            position: relative;
            margin-top: 6px;
        }

        .input-wrapper input {
            width: 100%;
            background: rgba(10, 15, 29, 0.85);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 12px 14px 12px 42px;
            color: #fff;
            font-size: 14px;
            outline: none;
            transition: all 0.2s ease;
            box-sizing: border-box;
        }

        .input-wrapper input:focus {
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
            background: rgba(15, 23, 42, 0.95);
        }

        .input-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            pointer-events: none;
            transition: color 0.2s ease;
        }

        .input-wrapper input:focus + .input-icon,
        .input-wrapper input:not(:placeholder-shown) + .input-icon {
            color: #3b82f6;
        }

        .btn-submit-login {
            width: 100%;
            padding: 13px 20px;
            margin-top: 24px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #fff;
            font-size: 14px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.35);
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-submit-login:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 28px rgba(59, 130, 246, 0.5);
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        }
    </style>
</head>
<body class="login-page">
    <div class="login-card">
        <div class="brand" style="text-align: center;">
            <div class="brand-logo-admin">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="M6 18h.01"/><path d="M10 18h.01"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M2 10V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/></svg>
            </div>
            <h2>Master Control Panel</h2>
            <p>Sign in to manage client quota & storage pool</p>
        </div>

        <?php if (!empty($error)): ?>
            <div style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 12px 16px; border-radius: 12px; margin-bottom: 20px; font-size: 13.5px; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span><?= htmlspecialchars($error) ?></span>
            </div>
        <?php endif; ?>

        <form action="/admin/login" method="POST">
            <div class="form-group" style="margin-bottom: 16px;">
                <label for="username" style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Admin Username</label>
                <div class="input-wrapper">
                    <input type="text" id="username" name="username" placeholder="Masukkan username admin" required autocomplete="off">
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
                <label for="password" style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Password</label>
                <div class="input-wrapper">
                    <input type="password" id="password" name="password" placeholder="••••••••" required>
                    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
            </div>

            <button type="submit" class="btn-submit-login">
                <span>Sign In to Master Control</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" x2="19" y1="12" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
        </form>
    </div>
</body>
</html>
