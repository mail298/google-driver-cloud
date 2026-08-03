// C:\Users\ADMIN\Desktop\framework\google-drive\cliend\public\assets\js\portal.js

// Trigger file input dialog
function triggerFileInput() {
    const input = document.getElementById('file-input');
    if (input) input.click();
}

// Handle settings modal visibility
function openSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.add('active');
    }
    if (typeof closeMobileSidebar === 'function') {
        closeMobileSidebar();
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Handle folder modal visibility
function openNewFolderModal() {
    const modal = document.getElementById('folder-modal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('new-folder-name').focus();
    }
}

function closeNewFolderModal() {
    const modal = document.getElementById('folder-modal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('new-folder-name').value = '';
    }
}

let isFolderSubmitting = false;

// Submit folder creation
function submitCreateFolder() {
    if (isFolderSubmitting) return;

    const nameInput = document.getElementById('new-folder-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert('Silakan masukkan nama folder.');
        return;
    }

    const btn = document.querySelector('#folder-modal button.btn-primary') || document.querySelector('#folder-modal button[onclick*="submitCreateFolder"]');
    let origText = '';
    if (btn) {
        origText = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 0.8s linear infinite; vertical-align:middle; margin-right:6px;"></span> Membuat...';
    }

    isFolderSubmitting = true;

    const formData = new FormData();
    formData.append('name', name);
    if (typeof CURRENT_FOLDER_ID !== 'undefined' && CURRENT_FOLDER_ID) {
        formData.append('parentId', CURRENT_FOLDER_ID);
    }

    fetch('/create-folder', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeNewFolderModal();
                window.location.reload();
            } else {
                alert('Gagal membuat folder: ' + data.message);
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    btn.innerHTML = origText;
                }
                isFolderSubmitting = false;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan saat membuat folder.');
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                btn.innerHTML = origText;
            }
            isFolderSubmitting = false;
        });
}

// Helper functions
function formatFileSize(bytes) {
    if (bytes >= 1099511627776) return (bytes / 1099511627776).toFixed(2) + ' TB';
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + ' GB';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return bytes + ' B';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Upload Queue State & Google Drive Style Upload Workflow
let uploadQueueItems = [];
let isUploading = false;
const MAX_BATCH_BYTES = 5 * 1024 * 1024 * 1024; // 5GB limit per batch

let pendingDuplicateFiles = null;
let gdriveQueue = [];
let isGDriveUploading = false;
let isWidgetCollapsed = false;

// Handle file selection (multi-file)
function handleFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    event.target.value = '';

    // Check if any selected file name already exists in current folder
    const existingList = (typeof EXISTING_FILE_NAMES !== 'undefined' && Array.isArray(EXISTING_FILE_NAMES)) ? EXISTING_FILE_NAMES : [];
    const duplicate = fileArray.find(f => existingList.includes(f.name));

    if (duplicate) {
        pendingDuplicateFiles = fileArray;
        if (typeof showToast === 'function') {
            showToast('⚠️ Berkas/gambar "' + duplicate.name + '" sudah ada di folder ini.', 'warning');
        }
        const textEl = document.getElementById('duplicate-filename-text');
        if (textEl) textEl.textContent = duplicate.name;
        const modal = document.getElementById('gdrive-duplicate-modal');
        if (modal) modal.style.display = 'flex';
    } else {
        startGDriveUpload(fileArray, { isReplace: false });
    }
}

function cancelDuplicateUpload() {
    pendingDuplicateFiles = null;
    const modal = document.getElementById('gdrive-duplicate-modal');
    if (modal) modal.style.display = 'none';
}

function confirmDuplicateUpload() {
    const modal = document.getElementById('gdrive-duplicate-modal');
    if (modal) modal.style.display = 'none';

    if (!pendingDuplicateFiles || pendingDuplicateFiles.length === 0) return;

    const selectedOption = document.querySelector('input[name="duplicate_option"]:checked');
    const optionValue = selectedOption ? selectedOption.value : 'replace';

    if (optionValue === 'replace') {
        if (typeof showToast === 'function') {
            showToast('Mengganti berkas dengan versi baru...', 'info');
        }
        startGDriveUpload(pendingDuplicateFiles, { isReplace: true, versionText: 'Versi 2' });
    } else {
        const existingList = (typeof EXISTING_FILE_NAMES !== 'undefined' && Array.isArray(EXISTING_FILE_NAMES)) ? [...EXISTING_FILE_NAMES] : [];
        const processedFiles = pendingDuplicateFiles.map(file => {
            if (existingList.includes(file.name)) {
                const newName = getUniqueFileName(file.name, existingList);
                existingList.push(newName);
                return new File([file], newName, { type: file.type, lastModified: file.lastModified });
            }
            return file;
        });
        if (typeof showToast === 'function') {
            showToast('Menyimpan kedua berkas (nama duplikat baru)...', 'info');
        }
        startGDriveUpload(processedFiles, { isReplace: false });
    }

    pendingDuplicateFiles = null;
}

function getUniqueFileName(originalName, existingNames) {
    if (!existingNames.includes(originalName)) return originalName;
    const dotIndex = originalName.lastIndexOf('.');
    let baseName = originalName;
    let ext = '';
    if (dotIndex !== -1) {
        baseName = originalName.substring(0, dotIndex);
        ext = originalName.substring(dotIndex);
    }
    let counter = 1;
    let newName = baseName + ' (' + counter + ')' + ext;
    while (existingNames.includes(newName)) {
        counter++;
        newName = baseName + ' (' + counter + ')' + ext;
    }
    return newName;
}

function checkStorageQuotaBeforeUpload(files) {
    if (!files || files.length === 0) return true;
    const fileArray = Array.from(files);
    const totalUploadBytes = fileArray.reduce((acc, f) => acc + (f.size || 0), 0);
    const limitBytes = (typeof STORAGE_LIMIT_BYTES !== 'undefined') ? Number(STORAGE_LIMIT_BYTES) : 0;
    const usedBytes = (typeof STORAGE_USED_BYTES !== 'undefined') ? Number(STORAGE_USED_BYTES) : 0;

    if (limitBytes > 0 && (usedBytes + totalUploadBytes) > limitBytes) {
        showQuotaPopupForFiles(fileArray, totalUploadBytes, usedBytes, limitBytes);
        const remaining = Math.max(0, limitBytes - usedBytes);
        if (typeof showToast === 'function') {
            showToast('⚠️ Ruang penyimpanan tidak mencukupi! Sisa kuota: ' + formatFileSize(remaining), 'error');
        }
        return false;
    }
    return true;
}

function startGDriveUpload(files, options) {
    options = options || {};
    if (!checkStorageQuotaBeforeUpload(files)) {
        return;
    }

    const widget = document.getElementById('gdrive-upload-widget');
    if (!widget) return;

    widget.style.display = 'block';
    const body = document.getElementById('gdrive-widget-body');
    if (body) body.style.display = 'block';

    const newItems = Array.from(files).map((file, idx) => ({
        id: gdriveQueue.length + idx,
        file: file,
        name: file.name,
        size: file.size,
        status: 'waiting',
        progress: 0,
        isReplace: !!options.isReplace,
        versionText: options.versionText || (options.isReplace ? 'Versi 2' : '')
    }));

    // Append new items to existing queue instead of replacing
    gdriveQueue = gdriveQueue.concat(newItems);

    renderGDriveWidget();
    if (!isGDriveUploading) {
        processGDriveQueueItem();
    }
}

