let allDevices = [];
let currentFilter = 'all';
let isLoading = false;
let autoRefreshTimer = null;
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
    }
}

function renderDevicesTable(devices) {
    const table = document.getElementById('deviceTable');
    if (!table) return;

    if (devices.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fas fa-folder-open fa-2x mb-2"></i>
                    <div>Tidak ada data device yang ditemukan.</div>
                </td>
            </tr>
        `;
        return;
    }

    let html = '';
    devices.forEach((item, index) => {
        html += `
            <tr class="device-row" data-index="${allDevices.indexOf(item)}" style="cursor:pointer;">
                <td class="fw-medium font-monospace">${escapeHTML(item.SN ?? '-')}</td>
                <td>${escapeHTML(item.listing ?? '-')}</td>
                <td>${escapeHTML(item.laptop ?? '-')}</td>
                <td>${escapeHTML(item.name ?? '-')}</td>
                <td>${escapeHTML(item.division ?? '-')}</td>
                <td>${badgeStatus(item.status)}</td>
            </tr>
        `;
    });
    table.innerHTML = html;
}

// function filterDevicesTable() {
//     const query = document.getElementById('searchDevice').value.toLowerCase().trim();
//     if (!query) {
//         renderDevicesTable(allDevices);
//         return;
//     }

//     const filtered = allDevices.filter(item => {
//         return (
//             (item.SN && item.SN.toLowerCase().includes(query)) ||
//             (item.listing && String(item.listing).toLowerCase().includes(query)) ||
//             (item.laptop && item.laptop.toLowerCase().includes(query)) ||
//             (item.name && item.name.toLowerCase().includes(query)) ||
//             (item.division && item.division.toLowerCase().includes(query)) ||
//             (item.status && item.status.toLowerCase().includes(query))
//         );
//     });

//     renderDevicesTable(filtered);
// }

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

    const row = e.target.closest('.device-row');
    if (!row) return;

    const device = allDevices[row.dataset.index];

    if (!device) return;

    showDeviceDetail(device);

});

function showDeviceDetail(device) {

    document.getElementById('detailSN').textContent = device.SN || '-';
    document.getElementById('detailNoList').textContent = device.listing || '-';
    document.getElementById('detailBrand').textContent = device.brand || '-';
    document.getElementById('detailLaptop').textContent = device.laptop || '-';

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