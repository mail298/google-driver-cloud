<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($file['name'] ?? 'Video Stream') ?></title>
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
        html, body { width: 100%; height: 100%; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
        
        .player-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000;
        }

        video {
            width: 100%;
            height: 100%;
            object-fit: contain;
            outline: none;
        }

        /* Overlay Play Button */
        .big-play-btn {
            position: absolute;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: rgba(13, 110, 253, 0.85);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            transition: transform 0.2s ease, background 0.2s ease;
            z-index: 10;
            padding-left: 4px;
        }
        .big-play-btn:hover {
            transform: scale(1.1);
            background: rgba(13, 110, 253, 1);
        }
        .big-play-btn.hidden { display: none; }

        /* Custom Control Bar */
        .controls-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%);
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 20;
        }
        .player-container:hover .controls-overlay,
        .player-container.paused .controls-overlay {
            opacity: 1;
        }

        /* Progress Bar */
        .progress-container {
            width: 100%;
            height: 6px;
            background: rgba(255,255,255,0.25);
            border-radius: 3px;
            cursor: pointer;
            position: relative;
            transition: height 0.15s ease;
        }
        .progress-container:hover {
            height: 10px;
        }
        .progress-filled {
            height: 100%;
            background: #0d6efd;
            border-radius: 3px;
            width: 0%;
            position: relative;
        }
        .progress-filled::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #fff;
            opacity: 0;
            transition: opacity 0.15s ease;
        }
        .progress-container:hover .progress-filled::after {
            opacity: 1;
        }

        /* Lower Controls Row */
        .controls-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #fff;
            font-size: 14px;
        }
        .controls-left, .controls-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .btn-icon {
            background: none;
            border: none;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            opacity: 0.85;
            transition: opacity 0.2s ease, transform 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .btn-icon:hover { opacity: 1; transform: scale(1.15); }

        .time-display {
            font-size: 13px;
            color: rgba(255,255,255,0.85);
            font-variant-numeric: tabular-nums;
        }

        /* Select / Menu Dropdowns */
        .custom-select {
            background: rgba(255,255,255,0.15);
            color: #fff;
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 4px;
            padding: 2px 8px;
            font-size: 12px;
            cursor: pointer;
            outline: none;
        }
        .custom-select option {
            background: #111;
            color: #fff;
        }

        /* Title Badge */
        .video-title-badge {
            position: absolute;
            top: 16px;
            left: 16px;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(8px);
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            z-index: 15;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 80%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        /* Mobile Responsive Adjustments */
        @media (max-width: 640px) {
            .big-play-btn { width: 56px; height: 56px; font-size: 22px; }
            .controls-overlay { padding: 8px 12px; gap: 6px; }
            .controls-row { flex-wrap: wrap; gap: 6px; }
            .controls-left, .controls-right { gap: 8px; }
            .btn-icon { font-size: 14px; }
            .time-display { font-size: 11px; }
            .custom-select { font-size: 11px; padding: 2px 4px; }
            .video-title-badge { font-size: 11px; padding: 4px 10px; top: 10px; left: 10px; }
            .gd-frame-wrap iframe { margin-top: -40px; height: calc(100% + 44px); }
        }
    </style>
</head>
<body>

<?php if (!empty($file['provider_file_id'])): ?>
    <!-- Fast Engine (Instant <0.2s Startup Speed) - 100% White-Label Shielded -->
    <div class="player-container" id="playerContainer" style="position: relative; width:100%; height:100%; background:#000; overflow:hidden;">
        <div class="gd-frame-wrap" style="position: relative; width:100%; height:100%; background:#000; overflow:hidden;">
        <iframe src="https://drive.google.com/file/d/<?= htmlspecialchars($file['provider_file_id']) ?>/preview" 
                style="width:100%; height:calc(100% + 56px); margin-top:-52px; border:none;" 
                allow="autoplay; fullscreen" 
                allowfullscreen>
        </iframe>
        <!-- White-Label Click Shield: Blocks popout icon from opening Google Drive -->
        <div style="position: absolute; top:0; right:0; width:80px; height:80px; z-index:999; background:transparent;"></div>
    </div>
    </div>
<?php else: ?>
<div class="player-container paused" id="playerContainer">
    <div class="video-title-badge"><?= htmlspecialchars($file['name']) ?></div>
    
    <div class="big-play-btn" id="bigPlayBtn">
        <i class="fa-solid fa-play"></i>
    </div>

    <video id="videoPlayer" src="/download?id=<?= htmlspecialchars($file['id']) ?>&inline=1" poster="/download?id=<?= htmlspecialchars($file['id']) ?>&thumb=1" playsinline preload="metadata"></video>

    <div class="controls-overlay">
        <div class="progress-container" id="progressContainer">
            <div class="progress-filled" id="progressFilled"></div>
        </div>
        
        <div class="controls-row">
            <div class="controls-left">
                <button class="btn-icon" id="playPauseBtn" title="Play/Pause (Space)"><i class="fa-solid fa-play"></i></button>
                <button class="btn-icon" id="muteBtn" title="Mute/Unmute (M)"><i class="fa-solid fa-volume-high"></i></button>
                <span class="time-display" id="timeDisplay">00:00 / 00:00</span>
            </div>
            
            <div class="controls-right">
                <select class="custom-select" id="speedSelect" title="Kecepatan">
                    <option value="0.5">0.5x</option>
                    <option value="1.0" selected>1.0x (Normal)</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                </select>

                <button class="btn-icon" id="pipBtn" title="Picture-in-Picture"><i class="fa-solid fa-clone"></i></button>
                <button class="btn-icon" id="fullscreenBtn" title="Layar Penuh (F)"><i class="fa-solid fa-expand"></i></button>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>

<script>
    const container = document.getElementById('playerContainer');
    const video = document.getElementById('videoPlayer');
    const bigPlayBtn = document.getElementById('bigPlayBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const muteBtn = document.getElementById('muteBtn');
    const progressContainer = document.getElementById('progressContainer');
    const progressFilled = document.getElementById('progressFilled');
    const timeDisplay = document.getElementById('timeDisplay');
    const speedSelect = document.getElementById('speedSelect');
    const pipBtn = document.getElementById('pipBtn');
    const fullscreenBtn = document.getElementById('fullscreenBtn');

    const fileId = "<?= htmlspecialchars($file['id']) ?>";
    const hlsUrl = "/stream/" + encodeURIComponent(fileId) + "/master.m3u8";
    const mp4Url = "/download?id=" + encodeURIComponent(fileId) + "&inline=1";

    if (video) {
        const mp4DirectUrl = "/download?id=" + encodeURIComponent(fileId) + "&inline=1";

        video.src = mp4DirectUrl;
        video.load();

        function togglePlay() {
            if (video.paused) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.log("Autoplay / Play interaction deferred:", err);
                    });
                }
            } else {
                video.pause();
            }
        }

        video.addEventListener('play', () => {
            container.classList.remove('paused');
            bigPlayBtn.classList.add('hidden');
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        });

        video.addEventListener('pause', () => {
            container.classList.add('paused');
            bigPlayBtn.classList.remove('hidden');
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        });

        bigPlayBtn.addEventListener('click', togglePlay);
        playPauseBtn.addEventListener('click', togglePlay);
        video.addEventListener('click', togglePlay);

        // Mute / Volume
        muteBtn.addEventListener('click', () => {
            video.muted = !video.muted;
            muteBtn.innerHTML = video.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
        });

        // Time & Progress Update
        function formatTime(seconds) {
            if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
        }

        function updateDurationDisplay() {
            if (video.duration && !isNaN(video.duration)) {
                const percent = (video.currentTime / video.duration) * 100 || 0;
                progressFilled.style.width = percent + '%';
                timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
            }
        }

        video.addEventListener('loadedmetadata', updateDurationDisplay);
        video.addEventListener('durationchange', updateDurationDisplay);
        video.addEventListener('canplay', updateDurationDisplay);

        video.addEventListener('timeupdate', () => {
            const percent = (video.currentTime / video.duration) * 100 || 0;
            progressFilled.style.width = percent + '%';
            timeDisplay.textContent = formatTime(video.currentTime) + ' / ' + formatTime(video.duration);
        });

        progressContainer.addEventListener('click', (e) => {
            const rect = progressContainer.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            video.currentTime = pos * video.duration;
        });

        // Speed Select
        speedSelect.addEventListener('change', () => {
            video.playbackRate = parseFloat(speedSelect.value);
        });

        // Picture in Picture
        pipBtn.addEventListener('click', () => {
            if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            } else if (video.requestPictureInPicture) {
                video.requestPictureInPicture();
            }
        });

        // Fullscreen
        fullscreenBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                container.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        });

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'KeyK') {
                e.preventDefault();
                togglePlay();
            } else if (e.code === 'KeyF') {
                e.preventDefault();
                fullscreenBtn.click();
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                muteBtn.click();
            } else if (e.code === 'ArrowRight') {
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
            } else if (e.code === 'ArrowLeft') {
                video.currentTime = Math.max(0, video.currentTime - 5);
            }
        });
    }
</script>
</body>
</html>