function renderGDriveWidget() {
    const titleEl = document.getElementById('gdrive-widget-title');
    const statusTextEl = document.getElementById('gdrive-widget-status-text');
    const itemListEl = document.getElementById('gdrive-widget-item-list');
    if (!itemListEl) return;

    const total = gdriveQueue.length;
    const completed = gdriveQueue.filter(i => i.status === 'completed').length;
    const isFinished = (completed === total && total > 0);

    const currentlyUploading = gdriveQueue.find(i => i.status === 'uploading');

    if (titleEl) {
        titleEl.textContent = isFinished ? completed + ' upload selesai' : 'Mengupload ' + total + ' item';
    }
    if (statusTextEl) {
        if (isFinished) {
            statusTextEl.textContent = 'Semua pengunggahan selesai';
        } else if (currentlyUploading) {
            const pct = currentlyUploading.progress || 0;
            statusTextEl.textContent = 'Mengunggah berkas... ' + pct + '%';
        } else {
            statusTextEl.textContent = 'Menyiapkan pengunggahan...';
        }
    }

    let html = '';
    gdriveQueue.forEach((item) => {
        let statusIcon = '';
        let subTextHtml = '';

        if (item.status === 'waiting') {
            statusIcon = '<div style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid #64748b;" title="Menunggu antrean"></div>';
            subTextHtml = '<div style="font-size: 11.5px; color: #94a3b8; margin-top: 2px;">Menunggu antrean...</div>';
        } else if (item.status === 'uploading') {
            if (item.progress >= 100) {
                statusIcon = '<div style="width: 20px; height: 20px; border-radius: 50%; background: #10b981; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 0 10px rgba(16,185,129,0.3);">✓</div>';
                subTextHtml = '<div style="font-size: 11.5px; color: #34d399; margin-top: 2px; font-weight: 500;">✓ Berhasil diunggah (100%)</div>';
            } else {
                statusIcon = '<div style="display:flex; align-items:center; gap:6px;">'
                    + '<span style="font-size:12px; font-weight:700; color:#60a5fa;">' + (item.progress || 0) + '%</span>'
                    + '<div style="width: 18px; height: 18px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.15); border-top: 3px solid #3b82f6; animation: spinRing 0.8s linear infinite;"></div>'
                    + '</div>';

                const loadedStr = formatFileSize(item.loadedBytes || 0);
                const totalStr = formatFileSize(item.totalBytes || item.size || 0);
                subTextHtml = '<div style="margin-top: 4px;">'
                    + '<div style="background: rgba(255,255,255,0.1); height: 5px; border-radius: 10px; overflow: hidden; margin-bottom: 3px;">'
                    + '<div style="background: linear-gradient(90deg, #3b82f6, #60a5fa); height: 100%; width: ' + (item.progress || 0) + '%; transition: width 0.2s ease;"></div>'
                    + '</div>'
                    + '<div style="font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between;">'
                    + '<span>Proses upload: ' + (item.progress || 0) + '%</span>'
                    + '<span>' + loadedStr + ' / ' + totalStr + '</span>'
                    + '</div>'
                    + '</div>';
            }
        } else if (item.status === 'completed') {
            statusIcon = '<div style="width: 20px; height: 20px; border-radius: 50%; background: #10b981; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; box-shadow: 0 0 10px rgba(16,185,129,0.3);">✓</div>';
            subTextHtml = '<div style="font-size: 11.5px; color: #34d399; margin-top: 2px; font-weight: 500;">✓ Berhasil diunggah (' + formatFileSize(item.size || 0) + ')</div>';
        } else if (item.status === 'failed') {
            statusIcon = '<div style="width: 20px; height: 20px; border-radius: 50%; background: #ef4444; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">✕</div>';
            subTextHtml = '<div style="font-size: 11.5px; color: #f87171; margin-top: 2px; line-height: 1.3;" title="' + escapeHtml(item.error || 'Gagal mengunggah') + '">' + escapeHtml(item.error || 'Gagal mengunggah') + '</div>';
        }

        let fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
        if (item.file && item.file.type && item.file.type.startsWith('image/')) {
            fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
        }

        const versionHtml = item.versionText ? '<span style="font-size: 11.5px; color: #94a3b8; background: rgba(255,255,255,0.08); padding: 2px 7px; border-radius: 4px; margin-right: 8px; font-weight: 600;">' + escapeHtml(item.versionText) + '</span>' : '';

        html += '<div style="display: flex; align-items: flex-start; gap: 12px; padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); background: #0f172a;">';
        html += '<div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; margin-top: 2px;">' + fileIcon + '</div>';
        html += '<div style="flex: 1; min-width: 0;">';
        html += '<div style="font-size: 13px; font-weight: 600; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>';
        html += subTextHtml;
        html += '</div>';
        html += '<div style="display: flex; align-items: center; flex-shrink: 0; margin-top: 2px;">';
        html += versionHtml;
        html += statusIcon;
        html += '</div>';
        html += '</div>';
    });

    itemListEl.innerHTML = html;
}

let cachedUploadToken = null;
let cachedUploadTokenAt = 0;
let cachedUploadTokenPromise = null;

async function getUploadToken() {
    const now = Date.now();
    if (cachedUploadToken && now - cachedUploadTokenAt < 8 * 60 * 1000) {
        return cachedUploadToken;
    }
    // Coalesce concurrent token requests into one
    if (cachedUploadTokenPromise) {
        return cachedUploadTokenPromise;
    }
    cachedUploadTokenPromise = fetch('/upload-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
    })
        .then(r => r.json())
        .then(resp => {
            if (resp.success && resp.token) {
                cachedUploadToken = resp.token;
                cachedUploadTokenAt = Date.now();
                return resp.token;
            }
            return null;
        })
        .catch(() => null)
        .finally(() => { cachedUploadTokenPromise = null; });
    return cachedUploadTokenPromise;
}

// Pre-warm token when page loads so first upload is instant
(function prewarmUploadToken() {
    if (typeof UPLOAD_DIRECT_URL !== 'undefined' && UPLOAD_DIRECT_URL) {
        getUploadToken().catch(() => { });
    }
})();

async function getUploadEndpointAsync(fileSizeBytes) {
    if (typeof UPLOAD_DIRECT_URL === 'undefined' || !UPLOAD_DIRECT_URL) {
        return '/upload';
    }
    const threshold = (typeof UPLOAD_DIRECT_THRESHOLD_BYTES !== 'undefined' && UPLOAD_DIRECT_THRESHOLD_BYTES > 0)
        ? UPLOAD_DIRECT_THRESHOLD_BYTES
        : 10 * 1024 * 1024;
    if (fileSizeBytes < threshold) {
        return '/upload';
    }
    const token = await getUploadToken();
    if (!token) {
        return '/upload';
    }
    return UPLOAD_DIRECT_URL + '/upload?upload_token=' + encodeURIComponent(token);
}

async function uploadItemInChunks(item) {
    const chunkSize = 45 * 1024 * 1024; // 45MB chunks (Cloudflare 100MB safe & 3x faster upload speed)
    const totalSize = item.file.size;
    const totalChunks = Math.ceil(totalSize / chunkSize);
    const uploadId = 'up_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

    let token = '';
    if (typeof UPLOAD_DIRECT_URL !== 'undefined' && UPLOAD_DIRECT_URL) {
        token = await getUploadToken();
    }

    for (let i = 0; i < totalChunks; i++) {
        if (item.status === 'cancelled' || item.status === 'failed') return;

        const start = i * chunkSize;
        const end = Math.min(totalSize, start + chunkSize);
        const chunkBlob = item.file.slice(start, end);

        const formData = new FormData();
        formData.append('chunk', chunkBlob, item.file.name);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', i);
        formData.append('totalChunks', totalChunks);
        formData.append('fileName', item.file.name);
        if (typeof CURRENT_FOLDER_ID !== 'undefined' && CURRENT_FOLDER_ID) {
            formData.append('folderId', CURRENT_FOLDER_ID);
        }
        if (item.isReplace) {
            formData.append('replace', '1');
        }
        if (token) {
            formData.append('upload_token', token);
        }

        const chunkResult = await new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            item.xhr = xhr;
            xhr.open('POST', '/upload-chunk', true);

            xhr.upload.onprogress = function (e) {
                if (e.lengthComputable) {
                    const currentChunkLoaded = e.loaded;
                    const accumulatedLoaded = start + currentChunkLoaded;
                    item.loadedBytes = Math.min(accumulatedLoaded, totalSize);
                    item.totalBytes = totalSize;
                    item.progress = Math.round((item.loadedBytes / totalSize) * 100);
                    renderGDriveWidget();
                }
            };

            xhr.onload = function () {
                if (xhr.status === 200) {
                    try {
                        const resp = JSON.parse(xhr.responseText);
                        resolve(resp);
                    } catch (err) {
                        resolve({ success: false, message: 'Respon server tidak valid' });
                    }
                } else {
                    let errMsg = 'Server error HTTP (' + xhr.status + ')';
                    try {
                        const errObj = JSON.parse(xhr.responseText);
                        if (errObj.message) errMsg = errObj.message;
                    } catch (e) { }
                    resolve({ success: false, message: errMsg });
                }
            };

            xhr.onerror = function () {
                resolve({ success: false, message: 'Gagal terhubung ke server (Koneksi terputus)' });
            };

            xhr.send(formData);
        });

        if (!chunkResult.success) {
            item.status = 'failed';
            item.error = chunkResult.message || 'Gagal mengunggah potongan berkas';
            renderGDriveWidget();
            processGDriveQueueItem();
            return;
        }

        if (chunkResult.completed) {
            item.status = 'completed';
            item.progress = 100;
            item.loadedBytes = totalSize;
            if (typeof EXISTING_FILE_NAMES !== 'undefined' && Array.isArray(EXISTING_FILE_NAMES)) {
                if (!EXISTING_FILE_NAMES.includes(item.file.name)) {
                    EXISTING_FILE_NAMES.push(item.file.name);
                }
            }
            if (chunkResult.replaced && typeof showToast === 'function') {
                showToast('Berkas "' + item.file.name + '" telah diganti dengan versi baru', 'success');
            } else if (chunkResult.isDuplicate && typeof showToast === 'function') {
                showToast('Informasi: Berkas "' + item.file.name + '" sudah ada di folder ini', 'warning');
            }
            renderGDriveWidget();
            processGDriveQueueItem();
            return;
        }
    }
}

let isReloadScheduled = false;

