<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\admin_403.php -->
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Akses Ditolak (IP Not Whitelisted)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap"
        rel="stylesheet">
    <style>
        body {
            background-color: #080c14;
            background-image:
                radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.12) 0%, transparent 60%),
                radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%);
            color: #f8fafc;
            font-family: 'Plus Jakarta Sans', sans-serif;
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        .error-card {
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 24px;
            padding: 40px 36px;
            width: 480px;
            max-width: 100%;
            text-align: center;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
            position: relative;
            overflow: hidden;
        }

        .error-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, #ef4444, #f43f5e);
        }

        /* Styling gambar pengganti icon */
        .error-image {
            width: 120px;
            /* Sesuaikan ukuran gambar di sini */
            height: auto;
            max-width: 100%;
            margin: 0 auto 20px auto;
            display: block;
            filter: drop-shadow(0 8px 24px rgba(239, 68, 68, 0.25));
        }

        .error-card h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 800;
            margin: 0 0 8px 0;
            color: #fff;
            letter-spacing: -0.5px;
        }

        .error-card p {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin: 0 0 24px 0;
        }

        .ip-badge {
            font-family: 'JetBrains Mono', monospace;
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 6px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            display: inline-block;
            margin: 6px 0 20px 0;
        }

        .btn-home {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-home:hover {
            background: rgba(255, 255, 255, 0.15);
            transform: translateY(-2px);
        }
    </style>
</head>

<body>
    <div class="error-card">
        <!-- Gantilah atribut 'src' di bawah dengan lokasi file gambar kamu -->
        <img src="../image/403/forbidden-403.png" alt="Akses Ditolak" class="error-image">

        <h1>403 - Akses Ditolak</h1>
        <p>Halaman Admin dilindungi oleh Kebijakan Admin IP Whitelist. Alamat IP Anda tidak memiliki izin untuk
            mengakses area ini.</p>

        <div>
            <span style="font-size: 12px; color: #64748b; display: block;">ALAMAT IP ANDA</span>
            <div class="ip-badge">🌐 <?= htmlspecialchars($clientIp ?? 'Unknown IP') ?></div>
        </div>

        <div>
            <a href="/" class="btn-home">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Kembali ke Client Portal</span>
            </a>
        </div>
    </div>
</body>

</html>