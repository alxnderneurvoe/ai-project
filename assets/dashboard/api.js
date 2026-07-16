import { isValidDeviceRow } from './utils.js';

export class DashboardApi {
    constructor(rootPath = 'api') {
        this.rootPath = rootPath;
    }

    async fetchDevices() {
        const response = await fetch(this.buildUrl('devices.php'));
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const payload = await response.json();
        const result = this.normalizeResponse(payload);
        return result.filter(isValidDeviceRow);
    }

    async updateDevice(payload) {
        return this.postJson('update-device.php', payload);
    }

    async deleteDevice(serialNumber) {
        return this.postJson('delete-device.php', { SN: serialNumber });
    }

    async postJson(endpoint, payload) {
        const response = await fetch(this.buildUrl(endpoint), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Request gagal');
        }

        return result;
    }

    buildUrl(endpoint) {
        return `${this.rootPath}/${endpoint}?ts=${Date.now()}`;
    }

    normalizeResponse(payload) {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === 'object') {
            return [payload];
        }

        throw new Error('Response tidak valid dari server');
    }
}