async function processGDriveQueueItem() {
    const nextIdx = gdriveQueue.findIndex(item => item.status === 'waiting');

    if (nextIdx === -1) {
        isGDriveUploading = false;
        renderGDriveWidget();
        const hasCompleted = gdriveQueue.some(i => i.status === 'completed');
        const isStillUploading = gdriveQueue.some(i => i.status === 'uploading');
        if (!isStillUploading && hasCompleted && !isReloadScheduled) {
            isReloadScheduled = true;
            setTimeout(function () {
                window.location.reload();
            }, 2500);
        }
        return;
    }

    isGDriveUploading = true;
    const item = gdriveQueue[nextIdx];
    item.status = 'uploading';
    item.progress = 0;
    item.loadedBytes = 0;
    item.totalBytes = item.file.size;
    item.phase = 'uploading';
    renderGDriveWidget();

    // Route files larger than 45MB through Chunked Upload to bypass Cloudflare 100MB request limit
    if (item.file.size > 45 * 1024 * 1024) {
        uploadItemInChunks(item);
        return;
    }

    const formData = new FormData();
    formData.append('file', item.file);
    if (typeof CURRENT_FOLDER_ID !== 'undefined' && CURRENT_FOLDER_ID) {
        formData.append('folderId', CURRENT_FOLDER_ID);
    }
    if (item.isReplace) {
        formData.append('replace', '1');
    }

    // Resolve endpoint asynchronously (gets token via async fetch, not sync XHR)
    const endpoint = await getUploadEndpointAsync(item.file.size);

    const xhr = new XMLHttpRequest();
    item.xhr = xhr;

    xhr.open('POST', endpoint, true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            item.loadedBytes = e.loaded;
            item.totalBytes = e.total;
            item.progress = Math.round((e.loaded / e.total) * 100);
            if (e.loaded >= e.total) {
                item.phase = 'processing';
            } else {
                item.phase = 'uploading';
            }
            renderGDriveWidget();
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    item.status = 'completed';
                    if (typeof EXISTING_FILE_NAMES !== 'undefined' && Array.isArray(EXISTING_FILE_NAMES)) {
                        if (!EXISTING_FILE_NAMES.includes(item.file.name)) {
                            EXISTING_FILE_NAMES.push(item.file.name);
                        }
                    }
                    if (response.replaced && typeof showToast === 'function') {
                        showToast('Berkas "' + item.file.name + '" telah diganti dengan versi baru', 'success');
                    } else if (response.isDuplicate && typeof showToast === 'function') {
                        showToast('Informasi: Berkas "' + item.file.name + '" sudah ada di folder ini', 'warning');
                    }
                } else {
                    item.status = 'failed';
                    item.error = response.message || 'Gagal mengunggah';
                }
            } catch (e) {
                item.status = 'failed';
                item.error = 'Respon server tidak valid';
            }
        } else {
            item.status = 'failed';
            try {
                const errResp = JSON.parse(xhr.responseText);
                item.error = errResp.message || ('Server error (' + xhr.status + ')');
            } catch (e) {
                if (xhr.status === 413) {
                    item.error = 'Ukuran berkas melebihi batas server (HTTP 413 Payload Too Large). Tambahkan flag -d upload_max_filesize=10G -d post_max_size=10G pada server PHP.';
                } else {
                    item.error = 'Server error HTTP (' + xhr.status + ')';
                }
            }
        }
        renderGDriveWidget();
        processGDriveQueueItem();
    };

    xhr.onerror = function () {
        item.status = 'failed';
        item.error = 'Gagal terhubung ke server/CDN (Koneksi terputus)';
        renderGDriveWidget();
        processGDriveQueueItem();
    };

    xhr.send(formData);
}

function toggleUploadWidgetCollapse() {
    const body = document.getElementById('gdrive-widget-body');
    const btn = document.getElementById('btn-widget-toggle');
    if (!body) return;

    isWidgetCollapsed = !isWidgetCollapsed;
    if (isWidgetCollapsed) {
        body.style.display = 'none';
        if (btn) btn.style.transform = 'rotate(180deg)';
    } else {
        body.style.display = 'block';
        if (btn) btn.style.transform = 'rotate(0deg)';
    }
}

function closeUploadWidget() {
    const widget = document.getElementById('gdrive-upload-widget');
    if (widget) widget.style.display = 'none';
    if (!isGDriveUploading && gdriveQueue.some(i => i.status === 'completed')) {
        window.location.reload();
    }
}

function cancelUploadWidgetQueue() {
    gdriveQueue.forEach(item => {
        if (item.status === 'uploading' && item.xhr) {
            try { item.xhr.abort(); } catch (e) { }
        }
    });
    gdriveQueue = [];
    isGDriveUploading = false;
    closeUploadWidget();
}

// Render queue list
function renderUploadQueue() {
    const list = document.getElementById('upload-queue-list');
    if (!list) return;

    if (uploadQueueItems.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:36px 20px; color:#94a3b8; font-size:13px; display:flex; flex-direction:column; align-items:center; gap:8px;"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg><span>Tidak ada berkas dipilih.</span></div>';
        var btn = document.getElementById('btn-upload-start');
        if (btn) {
            btn.disabled = true;
            btn.onclick = startUploadQueue;
            btn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
            btn.textContent = 'Upload Terpilih';
        }
        var headerCount = document.getElementById('queue-header-count');
        if (headerCount) headerCount.textContent = 'Tidak ada berkas';
        const summary = document.getElementById('upload-queue-summary');
        if (summary) summary.style.display = 'none';
        return;
    }

    var headerCount = document.getElementById('queue-header-count');
    if (headerCount) headerCount.textContent = uploadQueueItems.length + ' berkas dipilih';

    let html = '';
    let checkedCount = 0;
    uploadQueueItems.forEach((item, idx) => {
        if (item.checked) checkedCount++;
        const sizeStr = formatFileSize(item.size);
        let statusHtml = '';
        if (item.status === 'waiting') {
            statusHtml = '<span style="background:rgba(255,255,255,0.06); color:#94a3b8; font-size:11px; padding:4px 9px; border-radius:6px; font-weight:600; display:inline-flex; align-items:center; gap:4px;"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Menunggu</span>';
        } else if (item.status === 'uploading') {
            statusHtml = '<div style="display:flex; align-items:center; gap:8px; min-width:120px;"><div class="progress-bar-bg" style="flex:1; background:rgba(255,255,255,0.1); height:6px; border-radius:10px; overflow:hidden;"><div class="progress-bar-fill" style="background:linear-gradient(90deg, #3b82f6, #60a5fa); height:100%; width:' + item.progress + '%; transition: width 0.2s ease;"></div></div><span style="color:#60a5fa; font-size:11px; font-weight:700; min-width:32px; text-align:right;">' + item.progress + '%</span></div>';
        } else if (item.status === 'completed') {
            statusHtml = '<span style="background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(52,211,153,0.3); font-size:11px; padding:4px 10px; border-radius:6px; font-weight:700; display:inline-flex; align-items:center; gap:4px; box-shadow:0 0 10px rgba(52,211,153,0.15);"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Selesai ✓</span>';
        } else if (item.status === 'failed') {
            statusHtml = '<span style="background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); font-size:11px; padding:4px 9px; border-radius:6px; font-weight:700; display:inline-flex; align-items:center; gap:4px;" title="' + escapeHtml(item.error) + '">✕ Gagal</span>';
        }

        // Generate thumbnail based on file type
        var thumbHtml = '';
        if (item.file && item.file.type && item.file.type.startsWith('image/')) {
            try {
                var thumbUrl = URL.createObjectURL(item.file);
                thumbHtml = '<img src="' + thumbUrl + '" alt="" style="width:100%; height:100%; object-fit:cover;">';
            } catch (e) {
                thumbHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
            }
        } else if (item.file && item.file.type && item.file.type.startsWith('video/')) {
            thumbHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>';
        } else if (item.file && item.file.type && item.file.type.startsWith('audio/')) {
            thumbHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
        } else {
            thumbHtml = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
        }

        html += '<div class="upload-queue-item" data-index="' + idx + '" style="display:flex; align-items:center; gap:12px; padding:10px 10px; border-bottom:1px solid rgba(255,255,255,0.05); transition: background 0.15s ease; border-radius: 8px;">';
        html += '<input type="checkbox" class="queue-item-checkbox" data-index="' + idx + '" ' + (item.checked ? 'checked' : '') + ' ' + (item.status === 'uploading' || item.status === 'completed' ? 'disabled' : '') + ' onchange="toggleQueueItem(' + idx + ')" style="accent-color:#3b82f6; cursor:pointer; width:16px; height:16px; flex-shrink:0;">';
        html += '<div class="queue-thumb" style="width:36px; height:36px; border-radius:8px; flex-shrink:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); overflow:hidden;">' + thumbHtml + '</div>';
        html += '<div style="flex:1; min-width:0;">';
        html += '<div class="queue-item-name" style="font-size:13px; font-weight:600; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>';
        html += '<div class="queue-item-size" style="font-size:11px; color:#64748b; margin-top:2px;">' + sizeStr + '</div>';
        html += '</div>';
        html += '<div style="flex-shrink:0; text-align:right;">' + statusHtml + '</div>';
        html += '</div>';
    });
    list.innerHTML = html;

    var totalCheckedBytes = 0;
    uploadQueueItems.forEach(function (item) {
        if (item.checked) totalCheckedBytes += item.size;
    });
    var overBatchLimit = totalCheckedBytes > MAX_BATCH_BYTES;
    var btn = document.getElementById('btn-upload-start');
    if (btn) {
        var completedCount = uploadQueueItems.filter(i => i.checked && i.status === 'completed').length;
        var totalChecked = uploadQueueItems.filter(i => i.checked).length;

        if (completedCount > 0 && completedCount === totalChecked && !isUploading) {
            btn.disabled = false;
            btn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            btn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.4)';
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px; vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg>Selesai & Refresh';
            btn.onclick = function () { window.location.reload(); };
        } else if (overBatchLimit) {
            btn.disabled = true;
            btn.textContent = 'Melebihi batas ' + formatFileSize(MAX_BATCH_BYTES);
        } else if (isUploading) {
            btn.disabled = true;
            btn.textContent = 'Mengunggah...';
        } else {
            btn.disabled = (checkedCount === 0);
            btn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
            btn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            btn.textContent = 'Upload Terpilih (' + checkedCount + ')';
            btn.onclick = startUploadQueue;
        }
    }
}

function toggleQueueItem(index) {
    if (isUploading) return;
    uploadQueueItems[index].checked = !uploadQueueItems[index].checked;
    renderUploadQueue();

    // Re-check batch limit after toggle
    var totalBatchBytes = 0;
    uploadQueueItems.forEach(function (item) {
        if (item.checked) totalBatchBytes += item.size;
    });
    if (totalBatchBytes > MAX_BATCH_BYTES) {
        showBatchSizePopup(totalBatchBytes, MAX_BATCH_BYTES);
    } else {
        closeBatchSizePopup();
    }
}

function selectAllQueueItems() {
    if (isUploading) return;
    uploadQueueItems.forEach(function (item) {
        if (item.status !== 'completed' && item.status !== 'uploading') {
            item.checked = true;
        }
    });
    renderUploadQueue();
}

