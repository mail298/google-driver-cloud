<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\admin.php -->
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard — Drive Portal</title>
    <link rel="icon" type="image/png" href="/assets/image/favicon/favicon-clouds.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --bg: #06080f;
            --surface: rgba(13, 18, 32, 0.85);
            --surface-hover: rgba(20, 27, 46, 0.9);
            --border: rgba(255, 255, 255, 0.07);
            --border-accent: rgba(59, 130, 246, 0.3);
            --text: #f1f5f9;
            --muted: #64748b;
            --muted-light: #94a3b8;
            --blue: #3b82f6;
            --blue-glow: rgba(59, 130, 246, 0.2);
            --green: #10b981;
            --green-glow: rgba(16, 185, 129, 0.2);
            --amber: #f59e0b;
            --amber-glow: rgba(245, 158, 11, 0.2);
            --rose: #ef4444;
            --rose-glow: rgba(239, 68, 68, 0.2);
            --purple: #8b5cf6;
            --purple-glow: rgba(139, 92, 246, 0.2);
        }

        html, body {
            background: var(--bg);
            background-image:
                radial-gradient(ellipse at 12% 12%, rgba(59, 130, 246, 0.07) 0%, transparent 50%),
                radial-gradient(ellipse at 88% 88%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
            color: var(--text);
            font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
            min-height: 100vh;
            height: auto;
            overflow-y: auto;
        }

        /* =============== LAYOUT =============== */
        .admin-wrap {
            max-width: 1440px;
            margin: 0 auto;
            padding: 20px 24px 60px;
        }

        /* =============== HEADER =============== */
        .admin-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 22px;
            background: rgba(13, 18, 32, 0.75);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid var(--border);
            border-radius: 20px;
            margin-bottom: 22px;
            position: sticky;
            top: 12px;
            z-index: 100;
            box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }

        .admin-header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            border-radius: 20px 20px 0 0;
            background: linear-gradient(90deg, transparent 5%, rgba(59,130,246,0.5) 40%, rgba(139,92,246,0.5) 60%, transparent 95%);
        }

        .brand-row {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .brand-logo {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(59,130,246,0.4);
            flex-shrink: 0;
        }

        .brand-text-wrap { display: flex; flex-direction: column; gap: 1px; }

        .brand-title {
            font-family: 'Outfit', sans-serif;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: -0.3px;
            color: #fff;
        }

        .brand-subtitle {
            font-size: 11px;
            color: var(--muted);
            font-weight: 500;
        }

        .admin-badge-pill {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(239,68,68,0.12);
            border: 1px solid rgba(239,68,68,0.3);
            color: #fca5a5;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 3px 10px;
            border-radius: 20px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-sm {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            border: none;
            transition: all 0.2s;
            text-decoration: none;
        }

        .btn-sm-ghost {
            background: rgba(255,255,255,0.04);
            border: 1px solid var(--border);
            color: var(--muted-light);
        }

        .btn-sm-ghost:hover {
            background: rgba(255,255,255,0.08);
            color: var(--text);
        }

        .btn-sm-danger {
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.25);
            color: #fca5a5;
        }

        .btn-sm-danger:hover {
            background: rgba(239,68,68,0.2);
        }

        /* =============== STATS GRID =============== */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 22px;
        }

        @media (max-width: 900px) {
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 540px) {
            .stats-grid { grid-template-columns: 1fr; }
        }

        .stat-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 18px;
            padding: 20px 22px;
            position: relative;
            overflow: hidden;
            transition: all 0.22s ease;
        }

        .stat-card::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            border-radius: 18px 18px 0 0;
            background: var(--card-accent-color);
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 28px rgba(0,0,0,0.4);
        }

        .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
        }

        .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-icon {
            width: 32px;
            height: 32px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .stat-value {
            font-family: 'Outfit', sans-serif;
            font-size: 26px;
            font-weight: 800;
            line-height: 1;
            letter-spacing: -1px;
            margin-bottom: 6px;
        }

        .stat-sub {
            font-size: 11.5px;
            color: var(--muted);
        }

        .stat-bar-track {
            height: 4px;
            background: rgba(255,255,255,0.06);
            border-radius: 4px;
            margin-top: 14px;
            overflow: hidden;
        }

        .stat-bar-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.8s ease;
            background: var(--card-accent-color);
        }

        /* =============== MAIN LAYOUT =============== */
        .admin-main {
            display: grid;
            grid-template-columns: 380px 1fr;
            gap: 18px;
            align-items: start;
        }

        @media (max-width: 1100px) {
            .admin-main { grid-template-columns: 1fr; }
        }

        /* Left column stacks multiple cards */
        .left-column { display: flex; flex-direction: column; gap: 18px; }

        /* =============== PANEL CARD =============== */
        .panel-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 22px 24px;
            position: relative;
        }

        .panel-card-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 18px;
        }

        .panel-card-title h2 {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Outfit', sans-serif;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: -0.2px;
            color: var(--text);
        }

        .title-icon {
            width: 30px;
            height: 30px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        /* =============== FORM ELEMENTS =============== */
        .form-group { margin-bottom: 14px; }

        .form-label {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--muted-light);
            text-transform: uppercase;
            letter-spacing: 0.4px;
            margin-bottom: 7px;
        }

        .input-box {
            width: 100%;
            background: rgba(10, 15, 29, 0.8);
            border: 1px solid rgba(255,255,255,0.07);
            border-radius: 11px;
            padding: 11px 14px;
            color: var(--text);
            font-size: 13.5px;
            font-family: inherit;
            outline: none;
            transition: all 0.2s;
        }

        .input-box:focus {
            border-color: var(--blue);
            background: rgba(59,130,246,0.04);
            box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
        }

        .input-box::placeholder { color: #364259; }

        select.input-box {
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 12px center;
            padding-right: 36px;
        }

        /* =============== POOL BADGE =============== */
        .pool-badge {
            padding: 9px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 6px;
        }

        .pool-badge-ok {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: #34d399;
        }

        .pool-badge-warn {
            background: rgba(245, 158, 11, 0.08);
            border: 1px solid rgba(245, 158, 11, 0.2);
            color: #fde68a;
        }

        .pool-badge-error {
            background: rgba(239, 68, 68, 0.08);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #fca5a5;
        }

        /* =============== FOLDER PICKER =============== */
        .folder-picker-box {
            background: rgba(59, 130, 246, 0.04);
            border: 1px solid rgba(59, 130, 246, 0.15);
            border-radius: 14px;
            padding: 14px 16px;
            margin-top: 10px;
            margin-bottom: 14px;
        }

        /* =============== BTN PRIMARY =============== */
        .btn-primary {
            width: 100%;
            padding: 12px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: #fff;
            font-size: 13.5px;
            font-weight: 700;
            font-family: inherit;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 4px 16px rgba(59,130,246,0.35);
            transition: all 0.22s ease;
        }

        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(59,130,246,0.5);
        }

        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-green {
            background: linear-gradient(135deg, #10b981, #059669);
            box-shadow: 0 4px 16px rgba(16,185,129,0.35);
        }

        .btn-green:hover:not(:disabled) {
            box-shadow: 0 8px 24px rgba(16,185,129,0.5);
        }

        .btn-rose {
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.25);
            color: #fca5a5;
            box-shadow: none;
        }

        .btn-rose:hover {
            background: rgba(239,68,68,0.2);
        }

        /* =============== IP WHITELIST =============== */
        .ip-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }

        .ip-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(10, 15, 29, 0.7);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 9px 12px;
        }

        .ip-row-addr {
            font-family: 'JetBrains Mono', monospace;
            font-size: 12.5px;
            color: #93c5fd;
            font-weight: 500;
        }

        .ip-row-badge {
            font-size: 10px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 6px;
        }

        .btn-icon-del {
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.2);
            color: #fca5a5;
            border-radius: 7px;
            width: 26px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.18s;
        }

        .btn-icon-del:hover { background: rgba(239,68,68,0.2); }

        /* =============== SECURITY STATUS CARD =============== */
        .sec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .sec-item {
            background: rgba(10, 15, 29, 0.7);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .sec-item-label {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            color: var(--muted);
        }

        .sec-item-value {
            font-size: 13px;
            font-weight: 700;
            color: var(--text);
        }

        /* =============== ALERTS =============== */
        .alert-box {
            padding: 11px 14px;
            border-radius: 12px;
            margin-bottom: 16px;
            font-size: 13px;
            font-weight: 600;
            display: flex;
            align-items: flex-start;
            gap: 10px;
            line-height: 1.5;
        }

        .alert-box svg { flex-shrink: 0; margin-top: 1px; }

        .alert-success {
            background: rgba(16,185,129,0.08);
            border: 1px solid rgba(16,185,129,0.25);
            color: #34d399;
        }

        .alert-error {
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.25);
            color: #fca5a5;
        }

        .alert-warning {
            background: rgba(245,158,11,0.08);
            border: 1px solid rgba(245,158,11,0.25);
            color: #fde68a;
        }

        /* =============== USERS TABLE =============== */
        .table-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 22px 24px;
            overflow: hidden;
        }

        .table-responsive { overflow-x: auto; }

        .users-table {
            width: 100%;
            border-collapse: collapse;
        }

        .users-table th {
            padding: 10px 14px;
            font-size: 10.5px;
            font-weight: 800;
            color: var(--muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border);
            text-align: left;
            white-space: nowrap;
        }

        .users-table td {
            padding: 14px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            vertical-align: middle;
            white-space: nowrap;
            font-size: 13px;
        }

        .users-table tr:last-child td { border-bottom: none; }

        .users-table tr:hover td {
            background: rgba(255,255,255,0.02);
        }

        .user-cell {
            display: flex;
            align-items: center;
            gap: 11px;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 800;
            flex-shrink: 0;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: #fff;
        }

        .user-name {
            font-weight: 700;
            font-size: 13.5px;
            color: var(--text);
        }

        .user-files {
            font-size: 11px;
            color: var(--muted);
            margin-top: 1px;
        }

        .role-pill {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.4px;
            padding: 3px 9px;
            border-radius: 20px;
        }

        .role-admin {
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.25);
            color: #fca5a5;
        }

        .role-client {
            background: rgba(59,130,246,0.1);
            border: 1px solid rgba(59,130,246,0.25);
            color: #93c5fd;
        }

        .quota-cell { min-width: 140px; }

        .quota-text {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
        }

        .quota-bar {
            height: 5px;
            background: rgba(255,255,255,0.06);
            border-radius: 5px;
            overflow: hidden;
        }

        .quota-bar-fill {
            height: 100%;
            border-radius: 5px;
            transition: width 0.6s ease;
        }

        .action-btns { display: flex; gap: 6px; }

        .btn-edit, .btn-del {
            width: 30px;
            height: 30px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: none;
            transition: all 0.18s;
        }

        .btn-edit {
            background: rgba(59,130,246,0.1);
            border: 1px solid rgba(59,130,246,0.2);
            color: #93c5fd;
        }

        .btn-edit:hover { background: rgba(59,130,246,0.22); }

        .btn-del {
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.2);
            color: #fca5a5;
        }

        .btn-del:hover { background: rgba(239,68,68,0.2); }

        /* =============== MODAL =============== */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.75);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 20px;
        }

        .modal-overlay.active { display: flex; }

        .modal-card {
            background: rgba(13, 18, 32, 0.97);
            border: 1px solid rgba(59,130,246,0.2);
            border-radius: 24px;
            padding: 28px 28px;
            width: 100%;
            max-width: 480px;
            box-shadow: 0 30px 80px rgba(0,0,0,0.8);
            position: relative;
        }

        .modal-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 2px;
            border-radius: 24px 24px 0 0;
            background: linear-gradient(90deg, var(--blue), var(--purple));
        }

        .modal-title {
            font-family: 'Outfit', sans-serif;
            font-size: 17px;
            font-weight: 800;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .modal-close {
            position: absolute;
            top: 18px;
            right: 18px;
            background: rgba(255,255,255,0.06);
            border: 1px solid var(--border);
            color: var(--muted-light);
            border-radius: 8px;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.18s;
        }

        .modal-close:hover { background: rgba(255,255,255,0.12); color: var(--text); }

        .modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px; }

        /* =============== DIVIDERS =============== */
        .section-divider {
            border: none;
            border-top: 1px solid var(--border);
            margin: 16px 0;
        }

        /* =============== SESSION INFO BAR =============== */
        .session-bar {
            background: rgba(10, 15, 29, 0.7);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 10px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11.5px;
            color: var(--muted);
            margin-bottom: 22px;
        }

        .session-bar-left { display: flex; align-items: center; gap: 8px; }

        .session-active-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 6px rgba(16,185,129,0.7);
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* =============== EMPTY STATE =============== */
        .empty-state {
            text-align: center;
            padding: 48px 20px;
            color: var(--muted);
        }

        .empty-state svg { margin-bottom: 12px; opacity: 0.3; }
        .empty-state p { font-size: 13px; }
    </style>
