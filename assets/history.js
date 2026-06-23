let allHistory = [];
let isLoading = false;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('historyTable')) {
        loadHistory();

        const searchInput = document.getElementById('historySearch');
        if (searchInput) {
            searchInput.addEventListener('input', filterHistoryTable);
        }
    }
});

async function loadHistory() {
    if (isLoading) return;
    isLoading = true;

    const table = document.getElementById('historyTable');
    if (!table) return;

    table.innerHTML = `
        <tr>
            <td colspan="6" class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading history...</span>
                </div>
                <div class="mt-2 text-muted small">Fetching history logs from database...</div>
            </td>
        </tr>
    `;

    try {
        const response = await fetch('api/history.php?ts=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let data = await response.json();

        if (!Array.isArray(data)) {
            if (data && typeof data === 'object') {
                data = [data];
            } else {
                throw new Error('Response is not a valid array');
            }
        }

        // Securely filter out header mapping rows (e.g. SN: 1 or similar)
        allHistory = data.filter(item => {
            if (!item) return false;
            const sn = String(item.SN || '').trim();
            // Filter empty or header rows
            return sn !== '' && sn !== '1' && !/^\d+$/.test(sn);
        });

        renderHistoryTable(allHistory);

    } catch (err) {
        console.error('Failed to load history:', err);
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <div>Gagal memuat data history. Silakan coba lagi.</div>
                    <div class="small text-muted mt-1">${escapeHTML(err.message)}</div>
                    <button class="btn btn-outline-danger btn-sm mt-3" onclick="loadHistory()">
                        <i class="fas fa-sync-alt me-1"></i> Muat Ulang
                    </button>
                </td>
            </tr>
        `;
    } finally {
        isLoading = false;
    }
}

function renderHistoryTable(historyData) {
    const table = document.getElementById('historyTable');
    if (!table) return;

    if (historyData.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fas fa-history fa-2x mb-2"></i>
                    <div>Tidak ada log history yang ditemukan.</div>
                </td>
            </tr>
        `;
        return;
    }

    // Sort by timestamp descending if possible
    historyData.sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    let html = '';
    historyData.forEach(item => {
        html += `
            <tr class="history-row">
                <td class="fw-semibold" style="font-size: 0.9rem;">
                    ${escapeHTML(formatTimestamp(item.timestamp))}
                </td>
                <td class="fw-semibold">${escapeHTML(item.name ?? '-')}</td>
                <td class="font-monospace fw-medium">${escapeHTML(item.SN ?? '-')}</td>
                <td>${escapeHTML(item.Laptop ?? item.laptop ?? '-')}</td>
                <td>${escapeHTML(item.Division ?? item.division ?? '-')}</td>
                <td>${badgeKeterangan(item.keterangan)}</td>
            </tr>
        `;
    });
    table.innerHTML = html;
}

function filterHistoryTable() {
    const query = document.getElementById('historySearch').value.toLowerCase().trim();
    if (!query) {
        renderHistoryTable(allHistory);
        return;
    }

    const filtered = allHistory.filter(item => {
        return (
            (item.name && item.name.toLowerCase().includes(query)) ||
            (item.SN && item.SN.toLowerCase().includes(query)) ||
            (item.Laptop && item.Laptop.toLowerCase().includes(query)) ||
            (item.laptop && item.laptop.toLowerCase().includes(query)) ||
            (item.Division && item.Division.toLowerCase().includes(query)) ||
            (item.division && item.division.toLowerCase().includes(query)) ||
            (item.keterangan && item.keterangan.toLowerCase().includes(query))
        );
    });

    renderHistoryTable(filtered);
}

function formatTimestamp(tsStr) {
    if (!tsStr) return '-';
    // If it's a simple ISO date or normal Y-m-d H:i:s, parse it.
    try {
        const d = new Date(tsStr);
        if (isNaN(d.getTime())) return tsStr;
        
        // Return structured date format: YYYY-MM-DD HH:MM:SS
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    } catch(e) {
        return tsStr;
    }
}

function badgeKeterangan(ket) {
    const k = String(ket || '').trim();
    const kLower = k.toLowerCase();
    
    let colorClass = 'bg-secondary';
    let iconClass = 'fa-info-circle';
    
    if (kLower.includes('new')) {
        colorClass = 'bg-info text-dark';
        iconClass = 'fa-user-plus';
    } else if (kLower.includes('replacing-lama') || kLower.includes('exit')) {
        colorClass = 'bg-danger';
        iconClass = 'fa-undo-alt';
    } else if (kLower.includes('replacing-baru')) {
        colorClass = 'bg-primary';
        iconClass = 'fa-laptop';
    } else if (kLower.includes('done')) {
        colorClass = 'bg-success';
        iconClass = 'fa-check-double';
    } else if (kLower.includes('service')) {
        colorClass = 'bg-warning text-dark';
        iconClass = 'fa-tools';
    }

    return `<span class="badge ${colorClass}"><i class="fas ${iconClass} me-1"></i>${escapeHTML(k)}</span>`;
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