function deselectAllQueueItems() {
    if (isUploading) return;
    uploadQueueItems.forEach(function (item) {
        if (item.status !== 'completed' && item.status !== 'uploading') {
            item.checked = false;
        }
    });
    renderUploadQueue();
}

function openUploadQueue() {
    const modal = document.getElementById('upload-queue-modal');
    if (modal) modal.classList.add('active');
    renderUploadQueue();
}

function closeUploadQueue() {
    if (isUploading) return;
    const modal = document.getElementById('upload-queue-modal');
    if (modal) modal.classList.remove('active');
    closeBatchSizePopup();
    if (!isUploading) {
        uploadQueueItems = [];
        renderUploadQueue();
    }
}

// Start sequential upload queue
function startUploadQueue() {
    if (isUploading) return;

    // Re-check batch 5GB limit before starting
    var totalBatchBytes = 0;
    uploadQueueItems.forEach(function (item) {
        if (item.checked) totalBatchBytes += item.size;
    });
    if (totalBatchBytes > MAX_BATCH_BYTES) {
        showBatchSizePopup(totalBatchBytes, MAX_BATCH_BYTES);
        return;
    }

    const checked = uploadQueueItems.filter(i => i.checked && i.status !== 'completed');
    if (checked.length === 0) return;

    isUploading = true;
    const summary = document.getElementById('upload-queue-summary');
    if (summary) {
        summary.style.display = 'block';
        summary.innerHTML = '<div class="progress-bar-bg" style="background: rgba(255,255,255,0.08); height: 6px; border-radius: 10px; overflow: hidden; margin-bottom: 8px;">' +
            '<div class="progress-bar-fill" id="queue-progress-fill" style="background: linear-gradient(90deg, #3b82f6, #10b981); height: 100%; width: 0%; transition: width 0.3s ease;"></div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 10px;">' +
            '<span id="queue-status-text">0 / 0 selesai</span>' +
            '<span id="queue-percent-text" style="font-weight: 700; color: #60a5fa;">0%</span>' +
            '</div>';
    }

    const btn = document.getElementById('btn-upload-start');
    if (btn) {
        btn.textContent = 'Mengunggah...';
        btn.disabled = true;
    }

    updateQueueSummary();
    processQueueItem(0);
}

function updateQueueSummary() {
    const total = uploadQueueItems.filter(i => i.checked).length;
    const done = uploadQueueItems.filter(i => i.checked && i.status === 'completed').length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const statusText = document.getElementById('queue-status-text');
    if (statusText) statusText.textContent = done + ' / ' + total + ' selesai';
    const percentText = document.getElementById('queue-percent-text');
    if (percentText) percentText.textContent = pct + '%';
    const fill = document.getElementById('queue-progress-fill');
    if (fill) fill.style.width = pct + '%';
}

function processQueueItem(idx) {
    // Find next checked item that's not completed
    while (idx < uploadQueueItems.length) {
        const item = uploadQueueItems[idx];
        if (item.checked && item.status !== 'completed') {
            break;
        }
        idx++;
    }

    if (idx >= uploadQueueItems.length) {
        isUploading = false;
        updateQueueSummary();
        renderUploadQueue();

        const completedCount = uploadQueueItems.filter(i => i.checked && i.status === 'completed').length;
        const totalChecked = uploadQueueItems.filter(i => i.checked).length;
        if (completedCount > 0 && completedCount === totalChecked) {
            const summary = document.getElementById('upload-queue-summary');
            if (summary) {
                summary.innerHTML = '<div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(5, 150, 105, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 12px; padding: 12px 14px; margin-top: 10px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15); animate: fadeIn 0.3s ease;">' +
                    '<div style="background: rgba(16, 185, 129, 0.25); border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: #34d399;">' +
                    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>' +
                    '</div>' +
                    '<div style="flex: 1;">' +
                    '<div style="font-size: 13.5px; font-weight: 700; color: #34d399;">Pengunggahan Selesai!</div>' +
                    '<div style="font-size: 11.5px; color: #a7f3d0; margin-top: 1px;">' + completedCount + ' berkas telah tersimpan dengan aman di folder Google Drive Anda.</div>' +
                    '</div>' +
                    '</div>';
            }
        }
        return;
    }

    const item = uploadQueueItems[idx];
    item.status = 'uploading';
    item.progress = 0;
    renderUploadQueue();

    uploadFileObject(item.file, function (pct) {
        item.progress = pct;
        updateQueueSummary();
        const el = document.querySelector('.upload-queue-item[data-index="' + idx + '"]');
        if (el) {
            const statusCell = el.querySelector('div:last-child');
            if (statusCell) {
                statusCell.innerHTML = '<div style="display:flex; align-items:center; gap:8px; min-width:120px;"><div class="progress-bar-bg" style="flex:1; background:rgba(255,255,255,0.1); height:6px; border-radius:10px; overflow:hidden;"><div class="progress-bar-fill" style="background:linear-gradient(90deg, #3b82f6, #60a5fa); height:100%; width:' + pct + '%; transition: width 0.2s ease;"></div></div><span style="color:#60a5fa; font-size:11px; font-weight:700; min-width:32px; text-align:right;">' + pct + '%</span></div>';
            }
        }
    }, function (success, errorMsg) {
        if (success) {
            item.status = 'completed';
            item.progress = 100;
        } else {
            item.status = 'failed';
            item.error = errorMsg || 'Unknown error';

            // Check if failure is due to quota
            if (errorMsg && (errorMsg.toLowerCase().includes('kuota') || errorMsg.toLowerCase().includes('quota') || errorMsg.toLowerCase().includes('melebihi sisa'))) {
                // Show quota popup with remaining failed items
                const remaining = uploadQueueItems.slice(idx).filter(i => i.checked && i.status !== 'completed');
                showQuotaPopup(remaining);
                // Mark remaining as failed too
                remaining.forEach(r => { r.status = 'failed'; r.error = 'Kuota tidak mencukupi'; });
                isUploading = false;
                renderUploadQueue();
                updateQueueSummary();
                return;
            }
        }
        renderUploadQueue();
        updateQueueSummary();
        processQueueItem(idx + 1);
    });
}

// Core File Upload Function with callbacks
function uploadFileObject(file, onProgress, onComplete) {
    const formData = new FormData();
    formData.append('file', file);
    if (typeof CURRENT_FOLDER_ID !== 'undefined' && CURRENT_FOLDER_ID) {
        formData.append('folderId', CURRENT_FOLDER_ID);
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', getUploadEndpoint(file.size), true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && onProgress) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            onProgress(percentComplete);
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    if (onComplete) onComplete(true, '');
                } else {
                    if (onComplete) onComplete(false, response.message || 'Gagal mengunggah');
                }
            } catch (e) {
                if (onComplete) onComplete(false, 'Respons pengunggahan tidak valid.');
            }
        } else {
            if (onComplete) onComplete(false, 'Kode status ' + xhr.status);
        }
    };

    xhr.onerror = function () {
        if (onComplete) onComplete(false, 'Kesalahan koneksi.');
    };

    xhr.send(formData);
}

// Batch size exceeded popup (5GB limit)
function showBatchSizePopup(totalBytes, maxBytes) {
    const modal = document.getElementById('batch-size-popup-modal');
    const totalEl = document.getElementById('batch-total-size');
    const maxEl = document.getElementById('batch-max-size');
    if (!modal) return;
    if (totalEl) totalEl.textContent = formatFileSize(totalBytes);
    if (maxEl) maxEl.textContent = formatFileSize(maxBytes);
    modal.classList.add('active');
}

function closeBatchSizePopup() {
    const modal = document.getElementById('batch-size-popup-modal');
    if (modal) modal.classList.remove('active');
}

// Quota Exceeded Popup Modal Handler
function showQuotaPopupForFiles(files, totalUploadBytes, usedBytes, limitBytes) {
    const modal = document.getElementById('quota-popup-modal');
    const infoBox = document.getElementById('quota-info-box');
    const list = document.getElementById('quota-failed-list');
    if (!modal) return;

    totalUploadBytes = totalUploadBytes || files.reduce((sum, f) => sum + (f.size || f.sizeBytes || 0), 0);
    usedBytes = (usedBytes !== undefined) ? usedBytes : ((typeof STORAGE_USED_BYTES !== 'undefined') ? Number(STORAGE_USED_BYTES) : 0);
    limitBytes = (limitBytes !== undefined) ? limitBytes : ((typeof STORAGE_LIMIT_BYTES !== 'undefined') ? Number(STORAGE_LIMIT_BYTES) : 0);

    const remainingBytes = Math.max(0, limitBytes - usedBytes);
    const limitGb = (limitBytes / (1024 * 1024 * 1024)).toFixed(1);

    if (infoBox) {
        let shortageHtml = '';
        if (totalUploadBytes > remainingBytes) {
            shortageHtml = '<div style="color: #ef4444; font-weight: 700; margin-top: 2px;"><strong>Kekurangan Ruang:</strong> ' + formatFileSize(totalUploadBytes - remainingBytes) + '</div>';
        }
        infoBox.innerHTML = '<div><strong>Total Ukuran Berkas:</strong> ' + formatFileSize(totalUploadBytes) + '</div>' +
            '<div><strong>Sisa Kapasitas Storage:</strong> ' + formatFileSize(remainingBytes) + ' (Limit Admin: ' + limitGb + ' GB)</div>' +
            shortageHtml;
    }

    if (list) {
        let html = '';
        files.forEach(file => {
            const name = file.name || file.fileName || 'Berkas';
            const sz = file.size || file.sizeBytes || 0;
            html += '<div style="padding: 5px 0; display:flex; justify-content:space-between; gap:10px; border-bottom: 1px dashed rgba(255,255,255,0.08);">';
            html += '<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#f8fafc; font-weight:500;">' + escapeHtml(name) + '</span>';
            html += '<span style="flex-shrink:0; font-family:monospace; color:#fca5a5; font-weight:700;">' + formatFileSize(sz) + '</span>';
            html += '</div>';
        });
        list.innerHTML = html;
    }

    modal.style.display = 'flex';
}