</head>

<body>
<div class="admin-wrap">

    <!-- ===== HEADER ===== -->
    <header class="admin-header">
        <div class="brand-row">
            <div class="brand-logo">
                <img src="/assets/image/logo.png" alt="Logo" class="logo-img" style="height: 24px; width: auto; object-fit: contain;">
            </div>
            <div class="brand-text-wrap">
                <div class="brand-title">Drive Portal</div>
                <div class="brand-subtitle">Master Control Panel</div>
            </div>
            <div class="admin-badge-pill">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Administrator
            </div>
        </div>
        <div class="header-actions">
            <a href="/" class="btn-sm btn-sm-ghost" target="_blank">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
                Lihat Portal
            </a>
            <a href="/logout" class="btn-sm btn-sm-danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Logout
            </a>
        </div>
    </header>

    <!-- ===== SESSION INFO BAR ===== -->
    <div class="session-bar">
        <div class="session-bar-left">
            <div class="session-active-dot"></div>
            <span>Sesi Admin Aktif · Admin: <strong style="color: var(--text)"><?= htmlspecialchars($_SESSION['user']['username'] ?? 'admin') ?></strong></span>
        </div>
        <span id="session-timer" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--muted);">
            <?php
                $timeoutMins = (int) Config::get('SESSION_TIMEOUT_MINUTES', 60);
                if ($timeoutMins > 0):
                    $remaining = SecurityModel::getSessionRemainingSeconds();
                    $rmins = floor($remaining / 60);
                    $rsecs = $remaining % 60;
                    echo "Sesi berakhir dalam {$rmins}m {$rsecs}s";
                else:
                    echo "Sesi tidak ada batas waktu";
                endif;
            ?>
        </span>
    </div>

    <!-- ===== FLASH MESSAGES ===== -->
    <?php if (isset($_GET['success'])): ?>
        <div class="alert-box alert-success" style="margin-bottom: 18px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <?= htmlspecialchars($_GET['success']) ?>
        </div>
    <?php elseif (isset($_GET['error'])): ?>
        <div class="alert-box alert-error" style="margin-bottom: 18px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <?= htmlspecialchars($_GET['error']) ?>
        </div>
    <?php endif; ?>

    <!-- ===== STATS ===== -->
    <?php
        $poolGb = (float)($limitGb ?? 0);
        $allocGb = (float)($totalAllocatedGb ?? 0);
        $availGb = (float)($availablePoolGb ?? 0);
        $totalUsedBytes = (float)($totalUsedBytes ?? 0);
        $usedGb = round($totalUsedBytes / (1024**3), 2);
        $allocPct = $poolGb > 0 ? min(100, round($allocGb / $poolGb * 100)) : 0;
        $usedPct  = $poolGb > 0 ? min(100, round($usedGb / $poolGb * 100)) : 0;
        $userCount = count($users ?? []);
    ?>
    <div class="stats-grid">
        <!-- Stat 1: Master Pool -->
        <div class="stat-card" style="--card-accent-color: linear-gradient(90deg, #3b82f6, #8b5cf6);">
            <div class="stat-header">
                <span class="stat-label">Master Pool</span>
                <div class="stat-icon" style="background: var(--blue-glow);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
                </div>
            </div>
            <div class="stat-value" style="color: #60a5fa;"><?= number_format($poolGb, 0) ?> <span style="font-size: 14px; color: var(--muted);">GB</span></div>
            <div class="stat-sub">Total kapasitas sistem</div>
        </div>

        <!-- Stat 2: Allocated -->
        <div class="stat-card" style="--card-accent-color: linear-gradient(90deg, #f59e0b, #d97706);">
            <div class="stat-header">
                <span class="stat-label">Teralokasi</span>
                <div class="stat-icon" style="background: var(--amber-glow);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
            </div>
            <div class="stat-value" style="color: #fbbf24;"><?= number_format($allocGb, 1) ?> <span style="font-size: 14px; color: var(--muted);">GB</span></div>
            <div class="stat-sub"><?= $allocPct ?>% dari master pool</div>
            <div class="stat-bar-track">
                <div class="stat-bar-fill" style="width: <?= $allocPct ?>%; background: linear-gradient(90deg, #f59e0b, #d97706);"></div>
            </div>
        </div>

        <!-- Stat 3: Available -->
        <div class="stat-card" style="--card-accent-color: linear-gradient(90deg, #10b981, #059669);">
            <div class="stat-header">
                <span class="stat-label">Sisa Pool</span>
                <div class="stat-icon" style="background: var(--green-glow);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
            </div>
            <div class="stat-value" style="color: #34d399;"><?= number_format($availGb, 1) ?> <span style="font-size: 14px; color: var(--muted);">GB</span></div>
            <div class="stat-sub">Tersedia untuk dialokasi</div>
        </div>

        <!-- Stat 4: Actual Usage -->
        <div class="stat-card" style="--card-accent-color: linear-gradient(90deg, #ef4444, #dc2626);">
            <div class="stat-header">
                <span class="stat-label">Terpakai Fisik</span>
                <div class="stat-icon" style="background: var(--rose-glow);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
            </div>
            <div class="stat-value" style="color: #f87171;"><?= number_format($usedGb, 1) ?> <span style="font-size: 14px; color: var(--muted);">GB</span></div>
            <div class="stat-sub"><?= $userCount ?> pengguna terdaftar</div>
            <div class="stat-bar-track">
                <div class="stat-bar-fill" style="width: <?= $usedPct ?>%; background: linear-gradient(90deg, #ef4444, #dc2626);"></div>
            </div>
        </div>
    </div>

    <!-- ===== MAIN GRID ===== -->
    <div class="admin-main">

        <!-- ===== LEFT COLUMN ===== -->
        <div class="left-column">

            <!-- ---- Card: Register User ---- -->
            <div class="panel-card">
                <div class="panel-card-title">
                    <h2>
                        <div class="title-icon" style="background: var(--blue-glow);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                        </div>
                        Registrasi Pengguna Baru
                    </h2>
                    <span style="font-size: 11px; font-weight: 700; color: var(--green); background: var(--green-glow); border: 1px solid rgba(16,185,129,0.25); padding: 3px 9px; border-radius: 20px;">
                        Pool: <?= number_format($availGb, 1) ?> GB tersedia
                    </span>
                </div>

                <form action="/admin/users/create" method="POST" id="form-create">
                    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">

                    <div class="form-group">
                        <label for="cr_username" class="form-label">
                            <span>Username</span>
                            <span style="color: var(--muted); font-size: 10px;">wajib</span>
                        </label>
                        <input type="text" id="cr_username" name="username" class="input-box" placeholder="contoh: client_alpha" required autocomplete="off">
                    </div>

                    <div class="form-group">
                        <label for="cr_password" class="form-label">
                            <span>Password</span>
                            <span style="color: var(--muted); font-size: 10px;">wajib</span>
                        </label>
                        <input type="text" id="cr_password" name="password" class="input-box" placeholder="Password akun" required>
                    </div>

                    <div class="form-group">
                        <label for="cr_role" class="form-label">Role Akses</label>
                        <select id="cr_role" name="role" class="input-box" onchange="updateCreateCalc()">
                            <option value="client" selected>Client User</option>
                            <option value="admin">Administrator</option>
                        </select>
                    </div>

                    <div class="form-group" id="cr-storage-wrap">
                        <label for="cr_storage" class="form-label">
                            <span>Alokasi Storage (GB)</span>
                            <span style="color: var(--green); font-size: 10.5px; font-weight: 700;">Tersedia: <?= number_format($availGb, 1) ?> GB</span>
                        </label>
                        <input type="number" step="0.1" id="cr_storage" name="storage_limit_gb" class="input-box" value="15" min="0.1" required oninput="updateCreateCalc()">
                        <div id="cr-pool-badge" class="pool-badge pool-badge-ok">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                            <span>Sisa Admin Pool menjadi <strong id="cr-calc-rem"><?= max(0, $availGb - 15) ?></strong> GB</span>
                        </div>
                    </div>

                    <div class="folder-picker-box">
                        <label for="cr_folder" class="form-label" style="color: #60a5fa; margin-bottom: 7px; text-transform: none; font-size: 12px;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            Target Root Folder ID (Opsional)
                        </label>
                        <input type="text" id="cr_folder" name="root_folder_id" class="input-box" placeholder="Tempel ID atau URL Google Drive...">
                    </div>

                    <button type="submit" id="btn-create" class="btn-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
                        Registrasi & Alokasikan Storage
                    </button>
                </form>
            </div>

            <!-- ---- Card: IP Whitelist ---- -->
            <div class="panel-card">
                <div class="panel-card-title">
                    <h2>
                        <div class="title-icon" style="background: var(--green-glow);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        </div>
                        Admin IP Whitelist
                    </h2>
                    <?php $wlEnabled = !empty($ipConfig['enabled']); ?>
                    <span style="display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 20px;
                        <?= $wlEnabled ? 'background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #34d399;' : 'background: rgba(148,163,184,0.1); border: 1px solid rgba(148,163,184,0.2); color: #94a3b8;' ?>">
                        <span class="status-dot" style="background: <?= $wlEnabled ? '#10b981' : '#64748b' ?>;"></span>
                        <?= $wlEnabled ? 'AKTIF' : 'NONAKTIF' ?>
                    </span>
                </div>

                <p style="font-size: 12px; color: var(--muted); line-height: 1.65; margin-bottom: 14px;">
                    Batasi akses halaman Admin hanya untuk daftar IP terverifikasi. Jika aktif, IP lain akan mendapat halaman <strong>403 Forbidden</strong>.
                </p>

                <!-- Current IP Widget -->
                <div style="background: rgba(10,15,29,0.8); border: 1px solid rgba(59,130,246,0.2); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px;">
                    <div style="font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase; margin-bottom: 4px;">IP Anda Saat Ini</div>
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                        <div style="font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 700; color: #60a5fa;">
                            <?= htmlspecialchars($clientIp ?? '–') ?>
                        </div>
                        <?php $inList = in_array($clientIp ?? '', $ipConfig['allowed_ips'] ?? [], true); ?>
                        <?php if ($inList): ?>
                            <span style="font-size: 10px; font-weight: 700; color: #34d399; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25); padding: 3px 8px; border-radius: 6px;">✓ Terdaftar</span>
                        <?php else: ?>
                            <form action="/admin/whitelist/update" method="POST" style="margin:0;">
                                <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">
                                <input type="hidden" name="whitelist_action" value="add_current">
                                <button type="submit" style="font-size: 10px; font-weight: 700; color: #fbbf24; background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.25); padding: 4px 10px; border-radius: 6px; cursor: pointer;">+ Tambahkan</button>
                            </form>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- IP List -->
                <div class="ip-list">
                    <?php foreach ($ipConfig['allowed_ips'] ?? [] as $ip): ?>
                        <div class="ip-row">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4e5f74" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                                <span class="ip-row-addr"><?= htmlspecialchars($ip) ?></span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <?php if ($ip === ($clientIp ?? '')): ?>
                                    <span class="ip-row-badge" style="background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.2);">Anda</span>
                                <?php endif; ?>
                                <form action="/admin/whitelist/update" method="POST" style="margin:0;">
                                    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">
                                    <input type="hidden" name="whitelist_action" value="remove">
                                    <input type="hidden" name="ip" value="<?= htmlspecialchars($ip) ?>">
                                    <button type="submit" class="btn-icon-del" onclick="return confirm('Hapus IP <?= htmlspecialchars($ip) ?> dari whitelist?')">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                    <?php if (empty($ipConfig['allowed_ips'])): ?>
                        <div style="font-size: 12px; color: var(--muted); text-align: center; padding: 12px;">Belum ada IP terdaftar.</div>
                    <?php endif; ?>
                </div>

                <!-- Add IP Form -->
                <form action="/admin/whitelist/update" method="POST" style="display: flex; gap: 8px; margin-bottom: 14px;">
                    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">
                    <input type="hidden" name="whitelist_action" value="add">
                    <input type="text" name="ip" class="input-box" placeholder="192.168.x.x atau 10.0.0.0/24" style="flex: 1; font-family: 'JetBrains Mono', monospace; font-size: 12.5px;">
                    <button type="submit" class="btn-primary" style="width: auto; padding: 11px 16px; flex-shrink: 0;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                        Tambah
                    </button>
                </form>

                <hr class="section-divider">

                <!-- Toggle Enable/Disable -->
                <form action="/admin/whitelist/update" method="POST">
                    <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">
                    <input type="hidden" name="whitelist_action" value="toggle">
                    <input type="hidden" name="enabled" value="<?= $wlEnabled ? '0' : '1' ?>">
                    <?php if ($wlEnabled): ?>
                        <button type="submit" class="btn-primary btn-rose" onclick="return confirm('Nonaktifkan proteksi IP Whitelist?')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>
                            Nonaktifkan IP Whitelist
                        </button>
                    <?php else: ?>
                        <button type="submit" class="btn-primary btn-green" onclick="return confirm('Aktifkan proteksi IP Whitelist Admin?')">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            Aktifkan Proteksi IP Whitelist
                        </button>
                    <?php endif; ?>
                </form>
            </div>

            <!-- ---- Card: Security Status ---- -->
            <?php $sec = $securityStatus ?? []; ?>
            <div class="panel-card">
                <div class="panel-card-title">
                    <h2>
                        <div class="title-icon" style="background: var(--purple-glow);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2.5"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </div>
                        Security Configuration
                    </h2>
                </div>

                <div class="sec-grid">
                    <div class="sec-item">
                        <span class="sec-item-label">CSRF Protection</span>
                        <span class="sec-item-value" style="color: <?= ($sec['csrf_enabled'] ?? false) ? '#34d399' : '#f87171' ?>;">
                            <?= ($sec['csrf_enabled'] ?? false) ? '✓ Aktif' : '✗ Nonaktif' ?>
                        </span>
                    </div>
                    <div class="sec-item">
                        <span class="sec-item-label">Session Timeout</span>
                        <span class="sec-item-value" style="color: #93c5fd;">
                            <?= ($sec['session_timeout'] ?? 0) > 0 ? ($sec['session_timeout']).' menit' : 'Nonaktif' ?>
                        </span>
                    </div>
                    <div class="sec-item">
                        <span class="sec-item-label">Login Rate Limit</span>
                        <span class="sec-item-value" style="color: #fbbf24;">
                            <?= $sec['login_max_attempts'] ?? 5 ?>× / <?= $sec['login_lockout_minutes'] ?? 15 ?> mnt
                        </span>
                    </div>
                    <div class="sec-item">
                        <span class="sec-item-label">IP Whitelist</span>
                        <span class="sec-item-value" style="color: <?= ($sec['ip_whitelist_enabled'] ?? false) ? '#34d399' : '#64748b' ?>;">
                            <?= ($sec['ip_whitelist_enabled'] ?? false) ? '✓ Aktif ('.($sec['ip_whitelist_count'] ?? 0).' IP)' : '○ Nonaktif' ?>
                        </span>
                    </div>
                    <div class="sec-item">
                        <span class="sec-item-label">Force HTTPS</span>
                        <span class="sec-item-value" style="color: <?= ($sec['force_https'] ?? false) ? '#34d399' : '#64748b' ?>;">
                            <?= ($sec['force_https'] ?? false) ? '✓ Aktif' : '○ Nonaktif' ?>
                        </span>
                    </div>
                    <div class="sec-item">
                        <span class="sec-item-label">Security Headers</span>
                        <span class="sec-item-value" style="color: #34d399;">✓ Aktif</span>
                    </div>
                </div>

                <p style="font-size: 11px; color: var(--muted); margin-top: 12px; line-height: 1.5;">
                    Konfigurasi keamanan diatur melalui file <code style="font-family: 'JetBrains Mono'; color: #60a5fa; background: rgba(59,130,246,0.1); padding: 1px 5px; border-radius: 4px;">.env</code>. Restart server PHP setelah mengubah nilai .env.
                </p>
            </div>

            <!-- ---- Card: System Backup & Restore ---- -->
            <div class="panel-card" style="margin-top: 20px;">
                <div class="panel-card-title">
                    <h2>
                        <div class="title-icon" style="background: var(--blue-glow);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        </div>
                        Backup & Restore System
                    </h2>
                </div>
                <p style="font-size: 12.5px; color: var(--muted-light); margin-bottom: 14px; line-height: 1.5;">
                    Unduh file cadangan database MySQL dan konfigurasi akun sistem dalam format ZIP, atau pulihkan data sistem dari file backup.
                </p>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <a href="/admin/backup/export" class="btn-primary btn-green" style="text-decoration: none; justify-content: center;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                        Unduh Backup System (.ZIP)
                    </a>
                    
                    <hr class="section-divider" style="margin: 4px 0;">

                    <form action="/admin/backup/restore" method="POST" enctype="multipart/form-data" onsubmit="return confirm('APAKAH ANDA YAKIN? Memulihkan data akan menimpa database dan konfigurasi pengguna saat ini!')">
                        <label class="form-label" style="margin-bottom: 6px;">Pulihkan Data (Restore ZIP)</label>
                        <div style="display: flex; gap: 8px;">
                            <input type="file" name="backup_zip" accept=".zip" required class="input-box" style="padding: 7px 10px; font-size: 12px; flex: 1;">
                            <button type="submit" class="btn-primary btn-rose" style="width: auto; padding: 0 16px;">Restore</button>
                        </div>
                    </form>
                </div>
            </div>

        </div><!-- end left-column -->

        <!-- ===== RIGHT COLUMN: USER TABLE ===== -->
        <div class="table-card">
            <div class="panel-card-title">
                <h2>
                    <div class="title-icon" style="background: rgba(59,130,246,0.12);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    Daftar Pengguna & Alokasi Storage
                </h2>
                <span style="font-size: 12px; font-weight: 700; color: var(--muted);">
                    <?= count($users ?? []) ?> akun terdaftar
                </span>
            </div>

            <?php if (empty($users)): ?>
                <div class="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    <p>Belum ada pengguna terdaftar.</p>
                </div>
            <?php else: ?>
                <div class="table-responsive">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Pengguna</th>
                                <th>Role</th>
                                <th>Target Root Folder</th>
                                <th>Kuota Alokasi</th>
                                <th>Pemakaian Fisik</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($users as $u):
                                $uid = $u['id'];
                                $initial = mb_strtoupper(mb_substr($u['username'], 0, 2));
                                $usage = $userUsageMap[$uid] ?? ['used_bytes' => 0, 'file_count' => 0];
                                $usedBytes = (float)$usage['used_bytes'];
                                $limitBytes = (float)$u['storage_limit_gb'] * 1024 ** 3;
                                $pct = $limitBytes > 0 ? min(100, round($usedBytes / $limitBytes * 100)) : 0;
                                $usedFmt = $usedBytes < 1024**3 ? round($usedBytes/(1024**2), 1).' MB' : round($usedBytes/(1024**3), 2).' GB';
                                $barColor = $pct >= 90 ? '#ef4444' : ($pct >= 70 ? '#f59e0b' : '#10b981');
                                $rfId = trim($u['root_folder_id'] ?? '');
                            ?>
                            <tr>
                                <td>
                                    <div class="user-cell">
                                        <div class="user-avatar"><?= htmlspecialchars($initial) ?></div>
                                        <div>
                                            <div class="user-name"><?= htmlspecialchars($u['username']) ?></div>
                                            <div class="user-files"><?= $usage['file_count'] ?> file aktif</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <?php if ($u['role'] === 'admin'): ?>
                                        <span class="role-pill role-admin">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                            Admin
                                        </span>
                                        <div style="font-size: 10px; color: #ef4444; margin-top: 4px; white-space: nowrap;">Full Master Pool</div>
                                    <?php else: ?>
                                        <span class="role-pill role-client">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                            Client
                                        </span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?php if (!empty($rfId)): ?>
                                        <div style="display: inline-flex; align-items: center; gap: 6px; color: #60a5fa; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.25); padding: 4px 10px; border-radius: 8px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600;" title="Target Root Folder ID: <?= htmlspecialchars($rfId) ?>">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                            <span><?= htmlspecialchars(mb_strimwidth($rfId, 0, 20, '...')) ?></span>
                                        </div>
                                    <?php else: ?>
                                        <span style="color: var(--muted); font-size: 11.5px; font-style: italic;">📁 Utama (Main Root)</span>
                                    <?php endif; ?>
                                </td>
                                <td>
                                    <?= number_format((float)$u['storage_limit_gb'], 1) ?> GB
                                </td>
                                <td class="quota-cell">
                                    <div class="quota-text">
                                        <span><?= $usedFmt ?></span>
                                        <span style="color: <?= $barColor ?>;"><?= $pct ?>%</span>
                                    </div>
                                    <div class="quota-bar">
                                        <div class="quota-bar-fill" style="width: <?= $pct ?>%; background: <?= $barColor ?>;"></div>
                                    </div>
                                </td>
                                <td>
                                    <div class="action-btns">
                                        <button class="btn-edit" title="Edit Pengguna" onclick="openEditModal(
                                            '<?= htmlspecialchars($uid) ?>',
                                            '<?= htmlspecialchars($u['username']) ?>',
                                            '<?= htmlspecialchars($u['role']) ?>',
                                            '<?= htmlspecialchars((string)$u['storage_limit_gb']) ?>',
                                            '<?= htmlspecialchars($u['root_folder_id'] ?? '') ?>'
                                        )">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                        </button>
                                        <form action="/admin/users/delete" method="POST" style="margin:0;" onsubmit="return confirm('Hapus akun <?= htmlspecialchars($u['username']) ?>? Tindakan ini tidak dapat dibatalkan.')">
                                            <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">
                                            <input type="hidden" name="user_id" value="<?= htmlspecialchars($uid) ?>">
                                            <button type="submit" class="btn-del" title="Hapus Pengguna">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php endif; ?>
        </div><!-- end table-card -->
    </div><!-- end admin-main -->
