export class HistoryStore {
    constructor() {
        this.entries = [];
        this.searchKeyword = '';
    }

    setEntries(entries) {
        this.entries = Array.isArray(entries) ? entries : [];
    }

    setSearchKeyword(keyword) {
        this.searchKeyword = String(keyword || '').toLowerCase().trim();
    }

    get filteredEntries() {
        if (!this.searchKeyword) {
            return [...this.entries];
        }

        return this.entries.filter(entry => {
            const fields = [
                entry.name,
                entry.SN,
                entry.Laptop,
                entry.laptop,
                entry.Division,
                entry.division,
                entry.keterangan,
            ];

            return fields.some(value =>
                String(value || '').toLowerCase().includes(this.searchKeyword)
            );
        });
    }
}
