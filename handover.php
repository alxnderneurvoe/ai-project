<?php
require 'auth.php';
require_role(['admin', 'user']);
include 'templates/header.php';
?>

<div class="row justify-content-center">
    <div class="col-lg-7">

        <div class="card card-premium shadow-lg">

            <div class="card-header d-flex align-items-center justify-content-between py-3">
                <h5 class="mb-0 fw-bold text-white"><i class="fas fa-file-signature me-2 text-indigo"></i>Device
                    Handover Form</h5>
                <span class="badge bg-indigo-subtle text-indigo px-3 py-2 rounded-pill small fw-medium">SOP
                    Compliant</span>
            </div>

            <div class="card-body p-4">

                <form id="handoverForm" autocomplete="off">

                    <!-- KETERANGAN -->
                    <div class="mb-4">
                        <label class="form-label fw-semibold text-white-50"><i
                                class="fas fa-tasks me-2"></i>Keterangan</label>
                        <select class="form-select form-select-lg" name="keterangan" id="keterangan" required>
                            <option value="">Pilih Keterangan Transaksi</option>
                            <option value="New Employee">New Employee (Karyawan Baru)</option>
                            <option value="Replacing-Lama">Replacing-Lama (Kembalikan Laptop Lama)</option>
                            <option value="Replacing-Baru">Replacing-Baru (Terima Laptop Baru)</option>
                            <option value="Exit Clearance">Exit Clearance (Karyawan Resign)</option>
                            <option value="Service">Service (Perbaikan Laptop)</option>
                            <option value="Done Service">Done Service (Selesai Perbaikan)</option>
                        </select>
                    </div>

                    <div class="row">
                        <!-- NAMA -->
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-semibold text-white-50"><i class="fas fa-user me-2"></i>Nama
                                Karyawan</label>

                            <!-- Manual Name Input (for New Employee, Replacing-Baru) -->
                            <div id="nameInputContainer">
                                <input type="text" class="form-control form-control-lg" id="nameInput"
                                    placeholder="Masukkan Nama">
                            </div>

                            <!-- Dropdown Select Name (for Replacing-Lama, Exit Clearance, Service) -->
                            <div id="nameSelectContainer" class="d-none">
                                <select class="form-select form-select-lg" id="nameSelect">
                                    <option value="">Pilih User</option>
                                </select>
                            </div>

                            <!-- Readonly Name Input (for Done Service) -->
                            <div id="nameReadonlyContainer" class="d-none">
                                <input type="text" class="form-control form-control-lg bg-dark-subtle" id="nameReadonly"
                                    readonly placeholder="Auto-filled from SN">
                            </div>
                        </div>

                        <!-- SN -->
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-semibold text-white-50"><i
                                    class="fas fa-barcode me-2"></i>Serial Number (SN)</label>

                            <!-- Dropdown Select SN (for New Employee, Replacing-Baru, Done Service) -->
                            <div id="snSelectContainer">
                                <select class="form-select form-select-lg" id="snSelect">
                                    <option value="">Pilih SN</option>
                                </select>
                            </div>

                            <!-- Readonly SN Input (for Replacing-Lama, Exit Clearance, Service) -->
                            <div id="snInputContainer" class="d-none">
                                <input type="text" class="form-control form-control-lg bg-dark-subtle" id="snInput"
                                    readonly placeholder="Auto-filled from User">
                            </div>
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold text-white-50"><i
                                class="fas fa-sitemap me-2"></i>Division</label>
                        <input type="text" class="form-control form-control-lg" id="division" placeholder="Division">
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-semibold text-white-50"><i class="fas fa-laptop me-2"></i>Laptop
                                Model</label>
                            <input type="text" class="form-control form-control-lg bg-dark-subtle" id="laptop" readonly
                                placeholder="Auto-filled">
                        </div>

                        <div class="col-md-6 mb-4">
                            <label class="form-label fw-semibold text-white-50"><i
                                    class="fas fa-industry me-2"></i>Brand</label>
                            <input type="text" class="form-control form-control-lg bg-dark-subtle" id="brand" readonly
                                placeholder="Auto-filled">
                        </div>
                    </div>

                    <div class="mb-4">
                        <label class="form-label fw-semibold text-white-50">
                            <i class="fas fa-microchip me-2"></i>
                            Spesifikasi Laptop
                        </label>

                        <textarea class="form-control bg-dark-subtle" id="spesifikasi" rows="3" readonly
                            style="resize:none;"></textarea>
                    </div>
                    <button id="submitBtn" type="submit"
                        class="btn btn-indigo btn-lg fw-bold text-white py-3 shadow-sm">
                        <i class="fas fa-paper-plane me-2"></i>Submit Handover
                    </button>
                </form>
            </div>

        </div>
    </div>
</div>

<script src="assets/handover/ui.js"></script>
<script src="assets/handover/devices.js"></script>
<script src="assets/handover/populate.js"></script>
<script src="assets/handover/form.js"></script>
<script src="assets/handover/submit.js"></script>
<script src="assets/handover/main.js"></script>
<!-- <script src="assets/handover.js"></script> -->
<?php include 'templates/footer.php'; ?>