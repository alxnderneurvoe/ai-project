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
