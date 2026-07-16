const addDeviceForm = document.getElementById('addDeviceForm');
const addDeviceOutput = document.getElementById('deviceOutput');
const addDeviceSubmit = document.getElementById('submitDeviceBtn');

if (addDeviceForm) {
    addDeviceForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(addDeviceForm);
        const payload = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            payload.append(key, value.trim());
        }

        addDeviceSubmit.disabled = true;
        const originalText = addDeviceSubmit.innerHTML;
        addDeviceSubmit.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Submitting...';
        // addDeviceOutput.textContent = 'Mengirim data...';

        try {
            const response = await fetch('api/add-device.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: payload.toString(),
            });

            const result = await response.json();
            addDeviceOutput.textContent = JSON.stringify(result, null, 2);

            if (response.ok && result.success) {
                addDeviceForm.reset();
            }
        } catch (error) {
            addDeviceOutput.textContent = 'Error: ' + error.message;
        } finally {
            addDeviceSubmit.disabled = false;
            addDeviceSubmit.innerHTML = originalText;
        }
    });
}
