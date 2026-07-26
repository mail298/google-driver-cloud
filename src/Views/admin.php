<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\admin.php -->
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard & Storage Control</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        :root {
            --bg-dark: #07090e;
            --card-bg: rgba(15, 23, 42, 0.75);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-primary: #3b82f6;
            --accent-emerald: #10b981;
            --accent-amber: #f59e0b;
            --accent-rose: #ef4444;
            --accent-purple: #8b5cf6;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        .admin-dashboard-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 24px;
        }

        /* Top Header Bar */
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 24px;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            margin-bottom: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .admin-brand {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .admin-brand-icon {
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, #ef4444 0%, #3b82f6 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .admin-brand h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .admin-brand-badge {
            font-size: 11px;
            font-weight: 700;
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 3px 10px;
            border-radius: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .admin-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .btn-nav {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 18px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-nav-portal {
            background: rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
            border: 1px solid var(--card-border);
        }

        .btn-nav-portal:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            transform: translateY(-1px);
        }

        .btn-nav-logout {
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .btn-nav-logout:hover {
            background: #ef4444;
            color: #fff;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
            transform: translateY(-1px);
        }

        /* Executive Stats Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-bottom: 28px;
        }

        .stat-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 18px;
            padding: 20px;
            backdrop-filter: blur(12px);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-3px);
            border-color: rgba(255, 255, 255, 0.18);
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
        }

        .stat-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
        }

        .stat-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-value {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 8px;
        }

        .stat-subtext {
            font-size: 12px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .stat-progress-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            overflow: hidden;
            margin-top: 10px;
        }

        .stat-progress-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.5s ease;
        }

        /* Layout Grid: Left Form, Right Table */
        .content-grid {
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 24px;
            align-items: start;
        }

        .panel-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 20px;
            padding: 24px;
            backdrop-filter: blur(12px);
        }

        .panel-title {
            font-size: 16px;
            font-weight: 800;
            color: #fff;
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* Form Controls (Compact Responsive Layout) */
        .form-group {
            margin-bottom: 12px;
        }

        .form-label {
            display: block;
            font-size: 12px;
            font-weight: 700;
            color: #cbd5e1;
            margin-bottom: 4px;
        }

        .input-box {
            width: 100%;
            box-sizing: border-box;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: 9px;
            padding: 8px 12px;
            color: #fff;
            font-size: 13px;
            outline: none;
            transition: all 0.2s ease;
        }

        .input-box:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
            background: rgba(255, 255, 255, 0.05);
        }

        select.input-box option {
            background: #0f172a;
            color: #fff;
        }

        .pool-preview-badge {
            margin-top: 5px;
            padding: 6px 10px;
            border-radius: 7px;
            font-size: 11.5px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .pool-badge-ok {
            background: rgba(16, 185, 129, 0.12);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .pool-badge-err {
            background: rgba(239, 68, 68, 0.12);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .btn-submit {
            width: 100%;
            padding: 10px 14px;
            margin-top: 6px;
            border-radius: 9px;
            border: none;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
            transition: all 0.2s ease;
        }

        .btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        /* Accounts Table */
        .table-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }

        .search-box {
            position: relative;
            width: 260px;
        }

        .search-box input {
            padding-left: 36px;
        }

        .search-icon {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
        }

        .admin-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 13px;
        }

        .admin-table th {
            padding: 12px 14px;
            text-align: left;
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background: rgba(255, 255, 255, 0.02);
            border-bottom: 1px solid var(--card-border);
        }

        .admin-table td {
            padding: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            vertical-align: middle;
        }

        .admin-table tr:hover td {
            background: rgba(255, 255, 255, 0.02);
        }

        .role-tag {
            display: inline-block;
            padding: 3px 9px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .role-admin {
            background: rgba(239, 68, 68, 0.15);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .role-client {
            background: rgba(59, 130, 246, 0.15);
            color: #93c5fd;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .user-quota-cell {
            font-weight: 700;
            color: #fff;
        }

        .btn-action-edit {
            background: rgba(59, 130, 246, 0.1);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.2);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-action-edit:hover {
            background: #2563eb;
            color: #fff;
        }

        .btn-action-del {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-action-del:hover {
            background: #ef4444;
            color: #fff;
        }

        /* Alert notifications */
        .alert-banner {
            padding: 12px 16px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 13.5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #6ee7b7;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        }

        /* Modal Overlay */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 999;
        }

        .modal-overlay.active {
            display: flex;
        }

        .modal-box {
            background: #0f172a;
            border: 1px solid var(--card-border);
            border-radius: 20px;
            width: 440px;
            max-width: 90%;
            padding: 24px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
    </style>
</head>
<body>
    <?php
        $allFolders = $allFolders ?? [];
        function formatBytes($bytes, $precision = 2) {
            if ($bytes >= 1099511627776) {
                return round($bytes / 1099511627776, $precision) . ' TB';
            } elseif ($bytes >= 1073741824) {
                return round($bytes / 1073741824, $precision) . ' GB';
            } elseif ($bytes >= 1048576) {
                return round($bytes / 1048576, $precision) . ' MB';
            } elseif ($bytes >= 1024) {
                return round($bytes / 1024, $precision) . ' KB';
            } else {
                return $bytes . ' B';
            }
        }

        function formatStorageUnit($gb, $precision = 2) {
            $gb = (float)$gb;
            if ($gb >= 1024) {
                $tb = round($gb / 1024, $precision);
                return $tb . ' TB (' . number_format($gb) . ' GB)';
            }
            return number_format($gb, 1) . ' GB';
        }
    ?>

    <div class="admin-dashboard-container">
        <!-- Header -->
        <header class="admin-header">
            <div class="admin-brand">
                <div class="admin-brand-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="M6 18h.01"/><path d="M10 18h.01"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M2 10V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/></svg>
                </div>
                <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <h1> Master Control</h1>
                        <span class="admin-brand-badge">Administrator</span>
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Dynamic Storage Pool & Account Manager</div>
                </div>
            </div>

            <div class="admin-actions">
                <a href="/" class="btn-nav btn-nav-portal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>
                    <span>Client Portal View</span>
                </a>
                <a href="/logout" class="btn-nav btn-nav-logout">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                    <span>Sign Out</span>
                </a>
            </div>
        </header>

        <!-- Notification Alerts -->
        <?php if (isset($_GET['success'])): ?>
            <div class="alert-banner alert-success">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span><?= htmlspecialchars($_GET['success']) ?></span>
                </div>
                <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer;">&times;</button>
            </div>
        <?php endif; ?>

        <?php if (isset($_GET['error'])): ?>
            <div class="alert-banner alert-error">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span><?= htmlspecialchars($_GET['error']) ?></span>
                </div>
                <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; cursor:pointer;">&times;</button>
            </div>
        <?php endif; ?>

        <!-- Stat Cards Grid -->
        <div class="stats-grid">
            <!-- Card 1: Master API Capacity -->
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Gateway Master API</span>
                    <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="font-size: 22px;"><?= formatStorageUnit($limitGb) ?></div>
                <div class="stat-subtext">Total Kapasitas Cloud Gateway API</div>
                <div class="stat-progress-bar">
                    <div class="stat-progress-fill" style="width: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa);"></div>
                </div>
            </div>

            <!-- Card 2: Total Allocated Client Storage -->
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Storage Teralokasi</span>
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="color: #fbbf24; font-size: 22px;"><?= formatStorageUnit($totalAllocatedGb) ?></div>
                <div class="stat-subtext"><?= $allocatedPercent ?>% dari Total Master Capacity</div>
                <div class="stat-progress-bar">
                    <div class="stat-progress-fill" style="width: <?= $allocatedPercent ?>%; background: linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
                </div>
            </div>

            <!-- Card 3: Available Admin Pool -->
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Sisa Admin Pool</span>
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="color: #34d399; font-size: 22px;"><?= formatStorageUnit($availablePoolGb) ?></div>
                <div class="stat-subtext">
                    <span style="color: <?= $availablePoolGb > 10 ? '#34d399' : '#ef4444' ?>; font-weight: 700;">
                        <?= $availablePoolGb > 10 ? '✓ Ambil & Bagikan Kuota' : '⚠️ Sisa Pool Rendah' ?>
                    </span>
                </div>
                <div class="stat-progress-bar">
                    <div class="stat-progress-fill" style="width: <?= max(0, 100 - $allocatedPercent) ?>%; background: linear-gradient(90deg, #10b981, #34d399);"></div>
                </div>
            </div>

            <!-- Card 4: Physical Storage Used -->
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">Penggunaan Fisik</span>
                    <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="color: #a78bfa;"><?= formatBytes($totalUsedBytes) ?></div>
                <div class="stat-subtext">
                    📷 <?= formatBytes($photoSize) ?> &bull; 📹 <?= formatBytes($videoSize) ?> &bull; 📄 <?= formatBytes($documentSize) ?>
                </div>
                <div class="stat-progress-bar">
                    <div class="stat-progress-fill" style="width: <?= $storagePercent ?>%; background: linear-gradient(90deg, #8b5cf6, #c084fc);"></div>
                </div>
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="content-grid">
            <!-- Left: Create User Card -->
            <div class="panel-card">
                <div class="panel-title">
                    <span>Register Akun Client Baru</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                </div>

                <form action="/admin/users/create" method="POST">
                    <div class="form-group">
                        <label for="create_username" class="form-label">Username</label>
                        <input type="text" id="create_username" name="username" class="input-box" placeholder="contoh: clientA" required autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="create_password" class="form-label">Password</label>
                        <input type="text" id="create_password" name="password" class="input-box" placeholder="Password akun" required>
                    </div>

                    <div class="form-group">
                        <label for="create_role" class="form-label">Role Akses</label>
                        <select id="create_role" name="role" class="input-box" onchange="updateCreateCalculator()">
                            <option value="client" selected>Client User</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <label for="create_storage_limit_gb" class="form-label">Alokasi Storage (GB)</label>
                            <span style="font-size: 11px; color: #34d399; font-weight: 700;">Tersedia: <?= $availablePoolGb ?> GB</span>
                        </div>
                        <input type="number" step="0.1" id="create_storage_limit_gb" name="storage_limit_gb" class="input-box" value="15" required oninput="updateCreateCalculator()">
                        
                        <!-- Interactive Live Calculator Widget -->
                        <div id="create-pool-badge" class="pool-preview-badge pool-badge-ok">
                            <span>⚡ Live Calculator: Sisa Admin Pool menjadi <strong id="create-calc-rem"><?= max(0, $availablePoolGb - 15) ?> GB</strong></span>
                        </div>
                    </div>

                    <div class="form-group" style="background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); border-radius: 12px; padding: 10px 12px; margin-bottom: 10px;">
                        <label for="create_root_folder_id" class="form-label" style="color: #60a5fa; margin-bottom: 4px;">📁 Target Root Folder ID (Opsional)</label>
                        <input type="text" id="create_root_folder_id" name="root_folder_id" class="input-box" placeholder="Tempel ID atau Link URL Google Drive..." style="margin-bottom: 6px;">
                        
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap;">Atau pilih folder:</span>
                            <select class="input-box" style="font-size: 11.5px; padding: 5px 8px; background: #0b1120; border-color: rgba(255,255,255,0.12);" onchange="if(this.value) document.getElementById('create_root_folder_id').value = this.value">
                                <option value="">-- Pilih Folder Terdaftar di Drive --</option>
                                <?php foreach ($allFolders as $af): ?>
                                    <?php $val = !empty($af['provider_folder_id']) ? $af['provider_folder_id'] : $af['id']; ?>
                                    <option value="<?= htmlspecialchars($val) ?>">📁 <?= htmlspecialchars($af['name']) ?> (<?= htmlspecialchars(substr($val, 0, 14)) ?>...)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <button type="submit" id="btn-create-submit" class="btn-submit">
                        Registrasi & Alokasikan Storage
                    </button>
                </form>
            </div>

            <!-- Right: Registered Users Table -->
            <div class="panel-card">
                <div class="table-toolbar">
                    <div>
                        <div class="panel-title" style="margin: 0;">Daftar Pengguna & Alokasi Storage</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Kelola peran, batas kuota, dan pemakaian fisik tiap akun</div>
                    </div>
                    <div class="search-box">
                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                        <input type="text" id="table-search" class="input-box" placeholder="Cari username..." onkeyup="filterUserTable()">
                    </div>
                </div>

                <table class="admin-table" id="users-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Kuota Alokasi</th>
                            <th>Pemakaian Fisik</th>
                            <th>Target Root Folder</th>
                            <th style="text-align: right;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $u): ?>
                            <?php 
                                $usage = $userUsageMap[$u['id']] ?? ['used_bytes' => 0, 'file_count' => 0];
                                $uLimitGb = (float)($u['storage_limit_gb'] ?? 15);
                                $uLimitBytes = $uLimitGb * 1024 * 1024 * 1024;
                                $uPercent = min(100, round(($usage['used_bytes'] / $uLimitBytes) * 100, 1));
                            ?>
                            <tr>
                                <td>
                                    <div style="font-weight: 700; color: #fff; font-size: 14px;"><?= htmlspecialchars($u['username']) ?></div>
                                    <div style="font-size: 11px; color: var(--text-muted);"><?= $usage['file_count'] ?> active files</div>
                                </td>
                                <td>
                                    <span class="role-tag <?= $u['role'] === 'admin' ? 'role-admin' : 'role-client' ?>">
                                        <?= htmlspecialchars($u['role']) ?>
                                    </span>
                                </td>
                                <td class="user-quota-cell">
                                    <?php if ($u['role'] === 'admin'): ?>
                                        <span style="color: #fca5a5; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.25);">Full Master Pool</span>
                                    <?php else: ?>
                                        <?= htmlspecialchars($u['storage_limit_gb']) ?> GB
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <div style="font-size: 12px; font-weight: 600; color: #e2e8f0;">
                                        <?= formatBytes($usage['used_bytes']) ?> <span style="color: var(--text-muted); font-size: 11px;">(<?= $uPercent ?>%)</span>
                                    </div>
                                    <div class="stat-progress-bar" style="height: 4px; width: 110px; margin-top: 4px;">
                                        <div class="stat-progress-fill" style="width: <?= $uPercent ?>%; background: <?= $uPercent > 90 ? '#ef4444' : '#3b82f6' ?>;"></div>
                                    </div>
                                </td>
                                <td>
                                    <?php if (!empty($u['root_folder_id'])): ?>
                                        <span title="<?= htmlspecialchars($u['root_folder_id']) ?>" style="font-family: monospace; font-size: 11px; color: #60a5fa; background: rgba(59,130,246,0.12); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(59,130,246,0.25); display: inline-flex; align-items: center; gap: 4px;">
                                            📁 <?= htmlspecialchars(strlen($u['root_folder_id']) > 16 ? substr($u['root_folder_id'], 0, 16) . '...' : $u['root_folder_id']) ?>
                                        </span>
                                    <?php else: ?>
                                        <span style="color:#64748b; font-size: 11px;">Root Drive Utama</span>
                                    <?php endif; ?>
                                </td>
                                <td style="text-align: right;">
                                    <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                                        <button type="button" class="btn-action-edit" onclick="openEditModal(<?= htmlspecialchars(json_encode($u), ENT_QUOTES, 'UTF-8') ?>)">Edit User</button>
                                        <form method="POST" action="/admin/users/delete" style="display:inline;" onsubmit="return confirm('Apakah Anda yakin ingin menghapus akun <?= htmlspecialchars($u['username']) ?>? Kuota storage akan dikembalikan ke Admin Pool.')">
                                            <input type="hidden" name="id" value="<?= $u['id'] ?>">
                                            <button type="submit" class="btn-action-del">Hapus</button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" id="edit-modal">
        <div class="modal-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Edit Kuota & Root Folder User</h3>
                <button type="button" onclick="closeEditModal()" style="background:none; border:none; color:var(--text-muted); font-size: 20px; cursor:pointer;">&times;</button>
            </div>

            <form action="/admin/users/update" method="POST">
                <input type="hidden" id="edit-id" name="id">
                
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" id="edit-username" class="input-box" disabled style="opacity: 0.7; cursor: not-allowed;">
                </div>

                <div class="form-group">
                    <label for="edit-role" class="form-label">Role Akses</label>
                    <select id="edit-role" name="role" class="input-box" onchange="updateEditCalculator()">
                        <option value="client">Client User</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>

                <div class="form-group">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label for="edit-storage_limit_gb" class="form-label">Alokasi Storage (GB)</label>
                        <span style="font-size: 11px; color: #34d399; font-weight: 700;">Admin Pool: <?= $availablePoolGb ?> GB</span>
                    </div>
                    <input type="number" step="0.1" id="edit-storage_limit_gb" name="storage_limit_gb" class="input-box" required oninput="updateEditCalculator()">
                    
                    <div id="edit-pool-badge" class="pool-preview-badge pool-badge-ok">
                        <span>⚡ Live Calculator: Sisa Admin Pool menjadi <strong id="edit-calc-rem">-- GB</strong></span>
                    </div>
                </div>

                <div class="form-group" style="background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); border-radius: 14px; padding: 14px;">
                    <label for="edit-root_folder_id" class="form-label" style="color: #60a5fa; margin-bottom: 6px;">📁 Target Root Folder ID (Opsional)</label>
                    <input type="text" id="edit-root_folder_id" name="root_folder_id" class="input-box" placeholder="Tempel ID atau Link URL Google Drive (https://drive.google.com/...)" style="margin-bottom: 8px;">
                    
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 11px; color: var(--text-muted); white-space: nowrap;">Atau pilih folder:</span>
                        <select class="input-box" style="font-size: 12px; padding: 6px 10px; background: #0b1120; border-color: rgba(255,255,255,0.12);" onchange="if(this.value) document.getElementById('edit-root_folder_id').value = this.value">
                            <option value="">-- Pilih Folder Terdaftar di Drive --</option>
                            <?php foreach ($allFolders as $af): ?>
                                <?php $val = !empty($af['provider_folder_id']) ? $af['provider_folder_id'] : $af['id']; ?>
                                <option value="<?= htmlspecialchars($val) ?>">📁 <?= htmlspecialchars($af['name']) ?> (<?= htmlspecialchars(substr($val, 0, 14)) ?>...)</option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="edit-password" class="form-label">Password Baru (Opsional)</label>
                    <input type="text" id="edit-password" name="password" class="input-box" placeholder="Biarkan kosong jika tidak diubah">
                </div>

                <div style="margin-top: 24px; display: flex; justify-content: flex-end; gap: 12px;">
                    <button type="button" class="btn-nav btn-nav-portal" onclick="closeEditModal()">Batal</button>
                    <button type="submit" id="btn-edit-submit" class="btn-submit" style="width: auto; padding: 10px 20px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);">Simpan Perubahan</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        const initialAvailablePoolGb = <?= (float)$availablePoolGb ?>;
        let currentEditOriginalQuota = 0;
        let currentEditOriginalRole = 'client';

        function formatJsStorageUnit(gb) {
            if (gb >= 1024) {
                return (gb / 1024).toFixed(2) + ' TB (' + Math.round(gb).toLocaleString('en-US') + ' GB)';
            }
            return gb.toFixed(1) + ' GB';
        }

        function updateCreateCalculator() {
            const role = document.getElementById('create_role').value;
            const inputVal = parseFloat(document.getElementById('create_storage_limit_gb').value) || 0;
            const badge = document.getElementById('create-pool-badge');
            const btnSubmit = document.getElementById('btn-create-submit');

            if (role === 'admin') {
                badge.className = 'pool-preview-badge pool-badge-ok';
                badge.innerHTML = '<span>ℹ️ Akun Admin tidak mengurangi sisa Admin Pool</span>';
                btnSubmit.disabled = false;
                btnSubmit.style.opacity = '1';
                return;
            }

            const newRemaining = initialAvailablePoolGb - inputVal;
            if (newRemaining < 0) {
                badge.className = 'pool-preview-badge pool-badge-err';
                badge.innerHTML = '<span>⚠️ Alokasi (' + inputVal + ' GB) melebihi sisa Admin Pool (' + formatJsStorageUnit(initialAvailablePoolGb) + ' tersedia)!</span>';
                btnSubmit.disabled = true;
                btnSubmit.style.opacity = '0.5';
            } else {
                badge.className = 'pool-preview-badge pool-badge-ok';
                badge.innerHTML = '<span>⚡ Live Calculator: Sisa Admin Pool menjadi <strong>' + formatJsStorageUnit(newRemaining) + '</strong></span>';
                btnSubmit.disabled = false;
                btnSubmit.style.opacity = '1';
            }
        }

        function openEditModal(user) {
            document.getElementById('edit-id').value = user.id;
            document.getElementById('edit-username').value = user.username;
            document.getElementById('edit-storage_limit_gb').value = user.storage_limit_gb;
            document.getElementById('edit-role').value = user.role;
            document.getElementById('edit-root_folder_id').value = user.root_folder_id || '';
            document.getElementById('edit-password').value = '';

            currentEditOriginalQuota = parseFloat(user.storage_limit_gb) || 0;
            currentEditOriginalRole = user.role || 'client';

            updateEditCalculator();
            document.getElementById('edit-modal').classList.add('active');
        }

        function updateEditCalculator() {
            const role = document.getElementById('edit-role').value;
            const inputVal = parseFloat(document.getElementById('edit-storage_limit_gb').value) || 0;
            const badge = document.getElementById('edit-pool-badge');
            const btnSubmit = document.getElementById('btn-edit-submit');

            let oldQuota = (currentEditOriginalRole === 'client') ? currentEditOriginalQuota : 0;
            let newQuota = (role === 'client') ? inputVal : 0;
            let netDiff = newQuota - oldQuota;

            const newRemaining = initialAvailablePoolGb - netDiff;

            if (role === 'admin') {
                badge.className = 'pool-preview-badge pool-badge-ok';
                badge.innerHTML = '<span>ℹ️ Mengubah ke Admin akan mengembalikan ' + oldQuota + ' GB ke Admin Pool</span>';
                btnSubmit.disabled = false;
                btnSubmit.style.opacity = '1';
                return;
            }

            if (newRemaining < 0) {
                badge.className = 'pool-preview-badge pool-badge-err';
                badge.innerHTML = '<span>⚠️ Penambahan kuota melebihi sisa Admin Pool (butuh tambahan ' + Math.abs(newRemaining).toFixed(1) + ' GB)!</span>';
                btnSubmit.disabled = true;
                btnSubmit.style.opacity = '0.5';
            } else {
                badge.className = 'pool-preview-badge pool-badge-ok';
                badge.innerHTML = '<span>⚡ Live Calculator: Sisa Admin Pool menjadi <strong>' + formatJsStorageUnit(newRemaining) + '</strong></span>';
                btnSubmit.disabled = false;
                btnSubmit.style.opacity = '1';
            }
        }

        function closeEditModal() {
            document.getElementById('edit-modal').classList.remove('active');
        }

        function filterUserTable() {
            const query = document.getElementById('table-search').value.toLowerCase();
            const rows = document.querySelectorAll('#users-table tbody tr');
            rows.forEach(row => {
                const username = row.cells[0].innerText.toLowerCase();
                if (username.includes(query)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        // Initialize calculator on page load
        document.addEventListener('DOMContentLoaded', () => {
            updateCreateCalculator();
        });
    </script>
</body>
</html>
