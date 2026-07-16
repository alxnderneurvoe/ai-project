import { escapeHTML, formatTimestamp, badgeKeterangan } from './utils.js';

export class HistoryUI {
    constructor({ api, store }) {
        this.api = api;
        this.store = store;
        this.isLoading = false;
    }

    init() {
        const initialize = () => {
            if (!document.getElementById('historyTable')) {
                return;
            }

            this.attachEvents();
            this.loadHistory();
        };

        if (document.readyState !== 'loading') {
            initialize();
        } else {
            document.addEventListener('DOMContentLoaded', initialize);
        }
    }

    attachEvents() {
        const searchInput = document.getElementById('historySearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.store.setSearchKeyword(searchInput.value);
                this.renderHistoryTable(this.store.filteredEntries);
            });
        }
    }

    async loadHistory() {
        if (this.isLoading) {
            return;
        }

        const table = document.getElementById('historyTable');
        if (!table) {
            return;
        }

        this.isLoading = true;
        table.innerHTML = this.getLoadingRow();

        try {
            const entries = await this.api.fetchHistory();
            this.store.setEntries(entries);
            this.renderHistoryTable(this.store.filteredEntries);
        } catch (error) {
            this.renderErrorRow(error);
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    getLoadingRow() {
        return `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading history...</span>
                    </div>
                    <div class="mt-2 text-muted small">Fetching history logs from database...</div>
                </td>
            </tr>
        `;
    }

    renderErrorRow(error) {
        const table = document.getElementById('historyTable');
        if (!table) {
            return;
        }

        table.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <div>Gagal memuat data history. Silakan coba lagi.</div>
                    <div class="small text-muted mt-1">${escapeHTML(error.message)}</div>
                    <button class="btn btn-outline-danger btn-sm mt-3" onclick="window.historyApp && window.historyApp.loadHistory()">
                        <i class="fas fa-sync-alt me-1"></i> Muat Ulang
                    </button>
                </td>
            </tr>
        `;
    }

    renderHistoryTable(entries) {
        const table = document.getElementById('historyTable');
        if (!table) {
            return;
        }

        if (!entries.length) {
            table.innerHTML = this.getEmptyRow();
            return;
        }

        const rows = entries
            .slice()
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(entry => this.renderHistoryRow(entry));

        table.innerHTML = rows.join('');
    }

    getEmptyRow() {
        return `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    <i class="fas fa-history fa-2x mb-2"></i>
                    <div>Tidak ada log history yang ditemukan.</div>
                </td>
            </tr>
        `;
    }

    renderHistoryRow(entry) {
        return `
            <tr class="history-row">
                <td class="fw-semibold" style="font-size: 0.9rem;">${escapeHTML(formatTimestamp(entry.timestamp))}</td>
                <td class="fw-semibold">${escapeHTML(entry.name ?? '-')}</td>
                <td class="font-monospace fw-medium">${escapeHTML(entry.SN ?? '-')}</td>
                <td>${escapeHTML(entry.Laptop ?? entry.laptop ?? '-')}</td>
                <td>${escapeHTML(entry.Division ?? entry.division ?? '-')}</td>
                <td>${badgeKeterangan(entry.keterangan)}</td>
            </tr>
        `;
    }
}
