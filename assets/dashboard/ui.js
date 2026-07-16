import { escapeHTML, buildStatusBadge } from './utils.js';

export class DashboardUI {
    constructor({ api, store, currentRole }) {
        this.api = api;
        this.store = store;
        this.currentRole = currentRole;
        this.autoRefreshTimer = null;
        this.isLoading = false;
        this.deviceModalInstance = null;
        this.deleteConfirmModalInstance = null;
        this.updateConfirmModalInstance = null;
        this.deleteTargetDevice = null;
        this.pendingUpdatePayload = null;
        this.shouldReopenDeviceModalOnCancel = false;
        this.shouldShowUpdateConfirmAfterDeviceModalHide = false;
        this.isProcessingUpdate = false;
        this.refreshInterval = 60000;
    }

    init() {
        const initialize = () => {
            if (!document.getElementById('deviceTable')) {
                return;
            }

            this.initializeModalInstances();
            this.attachEventListeners();
            this.loadDevices();
            this.startAutoRefresh();
        };

        if (document.readyState !== 'loading') {
            initialize();
        } else {
            document.addEventListener('DOMContentLoaded', initialize);
        }
    }

    attachEventListeners() {
        const searchInput = document.getElementById('searchDevice');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.store.setSearchKeyword(searchInput.value);
                this.refreshTable();
            });
        }

        document.querySelectorAll('.filter-card').forEach(card => {
            card.addEventListener('click', () => {
                this.store.setFilter(card.dataset.filter);
                this.setActiveCard(card);
                this.refreshTable();
            });
        });

        document.addEventListener('click', event => this.handleDocumentClick(event));

        const deviceForm = document.getElementById('deviceForm');
        if (deviceForm) {
            deviceForm.addEventListener('submit', event => this.handleDeviceFormSubmit(event));
        }

        const deleteDeviceBtn = document.getElementById('deleteDeviceBtn');
        if (deleteDeviceBtn) {
            deleteDeviceBtn.addEventListener('click', event => this.handleDeleteDeviceClick(event));
        }
    }

    initializeModalInstances() {
        const deviceModalEl = document.getElementById('deviceModal');
        if (deviceModalEl) {
            this.deviceModalInstance = new bootstrap.Modal(deviceModalEl, {
                backdrop: 'static',
                keyboard: false,
            });

            deviceModalEl.addEventListener('hidden.bs.modal', () => {
                if (this.shouldShowUpdateConfirmAfterDeviceModalHide) {
                    this.shouldShowUpdateConfirmAfterDeviceModalHide = false;
                    this.openUpdateConfirmModal(this.pendingUpdatePayload);
                }
            });
        }

        const deleteConfirmModalEl = document.getElementById('deleteConfirmModal');
        if (deleteConfirmModalEl) {
            this.deleteConfirmModalInstance = new bootstrap.Modal(deleteConfirmModalEl, {
                backdrop: 'static',
                keyboard: false,
            });

            const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
            if (confirmDeleteBtn) {
                confirmDeleteBtn.addEventListener('click', () => this.performDeleteDevice());
            }
        }

        const updateConfirmModalEl = document.getElementById('updateConfirmModal');
        if (updateConfirmModalEl) {
            this.updateConfirmModalInstance = new bootstrap.Modal(updateConfirmModalEl, {
                backdrop: 'static',
                keyboard: false,
            });

            updateConfirmModalEl.addEventListener('hidden.bs.modal', () => {
                if (this.shouldReopenDeviceModalOnCancel && !this.isProcessingUpdate) {
                    this.shouldReopenDeviceModalOnCancel = false;
                    this.deviceModalInstance?.show();
                }
            });

            const confirmUpdateBtn = document.getElementById('confirmUpdateBtn');
            if (confirmUpdateBtn) {
                confirmUpdateBtn.addEventListener('click', () => this.performUpdateDevice());
            }
        }
    }

    async startAutoRefresh() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
        }

        this.autoRefreshTimer = setInterval(() => this.loadDevices(true), this.refreshInterval);
    }

    async loadDevices(isSilent = false) {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        const table = document.getElementById('deviceTable');
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

        if (!table) {
            this.isLoading = false;
            return;
        }

        if (!isSilent || this.store.devices.length === 0) {
            table.innerHTML = this.renderLoadingRow();
        }

        this.toggleRefreshIndicator(isSilent, true);

        try {
            const devices = await this.api.fetchDevices();
            this.store.setDevices(devices);
            this.refreshTable();
        } catch (error) {
            this.renderLoadError(error);
            console.error(error);
        } finally {
            this.isLoading = false;
            this.toggleRefreshIndicator(isSilent, false);
            window.scrollTo({ top: scrollPosition, behavior: 'auto' });
        }
    }

    refreshTable() {
        this.renderDevicesTable(this.store.filteredDevices);
        this.renderStats(this.store.getStats());
    }

    renderLoadingRow() {
        return `
            <tr>
                <td colspan="${this.currentRole === 'admin' ? 7 : 6}" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading data...</span>
                    </div>
                    <div class="mt-2 text-muted small">Fetching devices from database...</div>
                </td>
            </tr>
        `;
    }

    renderLoadError(error) {
        const table = document.getElementById('deviceTable');
        if (!table) {
            return;
        }

        table.innerHTML = `
            <tr>
                <td colspan="${this.currentRole === 'admin' ? 7 : 6}" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <div>Gagal memuat data device. Silakan coba lagi.</div>
                    <div class="small text-muted mt-1">${escapeHTML(error.message)}</div>
                    <button class="btn btn-outline-danger btn-sm mt-3" onclick="window.dashboard && window.dashboard.loadDevices()">
                        <i class="fas fa-sync-alt me-1"></i> Muat Ulang
                    </button>
                </td>
            </tr>
        `;
    }

    toggleRefreshIndicator(isSilent, active) {
        const cardHeader = document.querySelector('.card-header');
        if (!cardHeader || !isSilent) {
            return;
        }

        let indicator = document.getElementById('refreshIndicator');
        if (!indicator) {
            cardHeader.insertAdjacentHTML('beforeend', ' <i id="refreshIndicator" class="fas fa-sync-alt text-muted float-end mt-1" style="font-size: 0.9rem;"></i>');
            indicator = document.getElementById('refreshIndicator');
        }

        indicator.classList.toggle('fa-spin', active);
    }

    renderDevicesTable(devices) {
        const table = document.getElementById('deviceTable');
        if (!table) {
            return;
        }

        if (devices.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="${this.currentRole === 'admin' ? 7 : 6}" class="text-center py-4 text-muted">
                        <i class="fas fa-folder-open fa-2x mb-2"></i>
                        <div>Tidak ada data device yang ditemukan.</div>
                    </td>
                </tr>
            `;
            return;
        }

        const rows = devices.map((device, index) => this.renderDeviceRow(device, index));
        table.innerHTML = rows.join('');
    }

    renderDeviceRow(device, index) {
        return `
            <tr class="device-row" data-index="${index}" style="cursor:pointer;">
                <td class="fw-medium font-monospace">${escapeHTML(device.SN ?? '-')}</td>
                <td>${escapeHTML(device.listing ?? '-')}</td>
                <td>${escapeHTML(device.laptop ?? '-')}</td>
                <td>${escapeHTML(device.name ?? '-')}</td>
                <td>${escapeHTML(device.division ?? '-')}</td>
                <td>${buildStatusBadge(device.status)}</td>
                ${this.currentRole === 'admin' ? this.renderDeviceActions() : ''}
            </tr>
        `;
    }

    renderDeviceActions() {
        return `
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-warning action-btn action-edit mb-1" title="Edit Device">
                    <i class="fas fa-edit"></i>
                </button>
                <button type="button" class="btn btn-sm btn-outline-danger action-btn action-delete ms-2" title="Delete Device">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
    }

    renderStats(stats) {
        const totalEl = document.getElementById('totalDevice');
        const assignedEl = document.getElementById('assignedDevice');
        const availableEl = document.getElementById('availableDevice');
        const serviceEl = document.getElementById('serviceDevice');

        if (totalEl) {
            totalEl.innerText = stats.total;
        }
        if (assignedEl) {
            assignedEl.innerText = stats.assigned;
        }
        if (availableEl) {
            availableEl.innerText = stats.available;
        }
        if (serviceEl) {
            serviceEl.innerText = stats.service;
        }
    }

    handleDocumentClick(event) {
        const editBtn = event.target.closest('.action-edit');
        if (editBtn) {
            event.stopPropagation();
            const row = editBtn.closest('.device-row');
            this.openEditDeviceModalByRow(row);
            return;
        }

        const deleteBtn = event.target.closest('.action-delete');
        if (deleteBtn) {
            event.stopPropagation();
            const row = deleteBtn.closest('.device-row');
            this.openDeleteConfirmByRow(row);
            return;
        }

        const row = event.target.closest('.device-row');
        if (row && !event.target.closest('.action-btn')) {
            this.openDeviceDetailByRow(row);
        }
    }

    openEditDeviceModalByRow(row) {
        if (!row) {
            return;
        }

        const device = this.store.filteredDevices[row.dataset.index];
        if (!device) {
            return;
        }

        this.populateDeviceForm(device);
        this.configureEditModal();
        this.deviceModalInstance?.show();
    }

    openDeleteConfirmByRow(row) {
        if (!row) {
            return;
        }

        const device = this.store.filteredDevices[row.dataset.index];
        if (!device) {
            return;
        }

        this.deleteTargetDevice = device;
        this.updateDeleteConfirmModal(device);
        this.deleteConfirmModalInstance?.show();
    }

    populateDeviceForm(device) {
        const fields = {
            deviceId: device.SN,
            deviceSN: device.SN,
            deviceListing: device.listing,
            deviceType: device.Type || device.type,
            deviceLaptop: device.laptop,
            deviceBrand: device.brand,
            deviceCPU: device.cpu,
            deviceRAM: device.ram,
            deviceStorage: device.storage,
            deviceName: device.name,
            deviceDivision: device.division,
            deviceStatus: device.status,
            deviceSpesifikasi: device.spesifikasi,
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value || '';
            }
        });
    }

    configureEditModal() {
        const modalTitle = document.getElementById('deviceModalTitle');
        const saveBtn = document.getElementById('saveDeviceBtn');
        const deleteBtn = document.getElementById('deleteDeviceBtn');

        const readonlyFields = ['deviceSN', 'deviceListing', 'deviceName', 'deviceDivision', 'deviceStatus'];
        readonlyFields.forEach(id => {
            const field = document.getElementById(id);
            if (field) {
                field.readOnly = true;
            }
        });

        const statusField = document.getElementById('deviceStatus');
        if (statusField) {
            statusField.disabled = true;
        }

        if (modalTitle) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2 text-warning"></i>Update Device';
        }
        if (saveBtn) {
            saveBtn.textContent = 'Update';
        }
        if (deleteBtn) {
            deleteBtn.classList.remove('d-none');
        }
    }

    async handleDeviceFormSubmit(event) {
        event.preventDefault();
        const deviceId = document.getElementById('deviceId')?.value.trim();

        if (!deviceId) {
            return alert('Tidak ada device yang dipilih untuk diperbarui.');
        }

        const payload = {
            SN: document.getElementById('deviceSN')?.value.trim(),
            listing: document.getElementById('deviceListing')?.value.trim(),
            Type: document.getElementById('deviceType')?.value.trim(),
            laptop: document.getElementById('deviceLaptop')?.value.trim(),
            brand: document.getElementById('deviceBrand')?.value.trim(),
            cpu: document.getElementById('deviceCPU')?.value.trim(),
            ram: document.getElementById('deviceRAM')?.value.trim(),
            storage: document.getElementById('deviceStorage')?.value.trim(),
            name: document.getElementById('deviceName')?.value.trim(),
            division: document.getElementById('deviceDivision')?.value.trim(),
            status: document.getElementById('deviceStatus')?.value.trim(),
            spesifikasi: document.getElementById('deviceSpesifikasi')?.value.trim(),
        };

        this.pendingUpdatePayload = payload;
        this.shouldReopenDeviceModalOnCancel = true;
        this.shouldShowUpdateConfirmAfterDeviceModalHide = true;
        this.deviceModalInstance?.hide();
    }

    openUpdateConfirmModal(payload) {
        const messageElement = document.getElementById('updateConfirmMessage');
        if (messageElement) {
            const deviceLabel = payload.name || payload.SN || 'device ini';
            messageElement.textContent = `Apakah Anda yakin ingin memperbarui ${deviceLabel}?`;
        }

        if (this.updateConfirmModalInstance) {
            this.updateConfirmModalInstance.show();
        }
    }

    async performUpdateDevice() {
        if (!this.pendingUpdatePayload) {
            return;
        }

        const confirmBtn = document.getElementById('confirmUpdateBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Memproses...';
        }

        this.updateConfirmModalInstance?.hide();
        this.showUpdateProcessing();

        try {
            const updatePromise = this.api.updateDevice(this.pendingUpdatePayload);
            await Promise.all([updatePromise, this.delay(3000)]);
            this.deviceModalInstance?.hide();
            await this.loadDevices();
        } catch (error) {
            alert('Update gagal: ' + error.message);
            console.error(error);
        } finally {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Perbarui';
            }
            this.hideUpdateProcessing();
            this.pendingUpdatePayload = null;
            this.isProcessingUpdate = false;
        }
    }

    handleDeleteDeviceClick(event) {
        event.preventDefault();
        const deviceId = document.getElementById('deviceId')?.value.trim();
        if (!deviceId) {
            return;
        }

        const device = this.store.findBySerialNumber(deviceId);
        if (!device) {
            return;
        }

        this.deleteTargetDevice = device;
        this.updateDeleteConfirmModal(device);
        this.deleteConfirmModalInstance?.show();
    }

    updateDeleteConfirmModal(device) {
        const message = document.getElementById('deleteConfirmMessage');
        const successElement = document.getElementById('deleteConfirmSuccess');
        const confirmBtn = document.getElementById('confirmDeleteBtn');

        if (message) {
            message.textContent = `Hapus device dengan SN ${escapeHTML(device.SN)}?`;
            message.classList.remove('d-none');
        }

        if (successElement) {
            successElement.classList.add('d-none');
            successElement.classList.remove('show');
        }

        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Hapus';
        }
    }

    async performDeleteDevice() {
        if (!this.deleteTargetDevice) {
            return;
        }

        const confirmBtn = document.getElementById('confirmDeleteBtn');
        if (confirmBtn) {
            confirmBtn.disabled = true;
            confirmBtn.textContent = 'Menghapus...';
        }

        try {
            await this.api.deleteDevice(this.deleteTargetDevice.SN);
            this.showDeleteSuccess();
            await this.loadDevices();
        } catch (error) {
            alert('Delete gagal: ' + error.message);
            console.error(error);
        } finally {
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Hapus';
            }
            this.deleteTargetDevice = null;
        }
    }

    showDeleteSuccess() {
        const messageElement = document.getElementById('deleteConfirmMessage');
        const successElement = document.getElementById('deleteConfirmSuccess');

        if (messageElement) {
            messageElement.classList.add('d-none');
        }
        if (successElement) {
            successElement.classList.remove('d-none');
            requestAnimationFrame(() => successElement.classList.add('show'));
        }

        setTimeout(() => {
            this.deleteConfirmModalInstance?.hide();
        }, 1500);
    }

    openDeviceDetailByRow(row) {
        if (!row) return;
        const device = this.store.filteredDevices[row.dataset.index];
        if (!device) return;

        this.populateDeviceDetail(device);
        const modal = new bootstrap.Modal(document.getElementById('deviceDetailModal'));
        modal.show();
    }

    populateDeviceDetail(device) {
        const fields = {
            detailSN: device.SN,
            detailNoList: device.listing,
            detailType: device.Type || device.type,
            detailBrand: device.brand,
            detailLaptop: device.laptop,
            detailCPU: device.cpu,
            detailRAM: device.ram,
            detailStorage: device.storage,
            detailStatus: buildStatusBadge(device.status),
            detailName: device.name,
            detailDivision: device.division,
            detailSpec: device.spesifikasi,
        };

        Object.entries(fields).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (!element) {
                return;
            }

            if (id === 'detailStatus') {
                element.innerHTML = value || buildStatusBadge('Unknown');
            } else {
                element.textContent = value || '-';
            }
        });
    }

    hideUpdateProcessing() {
        const element = document.getElementById('updateProcessing');
        if (element) {
            element.classList.add('d-none');
        }
    }

    showUpdateProcessing() {
        const element = document.getElementById('updateProcessing');
        if (element) {
            element.classList.remove('d-none');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setActiveCard(activeCard) {
        document.querySelectorAll('.filter-card').forEach(card => {
            card.classList.remove('active');
        });

        if (activeCard) {
            activeCard.classList.add('active');
        }
    }
}
