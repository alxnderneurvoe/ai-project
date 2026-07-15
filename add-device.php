<?php
require 'auth.php';
require_role(['admin']);
include 'templates/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h3 class="fw-bold text-white mb-0">
        <i class="fas fa-plus me-2 text-indigo"></i>Tambah Device Baru
    </h3>
</div>

<div class="card card-premium shadow-lg">
    <div class="card-header py-3">
        <h5 class="mb-0 fw-bold text-white">Form Device Baru</h5>
    </div>
    <div class="card-body p-4">
        <form id="addDeviceForm" autocomplete="off">
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label text-white-50">Serial Number (SN)</label>
                    <input type="text" class="form-control form-control-lg" id="sn" name="sn" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-white-50">Type</label>
                    <select class="form-select form-select-lg" id="type" name="type" required>
                        <option value="">Pilih Type</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Tablet">Tablet</option>
                        <option value="Smartphone">Smartphone</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-white-50">Laptop</label>
                    <input type="text" class="form-control form-control-lg" id="laptop" name="laptop" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-white-50">Brand</label>
                    <input type="text" class="form-control form-control-lg" id="brand" name="brand" required>
                </div>
                <div class="col-md-6">
                    <label class="form-label text-white-50">CPU</label>
                    <input type="text" class="form-control form-control-lg" id="cpu" name="cpu">
                </div>
                <div class="col-md-6">
                    <label class="form-label text-white-50">RAM</label>
                    <select class="form-select form-select-lg" id="ram" name="ram">
                        <option value="">Pilih RAM</option>
                        <option value="4GB">4GB</option>
                        <option value="8GB">8GB</option>
                        <option value="10GB">10GB</option>
                        <option value="12GB">12GB</option>
                        <option value="16GB">16GB</option>
                        <option value="32GB">32GB</option>
                    </select>
                </div>
                <div class="col-12">
                    <label class="form-label text-white-50">Storage</label>
                    <select class="form-select form-select-lg" id="storage_full" name="storage_full" required>
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
                <div class="col-12">
                    <label class="form-label text-white-50">Spesifikasi</label>
                    <textarea class="form-control form-control-lg" id="spesifikasi" name="spesifikasi"
                        rows="4"></textarea>
                </div>
            </div>

            <div class="mt-4">
                <button id="submitDeviceBtn" type="submit"
                    class="btn btn-indigo btn-lg fw-bold text-white py-3 shadow-sm">
                    <i class="fas fa-paper-plane me-2"></i>Submit Device
                </button>
            </div>
        </form>
    </div>
</div>

<script src="assets/add-device.js"></script>

<?php include 'templates/footer.php';
