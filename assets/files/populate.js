/**
 * populate.js
 * Functions to populate the Name and SN dropdown selects
 * based on device status and keterangan type.
 */

/**
 * Returns the spesifikasi string for a device item.
 * @param {Object} item
 * @returns {string}
 */
function getSpesifikasiString(item) {
    return item.spesifikasi || '-';
}

/**
 * Populates the SN select dropdown filtered by device status.
 * @param {'Available'|'Service'} statusFilter
 */
function populateSnSelect(statusFilter) {
    const snSelect = document.getElementById('snSelect');
    if (!snSelect) return;

    const filtered = allDevices.filter(d => {
        const s = String(d.status || '').toLowerCase().trim();
        return s === statusFilter.toLowerCase();
    });

    let html = `<option value="">Pilih SN (${statusFilter})</option>`;
    filtered.forEach(item => {
        const nameText = item.name ? ` [User: ${item.name}]` : '';
        const spesifikasiText = getSpesifikasiString(item);
        html += `
            <option value="${escapeHTML(item.SN)}"
                    data-laptop="${escapeHTML(item.laptop ?? '')}"
                    data-brand="${escapeHTML(item.brand ?? '')}"
                    data-name="${escapeHTML(item.name ?? '')}"
                    data-division="${escapeHTML(item.division ?? '')}"
                    data-spesifikasi="${escapeHTML(spesifikasiText)}">
                ${escapeHTML(item.SN)} - ${escapeHTML(item.laptop ?? 'Unknown')} ${escapeHTML(nameText)}
            </option>
        `;
    });
    snSelect.innerHTML = html;
}

/**
 * Populates the Name select with users who have an Assigned device.
 */
function populateNameSelect() {
    const nameSelect = document.getElementById('nameSelect');
    if (!nameSelect) return;

    const filtered = allDevices.filter(d => {
        const s = String(d.status || '').toLowerCase().trim();
        return s === 'assigned';
    });

    let html = '<option value="">Pilih User (Assigned)</option>';
    filtered.forEach(item => {
        const spesifikasiText = getSpesifikasiString(item);
        html += `
            <option value="${escapeHTML(item.name)}"
                    data-sn="${escapeHTML(item.SN)}"
                    data-division="${escapeHTML(item.division ?? '')}"
                    data-laptop="${escapeHTML(item.laptop ?? '')}"
                    data-brand="${escapeHTML(item.brand ?? '')}"
                    data-spesifikasi="${escapeHTML(spesifikasiText)}">
                ${escapeHTML(item.name)} (${escapeHTML(item.SN)})
            </option>
        `;
    });
    nameSelect.innerHTML = html;
}

/**
 * Populates the Name select for Service-related keterangan types.
 * Shows users with Assigned or Available devices, sorted by name.
 */
function populateNameSelectService() {
    const nameSelect = document.getElementById('nameSelect');
    if (!nameSelect) return;

    const filtered = allDevices
        .filter(d => {
            const s = String(d.status || '').toLowerCase().trim();
            return s === 'assigned' || s === 'available';
        })
        .sort((a, b) =>
            String(a.name || '').localeCompare(
                String(b.name || ''),
                'id',
                { sensitivity: 'base' }
            )
        );

    let html = `<option value="">Pilih User / SN</option>`;
    filtered.forEach(item => {
        const spesifikasiText = getSpesifikasiString(item);
        html += `
            <option
                value="${escapeHTML(item.SN)}"
                data-name="${escapeHTML(item.name)}"
                data-sn="${escapeHTML(item.SN)}"
                data-division="${escapeHTML(item.division ?? '')}"
                data-laptop="${escapeHTML(item.laptop ?? '')}"
                data-brand="${escapeHTML(item.brand ?? '')}"
                data-spesifikasi="${escapeHTML(spesifikasiText)}">
                ${escapeHTML(item.name)} - ${escapeHTML(item.SN)} - ${escapeHTML(item.laptop)}
            </option>
        `;
    });
    nameSelect.innerHTML = html;
}
