let allDevices = [];
let currentFilter = 'all';
let isLoading = false;
let autoRefreshTimer = null;
let deviceModalInstance = null;
let deleteConfirmModalInstance = null;
let deleteTargetDevice = null;
let deleteTargetRow = null;
const refreshInterval = 60000; // 60 seconds

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('deviceTable')) {
        // Initial load
        loadDevices();

        // Setup Auto Refresh
        startAutoRefresh();

        // Setup Search Filter
        const searchInput = document.getElementById('searchDevice');
        if (searchInput) {
            searchInput.addEventListener('input', filterDevicesTable);
        }

        initDeviceModal();
        initDeleteConfirmModal();

        const deviceForm = document.getElementById('deviceForm');
        if (deviceForm) {
            deviceForm.addEventListener('submit', handleDeviceFormSubmit);
        }

        const deleteDeviceBtn = document.getElementById('deleteDeviceBtn');
        if (deleteDeviceBtn) {
            deleteDeviceBtn.addEventListener('click', handleDeleteDeviceClick);
        }
    }

    document.querySelectorAll('.filter-card').forEach(card => {
        card.addEventListener('click', function () {
            currentFilter = this.dataset.filter;
            applyCurrentFilter();
            setActiveCard(this);
        });
    });
});

function startAutoRefresh() {
    if (autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(() => {
        loadDevices(true); // silent refresh (don't show full-page loading placeholder if already loaded)
    }, refreshInterval);
}

async function loadDevices(isSilent = false) {
    if (isLoading) return;
    isLoading = true;

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const table = document.getElementById('deviceTable');
    if (!table) return;

    // Show loading spinner if not silent
    if (!isSilent || allDevices.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading data...</span>
                    </div>
                    <div class="mt-2 text-muted small">Fetching devices from database...</div>
                </td>
            </tr>
        `;
    }

    // Add a visual refresh state to card header if present
    const cardHeader = document.querySelector('.card-header');
    if (cardHeader && isSilent) {
        const indicator = document.getElementById('refreshIndicator');
        if (indicator) {
            indicator.classList.add('fa-spin');
        } else {
            cardHeader.insertAdjacentHTML('beforeend', ' <i id="refreshIndicator" class="fas fa-sync-alt fa-spin text-muted float-end mt-1" style="font-size: 0.9rem;"></i>');
        }
    }

    try {
        const response = await fetch('api/devices.php?ts=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (!Array.isArray(data)) {
            // If it's a single object, wrap it in array
            if (data && typeof data === 'object') {
                data = [data];
            } else {
                throw new Error('Response is not a valid array');
            }
        }

        // Securely filter out the row mapping (headers index) from n8n/Google Sheets
        // Real serial number is alphanumeric and usually has a length > 2
        allDevices = data.filter(item => {
            if (!item) return false;
            const sn = String(item.SN || '').trim();
            // If SN is empty, 1, or is the string representation of a header column index (single-digit mapping)
            return sn !== '' && sn !== '1' && !/^\d+$/.test(sn);
        });

        // Render Table & Cards
        renderDevicesTable(allDevices);
        updateStatistics(allDevices);
        applyCurrentFilter();

    } catch (err) {
        console.error('Failed to load devices:', err);
        if (allDevices.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-danger py-4">
                        <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                        <div>Gagal memuat data device. Silakan coba lagi.</div>
                        <div class="small text-muted mt-1">${escapeHTML(err.message)}</div>
                        <button class="btn btn-outline-danger btn-sm mt-3" onclick="loadDevices()">
                            <i class="fas fa-sync-alt me-1"></i> Muat Ulang
                        </button>
                    </td>
                </tr>
            `;
        }
    } finally {
        isLoading = false;
        const indicator = document.getElementById('refreshIndicator');
        if (indicator) {
            indicator.classList.remove('fa-spin');
        }
        window.scrollTo({ top: scrollPosition, behavior: 'auto' });
    }
}

