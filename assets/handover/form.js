/**
 * form.js
 * Handles form field visibility toggling, clearing, and auto-filling
 * based on Keterangan selection and dropdown changes.
 */

/**
 * Handles changes to the Keterangan select.
 * Shows/hides the correct input fields and populates dropdowns.
 */
function handleKeteranganChange() {
    const jenis = document.getElementById('keterangan').value;
    clearForm();

    const nameInputContainer    = document.getElementById('nameInputContainer');
    const nameSelectContainer   = document.getElementById('nameSelectContainer');
    const nameReadonlyContainer = document.getElementById('nameReadonlyContainer');
    const snSelectContainer     = document.getElementById('snSelectContainer');
    const snInputContainer      = document.getElementById('snInputContainer');
    const divisionInput         = document.getElementById('division');

    // Hide all conditional containers first
    [nameInputContainer, nameSelectContainer, nameReadonlyContainer, snSelectContainer, snInputContainer]
        .forEach(el => { if (el) el.classList.add('d-none'); });

    // Remove required from all conditional fields
    const nameInput    = document.getElementById('nameInput');
    const nameSelect   = document.getElementById('nameSelect');
    const nameReadonly = document.getElementById('nameReadonly');
    const snSelect     = document.getElementById('snSelect');
    const snInput      = document.getElementById('snInput');

    if (nameInput)    nameInput.required    = false;
    if (nameSelect)   nameSelect.required   = false;
    if (nameReadonly) nameReadonly.required = false;
    if (snSelect)     snSelect.required     = false;
    if (snInput)      snInput.required      = false;

    if (!jenis) return;

    switch (jenis) {
        case 'New Employee':
        case 'Replacing-Baru':
            // Name: manual text input
            if (nameInputContainer) nameInputContainer.classList.remove('d-none');
            if (nameInput) nameInput.required = true;

            // SN: select from Available inventory
            if (snSelectContainer) snSelectContainer.classList.remove('d-none');
            if (snSelect) {
                snSelect.required = true;
                populateSnSelect('Available');
            }

            // Division: editable
            if (divisionInput) {
                divisionInput.removeAttribute('readonly');
                divisionInput.placeholder = 'Enter Division';
                divisionInput.required = true;
            }
            break;

        case 'Replacing-Lama':
        case 'Exit Clearance':
        case 'Service':
            // Name: select from assigned users
            if (nameSelectContainer) nameSelectContainer.classList.remove('d-none');
            if (nameSelect) {
                nameSelect.required = true;
                populateNameSelectService();
            }

            // SN: readonly, auto-filled from name selection
            if (snInputContainer) snInputContainer.classList.remove('d-none');
            if (snInput) snInput.required = true;

            // Division: readonly, auto-filled
            if (divisionInput) {
                divisionInput.setAttribute('readonly', 'readonly');
                divisionInput.placeholder = 'Auto-filled from user selection';
                divisionInput.required = false;
            }
            break;

        case 'Done Service':
            // Name: readonly, auto-filled from service device record
            if (nameReadonlyContainer) nameReadonlyContainer.classList.remove('d-none');
            if (nameReadonly) nameReadonly.required = true;

            // SN: select from Service inventory
            if (snSelectContainer) snSelectContainer.classList.remove('d-none');
            if (snSelect) {
                snSelect.required = true;
                populateSnSelect('Service');
            }

            // Division: readonly, auto-filled
            if (divisionInput) {
                divisionInput.setAttribute('readonly', 'readonly');
                divisionInput.placeholder = 'Auto-filled from device selection';
                divisionInput.required = false;
            }
            break;
    }
}

/**
 * Handles changes to the Name select dropdown.
 * Auto-fills SN, Division, Laptop, Brand, and Spesifikasi.
 */
function handleNameSelectChange() {
    const nameSelect = document.getElementById('nameSelect');
    if (!nameSelect || nameSelect.selectedIndex <= 0) {
        clearAutoFilledFields();
        return;
    }

    const option = nameSelect.options[nameSelect.selectedIndex];

    document.getElementById('snInput').value    = option.dataset.sn       || '';
    document.getElementById('division').value   = option.dataset.division  || '';
    document.getElementById('laptop').value     = option.dataset.laptop    || '';
    document.getElementById('brand').value      = option.dataset.brand     || '';

    const spesifikasiEl = document.getElementById('spesifikasi');
    if (spesifikasiEl) {
        spesifikasiEl.value = option.dataset.spesifikasi || '';
        adjustTextareaHeight(spesifikasiEl);
    }
}

/**
 * Handles changes to the SN select dropdown.
 * Auto-fills Laptop, Brand, Spesifikasi, and (for Done Service) Name and Division.
 */
function handleSnSelectChange() {
    const snSelect = document.getElementById('snSelect');
    if (!snSelect || snSelect.selectedIndex <= 0) {
        clearAutoFilledFields();
        return;
    }

    const option = snSelect.options[snSelect.selectedIndex];
    const jenis  = document.getElementById('keterangan').value;

    document.getElementById('laptop').value = option.dataset.laptop || '';
    document.getElementById('brand').value  = option.dataset.brand  || '';

    const spesifikasiEl = document.getElementById('spesifikasi');
    if (spesifikasiEl) {
        spesifikasiEl.value = option.dataset.spesifikasi || '';
        adjustTextareaHeight(spesifikasiEl);
    }

    if (jenis === 'Done Service') {
        document.getElementById('nameReadonly').value = option.dataset.name     || '';
        document.getElementById('division').value     = option.dataset.division || '';
    }
}

/**
 * Resets all form fields and hides all conditional containers.
 */
function clearForm() {
    const alert = document.getElementById('formAlert');
    if (alert) alert.remove();

    const nameInput    = document.getElementById('nameInput');
    const nameSelect   = document.getElementById('nameSelect');
    const nameReadonly = document.getElementById('nameReadonly');
    const snSelect     = document.getElementById('snSelect');
    const snInput      = document.getElementById('snInput');

    if (nameInput)    nameInput.value       = '';
    if (nameSelect)   nameSelect.innerHTML  = '<option value="">Pilih Keterangan Terlebih Dahulu</option>';
    if (nameReadonly) nameReadonly.value    = '';
    if (snSelect)     snSelect.innerHTML    = '<option value="">Pilih Keterangan Terlebih Dahulu</option>';
    if (snInput)      snInput.value         = '';

    clearAutoFilledFields();
}

/**
 * Clears the auto-filled read-only fields (Division, Laptop, Brand, Spesifikasi).
 */
function clearAutoFilledFields() {
    const division    = document.getElementById('division');
    const laptop      = document.getElementById('laptop');
    const brand       = document.getElementById('brand');
    const spesifikasi = document.getElementById('spesifikasi');

    if (division)    division.value  = '';
    if (laptop)      laptop.value    = '';
    if (brand)       brand.value     = '';
    if (spesifikasi) {
        spesifikasi.value        = '';
        spesifikasi.style.height = 'auto';
    }
}

/**
 * Adjusts textarea height to fit its content dynamically.
 * @param {HTMLTextAreaElement} textarea
 */
function adjustTextareaHeight(textarea) {
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}
