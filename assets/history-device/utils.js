export function escapeHTML(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export function isValidHistoryRow(item) {
    if (!item || typeof item !== 'object') {
        return false;
    }

    const sn = String(item.SN || '').trim();
    return sn !== '' && sn !== '1' && !/^[0-9]+$/.test(sn);
}

export function formatTimestamp(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (isNaN(date.getTime())) {
        return String(value);
    }

    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function badgeKeterangan(keterangan) {
    const value = String(keterangan || '').trim();
    const normalized = value.toLowerCase();

    const map = [
        { test: v => v.includes('new'), css: 'bg-info text-dark', icon: 'user-plus' },
        { test: v => v.includes('replacing-lama') || v.includes('exit'), css: 'bg-danger', icon: 'undo-alt' },
        { test: v => v.includes('replacing-baru'), css: 'bg-primary', icon: 'laptop' },
        { test: v => v.includes('done'), css: 'bg-success', icon: 'check-double' },
        { test: v => v.includes('service'), css: 'bg-warning text-dark', icon: 'tools' },
    ];

    const match = map.find(item => item.test(normalized));
    const descriptor = match || { css: 'bg-secondary', icon: 'info-circle' };

    return `
        <span class="badge ${descriptor.css}">
            <i class="fas fa-${descriptor.icon} me-1"></i>
            ${escapeHTML(value)}
        </span>
    `;
}
