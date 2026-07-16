/**
 * submit.js
 * Handles form submission: collects field values, validates,
 * posts to the PHP API, and handles the response.
 */

/**
 * Handles the handover form submit event.
 * @param {SubmitEvent} e
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const form = document.getElementById('handoverForm');
    const submitBtn = form.querySelector('button[type="submit"]');

    const keterangan = document.getElementById('keterangan').value;
    const division = document.getElementById('division').value.trim();

    // Get references
    const nameSelect = document.getElementById('nameSelect');
    const selectedNameOption = nameSelect.selectedOptions[0];

    // Determine Name
    let name = '';

    if (keterangan === 'New Employee' || keterangan === 'Replacing-Baru') {
        name = document.getElementById('nameInput').value.trim();

    } else if (keterangan === 'Done Service') {
        name = document.getElementById('nameReadonly').value.trim();

    } else if (['Replacing-Lama', 'Exit Clearance', 'Service'].includes(keterangan)) {
        // Ambil nama dari data-name, bukan value
        name = selectedNameOption?.dataset.name || '';

    } else {
        name = nameSelect.value.trim();
    }

    // Determine SN
    let sn = '';

    if (['Replacing-Lama', 'Exit Clearance', 'Service'].includes(keterangan)) {
        // SN sudah diisi otomatis pada input readonly
        sn = document.getElementById('snInput').value.trim();

    } else if (keterangan === 'Done Service') {
        sn = document.getElementById('snInput').value.trim();

    } else {
        sn = document.getElementById('snSelect').value.trim();
    }

    // Client-side validation
    if (!keterangan) {
        showFeedback('Silakan pilih Keterangan.', 'warning');
        return;
    }
    if (!name) {
        showFeedback('Nama tidak boleh kosong.', 'warning');
        return;
    }
    if (!sn) {
        showFeedback('Serial Number tidak boleh kosong.', 'warning');
        return;
    }

    // Set loading state
    const origBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Submitting...';

    const payload = new URLSearchParams();
    payload.append('keterangan', keterangan);
    payload.append('name', name);
    payload.append('sn', sn);
    payload.append('division', division);
    console.log('Submitting payload:', payload.toString());

    try {
        const response = await fetch('api/submit.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: payload.toString()
        });

        const result = await response.json();

        if (response.ok && result.success) {
            showFeedback(`<strong>Sukses!</strong> ${escapeHTML(result.message || 'Transaksi berhasil dikirim.')}`, 'success');
            form.reset();
            clearForm();
            await initializeDevices();
        } else {
            showFeedback(`<strong>Gagal:</strong> ${escapeHTML(result.message || 'Terjadi kesalahan pada webhook.')}`, 'danger');
        }
    } catch (err) {
        console.error('Error submitting form:', err);
        showFeedback('<strong>Error:</strong> Tidak dapat terhubung ke server PHP API.', 'danger');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnText;
    }
}