function showQuotaPopup(failedItems) {
    const totalUpload = (failedItems || []).reduce((acc, i) => acc + (i.size || 0), 0);
    showQuotaPopupForFiles(failedItems || [], totalUpload);
}

function closeQuotaPopup() {
    const modal = document.getElementById('quota-popup-modal');
    if (modal) modal.style.display = 'none';
}

// ─────────────────────────────────────────────────────────────────────
// Full Screen Drag & Drop File Upload Handlers
// Allows users to drag and drop files anywhere on the browser window.
// ─────────────────────────────────────────────────────────────────────
let dragCounter = 0;

window.addEventListener('dragenter', function (e) {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        const overlay = document.getElementById('drag-overlay');
        if (overlay) overlay.classList.add('active');
    }
});

window.addEventListener('dragover', function (e) {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
    }
});

window.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
        dragCounter = 0;
        const overlay = document.getElementById('drag-overlay');
        if (overlay) overlay.classList.remove('active');
    }
});

window.addEventListener('drop', function (e) {
    e.preventDefault();
    dragCounter = 0;
    const overlay = document.getElementById('drag-overlay');
    if (overlay) overlay.classList.remove('active');

    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (files && files.length > 0) {
        processDroppedFiles(files);
    }
});

function processDroppedFiles(files) {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    const existingList = (typeof EXISTING_FILE_NAMES !== 'undefined' && Array.isArray(EXISTING_FILE_NAMES)) ? EXISTING_FILE_NAMES : [];
    const duplicate = fileArray.find(f => existingList.includes(f.name));

    if (duplicate) {
        pendingDuplicateFiles = fileArray;
        if (typeof showToast === 'function') {
            showToast('⚠️ Berkas/gambar "' + duplicate.name + '" sudah ada di folder ini.', 'warning');
        }
        const textEl = document.getElementById('duplicate-filename-text');
        if (textEl) textEl.textContent = duplicate.name;
        const modal = document.getElementById('gdrive-duplicate-modal');
        if (modal) modal.style.display = 'flex';
    } else {
        startGDriveUpload(fileArray, { isReplace: false });
    }
}