</div><!-- end admin-wrap -->

<!-- ===== EDIT USER MODAL ===== -->
<div class="modal-overlay" id="edit-modal">
    <div class="modal-card">
        <button class="modal-close" onclick="closeEditModal()">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
        </button>
        <div class="modal-title">
            <div class="title-icon" style="background: var(--blue-glow); width:32px; height:32px; border-radius: 9px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            Edit Pengguna
        </div>

        <form action="/admin/users/update" method="POST" id="form-edit">
            <input type="hidden" name="_csrf_token" value="<?= htmlspecialchars($csrfToken ?? '') ?>">
            <input type="hidden" name="user_id" id="edit_user_id">

            <div class="form-group">
                <label for="edit_username" class="form-label">Username</label>
                <input type="text" id="edit_username" name="username" class="input-box" required>
            </div>

            <div class="form-group">
                <label for="edit_password" class="form-label">
                    <span>Password Baru</span>
                    <span style="color: var(--muted); font-size: 10px;">kosongkan jika tidak diubah</span>
                </label>
                <input type="text" id="edit_password" name="password" class="input-box" placeholder="(tidak berubah)">
            </div>

            <div class="form-group">
                <label for="edit_role" class="form-label">Role Akses</label>
                <select id="edit_role" name="role" class="input-box" onchange="updateEditCalc()">
                    <option value="client">Client User</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>

            <div class="form-group" id="edit-storage-wrap">
                <label for="edit_storage" class="form-label">
                    <span>Alokasi Storage (GB)</span>
                    <span style="color: var(--green); font-size: 10px;">Pool tersedia: <?= number_format($availGb, 1) ?> GB</span>
                </label>
                <input type="number" step="0.1" id="edit_storage" name="storage_limit_gb" class="input-box" oninput="updateEditCalc()">
                <div id="edit-pool-badge" class="pool-badge pool-badge-ok" style="margin-top: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                    Sisa Pool: <strong id="edit-calc-rem">–</strong> GB
                </div>
            </div>

            <div class="folder-picker-box">
                <label for="edit_folder" class="form-label" style="color: #60a5fa; text-transform: none; font-size: 12px; margin-bottom: 7px;">
                    Root Folder ID
                </label>
                <input type="text" id="edit_folder" name="root_folder_id" class="input-box" placeholder="(opsional)">
            </div>

            <div class="modal-actions">
                <button type="button" class="btn-primary btn-rose" onclick="closeEditModal()">Batal</button>
                <button type="submit" class="btn-primary">Simpan Perubahan</button>
            </div>
        </form>
    </div>
