<?php
require 'auth.php';
require_role(['admin', 'user', 'viewer']);
$currentRole = current_user_role();
include 'templates/header.php';
?>

<script>
    window.CURRENT_USER_ROLE = <?php echo json_encode($currentRole, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP); ?>;
</script>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="fw-bold text-white mb-0">
        <i class="fas fa-chart-pie me-2 text-indigo"></i>Dashboard Device
    </h3>
    <div class="text-white-50 small">
        <span class="badge bg-dark border border-secondary px-3 py-2 rounded-pill">
            <i class="fas fa-circle text-success me-2 animate-pulse"></i>Live Monitoring
        </span>
    </div>
</div>

<!-- STATS CARDS -->
<div class="row mb-4 g-3">
    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-total filter-card" id="cardTotal" data-filter="all">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider"
                        style="font-size: 0.75rem;">Total Devices</h6>
                    <h2 class="fw-bold text-white mb-0" id="totalDevice">0</h2>
                </div>
                <div class="stat-icon bg-indigo-subtle text-indigo rounded-3 p-3">
                    <i class="fas fa-boxes fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-assigned filter-card" id="cardAssigned" data-filter="assigned">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider"
                        style="font-size: 0.75rem;">Assigned</h6>
                    <h2 class="fw-bold text-white mb-0" id="assignedDevice">0</h2>
                </div>
                <div class="stat-icon bg-success-subtle text-success rounded-3 p-3">
                    <i class="fas fa-user-check fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-available filter-card" id="cardAvailable" data-filter="available">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider"
                        style="font-size: 0.75rem;">Available</h6>
                    <h2 class="fw-bold text-white mb-0" id="availableDevice">0</h2>
                </div>
                <div class="stat-icon bg-secondary-subtle text-white-50 rounded-3 p-3">
                    <i class="fas fa-check-circle fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-service filter-card" id="cardService" data-filter="service">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider"
                        style="font-size: 0.75rem;">In Service</h6>
                    <h2 class="fw-bold text-white mb-0" id="serviceDevice">0</h2>
                </div>
                <div class="stat-icon bg-warning-subtle text-warning rounded-3 p-3">
                    <i class="fas fa-tools fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

</div>

<!-- DATA TABLE -->
<div class="card card-premium shadow-lg">

    <div class="card-header py-3 d-flex align-items-center justify-content-between">
        <h5 class="mb-0 fw-bold text-white">
            <i class="fas fa-table me-2 text-indigo"></i>Device Inventory Master
        </h5>
        <div class="d-flex align-items-center gap-2">
            <span class="small text-muted d-none d-md-inline" style="font-size: 0.8rem;">Auto-refreshing...</span>
        </div>
    </div>

    <div class="card-body p-4">

        <div class="input-group mb-4 search-input-group shadow-sm">
            <span class="input-group-text border-end-0"><i class="fas fa-search text-muted"></i></span>
            <input type="text" class="form-control border-start-0 ps-0" id="searchDevice"
                placeholder="Cari berdasarkan SN, Model, Brand, Nama User, Divisi, atau Status...">
        </div>

        <div class="table-responsive">

            <table class="table table-premium table-hover align-middle mb-0">

                <thead>
                    <tr>
                        <th class="ps-3">SN</th>
                        <th>No List</th>
                        <th>Laptop</th>
                        <th>Name</th>
                        <th>Division</th>
                        <th class="pe-3">Status</th>
                        <?php if ($currentRole === 'admin'): ?>
                            <th class="pe-3">Actions</th>
                        <?php endif; ?>
                    </tr>
                </thead>

                <tbody id="deviceTable"></tbody>

            </table>

        </div>

    </div>

</div>

