<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\admin.php -->
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard & Storage Control</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/style.css">
    <style>
        :root {
            --bg-dark: #080c14;
            --card-bg: rgba(15, 23, 42, 0.72);
            --card-border: rgba(255, 255, 255, 0.08);
            --card-border-hover: rgba(59, 130, 246, 0.3);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --accent-primary: #3b82f6;
            --accent-emerald: #10b981;
            --accent-amber: #f59e0b;
            --accent-rose: #ef4444;
            --accent-purple: #8b5cf6;
            --input-bg: rgba(10, 15, 29, 0.8);
        }

        body {
            background-color: var(--bg-dark);
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.06) 0%, transparent 40%),
                radial-gradient(circle at 85% 85%, rgba(139, 92, 246, 0.05) 0%, transparent 40%);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            overflow-y: auto;
        }

        .admin-dashboard-container {
            max-width: 1440px;
            margin: 0 auto;
            padding: 24px 28px 48px 28px;
        }

        /* Top Header Bar */
        .admin-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 18px 26px;
            background: rgba(15, 23, 42, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            margin-bottom: 24px;
            box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
        }

        .admin-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.4), transparent);
        }

        .admin-brand {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .admin-brand-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.35);
            position: relative;
        }

        .admin-brand-icon::after {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: 15px;
            background: linear-gradient(135deg, rgba(255,255,255,0.4), transparent);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            pointer-events: none;
        }

        .admin-brand h1 {
            font-family: 'Outfit', sans-serif;
            font-size: 22px;
            font-weight: 800;
            margin: 0;
            letter-spacing: -0.5px;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .admin-brand-badge {
            font-size: 10px;
            font-weight: 800;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(225, 29, 72, 0.15) 100%);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.35);
            padding: 3px 10px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            box-shadow: 0 2px 8px rgba(239, 68, 68, 0.15);
        }

        .admin-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .btn-nav {
            display: inline-flex;
            align-items: center;
            gap: 9px;
            padding: 10px 18px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.25s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-nav-portal {
            background: rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
            border: 1px solid var(--card-border);
        }

        .btn-nav-portal:hover {
            background: rgba(59, 130, 246, 0.12);
            color: #60a5fa;
            border-color: rgba(59, 130, 246, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
        }

        .btn-nav-logout {
            background: rgba(239, 68, 68, 0.08);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .btn-nav-logout:hover {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #fff;
            border-color: transparent;
            box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
            transform: translateY(-2px);
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
            border-radius: 22px;
            padding: 22px 24px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            position: relative;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: transparent;
            transition: all 0.3s ease;
        }

        .stat-card-blue::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .stat-card-amber::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .stat-card-emerald::before { background: linear-gradient(90deg, #10b981, #34d399); }
        .stat-card-purple::before { background: linear-gradient(90deg, #8b5cf6, #c084fc); }

        .stat-card:hover {
            transform: translateY(-4px);
            border-color: rgba(255, 255, 255, 0.16);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        }

        .stat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 14px;
        }

        .stat-title {
            font-size: 11.5px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.7px;
            color: var(--text-muted);
        }

        .stat-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }

        .stat-card:hover .stat-icon {
            transform: scale(1.08);
        }

        .stat-value {
            font-family: 'Outfit', sans-serif;
            font-size: 24px;
            font-weight: 800;
            color: #fff;
            margin-bottom: 6px;
            letter-spacing: -0.5px;
        }

        .stat-subtext {
            font-size: 12px;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 6px;
            min-height: 20px;
        }

        .stat-progress-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.06);
            border-radius: 10px;
            overflow: hidden;
            margin-top: 14px;
            position: relative;
        }

        .stat-progress-fill {
            height: 100%;
            border-radius: 10px;
            transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Layout Grid: Left Form, Right Table */
        .content-grid {
            display: grid;
            grid-template-columns: 400px 1fr;
            gap: 24px;
            align-items: start;
        }

        .panel-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 24px;
            padding: 26px;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.4);
            transition: border-color 0.3s ease;
        }

        .panel-card:hover {
            border-color: rgba(255, 255, 255, 0.12);
        }

        .panel-header-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 22px;
        }

        .panel-title {
            font-family: 'Outfit', sans-serif;
            font-size: 17px;
            font-weight: 800;
            color: #fff;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            letter-spacing: -0.3px;
        }

        .panel-title-icon {
            width: 32px;
            height: 32px;
            border-radius: 9px;
            background: rgba(59, 130, 246, 0.12);
            color: #60a5fa;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        /* Form Controls */
        .form-group {
            margin-bottom: 16px;
        }

        .form-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            font-weight: 700;
            color: #cbd5e1;
            margin-bottom: 6px;
            letter-spacing: 0.2px;
        }

        .input-box {
            width: 100%;
            box-sizing: border-box;
            background: var(--input-bg);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 10px 14px;
            color: #fff;
            font-size: 13.5px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s ease;
        }

        .input-box:focus {
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3);
            background: rgba(15, 23, 42, 0.95);
        }

        .input-box::placeholder {
            color: #64748b;
        }

        select.input-box option {
            background: #0f172a;
            color: #fff;
            padding: 8px;
        }

        /* Folder Picker Box */
        .folder-picker-box {
            background: rgba(10, 15, 29, 0.6);
            border: 1px dashed rgba(59, 130, 246, 0.3);
            border-radius: 14px;
            padding: 14px;
            margin-bottom: 16px;
            transition: border-color 0.2s ease;
        }

        .folder-picker-box:hover {
            border-color: rgba(59, 130, 246, 0.5);
        }

        .pool-preview-badge {
            margin-top: 8px;
            padding: 10px 12px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.25s ease;
            line-height: 1.4;
        }

        .pool-badge-ok {
            background: rgba(16, 185, 129, 0.1);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .pool-badge-err {
            background: rgba(239, 68, 68, 0.1);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .btn-submit-primary {
            width: 100%;
            padding: 12px 18px;
            margin-top: 8px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #fff;
            font-size: 13.5px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
            transition: all 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-submit-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59, 130, 246, 0.5);
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        }

        .btn-submit-primary:active {
            transform: translateY(0);
        }

        /* Accounts Table Toolbar & Structure */
        .table-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            gap: 16px;
            flex-wrap: wrap;
        }

        .search-box {
            position: relative;
            width: 280px;
        }

        .search-box input {
            padding-left: 40px;
            border-radius: 12px;
            height: 40px;
        }

        .search-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
            transition: color 0.2s ease;
        }

        .search-box input:focus + .search-icon,
        .search-box input:not(:placeholder-shown) + .search-icon {
            color: var(--accent-primary);
        }

        .table-responsive {
            width: 100%;
            overflow-x: auto;
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .admin-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            text-align: left;
        }

        .admin-table th {
            padding: 14px 16px;
            color: var(--text-muted);
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            background: rgba(10, 15, 29, 0.9);
            border-bottom: 1px solid var(--card-border);
            white-space: nowrap;
        }

        .admin-table td {
            padding: 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            vertical-align: middle;
            transition: background 0.2s ease;
        }

        .admin-table tr:last-child td {
            border-bottom: none;
        }

        .admin-table tr:hover td {
            background: rgba(255, 255, 255, 0.025);
        }

        /* User Avatar Pill */
        .user-info-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
            border: 1px solid rgba(59, 130, 246, 0.3);
            color: #93c5fd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 14px;
            font-family: 'Outfit', sans-serif;
            flex-shrink: 0;
        }

        .role-tag {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .role-admin {
            background: rgba(239, 68, 68, 0.12);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.25);
        }

        .role-client {
            background: rgba(59, 130, 246, 0.12);
            color: #93c5fd;
            border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .btn-action-edit {
            background: rgba(59, 130, 246, 0.08);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.2);
            padding: 7px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .btn-action-edit:hover {
            background: #2563eb;
            color: #fff;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
            transform: translateY(-1px);
        }

        .btn-action-del {
            background: rgba(239, 68, 68, 0.08);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.2);
            padding: 7px 14px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
            font-family: inherit;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }

        .btn-action-del:hover {
            background: #ef4444;
            color: #fff;
            border-color: transparent;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
            transform: translateY(-1px);
        }

        /* Alert notifications */
        .alert-banner {
            padding: 14px 20px;
            border-radius: 16px;
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .alert-success {
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #6ee7b7;
        }

        .alert-error {
            background: rgba(239, 68, 68, 0.12);
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
            background: rgba(4, 6, 12, 0.82);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 999;
            padding: 20px;
            opacity: 0;
            transition: opacity 0.25s ease;
        }

        .modal-overlay.active {
            display: flex;
            opacity: 1;
        }

        .modal-box {
            background: #0d1322;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 24px;
            width: 480px;
            max-width: 100%;
            padding: 28px;
            box-shadow: 0 24px 60px rgba(0, 0, 0, 0.7);
            transform: scale(0.95);
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .modal-overlay.active .modal-box {
            transform: scale(1);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1200px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            .content-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 640px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            .admin-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 16px;
            }
            .admin-actions {
                width: 100%;
                justify-content: flex-end;
            }
            .admin-dashboard-container {
                padding: 16px;
            }
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v8"/><path d="M6 18h.01"/><path d="M10 18h.01"/><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M2 10V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4"/></svg>
                </div>
                <div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <h1>Master Control</h1>
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
                <div style="display: flex; align-items: center; gap: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span><?= htmlspecialchars($_GET['success']) ?></span>
                </div>
                <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; font-size: 20px; cursor:pointer; opacity: 0.7;">&times;</button>
            </div>
        <?php endif; ?>

        <?php if (isset($_GET['error'])): ?>
            <div class="alert-banner alert-error">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                    <span><?= htmlspecialchars($_GET['error']) ?></span>
                </div>
                <button onclick="this.parentElement.remove()" style="background:none; border:none; color:inherit; font-size: 20px; cursor:pointer; opacity: 0.7;">&times;</button>
            </div>
        <?php endif; ?>

        <!-- Stat Cards Grid -->
        <div class="stats-grid">
            <!-- Card 1: Master API Capacity -->
            <div class="stat-card stat-card-blue">
                <div class="stat-header">
                    <span class="stat-title">Gateway Master API</span>
                    <div class="stat-icon" style="background: rgba(59, 130, 246, 0.15); color: #60a5fa;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                    </div>
                </div>
                <div class="stat-value"><?= formatStorageUnit($limitGb) ?></div>
                <div class="stat-subtext">Total Kapasitas Cloud Gateway API</div>
                <div class="stat-progress-bar">
                    <div class="stat-progress-fill" style="width: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa);"></div>
                </div>
            </div>

            <!-- Card 2: Total Allocated Client Storage -->
            <div class="stat-card stat-card-amber">
                <div class="stat-header">
                    <span class="stat-title">Storage Teralokasi</span>
                    <div class="stat-icon" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="color: #fbbf24;"><?= formatStorageUnit($totalAllocatedGb) ?></div>
                <div class="stat-subtext"><?= $allocatedPercent ?>% dari Total Master Capacity</div>
                <div class="stat-progress-bar">
                    <div class="stat-progress-fill" style="width: <?= $allocatedPercent ?>%; background: linear-gradient(90deg, #f59e0b, #fbbf24);"></div>
                </div>
            </div>

            <!-- Card 3: Available Admin Pool -->
            <div class="stat-card stat-card-emerald">
                <div class="stat-header">
                    <span class="stat-title">Sisa Admin Pool</span>
                    <div class="stat-icon" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="color: #34d399;"><?= formatStorageUnit($availablePoolGb) ?></div>
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
            <div class="stat-card stat-card-purple">
                <div class="stat-header">
                    <span class="stat-title">Penggunaan Fisik</span>
                    <div class="stat-icon" style="background: rgba(139, 92, 246, 0.15); color: #a78bfa;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                </div>
                <div class="stat-value" style="color: #c084fc;"><?= formatBytes($totalUsedBytes) ?></div>
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
                <div class="panel-header-title">
                    <h2 class="panel-title">
                        <span class="panel-title-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                        </span>
                        Register Akun Client Baru
                    </h2>
                </div>

                <form action="/admin/users/create" method="POST">
                    <div class="form-group">
                        <label for="create_username" class="form-label">
                            <span>Username</span>
                            <span style="font-size: 11px; color: var(--text-muted);">Wajib</span>
                        </label>
                        <input type="text" id="create_username" name="username" class="input-box" placeholder="contoh: clientA" required autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="create_password" class="form-label">
                            <span>Password</span>
                            <span style="font-size: 11px; color: var(--text-muted);">Wajib</span>
                        </label>
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
                        <label for="create_storage_limit_gb" class="form-label">
                            <span>Alokasi Storage (GB)</span>
                            <span style="font-size: 11px; color: #34d399; font-weight: 700;">Tersedia: <?= $availablePoolGb ?> GB</span>
                        </label>
                        <input type="number" step="0.1" id="create_storage_limit_gb" name="storage_limit_gb" class="input-box" value="15" required oninput="updateCreateCalculator()">
                        
                        <!-- Interactive Live Calculator Widget -->
                        <div id="create-pool-badge" class="pool-preview-badge pool-badge-ok">
                            <span>⚡ Live Calculator: Sisa Admin Pool menjadi <strong id="create-calc-rem"><?= max(0, $availablePoolGb - 15) ?> GB</strong></span>
                        </div>
                    </div>

                    <!-- Target Root Folder ID Card -->
                    <div class="folder-picker-box">
                        <label for="create_root_folder_id" class="form-label" style="color: #60a5fa; margin-bottom: 6px;">
                            <span style="display: flex; align-items: center; gap: 6px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                Target Root Folder ID (Opsional)
                            </span>
                        </label>
                        <input type="text" id="create_root_folder_id" name="root_folder_id" class="input-box" placeholder="Tempel ID atau Link URL Google Drive..." style="margin-bottom: 10px;">
                        
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <span style="font-size: 11px; color: var(--text-muted);">Atau pilih folder terdaftar:</span>
                            <select class="input-box" style="font-size: 12px; padding: 8px 10px; background: rgba(15, 23, 42, 0.95);" onchange="if(this.value) document.getElementById('create_root_folder_id').value = this.value">
                                <option value="">-- Pilih Folder Terdaftar di Drive --</option>
                                <?php foreach ($allFolders as $af): ?>
                                    <?php $val = !empty($af['provider_folder_id']) ? $af['provider_folder_id'] : $af['id']; ?>
                                    <option value="<?= htmlspecialchars($val) ?>">📁 <?= htmlspecialchars($af['name']) ?> (<?= htmlspecialchars(substr($val, 0, 14)) ?>...)</option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                    </div>

                    <button type="submit" id="btn-create-submit" class="btn-submit-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                        <span>Registrasi & Alokasikan Storage</span>
                    </button>
                </form>
            </div>

            <!-- Right: Registered Users Table -->
            <div class="panel-card">
                <div class="table-toolbar">
                    <div>
                        <h2 class="panel-title">Daftar Pengguna & Alokasi Storage</h2>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">Kelola peran, batas kuota, dan pemakaian fisik tiap akun</div>
                    </div>
                    <div class="search-box">
                        <input type="text" id="table-search" class="input-box" placeholder="Cari username..." onkeyup="filterUserTable()">
                        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
                    </div>
                </div>

                <div class="table-responsive">
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
                                    $initial = strtoupper(substr($u['username'], 0, 1));
                                ?>
                                <tr>
                                    <td>
                                        <div class="user-info-cell">
                                            <div class="user-avatar"><?= htmlspecialchars($initial) ?></div>
                                            <div>
                                                <div style="font-weight: 700; color: #fff; font-size: 14px;"><?= htmlspecialchars($u['username']) ?></div>
                                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 1px;"><?= $usage['file_count'] ?> active files</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="role-tag <?= $u['role'] === 'admin' ? 'role-admin' : 'role-client' ?>">
                                            <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
                                            <?= htmlspecialchars($u['role']) ?>
                                        </span>
                                    </td>
                                    <td style="font-weight: 700; color: #fff;">
                                        <?php if ($u['role'] === 'admin'): ?>
                                            <span style="color: #fca5a5; font-size: 11px; font-weight: 700; background: rgba(239, 68, 68, 0.12); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.25);">Full Master Pool</span>
                                        <?php else: ?>
                                            <?= htmlspecialchars($u['storage_limit_gb']) ?> GB
                                        <?php endif; ?>
                                    </td>
                                    <td>
                                        <div style="font-size: 12.5px; font-weight: 600; color: #e2e8f0;">
                                            <?= formatBytes($usage['used_bytes']) ?> <span style="color: var(--text-muted); font-size: 11px;">(<?= $uPercent ?>%)</span>
                                        </div>
                                        <div class="stat-progress-bar" style="height: 5px; width: 110px; margin-top: 5px;">
                                            <div class="stat-progress-fill" style="width: <?= $uPercent ?>%; background: <?= $uPercent > 90 ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #3b82f6, #60a5fa)' ?>;"></div>
                                        </div>
                                    </td>
                                    <td>
                                        <?php if (!empty($u['root_folder_id'])): ?>
                                            <span title="<?= htmlspecialchars($u['root_folder_id']) ?>" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #60a5fa; background: rgba(59,130,246,0.12); padding: 4px 10px; border-radius: 8px; border: 1px solid rgba(59,130,246,0.25); display: inline-flex; align-items: center; gap: 6px;">
                                                📁 <?= htmlspecialchars(strlen($u['root_folder_id']) > 14 ? substr($u['root_folder_id'], 0, 14) . '...' : $u['root_folder_id']) ?>
                                            </span>
                                        <?php else: ?>
                                            <span style="color:#64748b; font-size: 11.5px; display: inline-flex; align-items: center; gap: 5px;">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                                Root Drive Utama
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="text-align: right;">
                                        <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center;">
                                            <button type="button" class="btn-action-edit" onclick="openEditModal(<?= htmlspecialchars(json_encode($u), ENT_QUOTES, 'UTF-8') ?>)">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                                <span>Edit</span>
                                            </button>
                                            <form method="POST" action="/admin/users/delete" style="display:inline;" onsubmit="return confirm('Apakah Anda yakin ingin menghapus akun <?= htmlspecialchars($u['username']) ?>? Kuota storage akan dikembalikan ke Admin Pool.')">
                                                <input type="hidden" name="id" value="<?= $u['id'] ?>">
                                                <button type="submit" class="btn-action-del">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                    <span>Hapus</span>
                                                </button>
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
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" id="edit-modal">
        <div class="modal-box">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <h3 style="margin: 0; font-family: 'Outfit', sans-serif; font-size: 19px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Edit Kuota & Root Folder User
                </h3>
                <button type="button" onclick="closeEditModal()" style="background:none; border:none; color:var(--text-muted); font-size: 24px; cursor:pointer; line-height: 1; transition: color 0.2s;">&times;</button>
            </div>

            <form action="/admin/users/update" method="POST">
                <input type="hidden" id="edit-id" name="id">
                
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" id="edit-username" class="input-box" disabled style="opacity: 0.7; cursor: not-allowed; background: rgba(0,0,0,0.4);">
                </div>

                <div class="form-group">
                    <label for="edit-role" class="form-label">Role Akses</label>
                    <select id="edit-role" name="role" class="input-box" onchange="updateEditCalculator()">
                        <option value="client">Client User</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="edit-storage_limit_gb" class="form-label">
                        <span>Alokasi Storage (GB)</span>
                        <span style="font-size: 11px; color: #34d399; font-weight: 700;">Admin Pool: <?= $availablePoolGb ?> GB</span>
                    </label>
                    <input type="number" step="0.1" id="edit-storage_limit_gb" name="storage_limit_gb" class="input-box" required oninput="updateEditCalculator()">
                    
                    <div id="edit-pool-badge" class="pool-preview-badge pool-badge-ok">
                        <span>⚡ Live Calculator: Sisa Admin Pool menjadi <strong id="edit-calc-rem">-- GB</strong></span>
                    </div>
                </div>

                <div class="folder-picker-box">
                    <label for="edit-root_folder_id" class="form-label" style="color: #60a5fa; margin-bottom: 6px;">
                        <span style="display: flex; align-items: center; gap: 6px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            Target Root Folder ID (Opsional)
                        </span>
                    </label>
                    <input type="text" id="edit-root_folder_id" name="root_folder_id" class="input-box" placeholder="Tempel ID atau Link URL Google Drive (https://drive.google.com/...)" style="margin-bottom: 10px;">
                    
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <span style="font-size: 11px; color: var(--text-muted);">Atau pilih folder terdaftar:</span>
                        <select class="input-box" style="font-size: 12px; padding: 8px 10px; background: rgba(15, 23, 42, 0.95);" onchange="if(this.value) document.getElementById('edit-root_folder_id').value = this.value">
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
                    <button type="submit" id="btn-edit-submit" class="btn-submit-primary" style="width: auto; padding: 10px 22px;">Simpan Perubahan</button>
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
            const modal = document.getElementById('edit-modal');
            modal.classList.add('active');
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