</div>

<script>
    // ====== Storage Variables ======
    const AVAIL_GB = <?= (float)($availablePoolGb ?? 0) ?>;
    const MASTER_GB = <?= (float)($limitGb ?? 0) ?>;
    const ALLOC_GB = <?= (float)($totalAllocatedGb ?? 0) ?>;

    function fmtGb(val) {
        return parseFloat(val).toFixed(1);
    }

    // ====== Create Calculator ======
    function updateCreateCalc() {
        const role = document.getElementById('cr_role').value;
        const storageWrap = document.getElementById('cr-storage-wrap');
        const badge = document.getElementById('cr-pool-badge');
        const remEl = document.getElementById('cr-calc-rem');
        const btn = document.getElementById('btn-create');

        if (role === 'admin') {
            storageWrap.style.display = 'none';
            return;
        }
        storageWrap.style.display = '';

        const val = parseFloat(document.getElementById('cr_storage').value) || 0;
        const newRem = AVAIL_GB - val;
        remEl.textContent = fmtGb(newRem);

        if (newRem < 0) {
            badge.className = 'pool-badge pool-badge-error';
            btn.disabled = true;
        } else if (newRem < 10) {
            badge.className = 'pool-badge pool-badge-warn';
            btn.disabled = false;
        } else {
            badge.className = 'pool-badge pool-badge-ok';
            btn.disabled = false;
        }
    }

    updateCreateCalc();

    // ====== Edit Modal ======
    let editOriginalStorage = 0;

    function openEditModal(id, username, role, storage, folder) {
        document.getElementById('edit_user_id').value = id;
        document.getElementById('edit_username').value = username;
        document.getElementById('edit_password').value = '';
        document.getElementById('edit_storage').value = storage;
        document.getElementById('edit_folder').value = folder;

        const roleSelect = document.getElementById('edit_role');
        for (const opt of roleSelect.options) {
            opt.selected = opt.value === role;
        }

        editOriginalStorage = parseFloat(storage) || 0;
        updateEditCalc();
        document.getElementById('edit-modal').classList.add('active');
    }

    function closeEditModal() {
        document.getElementById('edit-modal').classList.remove('active');
    }

    function updateEditCalc() {
        const role = document.getElementById('edit_role').value;
        const storageWrap = document.getElementById('edit-storage-wrap');
        const badge = document.getElementById('edit-pool-badge');
        const remEl = document.getElementById('edit-calc-rem');

        if (role === 'admin') {
            storageWrap.style.display = 'none';
            return;
        }
        storageWrap.style.display = '';

        const val = parseFloat(document.getElementById('edit_storage').value) || 0;
        const delta = val - editOriginalStorage;
        const newRem = AVAIL_GB - delta;
        remEl.textContent = fmtGb(newRem);

        if (newRem < 0) {
            badge.className = 'pool-badge pool-badge-error';
        } else if (newRem < 10) {
            badge.className = 'pool-badge pool-badge-warn';
        } else {
            badge.className = 'pool-badge pool-badge-ok';
        }
    }

    // Close modal on backdrop click
    document.getElementById('edit-modal').addEventListener('click', function(e) {
        if (e.target === this) closeEditModal();
    });

    // ====== Session Countdown Timer ======
    <?php
        $timeoutMins = (int) Config::get('SESSION_TIMEOUT_MINUTES', 60);
        if ($timeoutMins > 0):
    ?>
    (function() {
        const timerEl = document.getElementById('session-timer');
        let remaining = <?= SecurityModel::getSessionRemainingSeconds() ?>;

        setInterval(function() {
            if (remaining <= 0) {
                timerEl.textContent = 'Sesi habis...';
                timerEl.style.color = '#ef4444';
                return;
            }
            remaining--;
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            timerEl.textContent = `Sesi berakhir dalam ${m}m ${s.toString().padStart(2,'0')}s`;
            if (remaining < 120) {
                timerEl.style.color = '#ef4444';
            } else if (remaining < 300) {
                timerEl.style.color = '#f59e0b';
            }
        }, 1000);
    })();
    <?php endif; ?>
</script>
</body>
</html>