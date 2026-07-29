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

// Submit folder creation
function submitCreateFolder() {
    const nameInput = document.getElementById('new-folder-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert('Silakan masukkan nama folder.');
        return;
    }

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
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan saat membuat folder.');
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

function startGDriveUpload(files, options) {
    options = options || {};
    const widget = document.getElementById('gdrive-upload-widget');
    if (!widget) return;

    widget.style.display = 'block';
    const body = document.getElementById('gdrive-widget-body');
    if (body) body.style.display = 'block';

    gdriveQueue = files.map((file, idx) => ({
        id: idx,
        file: file,
        name: file.name,
        size: file.size,
        status: 'waiting',
        progress: 0,
        isReplace: !!options.isReplace,
        versionText: options.versionText || (options.isReplace ? 'Versi 2' : '')
    }));

    renderGDriveWidget();
    if (!isGDriveUploading) {
        processGDriveQueueItem(0);
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

    if (titleEl) {
        titleEl.textContent = isFinished ? completed + ' upload selesai' : 'Mengupload ' + total + ' item';
    }
    if (statusTextEl) {
        statusTextEl.textContent = isFinished ? 'Semua pengunggahan selesai' : 'Menyelesaikan upload...';
    }

    let html = '';
    gdriveQueue.forEach((item) => {
        let statusIcon = '';
        if (item.status === 'waiting') {
            statusIcon = '<div style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid #cbd5e1;"></div>';
        } else if (item.status === 'uploading') {
            statusIcon = '<div style="width: 18px; height: 18px; border-radius: 50%; border: 3px solid #e2e8f0; border-top: 3px solid #0b57d0; animation: spinRing 0.8s linear infinite;"></div>';
        } else if (item.status === 'completed') {
            statusIcon = '<div style="width: 20px; height: 20px; border-radius: 50%; background: #1e8e3e; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">✓</div>';
        } else if (item.status === 'failed') {
            statusIcon = '<div style="width: 20px; height: 20px; border-radius: 50%; background: #d93025; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold;">✕</div>';
        }

        let fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5f6368" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>';
        if (item.file && item.file.type && item.file.type.startsWith('image/')) {
            fileIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d93025" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
        }

        const versionHtml = item.versionText ? '<span style="font-size: 12px; color: #5f6368; background: #f1f3f4; padding: 2px 7px; border-radius: 4px; margin-right: 8px; font-weight: 500;">' + escapeHtml(item.versionText) + '</span>' : '';

        html += '<div style="display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid #f1f3f4;">';
        html += '<div style="flex-shrink: 0; display: flex; align-items: center; justify-content: center;">' + fileIcon + '</div>';
        html += '<div style="flex: 1; min-width: 0;">';
        html += '<div style="font-size: 13.5px; font-weight: 500; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="' + escapeHtml(item.name) + '">' + escapeHtml(item.name) + '</div>';
        html += '</div>';
        html += '<div style="display: flex; align-items: center; flex-shrink: 0;">';
        html += versionHtml;
        html += statusIcon;
        html += '</div>';
        html += '</div>';
    });

    itemListEl.innerHTML = html;
}

function processGDriveQueueItem(idx) {
    if (idx >= gdriveQueue.length) {
        isGDriveUploading = false;
        renderGDriveWidget();
        setTimeout(function() {
            window.location.reload();
        }, 1200);
        return;
    }

    isGDriveUploading = true;
    const item = gdriveQueue[idx];
    item.status = 'uploading';
    renderGDriveWidget();

    const formData = new FormData();
    formData.append('file', item.file);
    if (typeof CURRENT_FOLDER_ID !== 'undefined' && CURRENT_FOLDER_ID) {
        formData.append('folderId', CURRENT_FOLDER_ID);
    }
    if (item.isReplace) {
        formData.append('replace', '1');
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) {
            item.progress = Math.round((e.loaded / e.total) * 100);
            renderGDriveWidget();
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    item.status = 'completed';
                } else {
                    item.status = 'failed';
                    item.error = response.message || 'Gagal mengunggah';
                }
            } catch (e) {
                item.status = 'failed';
            }
        } else {
            item.status = 'failed';
        }
        renderGDriveWidget();
        processGDriveQueueItem(idx + 1);
    };

    xhr.onerror = function () {
        item.status = 'failed';
        renderGDriveWidget();
        processGDriveQueueItem(idx + 1);
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
            } catch(e) {
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
    uploadQueueItems.forEach(function(item) {
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
            btn.onclick = function() { window.location.reload(); };
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
    uploadQueueItems.forEach(function(item) {
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
    uploadQueueItems.forEach(function(item) {
        if (item.status !== 'completed' && item.status !== 'uploading') {
            item.checked = true;
        }
    });
    renderUploadQueue();
}

function deselectAllQueueItems() {
    if (isUploading) return;
    uploadQueueItems.forEach(function(item) {
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
    uploadQueueItems.forEach(function(item) {
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

    uploadFileObject(item.file, function(pct) {
        item.progress = pct;
        updateQueueSummary();
        const el = document.querySelector('.upload-queue-item[data-index="' + idx + '"]');
        if (el) {
            const statusCell = el.querySelector('div:last-child');
            if (statusCell) {
                statusCell.innerHTML = '<div style="display:flex; align-items:center; gap:8px; min-width:120px;"><div class="progress-bar-bg" style="flex:1; background:rgba(255,255,255,0.1); height:6px; border-radius:10px; overflow:hidden;"><div class="progress-bar-fill" style="background:linear-gradient(90deg, #3b82f6, #60a5fa); height:100%; width:' + pct + '%; transition: width 0.2s ease;"></div></div><span style="color:#60a5fa; font-size:11px; font-weight:700; min-width:32px; text-align:right;">' + pct + '%</span></div>';
            }
        }
    }, function(success, errorMsg) {
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
    xhr.open('POST', '/upload', true);

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

// Quota popup
function showQuotaPopup(failedItems) {
    const modal = document.getElementById('quota-popup-modal');
    const list = document.getElementById('quota-failed-list');
    if (!modal || !list) return;

    let html = '';
    failedItems.forEach(item => {
        html += '<div style="padding: 4px 0; display:flex; justify-content:space-between; gap:8px;">';
        html += '<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(item.name) + '</span>';
        html += '<span style="flex-shrink:0; font-family:monospace; color:#94a3b8;">' + formatFileSize(item.size) + '</span>';
        html += '</div>';
    });
    list.innerHTML = html;
    modal.classList.add('active');
}

function closeQuotaPopup() {
    const modal = document.getElementById('quota-popup-modal');
    if (modal) modal.classList.remove('active');
}

// Drag & Drop Listeners - add to queue
document.addEventListener('dragover', function (e) {
    e.preventDefault();
    const overlay = document.getElementById('drag-overlay');
    if (overlay) overlay.classList.add('active');
});

document.addEventListener('dragleave', function (e) {
    if (e.clientX === 0 || e.clientY === 0) {
        const overlay = document.getElementById('drag-overlay');
        if (overlay) overlay.classList.remove('active');
    }
});

document.addEventListener('drop', function (e) {
    e.preventDefault();
    const overlay = document.getElementById('drag-overlay');
    if (overlay) overlay.classList.remove('active');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        addFilesToQueue(files);
        openUploadQueue();
    }
});

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
        content.innerHTML = `<img src="${previewUrl}" style="max-width: 100%; max-height: 480px; border-radius: 8px; object-fit: contain;">`;
    } else if (mimeType.startsWith('video/')) {
        content.innerHTML = `<video src="${previewUrl}" controls autoplay style="max-width: 100%; max-height: 480px; border-radius: 8px; outline: none;"></video>`;
    } else if (mimeType.startsWith('audio/')) {
        content.innerHTML = `<audio src="${previewUrl}" controls autoplay style="width: 90%; max-width: 480px; outline: none;"></audio>`;
    } else {
        content.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted); margin-bottom: 12px;">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 8px;">Pratinjau tidak tersedia untuk jenis berkas ini.</p>
                <p style="font-size: 12px; color: var(--accent-primary); font-weight: 600;">${mimeType}</p>
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

    // Show/hide preview & download for folders
    const previewBtn = document.getElementById('cm-btn-preview');
    const downloadBtn = document.getElementById('cm-btn-download');
    const copyLinkBtn = document.getElementById('cm-btn-copylink');

    if (item.type === 'folder') {
        if (previewBtn) previewBtn.style.display = 'none';
        if (downloadBtn) downloadBtn.style.display = 'none';
        if (copyLinkBtn) copyLinkBtn.style.display = 'none';
    } else {
        if (previewBtn) previewBtn.style.display = 'flex';
        if (downloadBtn) downloadBtn.style.display = 'flex';
        if (copyLinkBtn) copyLinkBtn.style.display = 'flex';
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

function cmActionShare() {
    closeContextMenu();
    if (activeContextItem) {
        const shareLink = window.location.origin + (activeContextItem.type === 'file' ? `/share?id=${activeContextItem.id}` : `/?folderId=${activeContextItem.id}`);
        copyToClipboard(shareLink).then(() => {
            showToast('Tautan Berbagi berhasil disalin ke clipboard');
        }).catch(() => {
            prompt('Salin tautan berbagi:', shareLink);
        });
    }
}

function cmActionCopyLink() {
    closeContextMenu();
    if (activeContextItem && activeContextItem.type === 'file') {
        const gdriveId = activeContextItem.providerFileId || activeContextItem.id;
        const link = `https://drive.google.com/file/d/${gdriveId}/view`;
        copyToClipboard(link).then(() => {
            showToast('Tautan Google Drive berhasil disalin ke clipboard');
        }).catch(() => {
            prompt('Salin tautan Google Drive:', link);
        });
    }
}

function cmActionCopyCdnLink() {
    closeContextMenu();
    if (activeContextItem && activeContextItem.type === 'file') {
        const gdriveId = activeContextItem.providerFileId || activeContextItem.id;
        const cdnUrl = `https://lh3.googleusercontent.com/d/${gdriveId}=s0`;
        copyToClipboard(cdnUrl).then(() => {
            showToast('Link CDN Gambar (Super Cepat) berhasil disalin ke clipboard! Siap dipakai di Landing Page.');
        }).catch(() => {
            prompt('Salin Link CDN Gambar:', cdnUrl);
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

// Move Item Modal Logic
let currentMoveItem = { type: '', id: '', name: '' };

function openMoveModal(type, id, name) {
    currentMoveItem = { type, id, name };
    const modal = document.getElementById('move-modal');
    const nameEl = document.getElementById('move-item-name');
    const selectEl = document.getElementById('move-target-folder');

    if (nameEl) nameEl.innerText = name;
    if (selectEl) {
        Array.from(selectEl.options).forEach(opt => {
            if (type === 'folder' && opt.value === id) {
                opt.style.display = 'none';
                opt.disabled = true;
            } else {
                opt.style.display = '';
                opt.disabled = false;
            }
        });
        selectEl.value = '';
    }
    if (modal) modal.classList.add('active');
}

function closeMoveModal() {
    const modal = document.getElementById('move-modal');
    if (modal) modal.classList.remove('active');
}

function submitMoveItem() {
    const targetFolderSelect = document.getElementById('move-target-folder');
    if (!targetFolderSelect) return;

    const targetFolderId = targetFolderSelect.value;
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
            }
        })
        .catch(err => {
            alert('Gagal terhubung ke server.');
        });
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

function submitRename() {
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
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
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

function submitDelete() {
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
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
        });
}

// Bulk Selection & Batch Delete Logic
function getSelectedItems() {
    const checkboxes = document.querySelectorAll('.item-checkbox:checked');
    const items = [];
    checkboxes.forEach(cb => {
        items.push({
            type: cb.getAttribute('data-type'),
            id: cb.getAttribute('data-id'),
            name: cb.getAttribute('data-name')
        });
    });
    return items;
}

function updateSelectionState() {
    const selected = getSelectedItems();
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
    updateSelectionState();
}

function deselectAllItems() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const masterCb = document.getElementById('select-all-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    if (masterCb) masterCb.checked = false;
    updateSelectionState();
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

function submitBulkDelete() {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

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
            }
        })
        .catch(err => {
            console.error(err);
            alert('Terjadi kesalahan koneksi.');
        });
}

