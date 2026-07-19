const addDeviceForm = document.getElementById('addDeviceForm');
const addDeviceOutput = document.getElementById('deviceOutput');
const addDeviceSubmit = document.getElementById('submitDeviceBtn');

function setOutput(message, success = true) {
    if (!addDeviceOutput) return;
    addDeviceOutput.classList.remove('d-none', 'alert-danger', 'alert-success', 'alert-info');
    addDeviceOutput.classList.add(success ? 'alert-success' : 'alert-danger');
    addDeviceOutput.textContent = message;
}

if (addDeviceForm) {
    addDeviceForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (addDeviceOutput) {
            addDeviceOutput.classList.add('d-none');
        }

        const formData = new FormData(addDeviceForm);
        const payload = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            payload.append(key, value.trim());
        }

        addDeviceSubmit.disabled = true;
        const originalText = addDeviceSubmit.innerHTML;
        addDeviceSubmit.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Submitting...';

        try {
            const response = await fetch('api/add-device.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: payload.toString(),
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setOutput('Device berhasil ditambahkan.');
                addDeviceForm.reset();
            } else {
                setOutput(result.message || 'Gagal menambahkan device.', false);
            }
        } catch (error) {
            setOutput('Error: ' + error.message, false);
        } finally {
            addDeviceSubmit.disabled = false;
            addDeviceSubmit.innerHTML = originalText;
        }
    });
}
