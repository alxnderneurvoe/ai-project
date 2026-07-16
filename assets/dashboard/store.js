export class DeviceStore {
    constructor() {
        this.devices = [];
        this.currentFilter = 'all';
        this.searchKeyword = '';
    }

    setDevices(devices) {
        this.devices = Array.isArray(devices) ? devices : [];
    }

    setFilter(filter) {
        this.currentFilter = filter || 'all';
    }

    setSearchKeyword(keyword) {
        this.searchKeyword = String(keyword || '').toLowerCase().trim();
    }

    get filteredDevices() {
        return this.devices
            .filter(item => this.matchesStatus(item))
            .filter(item => this.matchesKeyword(item));
    }

    matchesStatus(item) {
        if (this.currentFilter === 'all') {
            return true;
        }

        return String(item.status || '').toLowerCase().trim() === this.currentFilter;
    }

    matchesKeyword(item) {
        if (!this.searchKeyword) {
            return true;
        }

        const searchFields = [
            item.SN,
            item.listing,
            item.laptop,
            item.name,
            item.division,
            item.status,
        ];

        return searchFields.some(value =>
            String(value || '').toLowerCase().includes(this.searchKeyword)
        );
    }

    getStats() {
        const stats = {
            total: this.devices.length,
            assigned: 0,
            available: 0,
            service: 0,
        };

        this.devices.forEach(item => {
            const status = String(item.status || '').toLowerCase().trim();
            if (status === 'assigned') {
                stats.assigned += 1;
            } else if (status === 'available') {
                stats.available += 1;
            } else if (status === 'service') {
                stats.service += 1;
            }
        });

        return stats;
    }

    findBySerialNumber(serialNumber) {
        return this.devices.find(item => String(item.SN || '') === String(serialNumber || ''));
    }
}