function renderDevicesTable(devices) {
    const table = document.getElementById('deviceTable');
    if (!table) return;

    const isAdmin = window.CURRENT_USER_ROLE === 'admin';
    const columnCount = isAdmin ? 7 : 6;

    if (devices.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="${columnCount}" class="text-center py-4 text-muted">
                    <i class="fas fa-folder-open fa-2x mb-2"></i>
                    <div>Tidak ada data device yang ditemukan.</div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    devices.forEach((item) => {
        const index = allDevices.indexOf(item);
        html += `
            <tr class="device-row" data-index="${index}" style="cursor:pointer;">
                <td class="fw-medium font-monospace">${escapeHTML(item.SN ?? '-')}</td>
                <td>${escapeHTML(item.listing ?? '-')}</td>
                <td>${escapeHTML(item.laptop ?? '-')}</td>
                <td>${escapeHTML(item.name ?? '-')}</td>
                <td>${escapeHTML(item.division ?? '-')}</td>
                <td>${badgeStatus(item.status)}</td>
                ${isAdmin ? `
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-warning action-btn action-edit mb-1" title="Edit Device">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger action-btn action-delete ms-2" title="Delete Device">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                ` : ''}
            </tr>
        `;
    });
    table.innerHTML = html;
}

function filterDevicesTable() {
    applyCurrentFilter();
}

function updateStatistics(devices) {
    let assigned = 0;
    let available = 0;
    let service = 0;

    devices.forEach(item => {
        const status = String(item.status || '').toLowerCase().trim();
        if (status === 'assigned') assigned++;
        else if (status === 'available') available++;
        else if (status === 'service') service++;
    });

    const totalEl = document.getElementById('totalDevice');
    const assignedEl = document.getElementById('assignedDevice');
    const availableEl = document.getElementById('availableDevice');
    const serviceEl = document.getElementById('serviceDevice');

    if (totalEl) totalEl.innerText = devices.length;
    if (assignedEl) assignedEl.innerText = assigned;
    if (availableEl) availableEl.innerText = available;
    if (serviceEl) serviceEl.innerText = service;
}

function badgeStatus(status) {
    const s = String(status || '').trim();
    const sLower = s.toLowerCase();
    if (sLower === 'assigned') {
        return `<span class="badge badge-assigned"><i class="fas fa-user-check me-1"></i>Assigned</span>`;
    }
    if (sLower === 'available') {
        return `<span class="badge badge-available"><i class="fas fa-check-circle me-1"></i>Available</span>`;
    }
    if (sLower === 'service') {
        return `<span class="badge badge-service"><i class="fas fa-tools me-1"></i>Service</span>`;
    }
    return `<span class="badge badge-other"><i class="fas fa-info-circle me-1"></i>${escapeHTML(s)}</span>`;
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

document.addEventListener('click', function (e) {
    const editBtn = e.target.closest('.action-edit');
    if (editBtn) {
        e.stopPropagation();
        const row = editBtn.closest('.device-row');
        if (!row) return;
        const device = allDevices[row.dataset.index];
        if (!device) return;
        openEditDeviceModal(device);
        return;
    }

    const deleteBtn = e.target.closest('.action-delete');
    if (deleteBtn) {
        e.stopPropagation();
        const row = deleteBtn.closest('.device-row');
        if (!row) return;
        const device = allDevices[row.dataset.index];
        if (!device) return;
        confirmDeleteDevice(device);
        return;
    }

    const row = e.target.closest('.device-row');
    if (!row) return;
    if (e.target.closest('.action-btn')) {
        return;
    }

    const device = allDevices[row.dataset.index];
    if (!device) return;

    showDeviceDetail(device);
});

function showDeviceDetail(device) {

    document.getElementById('detailSN').textContent = device.SN || '-';
    document.getElementById('detailNoList').textContent = device.listing || '-';
    document.getElementById('detailType').textContent = device.Type || device.type || '-';
    document.getElementById('detailBrand').textContent = device.brand || '-';
    document.getElementById('detailLaptop').textContent = device.laptop || '-';
    document.getElementById('detailCPU').textContent = device.cpu || '-';
    document.getElementById('detailRAM').textContent = device.ram || '-';
    document.getElementById('detailStorage').textContent = device.storage || '-';

    document.getElementById('detailName').textContent = device.name || '-';
    document.getElementById('detailDivision').textContent = device.division || '-';

    document.getElementById('detailStatus').innerHTML =
        badgeStatus(device.status);

    document.getElementById('detailSpec').textContent =
        device.spesifikasi || '-';

    const modal = new bootstrap.Modal(
        document.getElementById('deviceDetailModal')
    );

    modal.show();
}

function applyCurrentFilter() {

    const keyword = document.getElementById('searchDevice')
        .value
        .toLowerCase()
        .trim();

    let devices = [...allDevices];

    // Filter Status
    if (currentFilter !== 'all') {
        devices = devices.filter(d =>
            String(d.status).toLowerCase() === currentFilter
        );
    }

    // Filter Search
    if (keyword) {
        devices = devices.filter(item =>
            (item.SN && item.SN.toLowerCase().includes(keyword)) ||
            (item.listing && String(item.listing).toLowerCase().includes(keyword)) ||
            (item.laptop && item.laptop.toLowerCase().includes(keyword)) ||
            (item.name && item.name.toLowerCase().includes(keyword)) ||
            (item.division && item.division.toLowerCase().includes(keyword)) ||
            (item.status && item.status.toLowerCase().includes(keyword))
        );
    }

    renderDevicesTable(devices);

}

function setActiveCard(activeCard){

    document.querySelectorAll('.filter-card').forEach(card=>{
        card.classList.remove('active');
    });

    activeCard.classList.add('active');

}

function initDeviceModal() {
    const modalEl = document.getElementById('deviceModal');
    if (!modalEl) return;
    deviceModalInstance = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false,
    });
}