<!-- Device Detail Modal -->
<div class="modal fade" id="deviceDetailModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary text-white">

            <div class="modal-header border-secondary">
                <h5 class="modal-title">
                    <i class="fas fa-laptop me-2 text-primary"></i>
                    Device Detail
                </h5>

                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <div class="row g-4">
                    <!-- Device -->
                    <div class="col-12">
                        <h6 class="text-primary mb-3">
                            <i class="fas fa-desktop me-2"></i>
                            Device Information
                        </h6>

                        <div class="row g-3">
                            <div class="col-md-6">
                                <table class="table table-dark table-borderless mb-0">
                                    <tr>
                                        <td width="35%">Serial Number</td>
                                        <td id="detailSN"></td>
                                    </tr>
                                    <tr>
                                        <td>No List</td>
                                        <td id="detailNoList"></td>
                                    </tr>
                                    <tr>
                                        <td>Type Device</td>
                                        <td id="detailType"></td>
                                    </tr>
                                    <tr>
                                        <td>Brand</td>
                                        <td id="detailBrand"></td>
                                    </tr>
                                    <tr>
                                        <td>Nama Device</td>
                                        <td id="detailLaptop"></td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <table class="table table-dark table-borderless mb-0">
                                    <tr>
                                        <td width="35%">CPU</td>
                                        <td id="detailCPU"></td>
                                    </tr>
                                    <tr>
                                        <td>RAM</td>
                                        <td id="detailRAM"></td>
                                    </tr>
                                    <tr>
                                        <td>Penyimpanan</td>
                                        <td id="detailStorage"></td>
                                    </tr>
                                    <tr>
                                        <td>Status</td>
                                        <td id="detailStatus"></td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>

                    <!-- User -->
                    <div class="col-md-6">
                        <h6 class="text-success mb-3">
                            <i class="fas fa-user me-2"></i>
                            User Information
                        </h6>

                        <table class="table table-dark table-borderless mb-0">

                            <tr>
                                <td width="35%">Name</td>
                                <td id="detailName"></td>
                            </tr>

                            <tr>
                                <td>Division</td>
                                <td id="detailDivision"></td>
                            </tr>

                        </table>
                    </div>

                    <!-- Specification -->
                    <div class="col-12">

                        <h6 class="text-warning mb-3">
                            <i class="fas fa-microchip me-2"></i>
                            Full Specification
                        </h6>

                        <div class="card bg-secondary bg-opacity-10 border-secondary">
                            <div class="card-body">

                                <pre id="detailSpec" class="mb-0 text-white"
                                    style="white-space:pre-wrap;font-family:inherit;"></pre>

                            </div>
                        </div>

                    </div>

                </div>

            </div>

            <div class="modal-footer border-secondary">
                <button class="btn btn-secondary" data-bs-dismiss="modal">
                    Close
                </button>
            </div>

        </div>
    </div>
</div>
<div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary text-white">
            <div class="modal-header border-secondary">
                <h5 class="modal-title">
                    <i class="fas fa-exclamation-triangle me-2 text-danger"></i>
                    Konfirmasi Hapus Device
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <p id="deleteConfirmMessage" class="mb-0">Apakah Anda yakin ingin menghapus device ini?</p>
                <div id="deleteConfirmSuccess" class="text-center d-none mt-4">
                    <div class="delete-check-icon mb-3">
                        <i class="fas fa-check-circle fa-4x text-success"></i>
                    </div>
                    <p class="mb-0 fw-semibold">Berhasil dihapus!</p>
                </div>
            </div>
            <div class="modal-footer border-secondary">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Batal</button>
                <button type="button" id="confirmDeleteBtn" class="btn btn-danger">Hapus</button>
            </div>
        </div>
    </div>
</div>
<style>
    @keyframes deleteCheckPop {
        0% {
            transform: scale(0.5);
            opacity: 0;
        }

        60% {
            transform: scale(1.15);
            opacity: 1;
        }

        100% {
            transform: scale(1);
            opacity: 1;
        }
    }

    #deleteConfirmSuccess {
        opacity: 0;
        transition: opacity 0.25s ease;
    }

    #deleteConfirmSuccess.show {
        opacity: 1;
    }

    #deleteConfirmSuccess .delete-check-icon {
        animation: deleteCheckPop 0.45s ease-out;
    }
