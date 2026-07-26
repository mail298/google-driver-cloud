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

// Handle file selection
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) return;
    uploadFileObject(files[0]);
}

// Core File Upload Function
function uploadFileObject(file) {
    const formData = new FormData();
    formData.append('file', file);
    if (typeof CURRENT_FOLDER_ID !== 'undefined' && CURRENT_FOLDER_ID) {
        formData.append('folderId', CURRENT_FOLDER_ID);
    }

    const progressContainer = document.getElementById('progress-container');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');

    if (progressContainer) {
        progressContainer.style.display = 'block';
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercent) progressPercent.innerText = '0%';
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);

    xhr.upload.onprogress = function (e) {
        if (e.lengthComputable && progressFill && progressPercent) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            progressFill.style.width = percentComplete + '%';
            progressPercent.innerText = percentComplete + '%';
        }
    };

    xhr.onload = function () {
        if (progressContainer) progressContainer.style.display = 'none';

        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    window.location.reload();
                } else {
                    alert('Gagal mengunggah: ' + response.message);
                }
            } catch (e) {
                alert('Respons pengunggahan tidak valid.');
            }
        } else {
            alert('Gagal mengunggah dengan kode status ' + xhr.status);
        }

        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
    };

    xhr.onerror = function () {
        if (progressContainer) progressContainer.style.display = 'none';
        alert('Terjadi kesalahan saat mengunggah berkas.');
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
    };

    xhr.send(formData);
}

// Drag & Drop Listeners
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
        uploadFileObject(files[0]);
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