function initDeleteConfirmModal() {
    const modalEl = document.getElementById('deleteConfirmModal');
    if (!modalEl) return;
    deleteConfirmModalInstance = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false,
    });

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', performDeleteDevice);
    }
}

function openEditDeviceModal(device) {
    const modalTitle = document.getElementById('deviceModalTitle');
    const saveBtn = document.getElementById('saveDeviceBtn');
    const deleteBtn = document.getElementById('deleteDeviceBtn');

    const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.value = value;
    };

    setValue('deviceId', device.SN || '');
    setValue('deviceSN', device.SN || '');
    setValue('deviceListing', device.listing || '');
    setValue('deviceType', device.Type || device.type || '');
    setValue('deviceLaptop', device.laptop || '');
    setValue('deviceBrand', device.brand || '');
    setValue('deviceCPU', device.cpu || '');
    setValue('deviceName', device.name || '');
    setValue('deviceDivision', device.division || '');
    setValue('deviceStatus', device.status || 'Available');
    setValue('deviceRAM', device.ram || '');
    setValue('deviceStorage', device.storage || '');
    setValue('deviceSpesifikasi', device.spesifikasi || '');

    const readonlyFields = ['deviceSN', 'deviceListing', 'deviceName', 'deviceDivision', 'deviceStatus'];
    readonlyFields.forEach(id => {
        const field = document.getElementById(id);
        if (field) field.readOnly = true;
    });
    const statusField = document.getElementById('deviceStatus');
    if (statusField) statusField.disabled = true;

    if (modalTitle) modalTitle.innerHTML = '<i class="fas fa-edit me-2 text-warning"></i>Update Device';
    if (saveBtn) saveBtn.textContent = 'Update';
    if (deleteBtn) deleteBtn.classList.remove('d-none');

    deviceModalInstance?.show();
}