</style>
<div class="modal fade" id="deviceModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content bg-dark border-secondary text-white">
            <div class="modal-header border-secondary">
                <h5 class="modal-title" id="deviceModalTitle">
                    <i class="fas fa-plus me-2 text-primary"></i>
                    Tambah Device
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                    aria-label="Close"></button>
            </div>
            <form id="deviceForm">
                <div class="modal-body">
                    <input type="hidden" id="deviceId" value="">
                    <div class="row gy-3">
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Serial Number (SN)</label>
                            <input type="text" id="deviceSN" class="form-control form-control-lg" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">No List</label>
                            <input type="text" id="deviceListing" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-4"></div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Type</label>
                            <select id="deviceType" class="form-select form-select-lg">
                                <option value="">Pilih Type</option>
                                <option value="Laptop">Laptop</option>
                                <option value="Tablet">Tablet</option>
                                <option value="Smartphone">Smartphone</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Nama Device</label>
                            <input type="text" id="deviceLaptop" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Brand</label>
                            <input type="text" id="deviceBrand" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">CPU</label>
                            <input type="text" id="deviceCPU" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">RAM</label>
                            <select id="deviceRAM" class="form-select form-select-lg">
                                <option value="">Pilih RAM</option>
                                <option value="4GB">4GB</option>
                                <option value="8GB">8GB</option>
                                <option value="10GB">10GB</option>
                                <option value="12GB">12GB</option>
                                <option value="16GB">16GB</option>
                                <option value="32GB">32GB</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Storage</label>
                            <select id="deviceStorage" class="form-select form-select-lg">
                                <option value="">Pilih Storage</option>
                                <option value="">---------SSD NVME---------</option>
                                <option value="64GB - SSD NVME">64GB - SSD NVME</option>
                                <option value="128GB - SSD NVME">128GB - SSD NVME</option>
                                <option value="256GB - SSD NVME">256GB - SSD NVME</option>
                                <option value="512GB - SSD NVME">512GB - SSD NVME</option>
                                <option value="1TB - SSD NVME">1TB - SSD NVME</option>
                                <option value="">---------SSD SATA---------</option>
                                <option value="64GB - SSD SATA">64GB - SSD SATA</option>
                                <option value="128GB - SSD SATA">128GB - SSD SATA</option>
                                <option value="256GB - SSD SATA">256GB - SSD SATA</option>
                                <option value="512GB - SSD SATA">512GB - SSD SATA</option>
                                <option value="1TB - SSD SATA">1TB - SSD SATA</option>
                                <option value="">---------HDD SATA---------</option>
                                <option value="64GB - HDD SATA">64GB - HDD SATA</option>
                                <option value="128GB - HDD SATA">128GB - HDD SATA</option>
                                <option value="256GB - HDD SATA">256GB - HDD SATA</option>
                                <option value="512GB - HDD SATA">512GB - HDD SATA</option>
                                <option value="1TB - HDD SATA">1TB - HDD SATA</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Name</label>
                            <input type="text" id="deviceName" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Division</label>
                            <input type="text" id="deviceDivision" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-white-50">Status</label>
                            <input type="text" id="deviceStatus" class="form-control form-control-lg">
                        </div>
                        <div class="col-md-12">
                            <label class="form-label text-white-50">Spesifikasi</label>
                            <textarea id="deviceSpesifikasi" class="form-control form-control-lg" rows="3"></textarea>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" id="deleteDeviceBtn" class="btn btn-danger d-none">Delete</button>
                    <button type="submit" class="btn btn-primary" id="saveDeviceBtn">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="assets/dashboard.js"></script>

<?php include 'templates/footer.php'; ?>