// File Preview Handling
function previewFile(id, name, mimeType) {
    const modal = document.getElementById('preview-modal');
    const title = document.getElementById('preview-title');
    const content = document.getElementById('preview-content');
    const downloadBtn = document.getElementById('preview-download-btn');

    if (!modal || !title || !content || !downloadBtn) return;

    title.innerText = name;
    downloadBtn.href = `/download?id=${id}`;
    content.innerHTML = '';

    const previewUrl = `/download?id=${id}&inline=1`;

    if (mimeType.startsWith('image/')) {
        content.innerHTML = `<img src="${previewUrl}" style="max-width: 100%; max-height: 65vh; border-radius: 8px; object-fit: contain;">`;
    } else if (mimeType.startsWith('video/')) {
        content.innerHTML = `<video src="${previewUrl}" controls autoplay playsinline style="width: 100%; max-height: 65vh; border-radius: 12px; object-fit: contain; background: #000; outline: none; box-shadow: 0 8px 24px rgba(0,0,0,0.5);"></video>`;
    } else if (mimeType.startsWith('audio/')) {
        content.innerHTML = `<audio src="${previewUrl}" controls autoplay style="width: 90%; max-width: 480px; outline: none;"></audio>`;
    } else if (mimeType === 'application/pdf' || name.toLowerCase().endsWith('.pdf')) {
        content.innerHTML = `<iframe src="${previewUrl}" style="width: 100%; height: 500px; border: none; border-radius: 8px; background: #fff;"></iframe>`;
    } else {
        content.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 12px;">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Pratinjau langsung tidak tersedia untuk format berkas ini.</p>
                <p style="font-size: 12px; color: var(--accent-primary); font-weight: 600;">${mimeType}</p>
                <a href="${downloadBtn.href}" class="btn-action btn-primary" style="display: inline-block; margin-top: 12px; text-decoration: none; padding: 8px 16px; border-radius: 8px;">Unduh Berkas</a>
            </div>
        `;
    }

    modal.classList.add('active');
}

function closePreviewModal() {
    const modal = document.getElementById('preview-modal');
    const content = document.getElementById('preview-content');
    if (content) content.innerHTML = '';
    if (modal) modal.classList.remove('active');
}

// Mobile Sidebar Toggle
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
}

function closeMobileSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
}

// View Mode Toggle (Grid vs List)
function setViewMode(mode) {
    localStorage.setItem('portal_view_mode', mode);
    const gridView = document.getElementById('grid-view-container');
    const listView = document.getElementById('list-view-container');
    const btnGrid = document.getElementById('view-mode-grid');
    const btnList = document.getElementById('view-mode-list');

    if (mode === 'list') {
        if (gridView) gridView.style.display = 'none';
        if (listView) listView.style.display = 'block';
        if (btnGrid) btnGrid.classList.remove('active');
        if (btnList) btnList.classList.add('active');
    } else {
        if (gridView) gridView.style.display = 'grid';
        if (listView) listView.style.display = 'none';
        if (btnGrid) btnGrid.classList.add('active');
        if (btnList) btnList.classList.remove('active');
    }
}

// Initialize View Mode on Load
document.addEventListener('DOMContentLoaded', function () {
    const savedMode = localStorage.getItem('portal_view_mode') || 'grid';
    setViewMode(savedMode);
});

// Floating Context Menu
let activeContextItem = null;

function openContextMenu(e, item) {
    e.preventDefault();
    e.stopPropagation();

    activeContextItem = item;
    const popup = document.getElementById('context-menu-popup');
    const badge = document.getElementById('cm-badge');
    const title = document.getElementById('cm-title');
    const size = document.getElementById('cm-size');
    const folder = document.getElementById('cm-folder');

    if (!popup) return;

    if (badge) {
        badge.innerText = item.kindBadge || (item.type === 'folder' ? 'FOL' : 'DOC');
        badge.className = 'cm-header-badge ' + (item.badgeClass || 'badge-doc');
    }
    if (title) title.innerText = item.name;
    if (size) size.innerText = item.sizeFormatted || '-';
    if (folder) folder.innerText = '📁 ' + (item.folderName || 'Root');

    // Show/hide preview, download & video embed buttons
    const previewBtn = document.getElementById('cm-btn-preview');
    const downloadBtn = document.getElementById('cm-btn-download');
    const copyLinkBtn = document.getElementById('cm-btn-copylink');
    const embedBtn = document.getElementById('cm-btn-embed');

    const isVideo = item.kindBadge === 'VID' || item.badgeClass === 'badge-video' || (item.mimeType && item.mimeType.indexOf('video/') === 0);

    if (item.type === 'folder') {
        if (previewBtn) previewBtn.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (copyLinkBtn) copyLinkBtn.style.display = 'none';
        if (embedBtn) embedBtn.style.display = 'none';
    } else {
        if (previewBtn) previewBtn.style.display = 'flex';
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (copyLinkBtn) copyLinkBtn.style.display = 'flex';
        if (embedBtn) embedBtn.style.display = isVideo ? 'flex' : 'none';
    }

    popup.classList.add('active');

    // Responsive position: bottom sheet on mobile (< 640px), floating popover on desktop
    if (window.innerWidth >= 640) {
        const x = e.clientX || (e.target.getBoundingClientRect().right - 220);
        const y = e.clientY || (e.target.getBoundingClientRect().bottom + 10);
        const safeX = Math.max(12, Math.min(x, window.innerWidth - 250));
        const safeY = Math.max(12, Math.min(y, window.innerHeight - 420));

        popup.style.left = safeX + 'px';
        popup.style.top = safeY + 'px';
        popup.style.bottom = 'auto';
        popup.style.right = 'auto';
        popup.style.width = '240px';
    } else {
        popup.style.left = '12px';
        popup.style.right = '12px';
        popup.style.bottom = '12px';
        popup.style.top = 'auto';
        popup.style.width = 'calc(100% - 24px)';
    }
}

function closeContextMenu() {
    const popup = document.getElementById('context-menu-popup');
    if (popup) popup.classList.remove('active');
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('#context-menu-popup')) {
        closeContextMenu();
    }
});

// Context Menu Action Handlers
function cmActionPreview() {
    closeContextMenu();
    if (activeContextItem && activeContextItem.type === 'file') {
        previewFile(activeContextItem.id, activeContextItem.name, activeContextItem.mimeType);
    }
}

function cmActionDownload() {
    closeContextMenu();
    if (activeContextItem && activeContextItem.type === 'file') {
        window.location.href = `/download?id=${activeContextItem.id}`;
    }
}

function cmActionRename() {
    closeContextMenu();
    if (activeContextItem) {
        openRenameModal(activeContextItem.type, activeContextItem.id, activeContextItem.name);
    }
}

function cmActionEmbedVideo() {
    closeContextMenu();
    if (activeContextItem && activeContextItem.id) {
        openVideoEmbedModal(activeContextItem.id, activeContextItem.name);
    }
}

function cmActionMove() {
    closeContextMenu();
    if (activeContextItem) {
        openMoveModal(activeContextItem.type, activeContextItem.id, activeContextItem.name);
    }
}

function cmActionDetails() {
    closeContextMenu();
    if (activeContextItem) {
        openDetailsModal(activeContextItem);
    }
}

function showToast(message, type = 'success') {
    let toast = document.getElementById('portal-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'portal-toast';
        toast.className = 'portal-toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `
        <div class="toast-content ${type}">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <span>${message}</span>
        </div>
    `;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                resolve();
            } else {
                reject(new Error("Copy command failed"));
            }
        } catch (err) {
            reject(err);
        }
    });
}

function cmActionCopyLink() {
    closeContextMenu();
    if (activeContextItem) {
        const link = window.location.origin + (activeContextItem.type === 'file' ? `/share?id=${encodeURIComponent(activeContextItem.id)}` : `/?folderId=${encodeURIComponent(activeContextItem.id)}`);
        copyToClipboard(link).then(() => {
            showToast('Tautan berhasil disalin');
        }).catch(() => {
            prompt('Salin tautan:', link);
        });
    }
}

function cmActionInvite() {
    closeContextMenu();
    const inviteLink = window.location.origin;
    copyToClipboard(inviteLink).then(() => {
        showToast('Tautan Undangan Portal berhasil disalin');
    }).catch(() => {
        prompt('Tautan Portal:', inviteLink);
    });
}

function cmActionDelete() {
    closeContextMenu();
    if (activeContextItem) {
        openDeleteModal(activeContextItem.type, activeContextItem.id, activeContextItem.name);
    }
}

// Move Item Modal Logic (Single & Batch)
let currentMoveItem = { type: '', id: '', name: '' };
let isBatchMoveMode = false;

function loadMoveTargetFolders(disabledIds) {
    return fetch('/folders')
        .then(res => res.json())
        .then(data => {
            const selectEl = document.getElementById('move-target-folder');
            if (!selectEl) return [];
            if (!data.success) return [];

            const folders = data.folders || [];
            const disabledSet = new Set(disabledIds || []);
            const activeFolderId = (typeof CURRENT_FOLDER_ID !== 'undefined') ? CURRENT_FOLDER_ID : null;

            selectEl.innerHTML = '';
            const rootOpt = document.createElement('option');
            rootOpt.value = '';
            rootOpt.textContent = '\u{1F4C1} Root / Utama';
            selectEl.appendChild(rootOpt);

            folders.forEach(f => {
                if (activeFolderId && (f.id === activeFolderId || (f.provider_folder_id && f.provider_folder_id === activeFolderId))) {
                    return;
                }
                const opt = document.createElement('option');
                opt.value = f.id;
                opt.textContent = '\u{1F4C1} ' + f.name;
                if (disabledSet.has(f.id)) {
                    opt.disabled = true;
                }
                selectEl.appendChild(opt);
            });
            selectEl.value = '';
            return folders;
        })
        .catch(() => {
            return [];
        });
}

function openMoveModal(type, id, name) {
    isBatchMoveMode = false;
    currentMoveItem = { type, id, name };
    const modal = document.getElementById('move-modal');
    const nameEl = document.getElementById('move-item-name');
    const selectEl = document.getElementById('move-target-folder');

    if (nameEl) nameEl.innerText = name;

    const disabledIds = (type === 'folder') ? [id] : [];
    loadMoveTargetFolders(disabledIds).then(() => {
        if (selectEl) selectEl.value = '';
    });
    if (modal) modal.classList.add('active');
}

function openBatchMoveModal() {
    const selected = getSelectedItems();
    if (selected.length === 0) {
        alert('Pilih setidaknya satu berkas atau folder untuk dipindahkan.');
        return;
    }

    isBatchMoveMode = true;
    const modal = document.getElementById('move-modal');
    const nameEl = document.getElementById('move-item-name');
    const selectEl = document.getElementById('move-target-folder');

    if (nameEl) nameEl.innerText = selected.length + ' item terpilih';

    const selectedFolderIds = selected.filter(i => i.type === 'folder').map(i => i.id);
    loadMoveTargetFolders(selectedFolderIds).then(() => {
        if (selectEl) selectEl.value = '';
    });
    if (modal) modal.classList.add('active');
}

function closeMoveModal() {
    const modal = document.getElementById('move-modal');
    if (modal) modal.classList.remove('active');
}

let isMoveSubmitting = false;
function submitMoveItem() {
    if (isMoveSubmitting) return;
    const targetFolderSelect = document.getElementById('move-target-folder');
    if (!targetFolderSelect) return;

    const btn = document.querySelector('#move-modal button[onclick*="submitMoveItem"]');
    let origText = '';
    if (btn) {
        origText = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 0.8s linear infinite; vertical-align:middle; margin-right:6px;"></span> Memindahkan...';
    }
    isMoveSubmitting = true;

    const targetFolderId = targetFolderSelect.value;

    if (isBatchMoveMode) {
        const selectedItems = getSelectedItems();
        if (selectedItems.length === 0) {
            alert('Tidak ada item yang dipilih.');
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
            isMoveSubmitting = false;
            return;
        }

        const formData = new FormData();
        formData.append('items', JSON.stringify(selectedItems));
        formData.append('targetFolderId', targetFolderId);

        fetch('/batch-move', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Gagal memindahkan item: ' + (data.message || 'Terjadi kesalahan.'));
                    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                    isMoveSubmitting = false;
                }
            })
            .catch(err => {
                alert('Gagal terhubung ke server.');
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                isMoveSubmitting = false;
            });
    } else {
        const formData = new FormData();
        formData.append('type', currentMoveItem.type);
        formData.append('id', currentMoveItem.id);
        formData.append('targetFolderId', targetFolderId);

        fetch('/move-item', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Gagal memindahkan item: ' + (data.message || 'Terjadi kesalahan.'));
                    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                    isMoveSubmitting = false;
                }
            })
            .catch(err => {
                alert('Gagal terhubung ke server.');
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                isMoveSubmitting = false;
            });
    }
}

// Drag & Drop Items to Move into Folder Logic
let draggedMoveItem = null;
let draggedBatchItems = [];

function initDragAndDropMove() {
    const draggables = document.querySelectorAll('.item-card-modern[draggable="true"], .portal-table tbody tr[draggable="true"]');

    draggables.forEach(el => {
        el.addEventListener('dragstart', function (e) {
            if (!e.dataTransfer) return;

            const type = el.getAttribute('data-type');
            const id = el.getAttribute('data-id');
            const name = el.getAttribute('data-name');
            if (!type || !id) return;

            draggedMoveItem = { type, id, name };

            const selected = getSelectedItems();
            const isItemInSelected = selected.some(s => s.id === id);

            if (selected.length > 0 && isItemInSelected) {
                draggedBatchItems = selected;
            } else {
                draggedBatchItems = [draggedMoveItem];
            }

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', JSON.stringify(draggedBatchItems));

            el.classList.add('is-dragging');
            e.stopPropagation();
        });

        el.addEventListener('dragend', function (e) {
            el.classList.remove('is-dragging');
            document.querySelectorAll('.drop-target-hover').forEach(t => t.classList.remove('drop-target-hover'));
            draggedMoveItem = null;
            draggedBatchItems = [];
        });
    });

    const dropTargets = document.querySelectorAll('.drop-target-folder, .drop-target-crumb');
    dropTargets.forEach(target => {
        target.addEventListener('dragover', function (e) {
            if (!draggedMoveItem && draggedBatchItems.length === 0) return;

            const targetFolderId = target.getAttribute('data-id') !== null ? target.getAttribute('data-id') : target.getAttribute('data-folder-id');

            if (draggedMoveItem && draggedMoveItem.type === 'folder' && draggedMoveItem.id === targetFolderId) {
                return;
            }

            if (draggedBatchItems.some(i => i.type === 'folder' && i.id === targetFolderId)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            target.classList.add('drop-target-hover');
        });

        target.addEventListener('dragleave', function (e) {
            target.classList.remove('drop-target-hover');
        });

        target.addEventListener('drop', function (e) {
            target.classList.remove('drop-target-hover');
            if (!draggedMoveItem && draggedBatchItems.length === 0) return;

            e.preventDefault();
            e.stopPropagation();

            const targetFolderId = target.getAttribute('data-id') !== null ? target.getAttribute('data-id') : target.getAttribute('data-folder-id');

            const itemsToMove = draggedBatchItems.length > 0 ? draggedBatchItems : [draggedMoveItem];
            const validItems = itemsToMove.filter(i => !(i.type === 'folder' && i.id === targetFolderId));
            if (validItems.length === 0) return;

            executeDragMove(validItems, targetFolderId);
        });
    });
}

function executeDragMove(items, targetFolderId) {
    if (!items || items.length === 0) return;

    if (items.length === 1) {
        const formData = new FormData();
        formData.append('type', items[0].type);
        formData.append('id', items[0].id);
        formData.append('targetFolderId', targetFolderId || '');

        fetch('/move-item', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Gagal memindahkan item: ' + (data.message || 'Terjadi kesalahan.'));
                }
            })
            .catch(err => {
                alert('Gagal terhubung ke server.');
            });
    } else {
        const formData = new FormData();
        formData.append('items', JSON.stringify(items));
        formData.append('targetFolderId', targetFolderId || '');

        fetch('/batch-move', {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Gagal memindahkan item: ' + (data.message || 'Terjadi kesalahan.'));
                }
            })
            .catch(err => {
                alert('Gagal terhubung ke server.');
            });
    }
}

// Details Modal Logic
function openDetailsModal(item) {
    const modal = document.getElementById('details-modal');
    const nameEl = document.getElementById('det-name');
    const typeEl = document.getElementById('det-type');
    const sizeEl = document.getElementById('det-size');
    const folderEl = document.getElementById('det-folder');

    if (nameEl) nameEl.innerText = item.name;
    if (typeEl) typeEl.innerText = item.mimeType || (item.type === 'folder' ? 'Folder Dokumen' : 'File');
    if (sizeEl) sizeEl.innerText = item.sizeFormatted || '-';
    if (folderEl) folderEl.innerText = item.folderName || 'Utama';

    if (modal) modal.classList.add('active');
}

function closeDetailsModal() {
    const modal = document.getElementById('details-modal');
    if (modal) modal.classList.remove('active');
}

// Rename Modal Handling
let currentRenameItem = { type: '', id: '', name: '' };

function openRenameModal(type, id, currentName) {
    currentRenameItem = { type, id, name: currentName };
    const modal = document.getElementById('rename-modal');
    const title = document.getElementById('rename-modal-title');
    const input = document.getElementById('rename-item-name');

    if (modal && input) {
        if (title) title.innerText = type === 'folder' ? 'Ubah Nama Folder' : 'Ubah Nama Berkas';
        input.value = currentName;
        modal.classList.add('active');
        setTimeout(() => input.focus(), 50);
    }
}

function closeRenameModal() {
    const modal = document.getElementById('rename-modal');
    if (modal) modal.classList.remove('active');
}

let isRenameSubmitting = false;
function submitRename() {
    if (isRenameSubmitting) return;
    const input = document.getElementById('rename-item-name');
    const newName = input ? input.value.trim() : '';

    if (!newName) {
        alert('Nama tidak boleh kosong.');
        return;
    }

    if (newName === currentRenameItem.name) {
        closeRenameModal();
        return;
    }

    const btn = document.querySelector('#rename-modal button[onclick*="submitRename"]');
    let origText = '';
    if (btn) {
        origText = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 0.8s linear infinite; vertical-align:middle; margin-right:6px;"></span> Menyimpan...';
    }
    isRenameSubmitting = true;

    const endpoint = currentRenameItem.type === 'folder' ? '/rename-folder' : '/rename-file';
    const formData = new FormData();
    formData.append('id', currentRenameItem.id);
    formData.append('name', newName);

    fetch(endpoint, {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeRenameModal();
                window.location.reload();
            } else {
                alert('Gagal mengubah nama: ' + (data.message || 'Terjadi kesalahan'));
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                isRenameSubmitting = false;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
            isRenameSubmitting = false;
        });
}

// Delete Confirmation Modal Handling
let currentDeleteItem = { type: '', id: '', name: '' };

function openDeleteModal(type, id, name) {
    currentDeleteItem = { type, id, name };
    const modal = document.getElementById('delete-modal');
    const nameEl = document.getElementById('delete-item-name');
    const typeEl = document.getElementById('delete-item-type');

    if (modal) {
        if (nameEl) nameEl.innerText = name;
        if (typeEl) typeEl.innerText = type === 'folder' ? 'folder' : 'berkas';
        modal.classList.add('active');
    }
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('active');
}

let isDeleteSubmitting = false;
function submitDelete() {
    if (isDeleteSubmitting) return;

    const btn = document.querySelector('#delete-modal button[onclick*="submitDelete"]');
    let origText = '';
    if (btn) {
        origText = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 0.8s linear infinite; vertical-align:middle; margin-right:6px;"></span> Menghapus...';
    }
    isDeleteSubmitting = true;

    const endpoint = currentDeleteItem.type === 'folder' ? '/delete-folder' : '/delete-file';
    const formData = new FormData();
    formData.append('id', currentDeleteItem.id);

    fetch(endpoint, {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeDeleteModal();
                window.location.reload();
            } else {
                alert('Gagal menghapus: ' + (data.message || 'Terjadi kesalahan'));
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                isDeleteSubmitting = false;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
            isDeleteSubmitting = false;
        });
}

// Bulk Selection & Batch Delete Logic
function getSelectedItems() {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const itemsMap = new Map();
    checkboxes.forEach(cb => {
        const id = cb.getAttribute('data-id');
        if (id && !itemsMap.has(id)) {
            itemsMap.set(id, {
                type: cb.getAttribute('data-type'),
                id: id,
                name: cb.getAttribute('data-name')
            });
        }
    });
    return Array.from(itemsMap.values());
}

function updateSelectionState(changedCb) {
    const cb = changedCb || (window.event ? window.event.target : null);
    if (cb && cb.getAttribute) {
        const itemId = cb.getAttribute('data-id');
        if (itemId) {
            const isChecked = cb.checked;
            document.querySelectorAll(`.item-checkbox[data-id="${itemId}"]`).forEach(otherCb => {
                otherCb.checked = isChecked;
            });
        }
    }

    const selected = getSelectedItems();
    const allUniqueIds = new Set();
    document.querySelectorAll('.item-checkbox').forEach(c => {
        const id = c.getAttribute('data-id');
        if (id) allUniqueIds.add(id);
    });

    const masterCbs = document.querySelectorAll('#select-all-checkbox, #master-select-all-checkbox');

    masterCbs.forEach(masterCb => {
        if (allUniqueIds.size > 0 && selected.length === allUniqueIds.size) {
            masterCb.checked = true;
            masterCb.indeterminate = false;
        } else if (selected.length > 0) {
            masterCb.checked = false;
            masterCb.indeterminate = true;
        } else {
            masterCb.checked = false;
            masterCb.indeterminate = false;
        }
    });

    const bar = document.getElementById('bulk-action-bar');
    const countText = document.getElementById('bulk-count-text');

    if (bar && countText) {
        if (selected.length > 0) {
            countText.innerText = selected.length + ' item dipilih';
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    }
}

function toggleSelectAll(masterCb) {
    const isChecked = masterCb.checked;
    const checkboxes = document.querySelectorAll('.item-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
    });
    const masterCbs = document.querySelectorAll('#select-all-checkbox, #master-select-all-checkbox');
    masterCbs.forEach(cb => {
        cb.checked = isChecked;
        cb.indeterminate = false;
    });
    updateSelectionState();
}

function deselectAllItems() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const masterCbs = document.querySelectorAll('#select-all-checkbox, #master-select-all-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    masterCbs.forEach(cb => {
        cb.checked = false;
        cb.indeterminate = false;
    });
    updateSelectionState();
}

function downloadSelectedZip() {
    const selectedFileCheckboxes = document.querySelectorAll('.item-checkbox[data-type="file"]:checked');
    if (selectedFileCheckboxes.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Pilih setidaknya satu berkas untuk diunduh sebagai ZIP');
        } else {
            alert('Pilih setidaknya satu berkas untuk diunduh sebagai ZIP');
        }
        return;
    }
    const ids = Array.from(selectedFileCheckboxes).map(cb => cb.getAttribute('data-id'));
    window.location.href = '/client/backup/zip?ids=' + encodeURIComponent(ids.join(','));
}

function openBulkDeleteModal() {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    const modal = document.getElementById('bulk-delete-modal');
    const countEl = document.getElementById('bulk-delete-count');
    if (countEl) countEl.innerText = selected.length;
    if (modal) modal.classList.add('active');
}

function closeBulkDeleteModal() {
    const modal = document.getElementById('bulk-delete-modal');
    if (modal) modal.classList.remove('active');
}

function openDeleteAllModal() {
    const modal = document.getElementById('delete-all-modal');
    if (modal) modal.classList.add('active');
}

function closeDeleteAllModal() {
    const modal = document.getElementById('delete-all-modal');
    if (modal) modal.classList.remove('active');
}

let isDeleteAllSubmitting = false;
function submitDeleteAllFiles() {
    if (isDeleteAllSubmitting) return;

    const btn = document.getElementById('btn-submit-delete-all');
    if (btn) {
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 0.8s linear infinite; vertical-align:middle; margin-right:6px;"></span> Menghapus Semua Data...';
    }
    isDeleteAllSubmitting = true;

    fetch('/delete-all-files', {
        method: 'POST'
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            } else {
                alert(data.message || 'Gagal menghapus semua data');
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'auto';
                    btn.innerHTML = 'Ya, Hapus Semua Data';
                }
                isDeleteAllSubmitting = false;
            }
        })
        .catch(err => {
            alert('Terjadi kesalahan jaringan.');
            if (btn) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
                btn.innerHTML = 'Ya, Hapus Semua Data';
            }
            isDeleteAllSubmitting = false;
        });
}

let isBulkDeleteSubmitting = false;
function submitBulkDelete() {
    if (isBulkDeleteSubmitting) return;
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    const btn = document.querySelector('#bulk-delete-modal button[onclick*="submitBulkDelete"]');
    let origText = '';
    if (btn) {
        origText = btn.innerHTML;
        btn.disabled = true;
        btn.style.opacity = '0.6';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = '<span style="display:inline-block; width:12px; height:12px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spinRing 0.8s linear infinite; vertical-align:middle; margin-right:6px;"></span> Menghapus...';
    }
    isBulkDeleteSubmitting = true;

    const formData = new FormData();
    formData.append('items', JSON.stringify(selected));

    fetch('/batch-delete', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                closeBulkDeleteModal();
                window.location.reload();
            } else {
                alert('Gagal menghapus item: ' + (data.message || 'Terjadi kesalahan'));
                if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
                isBulkDeleteSubmitting = false;
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
            if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; btn.innerHTML = origText; }
            isBulkDeleteSubmitting = false;
        });
}

// Onboarding Guide Feature Announcement Tour Popup Modal
const onboardingSlides = [
    {
        title: '1. Unggah Berkas Chunking & Folder',
        desc: '<div style="display:flex; flex-direction:column; gap:9px; font-size:13px; color:#cbd5e1; line-height:1.5;"><div style="display:flex; gap:6px;"><span>•</span><div><strong>Upload Berkas Besar (Hingga 5GB+)</strong>: Klik <strong>↑ Unggah File</strong> atau seret file ke layar. Berkas dipotong otomatis menjadi <i>chunk 45MB</i> untuk melewati limit Cloudflare 100MB tanpa freeze.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Manajemen Folder</strong>: Klik <strong>📁 Folder Baru</strong> untuk mengelompokkan berkas. Dilengkapi sistem anti-duplikat otomatis.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Widget Upload Real-time</strong>: Pantau progress unggah, kecepatan, dan sisa waktu di pojok kanan bawah.</div></div></div>',
        iconColor: '#f59e0b'
    },
    {
        title: '2. Stream & Embed Video CDN',
        desc: '<div style="display:flex; flex-direction:column; gap:9px; font-size:13px; color:#cbd5e1; line-height:1.5;"><div style="display:flex; gap:6px;"><span>•</span><div><strong>Ambil Kode Embed</strong>: Klik titik tiga <strong>⋮</strong> pada video &rarr; Pilih <strong>Stream & Embed Video (HLS)</strong>.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Pasang di Landing Page</strong>: Salin kode Iframe HTML dan tempelkan ke WordPress, Elementor, atau HTML Landing Page Anda.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Performa Instan (~0ms)</strong>: Video menggunakan <i>4MB Incremental Chunking</i> dengan kecepatan startup <30ms, bebas iklan, tanpa watermark, dan terlindungi Anti-Hotlink.</div></div></div>',
        iconColor: '#3b82f6'
    },
    {
        title: '3. Tautan Gambar CDN White-Label',
        desc: '<div style="display:flex; flex-direction:column; gap:9px; font-size:13px; color:#cbd5e1; line-height:1.5;"><div style="display:flex; gap:6px;"><span>•</span><div><strong>Copy Link 1-Klik</strong>: Klik titik tiga <strong>⋮</strong> pada gambar &rarr; Pilih <strong>Copy Link</strong> untuk menyalin URL kustom <code>clouds.wn-cdn.net/share?id=...</code></div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Integrasi HTML & CSS</strong>: Tempelkan langsung ke tag <code>&lt;img src="..."&gt;</code> atau CSS <code>background-image</code> pada website Anda.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Privasi & Kecepatan High-Speed</strong>: Gambar dimuat instan via ETag 304 Caching tanpa pernah membocorkan domain/akun Google Drive asli Anda.</div></div></div>',
        iconColor: '#10b981'
    },
    {
        title: '4. Pencarian & Navigasi Berkas',
        desc: '<div style="display:flex; flex-direction:column; gap:9px; font-size:13px; color:#cbd5e1; line-height:1.5;"><div style="display:flex; gap:6px;"><span>•</span><div><strong>Kolom Pencarian Fast Filter</strong>: Ketik nama berkas di kolom pencarian atas untuk menyaring data di layar secara langsung.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Pratinjau Berkas (Preview)</strong>: Klik dua kali atau pilih <strong>Preview</strong> untuk membaca PDF, melihat foto, atau memutar media.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Ubah Nama & Pindahkan</strong>: Gunakan opsi <strong>Rename</strong> atau <strong>Move to Folder</strong> untuk merapikan lokasi penyimpanan.</div></div></div>',
        iconColor: '#8b5cf6'
    },
    {
        title: '5. Aksi Massal & Keamanan Akun',
        desc: '<div style="display:flex; flex-direction:column; gap:9px; font-size:13px; color:#cbd5e1; line-height:1.5;"><div style="display:flex; gap:6px;"><span>•</span><div><strong>Seleksi Massal (Bulk Action)</strong>: Centang beberapa berkas sekaligus &rarr; Gunakan baris tombol di bawah untuk <strong>Pindahkan Terpilih</strong> atau <strong>Hapus Terpilih</strong>.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Keamanan Akun</strong>: Klik menu <strong>Pengaturan Akun</strong> di sidebar kiri untuk mengubah password akun Anda kapan saja.</div></div><div style="display:flex; gap:6px;"><span>•</span><div><strong>Pemantau Kuota Storage</strong>: Cek grafik kuota penyimpanan real-time di sidebar kiri untuk memantau kapasitas tersisa.</div></div></div>',
        iconColor: '#ec4899'
    }
];

let currentOnboardingIndex = 0;

function renderOnboardingSlide() {
    const container = document.getElementById('onboarding-slide-container');
    const dotsContainer = document.getElementById('onboarding-dots');
    const prevBtn = document.getElementById('btn-onboarding-prev');
    const nextBtn = document.getElementById('btn-onboarding-next');

    if (!container || !onboardingSlides[currentOnboardingIndex]) return;

    const slide = onboardingSlides[currentOnboardingIndex];
    container.innerHTML = `
        <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #f59e0b; font-family: 'Outfit', sans-serif;">${slide.title}</h3>
        <p style="font-size: 14px; color: #cbd5e1; margin: 0; line-height: 1.6;">${slide.desc}</p>
    `;

    // Render Dots
    if (dotsContainer) {
        let dotsHtml = '';
        onboardingSlides.forEach((_, i) => {
            const active = i === currentOnboardingIndex;
            dotsHtml += `<div style="width: ${active ? '20px' : '8px'}; height: 8px; border-radius: 100px; background: ${active ? '#f59e0b' : 'rgba(255,255,255,0.2)'}; transition: all 0.3s ease;"></div>`;
        });
        dotsContainer.innerHTML = dotsHtml;
    }

    // Prev Button state
    if (prevBtn) {
        if (currentOnboardingIndex === 0) {
            prevBtn.style.opacity = '0.4';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }
    }

    // Next Button text
    if (nextBtn) {
        if (currentOnboardingIndex === onboardingSlides.length - 1) {
            nextBtn.innerText = 'Mengerti';
        } else {
            nextBtn.innerText = 'Lanjut \u2192';
        }
    }
}

function prevOnboardingSlide() {
    if (currentOnboardingIndex > 0) {
        currentOnboardingIndex--;
        renderOnboardingSlide();
    }
}

function nextOnboardingSlide() {
    if (currentOnboardingIndex < onboardingSlides.length - 1) {
        currentOnboardingIndex++;
        renderOnboardingSlide();
    } else {
        closeOnboardingModal();
    }
}

function openOnboardingModalManually() {
    const modal = document.getElementById('onboarding-guide-modal');
    if (modal) {
        currentOnboardingIndex = 0;
        renderOnboardingSlide();
        modal.style.display = 'flex';
        modal.classList.add('active');
    }
}

function closeOnboardingModal() {
    const modal = document.getElementById('onboarding-guide-modal');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
    // Store in sessionStorage so it shows once per new session / tab
    try {
        sessionStorage.setItem('portal_onboarding_seen', 'true');
    } catch (e) { }
}

function checkAutoOnboardingPopup() {
    try {
        const seen = sessionStorage.getItem('portal_onboarding_seen');
        if (!seen) {
            const modal = document.getElementById('onboarding-guide-modal');
            if (modal) {
                currentOnboardingIndex = 0;
                renderOnboardingSlide();
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        }
    } catch (e) { }
}

// Auto-trigger when page completes loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        checkAutoOnboardingPopup();
        initDragAndDropMove();
    });
} else {
    setTimeout(function () {
        checkAutoOnboardingPopup();
        initDragAndDropMove();
    }, 300);
}

// Accidental Refresh & Page Close Warning Listener during Active Uploads
window.addEventListener('beforeunload', function (e) {
    if ((typeof isUploading !== 'undefined' && isUploading) || (typeof isGDriveUploading !== 'undefined' && isGDriveUploading)) {
        const confirmationMessage = 'Proses unggah berkas sedang berlangsung. Jika Anda menyegarkan atau menutup halaman, pengunggahan akan terhenti!';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});

// Video Stream & Embed Modal Helper Functions (BunnyStream / Cloudflare Stream Style)
function openVideoEmbedModal(fileId, fileName) {
    const modal = document.getElementById('video-embed-modal');
    const nameEl = document.getElementById('embed-video-name');
    const videoEl = document.getElementById('embed-player-video');
    const codeEl = document.getElementById('embed-iframe-code');
    const hlsEl = document.getElementById('embed-hls-url');

    if (!modal || !fileId) return;

    const origin = window.location.origin;
    const embedUrl = origin + '/embed/' + encodeURIComponent(fileId);
    const hlsUrl = origin + '/stream/' + encodeURIComponent(fileId) + '/master.m3u8';
    const streamUrl = origin + '/download?id=' + encodeURIComponent(fileId) + '&inline=1';
    const iframeCode = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;

    if (nameEl) nameEl.textContent = fileName || 'Video Stream';
    if (videoEl) {
        videoEl.src = streamUrl;
        videoEl.load();
    }
    if (codeEl) codeEl.value = iframeCode;
    if (hlsEl) hlsEl.value = hlsUrl;

    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.style.opacity = '1';
    modal.style.pointerEvents = 'auto';
    modal.style.visibility = 'visible';
}

function closeVideoEmbedModal() {
    const modal = document.getElementById('video-embed-modal');
    const videoEl = document.getElementById('embed-player-video');
    if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
    }
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        modal.style.opacity = '0';
        modal.style.pointerEvents = 'none';
        modal.style.visibility = 'hidden';
    }
}

function copyInputText(inputId, labelName) {
    const input = document.getElementById(inputId);
    if (!input || !input.value) return;

    input.focus();
    input.select();
    if (input.setSelectionRange) {
        input.setSelectionRange(0, 99999);
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(input.value)
            .then(() => {
                showCopyToast(labelName + ' berhasil disalin ke clipboard!');
            })
            .catch(() => {
                fallbackCopyText(input, labelName);
            });
    } else {
        fallbackCopyText(input, labelName);
    }
}

function fallbackCopyText(input, labelName) {
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyToast(labelName + ' berhasil disalin!');
        } else {
            prompt('Tekan Ctrl+C untuk menyalin ' + labelName + ':', input.value);
        }
    } catch (err) {
        prompt('Tekan Ctrl+C untuk menyalin ' + labelName + ':', input.value);
    }
}

function showCopyToast(msg) {
    if (typeof showToast === 'function') {
        showToast(msg, 'success');
    } else {
        alert(msg);
    }
}

