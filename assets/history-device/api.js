import { isValidHistoryRow } from './utils.js';

export class HistoryApi {
    constructor(rootPath = 'api') {
        this.rootPath = rootPath;
    }

    async fetchHistory() {
        const response = await fetch(this.buildUrl('history.php'));
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const payload = await response.json();
        const data = this.normalizeResponse(payload);
        return data.filter(isValidHistoryRow);
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

    buildUrl(endpoint) {
        return `${this.rootPath}/${endpoint}?ts=${Date.now()}`;
    }
}
