<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($file['name']) ?> -  Share</title>
    <link rel="icon" type="image/png" href="/assets/image/favicon/favicon-clouds.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            background: #090d16;
            color: #f8fafc;
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        /* Top Header Bar */
        .share-header {
            height: 64px;
            background: rgba(15, 23, 42, 0.9);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            z-index: 10;
            flex-shrink: 0;
        }

        .share-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }

        .file-icon-badge {
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            flex-shrink: 0;
        }

        .file-info {
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        .file-name {
            font-size: 14px;
            font-weight: 700;
            color: #f8fafc;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-meta {
            font-size: 11.5px;
            color: #64748b;
            margin-top: 1px;
        }

        .share-header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .btn-download-icon {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .btn-download-icon:hover {
            background: rgba(59, 130, 246, 0.2);
            border-color: rgba(59, 130, 246, 0.4);
            color: #60a5fa;
        }

        /* Main Image / Media Viewer Container */
        .share-viewer-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            overflow: auto;
            position: relative;
        }

        .share-full-img {
            max-width: 92vw;
            max-height: calc(100vh - 112px);
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7);
        }

        .share-full-video {
            max-width: 92vw;
            max-height: calc(100vh - 112px);
            border-radius: 12px;
            box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7);
            outline: none;
        }

        .share-generic-card {
            background: rgba(15, 23, 42, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            max-width: 440px;
            width: 100%;
        }

        .btn-download-main {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: #fff;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            margin-top: 20px;
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
    </style>
</head>

<body>
    <?php
    function formatBytesShare($bytes, $precision = 2)
    {
        if ($bytes >= 1073741824)
            return round($bytes / 1073741824, $precision) . ' GB';
        if ($bytes >= 1048576)
            return round($bytes / 1048576, $precision) . ' MB';
        if ($bytes >= 1024)
            return round($bytes / 1024, $precision) . ' KB';
        return $bytes . ' B';
    }

    $mime = strtolower($file['mime_type']);
    $isImage = (strpos($mime, 'image/') === 0);
    $isVideo = (strpos($mime, 'video/') === 0);
    $isPdf = ($mime === 'application/pdf' || strtolower(pathinfo($file['name'], PATHINFO_EXTENSION)) === 'pdf');
    $formattedDate = isset($file['created_at']) ? date('M j, Y, g:i A', strtotime($file['created_at'])) : '';
    ?>

    <!-- Top Header Bar -->
    <header class="share-header">
        <div class="share-header-left">
            <div class="file-icon-badge">
                <?php if ($isImage): ?>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                <?php elseif ($isVideo): ?>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect width="15" height="14" x="1" y="5" rx="2" ry="2" />
                    </svg>
                <?php else: ?>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                <?php endif; ?>
            </div>
            <div class="file-info">
                <span class="file-name"
                    title="<?= htmlspecialchars($file['name']) ?>"><?= htmlspecialchars($file['name']) ?></span>
                <span
                    class="file-meta"><?= formatBytesShare($file['size_bytes']) ?><?= $formattedDate ? ' • Uploaded ' . $formattedDate : '' ?></span>
            </div>
        </div>
        <div class="share-header-right">
            <a href="/download?id=<?= $file['id'] ?>&inline=1" target="_blank" class="btn-download-icon" title="Buka Langsung (Bertopeng Domain)">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                </svg>
            </a>
        </div>
    </header>

    <!-- Main Content Viewer -->
    <main class="share-viewer-container">
        <?php if ($isImage): ?>
            <img src="/download?id=<?= $file['id'] ?>&inline=1" alt="<?= htmlspecialchars($file['name']) ?>"
                class="share-full-img">
        <?php elseif ($isVideo): ?>
            <div style="position: relative; width: 100%; max-width: 960px; height: 100%; max-height: calc(100vh - 120px); aspect-ratio: 16/9; border-radius: 12px; overflow: hidden; background: #000; box-shadow: 0 16px 50px rgba(0, 0, 0, 0.7);">
                <iframe src="/embed/<?= htmlspecialchars($file['id']) ?>" style="width: 100%; height: 100%; border: none; background: #000;" allow="autoplay; fullscreen" allowfullscreen></iframe>
                <!-- White-Label Click Shield: Blocks popout icon from opening Google Drive -->
                <div style="position: absolute; top:0; right:0; width:80px; height:80px; z-index:999; background:transparent;"></div>
            </div>
        <?php elseif ($isPdf): ?>
            <iframe src="/download?id=<?= $file['id'] ?>&inline=1" style="width: 100%; height: 100%; border: none; background: #fff;"></iframe>
        <?php else: ?>
            <div class="share-generic-card">
                <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                <h2 style="font-size: 18px; margin: 0 0 8px 0;"><?= htmlspecialchars($file['name']) ?></h2>
                <p style="font-size: 13px; color: #94a3b8; margin: 0 0 20px 0;"><?= formatBytesShare($file['size_bytes']) ?>
                    • Pratinjau langsung tidak tersedia</p>
                <a href="/download?id=<?= $file['id'] ?>" class="btn-download-main">Unduh Berkas</a>
            </div>
        <?php endif; ?>
    </main>
</body>

</html>