<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
    <h3 class="fw-bold text-white mb-2 mb-md-0">
        <i class="fas fa-chart-pie me-2 text-indigo"></i>Dashboard Device
    </h3>
    <div class="text-white-50 small mt-2 mt-md-0">
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
        <div class="card card-stat card-stat-assigned filter-card" id="cardAssigned" data-filter="assigned">
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
        <div class="card card-stat card-stat-available filter-card" id="cardAvailable" data-filter="available">
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
        <div class="card card-stat card-stat-service filter-card" id="cardService" data-filter="service">
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
