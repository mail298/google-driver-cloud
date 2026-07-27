<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\login.php -->
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Portal - Login</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
</head>

<body class="login-page">
    <div class="glow-orb orb-1"></div>
    <div class="glow-orb orb-2"></div>

    <div class="login-container">
        <div class="login-card">
            <div class="brand">
                <div class="brand-logo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-cloud-lightning">
                        <path
                            d="M12 2a5 5 0 0 0-4.9 4.1 6 6 0 0 0-1.8 11.5M12 2a5 5 0 0 1 4.9 4.1 6 6 0 0 1 1.8 11.5" />
                        <path d="m13 14-3 5h4l-3 5" />
                    </svg>
                </div>
                <h2>LOGIN</h2>
                <!-- <p>Secure Storage Gateway</p> -->
            </div>

            <?php if (!empty($error)): ?>
                <div class="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" x2="12" y1="8" y2="12" />
                        <line x1="12" x2="12.01" y1="16" y2="16" />
                    </svg>
                    <span><?= htmlspecialchars($error) ?></span>
                </div>
            <?php endif; ?>

            <form action="/login" method="POST" class="login-form">
                <div class="form-group">
                    <label for="username">Username</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <input type="text" id="username" name="username" placeholder="Enter username" required
                            autocomplete="off">
                    </div>
                </div>

                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="input-wrapper">
                        <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <input type="password" id="password" name="password" placeholder="••••••••" required>
                    </div>
                </div>

                <button type="submit" class="btn-submit">
                    <span>Sign In</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" x2="19" y1="12" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </form>
        </div>
    </div>
</body>

</html>