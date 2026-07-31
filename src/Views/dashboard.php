<!DOCTYPE html>
<!-- C:\Users\ADMIN\Desktop\framework\google-drive\cliend\src\Views\dashboard.php -->
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Drive Portal - Client Storage Dashboard</title>
    <link rel="icon" type="image/png" href="/assets/image/favicon/favicon-clouds.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
        rel="stylesheet">
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
        }

        @keyframes spinRing {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        /* Modern Item Card Styling (Matching Frontend Design) */
        .items-grid-modern {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 16px;
        }

        .item-card-modern {
            background: rgba(15, 23, 42, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: all 0.22s ease;
            cursor: pointer;
            position: relative;
            user-select: none;
            overflow: hidden;
        }

        .item-card-modern:hover {
            transform: translateY(-3px);
            border-color: rgba(59, 130, 246, 0.4);
            background: rgba(30, 41, 59, 0.85);
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
        }

        .card-header-modern {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 10px;
        }

        .card-header-left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            flex: 1;
        }

        .card-icon-badge {
            width: 26px;
            height: 26px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 11px;
            font-weight: 800;
        }

        .badge-image {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .badge-video {
            background: rgba(168, 85, 247, 0.2);
            color: #c084fc;
            border: 1px solid rgba(168, 85, 247, 0.3);
        }

        .badge-audio {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .badge-doc {
            background: rgba(59, 130, 246, 0.2);
            color: #60a5fa;
            border: 1px solid rgba(59, 130, 246, 0.3);
        }

        .badge-folder {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .card-title-modern {
            font-size: 13px;
            font-weight: 700;
            color: #f8fafc;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .btn-more-dots {
            background: transparent;
            border: none;
            color: #94a3b8;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
            flex-shrink: 0;
        }

        .btn-more-dots:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
        }

        .card-thumb-box {
            aspect-ratio: 4/3;
            width: 100%;
            border-radius: 12px;
            overflow: hidden;
            background: rgba(0, 0, 0, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .card-thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .item-card-modern:hover .card-thumb-img {
            transform: scale(1.05);
        }

        .card-footer-modern {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11px;
            color: #94a3b8;
            gap: 6px;
        }

        .card-location {
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-weight: 600;
            color: #cbd5e1;
        }

        /* View Mode Toggle Buttons */
        .view-mode-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .view-mode-toggle {
            display: flex;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--card-border);
            border-radius: 10px;
            padding: 3px;
            gap: 2px;
        }

        .btn-view-mode {
            background: transparent;
            border: none;
            color: #94a3b8;
            padding: 6px 10px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .btn-view-mode.active {
            background: rgba(59, 130, 246, 0.25);
            color: #60a5fa;
            font-weight: 700;
        }

        /* List View Table Styling */
        .portal-table-container {
            width: 100%;
            overflow-x: auto;
            background: rgba(15, 23, 42, 0.75);
            border: 1px solid var(--card-border);
            border-radius: 16px;
        }

        .portal-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .portal-table th {
            padding: 14px 16px;
            font-size: 11.5px;
            font-weight: 700;
            color: #94a3b8;
            border-bottom: 1px solid var(--card-border);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .portal-table td {
            padding: 12px 16px;
            font-size: 13px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            color: #f8fafc;
            vertical-align: middle;
        }

        /* Toast Notification */
        .portal-toast {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 10000;
            opacity: 0;
            transform: translateY(16px);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
        }
        .portal-toast.show {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }
        .toast-content {
            background: #0f172a;
            border: 1px solid rgba(59, 130, 246, 0.4);
            color: #fff;
            padding: 12px 20px;
            border-radius: 14px;
            box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13.5px;
            font-weight: 600;
        }
        .toast-content.success {
            border-color: rgba(16, 185, 129, 0.5);
            color: #6ee7b7;
        }

        .portal-table tr:hover td {
            background: rgba(255, 255, 255, 0.03);
        }

        /* Context Menu Dropdown Popup */
        .context-menu-popup {
            position: fixed;
            z-index: 9999;
            width: 240px;
            background: #0b1120;
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 18px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(20px);
            display: none;
            padding: 8px;
        }

        .context-menu-popup.active {
            display: block;
            animation: fadeIn 0.15s ease;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: scale(0.96);
            }

            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        /* Bulk Action Bar Styling */
        .bulk-action-bar {
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            z-index: 9990;
            background: rgba(15, 23, 42, 0.94);
            border: 1px solid rgba(59, 130, 246, 0.4);
            border-radius: 18px;
            padding: 10px 18px;
            box-shadow: 0 16px 40px rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            max-width: calc(100vw - 32px);
            width: auto;
            white-space: nowrap;
        }

        .bulk-action-bar.active {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
            pointer-events: auto;
        }

        .bulk-info {
            display: flex;
            align-items: center;
            flex-shrink: 0;
        }

        .bulk-count-badge {
            font-size: 13px;
            font-weight: 700;
            color: #60a5fa;
            background: rgba(59, 130, 246, 0.15);
            padding: 6px 12px;
            border-radius: 10px;
            border: 1px solid rgba(59, 130, 246, 0.3);
            white-space: nowrap;
            display: inline-block;
            flex-shrink: 0;
        }

        .bulk-buttons {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-shrink: 0;
        }

        .btn-bulk-delete {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: #ffffff;
            border: none;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            white-space: nowrap;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .btn-bulk-delete:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(239, 68, 68, 0.5);
        }

        .btn-bulk-cancel {
            background: rgba(255, 255, 255, 0.08);
            color: #cbd5e1;
            border: 1px solid rgba(255, 255, 255, 0.15);
            padding: 8px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
            flex-shrink: 0;
        }

        .btn-bulk-cancel:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }

        .cm-header {
            padding: 10px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 12px;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid rgba(255, 255, 255, 0.04);
        }

        .cm-header-badge {
            padding: 5px 7px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 900;
            color: #fff;
            letter-spacing: 0.5px;
            flex-shrink: 0;
        }

        .cm-header-title {
            font-size: 12.5px;
            font-weight: 800;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .cm-header-sub {
            font-size: 10.5px;
            color: #94a3b8;
            display: flex;
            gap: 6px;
            margin-top: 2px;
        }

        .cm-item {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 12px;
            background: none;
            border: none;
            color: #e2e8f0;
            font-size: 13px;
            font-weight: 600;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.15s ease;
            text-align: left;
        }

        .cm-item:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #fff;
        }

        .cm-item.cm-danger {
            color: #f87171;
        }

        .cm-item.cm-danger:hover {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .cm-divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin: 6px 0;
        }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }

        .drop-zone-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(59, 130, 246, 0.2);
            backdrop-filter: blur(8px);
            border: 3px dashed var(--accent-primary);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            pointer-events: none;
        }

        .drop-zone-overlay.active {
            display: flex;
        }

        .drop-zone-box {
            background: rgba(15, 23, 42, 0.9);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        .drop-zone-box svg {
            color: var(--accent-primary);
            margin-bottom: 16px;
            animation: bounce 1s infinite alternate;
        }

        @keyframes bounce {
            from {
                transform: translateY(0);
            }

            to {
                transform: translateY(-10px);
            }
        }

        /* Sidebar Quota Badge */
        .sidebar-quota-header {
            margin-bottom: 16px;
            padding: 12px 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--card-border);
            border-radius: 12px;
        }

        .sidebar-quota-header .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
            font-weight: 700;
        }

        .sidebar-quota-header .value {
            font-family: 'Outfit', sans-serif;
            font-size: 18px;
            font-weight: 800;
            color: #fff;
            margin-top: 4px;
        }

        /* File Card Colors */
        .file-card-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
        }

        .icon-image {
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
        }

        .icon-video {
            background: rgba(245, 158, 11, 0.15);
            color: #fbbf24;
        }

        .icon-audio {
            background: rgba(139, 92, 246, 0.15);
            color: #c084fc;
        }

        .icon-doc {
            background: rgba(59, 130, 246, 0.15);
            color: #60a5fa;
        }

        .icon-archive {
            background: rgba(6, 182, 212, 0.15);
            color: #22d3ee;
        }

        .icon-folder {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }

        .item-card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 16px;
            backdrop-filter: blur(12px);
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .item-card:hover {
            transform: translateY(-2px);
            border-color: rgba(255, 255, 255, 0.18);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            background: rgba(15, 23, 42, 0.85);
        }

        .item-card .item-name {
            font-size: 13.5px;
            font-weight: 700;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }

        .item-card .item-meta {
            font-size: 11.5px;
            color: var(--text-muted);
        }

        .quota-alert-box {
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.25);
            border-radius: 12px;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 13px;
            color: #fde68a;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        /* Mobile & Tablet Responsive Strict Rules */
        @media (max-width: 900px) {

            html,
            body {
                width: 100% !important;
                max-width: 100% !important;
                overflow-x: hidden !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .app-layout {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .main-content {
                width: 100% !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                margin: 0 !important;
                padding: 0 !important;
            }

            .mobile-nav-bar {
                display: flex !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            .app-header {
                width: 100% !important;
                padding: 14px 16px !important;
                box-sizing: border-box !important;
            }

            .view-area {
                width: 100% !important;
                padding: 14px 16px !important;
                box-sizing: border-box !important;
            }

            .drag-drop-tip {
                display: none !important;
            }

            .items-grid {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 12px !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            .item-card {
                width: 100% !important;
                box-sizing: border-box !important;
            }
        }

        /* Mobile Upload Queue - Bottom Sheet Style */
        @media (max-width: 640px) {
            #upload-queue-modal.modal-overlay {
                align-items: flex-end;
                background: rgba(0,0,0,0.5);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
            }
            #upload-queue-modal .modal-card {
                max-width: 100% !important;
                width: 100% !important;
                max-height: 85vh !important;
                border-radius: 20px 20px 0 0 !important;
                padding: 16px !important;
                transform: translateY(0);
                margin-top: auto;
            }
            .upload-queue-item {
                padding: 10px 6px !important;
                gap: 10px !important;
            }
            .upload-queue-item .queue-thumb {
                width: 36px;
                height: 36px;
                border-radius: 8px;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(255,255,255,0.04);
                overflow: hidden;
            }
            .upload-queue-item .queue-thumb img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .upload-queue-item input[type="checkbox"] {
                width: 20px !important;
                height: 20px !important;
            }
            .upload-queue-item .queue-item-name {
                font-size: 13px;
                font-weight: 600;
                color: #fff;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .upload-queue-item .queue-item-size {
                font-size: 11px;
                color: #64748b;
            }
            .upload-queue-toolbar {
                gap: 6px !important;
            }
            .upload-queue-toolbar button {
                font-size: 11px !important;
                padding: 6px 10px !important;
            }
        }
    </style>
</head>

<body>
    <?php
    function formatBytes($bytes, $precision = 2)
    {
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

    $clientUsername = htmlspecialchars($currentUser['username'] ?? 'Client');
    ?>

    <div class="orb-wrapper"
        style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; overflow: hidden; pointer-events: none; z-index: 0;">
        <div class="glow-orb orb-1"></div>
        <div class="glow-orb orb-2"></div>
    </div>

    <!-- Drag & Drop Overlay -->
    <div class="drop-zone-overlay" id="drag-overlay">
        <div class="drop-zone-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <h2 style="margin: 0 0 8px 0; color: #fff; font-size: 18px;">Lepaskan Berkas di Sini</h2>
            <p style="margin: 0; color: var(--text-muted); font-size: 13px;">File akan diunggah otomatis ke folder aktif
                Anda</p>
        </div>
    </div>

    <!-- Mobile Top Navigation Header -->
    <div class="mobile-nav-bar">
        <button class="btn-mobile-toggle" onclick="toggleMobileSidebar()" aria-label="Open Sidebar Menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
        </button>
        <div class="mobile-brand-title">Drive Portal</div>
        <button class="btn-mobile-upload" onclick="triggerFileInput()" aria-label="Upload File">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
        </button>
    </div>

    <!-- Sidebar Backdrop for Mobile -->
    <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="closeMobileSidebar()"></div>

    <div class="app-layout">
        <!-- Sidebar -->
        <aside class="app-sidebar">
            <div>
                <a href="/" class="sidebar-logo">
                    <img src="/assets/image/logo.png" alt="Logo" class="logo-img" style="height: 28px; width: auto; object-fit: contain; margin-right: 4px;">
                    <h1>Drive Portal</h1>
                </a>

                <ul class="sidebar-menu">
                    <li class="sidebar-menu-item">
                        <a href="/" class="sidebar-menu-link active">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2">
                                <path
                                    d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
                            </svg>
                            <span>Semua Berkas</span>
                        </a>
                    </li>
                    <?php if (($currentUser['role'] ?? 'client') === 'admin'): ?>
                        <li class="sidebar-menu-item">
                            <a href="/admin" class="sidebar-menu-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path
                                        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                                <span>Admin Control</span>
                            </a>
                        </li>
                    <?php endif; ?>
                    <li class="sidebar-menu-item">
                        <a href="javascript:void(0)" onclick="openSettingsModal()" class="sidebar-menu-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path
                                    d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>Pengaturan Akun</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="javascript:void(0)" onclick="openOnboardingModalManually()" class="sidebar-menu-link" style="color: #fbbf24;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                            <span>Panduan Fitur</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item">
                        <a href="/client/backup/csv" class="sidebar-menu-link" style="color: #60a5fa;" title="Unduh laporan inventaris seluruh berkas dalam format CSV">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                            </svg>
                            <span>Laporan Berkas (CSV)</span>
                        </a>
                    </li>
                    <!--
                    <li class="sidebar-menu-item">
                        <a href="/client/backup/zip" class="sidebar-menu-link" style="color: #34d399;" title="Unduh seluruh berkas aktif milik Anda sebagai arsip ZIP">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y1="3"/>
                            </svg>
                            <span>Unduh Semua (ZIP)</span>
                        </a>
                    </li>
                    -->
                </ul>
            </div>

            <!-- Detailed Storage Section -->
            <div class="sidebar-storage-breakdown">
                <div class="sidebar-quota-header">
                    <div class="label">Batas Kuota Storage Anda</div>
                    <div class="value"><?= $limitGb ?> GB</div>
                </div>

                <div class="storage-item">
                    <span class="storage-label"><span class="storage-dot"
                            style="background: #10b981;"></span>Foto</span>
                    <span class="storage-val"><?= formatBytes($photoSize) ?></span>
                </div>
                <div class="storage-item">
                    <span class="storage-label"><span class="storage-dot"
                            style="background: #f59e0b;"></span>Video</span>
                    <span class="storage-val"><?= formatBytes($videoSize) ?></span>
                </div>
                <div class="storage-item">
                    <span class="storage-label"><span class="storage-dot"
                            style="background: #3b82f6;"></span>Dokumen</span>
                    <span class="storage-val"><?= formatBytes($documentSize) ?></span>
                </div>
                <?php $freeBytes = max(0, ($limitGb * 1024 * 1024 * 1024) - $totalUsedBytes); ?>
                <div class="storage-item">
                    <span class="storage-label"><span class="storage-dot" style="background: #a78bfa;"></span>Sisa
                        Kuota</span>
                    <span class="storage-val"><?= formatBytes($freeBytes) ?></span>
                </div>

                <div class="storage-progress-section">
                    <div class="storage-progress-text">
                        <?= formatBytes($totalUsedBytes) ?> terpakai dari <?= $limitGb ?> GB
                    </div>
                    <div class="storage-bar-bg">
                        <?php
                        $barColor = '#3b82f6';
                        if ($storagePercent > 95)
                            $barColor = '#ef4444';
                        elseif ($storagePercent > 80)
                            $barColor = '#f59e0b';
                        ?>
                        <div class="storage-bar-fill"
                            style="width: <?= $storagePercent ?>%; background: <?= $barColor ?>;"></div>
                    </div>
                </div>
            </div>

            <!-- Security Session Widget -->
            <?php
                $sesTimeout = (int) Config::get('SESSION_TIMEOUT_MINUTES', 60);
                $sesRemaining = SecurityModel::getSessionRemainingSeconds();
                $sesMins = floor($sesRemaining / 60);
                $sesSecs = $sesRemaining % 60;
            ?>
            <div style="margin-top: 16px; padding: 12px 14px; background: rgba(10,15,29,0.7); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px;">
                <div style="display: flex; align-items: center; gap: 7px; margin-bottom: 8px;">
                    <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; box-shadow: 0 0 6px rgba(16,185,129,0.7); animation: sessPulse 2s infinite; flex-shrink:0;"></span>
                    <span style="font-size: 10.5px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.4px;">Sesi Aktif</span>
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #94a3b8;"><?= htmlspecialchars($currentUser['username'] ?? '–') ?></div>
                <?php if ($sesTimeout > 0): ?>
                    <div id="dash-session-timer" style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b; margin-top: 4px;">
                        Berakhir dalam <?= $sesMins ?>m <?= str_pad($sesSecs, 2, '0', STR_PAD_LEFT) ?>s
                    </div>
                    <script>
                    (function(){
                        var el = document.getElementById('dash-session-timer');
                        var rem = <?= $sesRemaining ?>;
                        setInterval(function() {
                            if (rem <= 0) { el.textContent = 'Sesi habis'; el.style.color='#ef4444'; return; }
                            rem--;
                            var m = Math.floor(rem/60), s = rem%60;
                            el.textContent = 'Berakhir dalam ' + m + 'm ' + String(s).padStart(2,'0') + 's';
                            if (rem < 120) el.style.color = '#ef4444';
                            else if (rem < 300) el.style.color = '#f59e0b';
                        }, 1000);
                    })();
                    </script>
                <?php else: ?>
                    <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Tidak ada batas waktu</div>
                <?php endif; ?>
            </div>
            <style>@keyframes sessPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }</style>
        </aside>

        <!-- Right Content Area -->
        <main class="main-content">

            <!-- Quota Alert Banner -->
            <?php if ($storagePercent >= 85): ?>
            <div style="display: flex; align-items: center; gap: 10px; padding: 11px 16px; margin-bottom: 14px; border-radius: 14px;
                <?= $storagePercent >= 95 ? 'background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #fca5a5;' : 'background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); color: #fde68a;' ?>;
                font-size: 13px; font-weight: 600;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="flex-shrink:0;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                <span><?= $storagePercent >= 95 ? '⚠️ Kuota hampir penuh!' : '📊 Storage hampir penuh' ?> — <?= $storagePercent ?>% terpakai (<?= formatBytes($totalUsedBytes) ?> / <?= $limitGb ?> GB). Segera hubungi administrator.</span>
            </div>
            <?php endif; ?>

            <!-- Top Header Search -->
            <div class="app-header">
                <form action="/" method="GET" class="search-container">
                    <?php if (!empty($folderId)): ?>
                        <input type="hidden" name="folderId" value="<?= htmlspecialchars($folderId) ?>">
                    <?php endif; ?>
                    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <input type="text" name="q" class="search-input" placeholder="Cari dokumen, foto, atau video..."
                        value="<?= htmlspecialchars($searchQuery ?? '') ?>" autocomplete="off">
                </form>
                <div class="user-area">
                    <span class="user-profile-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        <span><?= $clientUsername ?></span>
                    </span>
                    <a href="/logout" class="btn-logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" x2="9" y1="12" y2="12" />
                        </svg>
                        <span>Sign Out</span>
                    </a>
                </div>
            </div>

            <!-- View Area -->
            <div class="view-area">
                <?php if (isset($_GET['settings_success'])): ?>
                    <div class="quota-alert-box"
                        style="background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.3); color: #6ee7b7;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span><?= htmlspecialchars($_GET['settings_success']) ?></span>
                    </div>
                <?php endif; ?>

                <?php if (isset($_GET['settings_error'])): ?>
                    <div class="quota-alert-box"
                        style="background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        <span><?= htmlspecialchars($_GET['settings_error']) ?></span>
                    </div>
                <?php endif; ?>

                <?php if ($storagePercent >= 80): ?>
                    <div class="quota-alert-box">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        <span>Peringatan: Pemakaian storage Anda telah mencapai <strong><?= $storagePercent ?>%</strong>
                            dari total kuota <?= $limitGb ?> GB.</span>
                    </div>
                <?php endif; ?>

                <!-- Action Tab Header -->
                <div class="view-actions-header">
                    <div class="tab-buttons">
                        <button class="btn-tab" onclick="triggerFileInput()"
                            style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; font-weight: 700; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" x2="12" y1="3" y2="15" />
                            </svg>
                            <span>Unggah File</span>
                        </button>
                        <button class="btn-tab" onclick="openNewFolderModal()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2">
                                <path
                                    d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                            </svg>
                            <span>Folder Baru</span>
                        </button>
                    </div>

                    <div class="drag-drop-tip">
                        <span>💡 Petunjuk: Anda juga bisa <strong>drag & drop</strong> file langsung ke layar</span>
                    </div>
                </div>

                <!-- Navigation Breadcrumbs & View Toggle Bar -->
                <div class="view-mode-bar">
                    <?php if (empty($searchQuery)): ?>
                        <div class="breadcrumbs" style="margin-bottom: 0;">
                            <a href="/">Utama</a>
                            <?php foreach ($breadcrumbs as $crumb): ?>
                                <span>/</span>
                                <a href="/?folderId=<?= $crumb['id'] ?>"><?= htmlspecialchars($crumb['name']) ?></a>
                            <?php endforeach; ?>
                        </div>
                    <?php else: ?>
                        <div style="font-size: 14px; font-weight: 700; color: #fff;">
                            Hasil Pencarian: "<?= htmlspecialchars($searchQuery) ?>"
                        </div>
                    <?php endif; ?>

                    <div style="display: flex; align-items: center; gap: 12px;">
                        <?php if (!empty($folders) || !empty($files)): ?>
                            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700; color: #94a3b8; cursor: pointer; background: rgba(255,255,255,0.05); padding: 6px 12px; border-radius: 8px; border: 1px solid var(--card-border); user-select: none;">
                                <input type="checkbox" id="master-select-all-checkbox" onclick="toggleSelectAll(this)" style="accent-color: #3b82f6; cursor:pointer; width: 16px; height: 16px;">
                                <span>Pilih Semua</span>
                            </label>
                        <?php endif; ?>

                        <div class="view-mode-toggle">
                            <button type="button" class="btn-view-mode active" id="view-mode-grid"
                                onclick="setViewMode('grid')" title="Tampilan Grid">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2.5">
                                    <rect width="7" height="7" x="3" y="3" rx="1.5" />
                                    <rect width="7" height="7" x="14" y="3" rx="1.5" />
                                    <rect width="7" height="7" x="14" y="14" rx="1.5" />
                                    <rect width="7" height="7" x="3" y="14" rx="1.5" />
                                </svg>
                            </button>
                            <button type="button" class="btn-view-mode" id="view-mode-list" onclick="setViewMode('list')"
                                title="Tampilan Tabel">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2.5">
                                    <line x1="8" x2="21" y1="6" y2="6" />
                                    <line x1="8" x2="21" y1="12" y2="12" />
                                    <line x1="8" x2="21" y1="18" y2="18" />
                                    <line x1="3" x2="3.01" y1="6" y2="6" />
                                    <line x1="3" x2="3.01" y1="12" y2="12" />
                                    <line x1="3" x2="3.01" y1="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <?php if (empty($folders) && empty($files)): ?>
                    <div class="empty-state">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="1.5">
                            <path
                                d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                        </svg>
                        <p><?= !empty($searchQuery) ? 'Tidak ada berkas yang cocok dengan pencarian Anda.' : 'Folder ini masih kosong. Klik "Unggah File" atau "Folder Baru" untuk menambahkan isi.' ?>
                        </p>
                    </div>
                <?php else: ?>
                    <?php
                    $currentFolderName = !empty($breadcrumbs) ? $breadcrumbs[count($breadcrumbs) - 1]['name'] : 'Utama';
                    ?>
                    <!-- Grid View Container -->
                    <div class="items-grid-modern" id="grid-view-container">
                        <!-- Folders Grid -->
                        <?php foreach ($folders as $folder): ?>
                            <?php
                            $folderItemJson = htmlspecialchars(json_encode([
                                'id' => $folder['id'],
                                'name' => $folder['name'],
                                'type' => 'folder',
                                'kindBadge' => 'FOL',
                                'badgeClass' => 'badge-folder',
                                'folderName' => $currentFolderName,
                                'sizeFormatted' => 'Folder Dokumen'
                            ]), ENT_QUOTES, 'UTF-8');
                            ?>
                            <div class="item-card-modern" onclick="window.location.href='/?folderId=<?= $folder['id'] ?>'">
                                <div class="card-header-modern">
                                    <div class="card-header-left">
                                        <input type="checkbox" class="item-checkbox" data-type="folder" data-id="<?= $folder['id'] ?>" data-name="<?= htmlspecialchars($folder['name']) ?>" onclick="event.stopPropagation(); updateSelectionState();" style="accent-color: #3b82f6; cursor:pointer; width: 16px; height: 16px; margin-right: 6px;">
                                        <div class="card-icon-badge badge-folder">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                fill="currentColor">
                                                <path
                                                    d="M20 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                                            </svg>
                                        </div>
                                        <span class="card-title-modern"
                                            title="<?= htmlspecialchars($folder['name']) ?>"><?= htmlspecialchars($folder['name']) ?></span>
                                    </div>
                                    <button type="button" class="btn-more-dots"
                                        onclick="openContextMenu(event, <?= $folderItemJson ?>)" title="Opsi Folder">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" stroke-width="2.5">
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="card-thumb-box"
                                    style="background: rgba(245, 158, 11, 0.05); border: 1px dashed rgba(245, 158, 11, 0.2);">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                                        fill="currentColor" style="color: rgba(245, 158, 11, 0.4);">
                                        <path
                                            d="M20 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                                    </svg>
                                </div>
                                <div class="card-footer-modern">
                                    <div class="card-location"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                            viewBox="0 0 24 24" fill="currentColor" style="color:#fbbf24;">
                                            <path
                                                d="M20 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                                        </svg><?= htmlspecialchars($folder['name']) ?></div>
                                    <span>Folder</span>
                                </div>
                            </div>
                        <?php endforeach; ?>

                        <!-- Files Grid -->
                        <?php foreach ($files as $file): ?>
                            <?php
                            $mime = strtolower($file['mime_type']);
                            $kindBadge = 'DOC';
                            $badgeClass = 'badge-doc';
                            $isImage = (strpos($mime, 'image/') === 0);
                            $isVideo = (strpos($mime, 'video/') === 0);

                            if ($isImage) {
                                $kindBadge = 'IMA';
                                $badgeClass = 'badge-image';
                            } elseif ($isVideo) {
                                $kindBadge = 'VID';
                                $badgeClass = 'badge-video';
                            } elseif (strpos($mime, 'audio/') === 0) {
                                $kindBadge = 'AUD';
                                $badgeClass = 'badge-audio';
                            }

                            $fileItemJson = htmlspecialchars(json_encode([
                                'id' => $file['id'],
                                'name' => $file['name'],
                                'mimeType' => $file['mime_type'],
                                'type' => 'file',
                                'kindBadge' => $kindBadge,
                                'badgeClass' => $badgeClass,
                                'folderName' => $currentFolderName,
                                'sizeFormatted' => formatBytes($file['size_bytes']),
                                'providerFileId' => $file['provider_file_id'] ?? ''
                            ]), ENT_QUOTES, 'UTF-8');
                            ?>
                            <div class="item-card-modern"
                                onclick="previewFile('<?= $file['id'] ?>', '<?= addslashes(htmlspecialchars($file['name'])) ?>', '<?= $file['mime_type'] ?>')">
                                <div class="card-header-modern">
                                    <div class="card-header-left">
                                        <input type="checkbox" class="item-checkbox" data-type="file" data-id="<?= $file['id'] ?>" data-name="<?= htmlspecialchars($file['name']) ?>" onclick="event.stopPropagation(); updateSelectionState();" style="accent-color: #3b82f6; cursor:pointer; width: 16px; height: 16px; margin-right: 6px;">
                                        <div class="card-icon-badge <?= $badgeClass ?>">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" stroke-width="2.5">
                                                <path
                                                    d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <span class="card-title-modern"
                                            title="<?= htmlspecialchars($file['name']) ?>"><?= htmlspecialchars($file['name']) ?></span>
                                    </div>
                                    <button type="button" class="btn-more-dots"
                                        onclick="openContextMenu(event, <?= $fileItemJson ?>)" title="Opsi Berkas">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" stroke-width="2.5">
                                            <circle cx="12" cy="5" r="1" />
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="12" cy="19" r="1" />
                                        </svg>
                                    </button>
                                </div>
                                <div class="card-thumb-box">
                                    <?php if ($isImage): ?>
                                        <img src="/download?id=<?= $file['id'] ?>&inline=1"
                                            alt="<?= htmlspecialchars($file['name']) ?>" class="card-thumb-img" loading="lazy"
                                            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                        <div
                                            style="display:none; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8;">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
                                                fill="none" stroke="currentColor" stroke-width="1.5">
                                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                                <circle cx="9" cy="9" r="2" />
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                            </svg></div>
                                    <?php elseif ($isVideo): ?>
                                        <video src="/download?id=<?= $file['id'] ?>&inline=1"
                                            style="width:100%; height:100%; object-fit:cover;"></video>
                                    <?php else: ?>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"
                                            fill="none" stroke="currentColor" stroke-width="1.5" style="color: #60a5fa;">
                                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    <?php endif; ?>
                                </div>
                                <div class="card-footer-modern">
                                    <div class="card-location"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12"
                                            viewBox="0 0 24 24" fill="currentColor" style="color:#fbbf24;">
                                            <path
                                                d="M20 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                                        </svg><?= htmlspecialchars($currentFolderName) ?></div>
                                    <span
                                        style="font-family: monospace; color: #a5b4fc;"><?= formatBytes($file['size_bytes']) ?></span>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <!-- List View Container (Table View) -->
                    <div class="portal-table-container" id="list-view-container" style="display: none;">
                        <table class="portal-table">
                            <thead>
                                <tr>
                                    <th width="40"><input type="checkbox" id="select-all-checkbox" onclick="toggleSelectAll(this)" style="accent-color: #3b82f6; cursor:pointer;">
                                    </th>
                                    <th>Nama Berkas</th>
                                    <th>Folder Lokasi</th>
                                    <th>Tanggal Modifikasi</th>
                                    <th>Ukuran</th>
                                    <th width="50"></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($folders as $folder): ?>
                                    <?php
                                    $folderItemJson = htmlspecialchars(json_encode([
                                        'id' => $folder['id'],
                                        'name' => $folder['name'],
                                        'type' => 'folder',
                                        'kindBadge' => 'FOL',
                                        'badgeClass' => 'badge-folder',
                                        'folderName' => $currentFolderName,
                                        'sizeFormatted' => 'Folder Dokumen'
                                    ]), ENT_QUOTES, 'UTF-8');
                                    ?>
                                    <tr onclick="window.location.href='/?folderId=<?= $folder['id'] ?>'"
                                        style="cursor: pointer;">
                                        <td onclick="event.stopPropagation();"><input type="checkbox" class="item-checkbox" data-type="folder" data-id="<?= $folder['id'] ?>" data-name="<?= htmlspecialchars($folder['name']) ?>" onclick="updateSelectionState()" style="accent-color: #3b82f6; cursor:pointer;"></td>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div class="card-icon-badge badge-folder">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
                                                        viewBox="0 0 24 24" fill="currentColor">
                                                        <path
                                                            d="M20 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2Z" />
                                                    </svg>
                                                </div>
                                                <span
                                                    style="font-weight: 700; color: #fff;"><?= htmlspecialchars($folder['name']) ?></span>
                                            </div>
                                        </td>
                                        <td><span style="color: #94a3b8; font-size: 12px;">📁
                                                <?= htmlspecialchars($currentFolderName) ?></span></td>
                                        <td><span
                                                style="color: #94a3b8; font-size: 12px;"><?= date('d M Y, H:i', strtotime($folder['created_at'])) ?></span>
                                        </td>
                                        <td><span style="color: #94a3b8; font-size: 12px;">Folder</span></td>
                                        <td onclick="event.stopPropagation();">
                                            <button type="button" class="btn-more-dots"
                                                onclick="openContextMenu(event, <?= $folderItemJson ?>)">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                    <circle cx="12" cy="5" r="1" />
                                                    <circle cx="12" cy="12" r="1" />
                                                    <circle cx="12" cy="19" r="1" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>

                                <?php foreach ($files as $file): ?>
                                    <?php
                                    $mime = strtolower($file['mime_type']);
                                    $kindBadge = 'DOC';
                                    $badgeClass = 'badge-doc';
                                    $isImage = (strpos($mime, 'image/') === 0);

                                    if ($isImage) {
                                        $kindBadge = 'IMA';
                                        $badgeClass = 'badge-image';
                                    } elseif (strpos($mime, 'video/') === 0) {
                                        $kindBadge = 'VID';
                                        $badgeClass = 'badge-video';
                                    } elseif (strpos($mime, 'audio/') === 0) {
                                        $kindBadge = 'AUD';
                                        $badgeClass = 'badge-audio';
                                    }

                                    $fileItemJson = htmlspecialchars(json_encode([
                                        'id' => $file['id'],
                                        'name' => $file['name'],
                                        'mimeType' => $file['mime_type'],
                                        'type' => 'file',
                                        'kindBadge' => $kindBadge,
                                        'badgeClass' => $badgeClass,
                                        'folderName' => $currentFolderName,
                                        'sizeFormatted' => formatBytes($file['size_bytes'])
                                    ]), ENT_QUOTES, 'UTF-8');
                                    ?>
                                    <tr onclick="previewFile('<?= $file['id'] ?>', '<?= addslashes(htmlspecialchars($file['name'])) ?>', '<?= $file['mime_type'] ?>')"
                                        style="cursor: pointer;">
                                        <td onclick="event.stopPropagation();"><input type="checkbox" class="item-checkbox" data-type="file" data-id="<?= $file['id'] ?>" data-name="<?= htmlspecialchars($file['name']) ?>" onclick="updateSelectionState()" style="accent-color: #3b82f6; cursor:pointer;"></td>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <?php if ($isImage): ?>
                                                    <img src="/download?id=<?= $file['id'] ?>&inline=1"
                                                        style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover;">
                                                <?php else: ?>
                                                    <div class="card-icon-badge <?= $badgeClass ?>"><?= $kindBadge ?></div>
                                                <?php endif; ?>
                                                <span
                                                    style="font-weight: 700; color: #fff; max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; inline-block;"><?= htmlspecialchars($file['name']) ?></span>
                                            </div>
                                        </td>
                                        <td><span style="color: #94a3b8; font-size: 12px;">📁
                                                <?= htmlspecialchars($currentFolderName) ?></span></td>
                                        <td><span
                                                style="color: #94a3b8; font-size: 12px;"><?= date('d M Y, H:i', strtotime($file['created_at'] ?? 'now')) ?></span>
                                        </td>
                                        <td><span
                                                style="color: #a5b4fc; font-family: monospace; font-size: 12px;"><?= formatBytes($file['size_bytes']) ?></span>
                                        </td>
                                        <td onclick="event.stopPropagation();">
                                            <button type="button" class="btn-more-dots"
                                                onclick="openContextMenu(event, <?= $fileItemJson ?>)">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                                    <circle cx="12" cy="5" r="1" />
                                                    <circle cx="12" cy="12" r="1" />
                                                    <circle cx="12" cy="19" r="1" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>
            </div>
        </main>
    </div>

    <!-- Hidden Input for File Upload (Multiple) -->
    <input type="file" id="file-input" style="display: none;" multiple onchange="handleFileSelect(event)">

    <!-- New Folder Modal -->
    <div class="modal-overlay" id="folder-modal">
        <div class="modal-card"
            style="background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <h3 style="color:#fff; margin-top:0; font-size: 18px; font-weight:800;">Buat Folder Baru</h3>
            <input type="text" id="new-folder-name" class="input-box" placeholder="Nama Folder..." autocomplete="off"
                style="margin-bottom: 20px;">
            <div class="modal-actions" style="display: flex; justify-content: flex-end; gap: 10px;">
                <button class="btn-action" onclick="closeNewFolderModal()"
                    style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 8px 16px; border-radius: 8px; cursor:pointer;">Batal</button>
                <button class="btn-action btn-primary" onclick="submitCreateFolder()"
                    style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight:700; cursor:pointer;">Buat
                    Folder</button>
            </div>
        </div>
    </div>

    <!-- File Preview Modal -->
    <div class="modal-overlay" id="preview-modal">
        <div class="modal-card"
            style="max-width: 800px; width: 90%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 id="preview-title"
                    style="margin: 0; font-size: 18px; font-weight: 800; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;">
                    Pratinjau Berkas</h3>
                <button class="btn-logout" onclick="closePreviewModal()"
                    style="padding: 6px 12px; border-radius: 8px; cursor:pointer;">Tutup</button>
            </div>

            <div id="preview-content"
                style="display: flex; justify-content: center; align-items: center; min-height: 280px; background: rgba(0,0,0,0.3); border-radius: 12px; overflow: hidden; margin-bottom: 20px; border: 1px solid var(--card-border);">
                <!-- Dynamic content loaded via JS -->
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px;">
                <a id="preview-download-btn" href="#" class="btn-action btn-primary"
                    style="text-decoration: none; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; padding: 10px 20px; border-radius: 8px; font-weight: 700;">Unduh
                    Berkas</a>
            </div>
        </div>
    </div>

    <!-- Upload Queue Modal -->
    <div class="modal-overlay" id="upload-queue-modal" style="backdrop-filter: blur(8px);">
        <div class="modal-card"
            style="max-width: 620px; width: 94%; max-height: 82vh; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 24px; padding: 24px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-shrink: 0;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; width: 40px; height: 40px; color: #60a5fa; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59,130,246,0.2);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                    </div>
                    <div>
                        <h3 style="margin:0; font-size:18px; font-weight:800; color:#fff; line-height:1.2; letter-spacing: -0.2px;">Unggah Berkas</h3>
                        <span id="queue-header-count" style="font-size:12px; color:#94a3b8; font-weight: 500;">Tidak ada berkas</span>
                    </div>
                </div>
                <button type="button" onclick="closeUploadQueue()" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); color:#94a3b8; width:34px; height:34px; border-radius:10px; cursor:pointer; font-size:18px; display:flex; align-items:center; justify-content:center; transition: all 0.2s ease;">&times;</button>
            </div>
            <div class="upload-queue-toolbar" style="display:flex; gap:8px; margin-bottom:12px; flex-shrink:0; flex-wrap:wrap;">
                <button type="button" onclick="triggerFileInput()" style="display:flex; align-items:center; gap:6px; background:rgba(59, 130, 246, 0.1); border:1px solid rgba(59, 130, 246, 0.25); color:#60a5fa; padding:8px 14px; border-radius:10px; cursor:pointer; font-size:12px; font-weight:700; transition: all 0.2s ease;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                    + Tambah Berkas
                </button>
                <button type="button" onclick="selectAllQueueItems()" style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid var(--card-border); color:#e2e8f0; padding:8px 14px; border-radius:10px; cursor:pointer; font-size:12px; font-weight:600; transition: all 0.2s ease;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Pilih Semua
                </button>
                <button type="button" onclick="deselectAllQueueItems()" style="display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.05); border:1px solid var(--card-border); color:#e2e8f0; padding:8px 14px; border-radius:10px; cursor:pointer; font-size:12px; font-weight:600; transition: all 0.2s ease;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                    Hapus Semua
                </button>
            </div>
            <div id="upload-queue-list"
                style="flex: 1; overflow-y: auto; margin-bottom: 12px; min-height: 100px; max-height: 320px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 8px;">
            </div>
            <div id="upload-queue-summary" style="flex-shrink: 0; display: none;">
                <div class="progress-bar-bg" style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 10px; overflow: hidden; margin-bottom: 8px;">
                    <div class="progress-bar-fill" id="queue-progress-fill" style="background: linear-gradient(90deg, #3b82f6, #10b981); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 12px;">
                    <span id="queue-status-text">0 / 0 selesai</span>
                    <span id="queue-percent-text" style="font-weight: 700; color: #60a5fa;">0%</span>
                </div>
            </div>
            <div style="display: flex; gap: 10px; flex-shrink: 0; margin-top: 4px;">
                <button type="button" id="btn-upload-start" onclick="startUploadQueue()"
                    style="flex: 2; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 13px 18px; border-radius: 14px; font-weight: 700; font-size:14px; cursor:pointer; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35); transition: all 0.2s ease;">
                    Upload Terpilih
                </button>
                <button type="button" onclick="closeUploadQueue()"
                    style="flex: 1; background: rgba(255,255,255,0.06); color: #e2e8f0; border: 1px solid var(--card-border); padding: 13px 18px; border-radius: 14px; cursor:pointer; font-weight: 600; font-size:14px; transition: all 0.2s ease;">Tutup</button>
            </div>
        </div>
    </div>

    <!-- Batch Size Exceeded Popup Modal (5GB Limit) -->
    <div class="modal-overlay" id="batch-size-popup-modal">
        <div class="modal-card"
            style="max-width: 480px; width: 92%; background: #0f172a; border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 20px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 10px; color: #fbbf24; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Batas Unggah Tercapai</h3>
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.5;">
                Total ukuran berkas yang dipilih melebihi batas maksimal <strong id="batch-max-size" style="color: #fbbf24;">5 GB</strong> per sesi unggah.
            </p>
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8; margin-bottom: 4px;">
                    <span>Total ukuran dipilih:</span>
                    <span id="batch-total-size" style="color: #fca5a5; font-weight: 700; font-family: monospace;">0 B</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 13px; color: #94a3b8;">
                    <span>Batas maksimal:</span>
                    <span style="color: #6ee7b7; font-weight: 700; font-family: monospace;">5 GB</span>
                </div>
            </div>
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">
                Pilihan berkas Anda tidak dihapus — cukup <strong>hapus centang</strong> beberapa berkas untuk mengurangi total ukuran, lalu klik "Upload Terpilih".
            </p>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeBatchSizePopup()"
                    style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 700; cursor:pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Mengerti</button>
            </div>
        </div>
    </div>

    <!-- Storage Quota Exceeded Popup Modal -->
    <div class="modal-overlay" id="quota-popup-modal" style="display: none; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(10px); z-index: 10000; align-items: center; justify-content: center;">
        <div class="modal-card" style="max-width: 460px; width: 92%; background: #0f172a; border: 1.5px solid rgba(239, 68, 68, 0.4); border-radius: 24px; padding: 26px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75); font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 14px; padding: 10px; color: #f87171; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 19px; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif;">Ruang Penyimpanan Tidak Cukup</h3>
                    <span style="font-size: 11.5px; color: #fca5a5; font-weight: 600;">Kapasitas Storage Ditetapkan Admin</span>
                </div>
            </div>

            <div id="quota-info-box" style="background: rgba(239, 68, 68, 0.08); border: 1px dashed rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 12px; margin-bottom: 14px; font-size: 12.5px; color: #fca5a5; display: flex; flex-direction: column; gap: 4px;">
                <!-- Dynamically populated via JS -->
            </div>

            <p style="font-size: 13px; color: #cbd5e1; margin-bottom: 8px; font-weight: 600;">Berkas yang Melebihi Kapasitas:</p>
            <div id="quota-failed-list" style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; margin-bottom: 18px; max-height: 160px; overflow-y: auto; font-size: 12.5px; color: #fca5a5;">
            </div>

            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 20px; line-height: 1.45;">
                Anda dapat menghapus beberapa berkas lama atau menghubungi Administrator untuk meningkatkan batas kapasitas penyimpanan akun Anda.
            </p>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeQuotaPopup()" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; border: none; padding: 10px 24px; border-radius: 10px; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);">Mengerti</button>
            </div>
        </div>
    </div>

    <!-- Account Settings Modal -->
    <div class="modal-overlay" id="settings-modal">
        <div class="modal-card"
            style="max-width: 460px; width: 92%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Pengaturan Akun & Password</h3>
                <button type="button" onclick="closeSettingsModal()"
                    style="background:none; border:none; color:var(--text-muted); font-size: 24px; cursor:pointer;">&times;</button>
            </div>

            <!-- Profile Overview Card -->
            <div
                style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span
                        style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Username</span>
                    <span style="font-size: 13.5px; font-weight: 800; color: #60a5fa;">👤 <?= $clientUsername ?></span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <span
                        style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Peran
                        Akun</span>
                    <span
                        style="font-size: 11.5px; font-weight: 700; color: #34d399; background: rgba(16,185,129,0.15); padding: 2px 8px; border-radius: 6px;">Client
                        User</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span
                        style="font-size: 11.5px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Batas
                        Storage</span>
                    <span style="font-size: 13px; font-weight: 800; color: #fbbf24;"><?= $limitGb ?> GB</span>
                </div>
            </div>

            <form action="/settings/update-password" method="POST">
                <div style="font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 14px;">🔒 Ubah Password Akun
                </div>

                <div style="margin-bottom: 14px;">
                    <label
                        style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Password
                        Saat Ini</label>
                    <input type="password" name="old_password" placeholder="Masukkan password lama..." required
                        style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.04); border: 1px solid var(--card-border); padding: 10px 14px; border-radius: 10px; color: #fff; outline: none;">
                </div>

                <div style="margin-bottom: 14px;">
                    <label
                        style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Password
                        Baru</label>
                    <input type="password" name="new_password" placeholder="Masukkan password baru..." required
                        style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.04); border: 1px solid var(--card-border); padding: 10px 14px; border-radius: 10px; color: #fff; outline: none;">
                </div>

                <div style="margin-bottom: 20px;">
                    <label
                        style="display: block; font-size: 12px; font-weight: 700; color: #cbd5e1; margin-bottom: 6px;">Konfirmasi
                        Password Baru</label>
                    <input type="password" name="confirm_password" placeholder="Ketik ulang password baru..." required
                        style="width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.04); border: 1px solid var(--card-border); padding: 10px 14px; border-radius: 10px; color: #fff; outline: none;">
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" onclick="closeSettingsModal()"
                        style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 9px 18px; border-radius: 8px; cursor:pointer;">Batal</button>
                    <button type="submit"
                        style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor:pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Simpan
                        Password</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Rename Confirmation Modal -->
    <div class="modal-overlay" id="rename-modal">
        <div class="modal-card"
            style="max-width: 440px; width: 92%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div
                    style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 10px; color: #60a5fa; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                    </svg>
                </div>
                <h3 id="rename-modal-title" style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Ubah Nama
                </h3>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 16px;">Masukkan nama baru yang
                diinginkan:</p>
            <input type="text" id="rename-item-name" class="input-box" placeholder="Nama Baru..." autocomplete="off"
                style="margin-bottom: 20px; width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.04); border: 1px solid var(--card-border); padding: 10px 14px; border-radius: 10px; color: #fff; outline: none;">
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeRenameModal()"
                    style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 9px 18px; border-radius: 8px; cursor:pointer;">Batal</button>
                <button type="button" onclick="submitRename()"
                    style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor:pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Simpan
                    Perubahan</button>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" id="delete-modal">
        <div class="modal-card"
            style="max-width: 440px; width: 92%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div
                    style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 10px; color: #f87171; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Konfirmasi Hapus</h3>
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.5;">Apakah Anda yakin ingin
                menghapus <span id="delete-item-type">item</span> ini?</p>
            <div
                style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); border-radius: 10px; padding: 12px; margin-bottom: 20px;">
                <span id="delete-item-name"
                    style="font-size: 14px; font-weight: 700; color: #f87171; word-break: break-all;">-</span>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeDeleteModal()"
                    style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 9px 18px; border-radius: 8px; cursor:pointer;">Batal</button>
                <button type="button" onclick="submitDelete()"
                    style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor:pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">Ya,
                    Hapus</button>
            </div>
        </div>
    </div>

    <!-- Move Item Modal -->
    <div class="modal-overlay" id="move-modal">
        <div class="modal-card"
            style="max-width: 440px; width: 92%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div
                    style="background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 10px; color: #60a5fa; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path
                            d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
                    </svg>
                </div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Pindahkan Item</h3>
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 12px;">Pindahkan "<strong id="move-item-name"
                    style="color: #60a5fa;">-</strong>" ke folder tujuan:</p>
            <select id="move-target-folder" class="input-box"
                style="margin-bottom: 20px; width: 100%; box-sizing: border-box; background: rgba(15, 23, 42, 0.9); border: 1px solid var(--card-border); padding: 10px 14px; border-radius: 10px; color: #fff; outline: none; font-size: 13.5px;">
                <option value="">📁 Root / Utama</option>
                <?php foreach ($allFoldersList ?? $folders as $f): ?>
                    <option value="<?= $f['id'] ?>">📁 <?= htmlspecialchars($f['name']) ?></option>
                <?php endforeach; ?>
            </select>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeMoveModal()"
                    style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 9px 18px; border-radius: 8px; cursor:pointer;">Batal</button>
                <button type="button" onclick="submitMoveItem()"
                    style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor:pointer; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Pindahkan</button>
            </div>
        </div>
    </div>

    <!-- Details Item Modal -->
    <div class="modal-overlay" id="details-modal">
        <div class="modal-card"
            style="max-width: 440px; width: 92%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Detail Berkas</h3>
                <button type="button" onclick="closeDetailsModal()"
                    style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:20px;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 13.5px;">
                <div
                    style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <span style="color: #94a3b8;">Nama</span>
                    <span id="det-name"
                        style="color: #fff; font-weight: 700; max-width: 60%; text-align: right; word-break: break-all;">-</span>
                </div>
                <div
                    style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <span style="color: #94a3b8;">Tipe</span>
                    <span id="det-type" style="color: #cbd5e1;">-</span>
                </div>
                <div
                    style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <span style="color: #94a3b8;">Ukuran</span>
                    <span id="det-size" style="color: #a5b4fc; font-family: monospace;">-</span>
                </div>
                <div
                    style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                    <span style="color: #94a3b8;">Lokasi Folder</span>
                    <span id="det-folder" style="color: #fbbf24; font-weight: 600;">-</span>
                </div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <button type="button" onclick="closeDetailsModal()"
                    style="background: rgba(255,255,255,0.1); color: #fff; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor:pointer;">Tutup</button>
            </div>
        </div>
    </div>

    <!-- Floating Context Menu Popover -->
    <div class="context-menu-popup" id="context-menu-popup">
        <div class="cm-header">
            <div class="cm-header-badge badge-image" id="cm-badge">IMA</div>
            <div style="min-width: 0; flex: 1;">
                <div class="cm-header-title" id="cm-title">File Name</div>
                <div class="cm-header-sub">
                    <span id="cm-size">0 KB</span>
                    <span>•</span>
                    <span id="cm-folder">📁 Folder</span>
                </div>
            </div>
        </div>
        <div class="cm-divider"></div>
        <button type="button" class="cm-item" id="cm-btn-preview" onclick="cmActionPreview()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
            <span style="flex:1;">Preview</span>
            <kbd
                style="font-size:10px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; color:#94a3b8;">↵</kbd>
        </button>
        <button type="button" class="cm-item" id="cm-btn-download" onclick="cmActionDownload()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            <span>Download</span>
        </button>
        <button type="button" class="cm-item" onclick="cmActionRename()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
            </svg>
            <span>Rename</span>
        </button>
        <button type="button" class="cm-item" onclick="cmActionMove()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path
                    d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
            </svg>
            <span>Move to Folder</span>
        </button>
        <button type="button" class="cm-item" onclick="cmActionDetails()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="16" y2="12" />
                <line x1="12" x2="12.01" y1="8" y2="8" />
            </svg>
            <span>Details</span>
        </button>
        <div class="cm-divider"></div>
        <button type="button" class="cm-item" id="cm-btn-copylink" onclick="cmActionCopyLink()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
            <span style="flex:1;">Copy Link</span>
            <kbd
                style="font-size:10px; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; color:#94a3b8;">Ctrl+L</kbd>
        </button>
        <button type="button" class="cm-item" onclick="cmActionInvite()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
            </svg>
            <span>Invite Member</span>
        </button>
        <div class="cm-divider"></div>
        <button type="button" class="cm-item cm-danger" onclick="cmActionDelete()">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            <span>Delete</span>
        </button>
    </div>

    <!-- Floating Bulk Action Bar -->
    <div id="bulk-action-bar" class="bulk-action-bar">
        <div class="bulk-info">
            <span class="bulk-count-badge" id="bulk-count-text">0 item dipilih</span>
        </div>
        <div class="bulk-buttons">
            <!--
            <button type="button" onclick="downloadSelectedZip()" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y1="3"/></svg>
                <span>Unduh ZIP</span>
            </button>
            -->
            <button type="button" class="btn-bulk-delete" onclick="openBulkDeleteModal()">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                <span>Hapus Terpilih</span>
            </button>
            <button type="button" class="btn-bulk-cancel" onclick="deselectAllItems()">
                <span>Batal</span>
            </button>
        </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <div class="modal-overlay" id="bulk-delete-modal">
        <div class="modal-card" style="max-width: 440px; width: 92%; background: #0f172a; border: 1px solid var(--card-border); border-radius: 20px; padding: 24px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 10px; color: #f87171; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </div>
                <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">Konfirmasi Hapus Terpilih</h3>
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 8px; line-height: 1.5;">Apakah Anda yakin ingin menghapus <span id="bulk-delete-count" style="font-weight: 700; color: #f87171;">0</span> item terpilih?</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                <button type="button" onclick="closeBulkDeleteModal()" style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 9px 18px; border-radius: 8px; cursor:pointer;">Batal</button>
                <button type="button" onclick="submitBulkDelete()" style="background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); color: #fff; border: none; padding: 9px 18px; border-radius: 8px; font-weight: 700; cursor:pointer; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">Ya, Hapus Terpilih</button>
            </div>
        </div>
    </div>

    <!-- Delete All Confirmation Modal -->
    <div class="modal-overlay" id="delete-all-modal">
        <div class="modal-card" style="max-width: 460px; width: 92%; background: #0f172a; border: 1px solid rgba(239,68,68,0.4); border-radius: 20px; padding: 24px; box-shadow: 0 20px 50px rgba(239,68,68,0.2);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.5); border-radius: 12px; padding: 10px; color: #ef4444; display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                </div>
                <div>
                    <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #fff;">⚠️ Hapus SELURUH Data Portal</h3>
                    <span style="font-size: 11.5px; color: #fca5a5; font-weight: 600;">PERINGATAN BAHAYA</span>
                </div>
            </div>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 12px; line-height: 1.5;">Apakah Anda yakin ingin <strong style="color: #ef4444;">MENGHAPUS SELURUH BERKAS & FOLDER</strong> milik Anda?</p>
            <div style="background: rgba(239, 68, 68, 0.08); border: 1px dashed rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 10px 12px; font-size: 12px; color: #fca5a5; margin-bottom: 20px;">
                Tindakan ini akan mengosongkan seluruh ruang penyimpanan Anda dan tidak dapat dibatalkan.
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" onclick="closeDeleteAllModal()" style="background: rgba(255,255,255,0.05); color: #e2e8f0; border: 1px solid var(--card-border); padding: 9px 18px; border-radius: 8px; cursor:pointer;">Batal</button>
                <button type="button" id="btn-submit-delete-all" onclick="submitDeleteAllFiles()" style="background: linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%); color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 800; cursor:pointer; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);">Ya, Hapus Semua Data</button>
            </div>
        </div>
    </div>

    <!-- Google Drive Style Duplicate File Option Modal ("Opsi upload") -->
    <div class="modal-overlay" id="gdrive-duplicate-modal" style="display: none; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center;">
        <div class="modal-card" style="max-width: 440px; width: 90%; background: #0f172a; color: #f8fafc; border-radius: 24px; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid var(--card-border); font-family: 'Plus Jakarta Sans', sans-serif;">
            <h3 style="margin: 0 0 14px 0; font-size: 20px; font-weight: 800; color: #fff; font-family: 'Outfit', sans-serif;">Opsi Upload Berkas</h3>
            <p style="font-size: 13.5px; color: #cbd5e1; margin-bottom: 20px; line-height: 1.5;">
                Berkas <strong id="duplicate-filename-text" style="color: #60a5fa;">file.png</strong> sudah ada di lokasi ini. Apakah Anda ingin mengganti file yang ada dengan versi baru atau menyimpan kedua file?
            </p>
            <div style="display: flex; flex-direction: column; gap: 14px; margin-bottom: 28px;">
                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; color: #f8fafc; font-weight: 500;">
                    <input type="radio" name="duplicate_option" value="replace" checked style="accent-color: #3b82f6; width: 18px; height: 18px; cursor: pointer;">
                    <span>Ganti file yang ada (Versi Baru)</span>
                </label>
                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; font-size: 14px; color: #f8fafc; font-weight: 500;">
                    <input type="radio" name="duplicate_option" value="keep_both" style="accent-color: #3b82f6; width: 18px; height: 18px; cursor: pointer;">
                    <span>Simpan kedua file (Duplikat)</span>
                </label>
            </div>
            <div style="display: flex; justify-content: flex-end; align-items: center; gap: 12px;">
                <button type="button" onclick="cancelDuplicateUpload()" style="background: rgba(255,255,255,0.06); border: 1px solid var(--card-border); color: #cbd5e1; padding: 9px 20px; font-size: 13.5px; font-weight: 600; cursor: pointer; border-radius: 10px;">Batal</button>
                <button type="button" onclick="confirmDuplicateUpload()" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; border: none; padding: 9px 24px; border-radius: 10px; font-size: 13.5px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);">Upload</button>
            </div>
        </div>
    </div>

    <!-- Google Drive Style Floating Upload Panel (Bottom-Right Widget) -->
    <div id="gdrive-upload-widget" style="display: none; position: fixed; bottom: 0; right: 24px; z-index: 9999; width: 350px; background: #0f172a; color: #f8fafc; border-radius: 16px 16px 0 0; box-shadow: 0 10px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.12); font-family: 'Plus Jakarta Sans', sans-serif; overflow: hidden; transition: transform 0.25s ease;">
        <!-- Widget Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: #1e293b; border-bottom: 1px solid rgba(255,255,255,0.08);">
            <span id="gdrive-widget-title" style="font-size: 14.5px; font-weight: 700; color: #f8fafc;">Mengupload 1 item</span>
            <div style="display: flex; align-items: center; gap: 6px;">
                <button type="button" onclick="toggleUploadWidgetCollapse()" id="btn-widget-toggle" style="background: transparent; border: none; color: #94a3b8; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <button type="button" onclick="closeUploadWidget()" style="background: transparent; border: none; color: #94a3b8; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 20px;">&times;</button>
            </div>
        </div>
        <!-- Widget Body Container -->
        <div id="gdrive-widget-body">
            <!-- Subheader status line -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: rgba(255,255,255,0.03); font-size: 12.5px; color: #cbd5e1; border-bottom: 1px solid rgba(255,255,255,0.06);">
                <span id="gdrive-widget-status-text">Menyelesaikan upload...</span>
                <button type="button" id="gdrive-widget-cancel-btn" onclick="cancelUploadWidgetQueue()" style="background: transparent; border: none; color: #60a5fa; font-weight: 700; font-size: 12.5px; cursor: pointer; padding: 0;">Batal</button>
            </div>
            <!-- Item List -->
            <div id="gdrive-widget-item-list" style="max-height: 220px; overflow-y: auto; padding: 4px 0; background: #0f172a;">
                <!-- Dynamic Upload Rows -->
            </div>
        </div>
    </div>

    <!-- Welcome & Feature Announcement Onboarding Modal -->
    <div class="modal-overlay" id="onboarding-guide-modal" style="display: none; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(8px); z-index: 10000; align-items: center; justify-content: center;">
        <div class="modal-card" style="max-width: 460px; width: 92%; background: #111827; color: #f8fafc; border-radius: 20px; padding: 26px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65); border: 1.5px solid #f59e0b; font-family: 'Plus Jakarta Sans', sans-serif; position: relative; animate: fadeIn 0.3s ease;">
            <!-- Close Button -->
            <button type="button" onclick="closeOnboardingModal()" style="position: absolute; top: 16px; right: 16px; background: rgba(255, 255, 255, 0.05); border: none; color: #9ca3af; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">&times;</button>
            
            <!-- Slide Content Container -->
            <div id="onboarding-slide-container" style="min-height: 140px;">
                <!-- Dynamically populated via portal.js -->
            </div>

            <!-- Slide Dots Indicator & Navigation Buttons -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                <div id="onboarding-dots" style="display: flex; gap: 6px;">
                    <!-- Dots injected via JS -->
                </div>

                <div style="display: flex; gap: 10px;">
                    <button type="button" id="btn-onboarding-prev" onclick="prevOnboardingSlide()" style="background: rgba(255, 255, 255, 0.08); color: #e5e7eb; border: 1px solid rgba(255, 255, 255, 0.15); padding: 8px 18px; border-radius: 10px; font-size: 13.5px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease;">
                        &larr; Previous
                    </button>
                    <button type="button" id="btn-onboarding-next" onclick="nextOnboardingSlide()" style="background: #f59e0b; color: #0f172a; border: none; padding: 8px 22px; border-radius: 10px; font-size: 13.5px; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35); transition: all 0.2s ease;">
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const CURRENT_FOLDER_ID = <?= json_encode($folderId) ?>;
        const EXISTING_FILE_NAMES = <?= json_encode(array_values(array_map(function($f) { return $f['name']; }, $files ?? []))) ?>;
        const STORAGE_LIMIT_BYTES = <?= json_encode((float)($limitBytes ?? 0)) ?>;
        const STORAGE_USED_BYTES = <?= json_encode((float)($totalUsedBytes ?? 0)) ?>;
        const STORAGE_LIMIT_GB = <?= json_encode((float)($limitGb ?? 15)) ?>;
        const UPLOAD_DIRECT_URL = <?= json_encode($uploadDirectUrl ?? '') ?>;
        const UPLOAD_DIRECT_THRESHOLD_BYTES = <?= json_encode((float)($uploadDirectThresholdBytes ?? 90 * 1024 * 1024)) ?>;
    </script>
    <script src="/assets/js/portal.js?v=<?= filemtime(__DIR__ . '/../../public/assets/js/portal.js') ?>"></script>
</body>

</html>