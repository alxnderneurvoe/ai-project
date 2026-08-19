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

export function isValidDeviceRow(item) {
    if (!item || typeof item !== 'object') {
        return false;
    }

    const sn = String(item.SN || '').trim();
    return sn !== '' && sn !== '1' && !/^[0-9]+$/.test(sn);
}

export function buildStatusBadge(status) {
    const value = String(status || '').trim();
    const normalized = value.toLowerCase();

    const statusMap = {
        assigned: {
            label: 'Assigned',
            css: 'badge-assigned',
            icon: 'user-check',
        },
        available: {
            label: 'Available',
            css: 'badge-available',
            icon: 'check-circle',
        },
        service: {
            label: 'Service',
            css: 'badge-service',
            icon: 'tools',
        },
    };

    const descriptor = statusMap[normalized] || {
        label: value || 'Unknown',
        css: 'badge-other',
        icon: 'info-circle',
    };

    return `
        <span class="badge ${descriptor.css}">
            <i class="fas fa-${descriptor.icon} me-1"></i>
            ${escapeHTML(descriptor.label)}
        </span>
    `;
}

