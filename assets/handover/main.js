/**
 * main.js
 * Entry point. Wires up all event listeners after the DOM is ready.
 *
 * Load order in HTML:
 *   1. ui.js
 *   2. devices.js
 *   3. populate.js
 *   4. form.js
 *   5. submit.js
 *   6. main.js   ← this file (last)
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('handoverForm');
    if (!form) return;

    // Fetch device inventory on page load
    initializeDevices();

    // Keterangan dropdown → toggle visible fields
    const keteranganSelect = document.getElementById('keterangan');
    if (keteranganSelect) {
        keteranganSelect.addEventListener('change', handleKeteranganChange);
    }

    // Name select → auto-fill SN, Division, Laptop, Brand, Spesifikasi
    const nameSelect = document.getElementById('nameSelect');
    if (nameSelect) {
        nameSelect.addEventListener('change', handleNameSelectChange);
    }

    // SN select → auto-fill Laptop, Brand, Spesifikasi (and Name/Division for Done Service)
    const snSelect = document.getElementById('snSelect');
    if (snSelect) {
        snSelect.addEventListener('change', handleSnSelectChange);
    }

    // Form submit
    form.addEventListener('submit', handleFormSubmit);
});
