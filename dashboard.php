<?php include 'templates/header.php'; ?>

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
                    <div class="col-md-6">
                        <h6 class="text-primary mb-3">
                            <i class="fas fa-desktop me-2"></i>
                            Device Information
                        </h6>

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
                                <td>Brand</td>
                                <td id="detailBrand"></td>
                            </tr>

                            <tr>
                                <td>Laptop</td>
                                <td id="detailLaptop"></td>
                            </tr>

                            <tr>
                                <td>Status</td>
                                <td id="detailStatus"></td>
                            </tr>
                        </table>
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

<script src="assets/dashboard.js"></script>

<?php include 'templates/footer.php'; ?>