function handleDeviceFormSubmit(event) {
    event.preventDefault();
    const deviceId = document.getElementById('deviceId').value.trim();
    const payload = {
        SN: document.getElementById('deviceSN').value.trim(),
        listing: document.getElementById('deviceListing').value.trim(),
        Type: document.getElementById('deviceType').value.trim(),
        laptop: document.getElementById('deviceLaptop').value.trim(),
        brand: document.getElementById('deviceBrand').value.trim(),
        cpu: document.getElementById('deviceCPU').value.trim(),
        name: document.getElementById('deviceName').value.trim(),
        division: document.getElementById('deviceDivision').value.trim(),
        status: document.getElementById('deviceStatus').value.trim(),
        ram: document.getElementById('deviceRAM').value.trim(),
        storage: document.getElementById('deviceStorage').value.trim(),
        spesifikasi: document.getElementById('deviceSpesifikasi').value.trim(),
    };

    if (!deviceId) {
        alert('Tidak ada device yang dipilih untuk diperbarui.');
        return;
    }

    const saveBtn = document.getElementById('saveDeviceBtn');
    saveBtn.disabled = true;
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Sedang menyimpan...';

    fetch('api/update-device.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(async response => {
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal menyimpan perubahan');
            }
            return result;
        })
        .then(() => {
            deviceModalInstance?.hide();
            loadDevices();
        })
        .catch(error => {
            alert('Update gagal: ' + error.message);
            console.error(error);
        })
        .finally(() => {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        });
}

function handleDeleteDeviceClick(event) {
    event.preventDefault();
    const deviceId = document.getElementById('deviceId').value.trim();
    if (!deviceId) {
        return;
    }
    const device = allDevices.find(item => String(item.SN) === deviceId);
    if (device) {
        openDeleteConfirmModal(device, null);
    }
}

function openDeleteConfirmModal(device, rowElement) {
    deleteTargetDevice = device;
    deleteTargetRow = rowElement || null;

    const message = document.getElementById('deleteConfirmMessage');
    const successElement = document.getElementById('deleteConfirmSuccess');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    if (message) {
        message.textContent = `Hapus device dengan SN ${device.SN}?`;
        message.classList.remove('d-none');
    }
    if (successElement) {
        successElement.classList.add('d-none');
        successElement.classList.remove('show');
    }
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Hapus';
    }

    deleteConfirmModalInstance?.show();
}

function confirmDeleteDevice(device) {
    openDeleteConfirmModal(device, null);
}

function performDeleteDevice() {
    if (!deleteTargetDevice) return;

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Menghapus...';
    }

    const row = deleteTargetRow || document.querySelector(`.device-row[data-index="${allDevices.indexOf(deleteTargetDevice)}"]`);
    if (row) {
        row.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        row.style.opacity = '0.4';
        row.style.transform = 'translateX(10px)';
    }

    fetch('api/delete-device.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ SN: deleteTargetDevice.SN }),
    })
        .then(async response => {
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Gagal menghapus device');
            }
            return result;
        })
        .then(() => {
            const successElement = document.getElementById('deleteConfirmSuccess');
            const messageElement = document.getElementById('deleteConfirmMessage');
            if (messageElement) {
                messageElement.classList.add('d-none');
            }
            if (successElement) {
                successElement.classList.remove('d-none');
                requestAnimationFrame(() => {
                    successElement.classList.add('show');
                });
            }
            if (row) {
                row.style.opacity = '0.2';
                row.style.transform = 'translateX(10px)';
            }
            setTimeout(() => {
                if (row) {
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(20px)';
                }
            }, 3000);
            setTimeout(() => {
                deleteConfirmModalInstance?.hide();
                if (row && row.parentNode) row.parentNode.removeChild(row);
                loadDevices();
            }, 3000);
        })
        .catch(error => {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Hapus';
            }
            if (row) {
                row.style.opacity = '1';
                row.style.transform = 'none';
            }
            alert('Delete gagal: ' + error.message);
            console.error(error);
        })
        .finally(() => {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Hapus';
            }
            deleteTargetDevice = null;
            deleteTargetRow = null;
        });
}

function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}