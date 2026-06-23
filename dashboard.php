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
        <div class="card card-stat card-stat-total">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider" style="font-size: 0.75rem;">Total Devices</h6>
                    <h2 class="fw-bold text-white mb-0" id="totalDevice">0</h2>
                </div>
                <div class="stat-icon bg-indigo-subtle text-indigo rounded-3 p-3">
                    <i class="fas fa-boxes fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-assigned">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider" style="font-size: 0.75rem;">Assigned</h6>
                    <h2 class="fw-bold text-white mb-0" id="assignedDevice">0</h2>
                </div>
                <div class="stat-icon bg-success-subtle text-success rounded-3 p-3">
                    <i class="fas fa-user-check fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-available">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider" style="font-size: 0.75rem;">Available</h6>
                    <h2 class="fw-bold text-white mb-0" id="availableDevice">0</h2>
                </div>
                <div class="stat-icon bg-secondary-subtle text-white-50 rounded-3 p-3">
                    <i class="fas fa-check-circle fa-2x"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="col-md-3 col-sm-6">
        <div class="card card-stat card-stat-service">
            <div class="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                    <h6 class="text-white-50 fw-semibold mb-1 text-uppercase tracking-wider" style="font-size: 0.75rem;">In Service</h6>
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
            <input type="text" class="form-control border-start-0 ps-0" id="searchDevice" placeholder="Cari berdasarkan SN, Model, Brand, Nama User, Divisi, atau Status...">
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

<script src="assets/dashboard.js"></script>
<?php include 'templates/footer.php'; ?>