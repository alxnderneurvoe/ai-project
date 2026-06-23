<?php include 'templates/header.php'; ?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="fw-bold text-white mb-0">
        <i class="fas fa-history me-2 text-indigo"></i>Handover Log History
    </h3>
    <div class="text-white-50 small">
        <span class="badge bg-dark border border-secondary px-3 py-2 rounded-pill">
            <i class="fas fa-file-invoice me-2"></i>Audit Trail
        </span>
    </div>
</div>

<div class="card card-premium shadow-lg">

    <div class="card-header py-3 d-flex align-items-center justify-content-between">
        <h5 class="mb-0 fw-bold text-white">
            <i class="fas fa-list me-2 text-indigo"></i>Transaction Log
        </h5>
        <span class="small text-muted" style="font-size: 0.8rem;">Sorted by latest transaction first</span>
    </div>

    <div class="card-body p-4">

        <div class="input-group mb-4 search-input-group shadow-sm">
            <span class="input-group-text border-end-0"><i class="fas fa-search text-muted"></i></span>
            <input type="text" id="historySearch" class="form-control border-start-0 ps-0"
                placeholder="Cari berdasarkan nama karyawan, Serial Number (SN), keterangan, laptop, divisi...">
        </div>

        <div class="table-responsive">

            <table class="table table-premium table-hover align-middle mb-0">

                <thead>

                    <tr>
                        <th class="ps-3">Timestamp</th>
                        <th>Name</th>
                        <th>SN</th>
                        <th>Laptop</th>
                        <th class="pe-3">Division</th>
                        <th>Keterangan</th>
                    </tr>

                </thead>

                <tbody id="historyTable"></tbody>

            </table>

        </div>

    </div>

</div>

<script src="assets/history.js"></script>
<?php include 'templates/footer.php'; ?>