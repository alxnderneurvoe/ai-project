/**
 * devices.js
 * Manages fetching and storing device inventory data from the API.
 */

let allDevices = [];
let isLoadingDevices = false;

/**
 * Fetches all devices from the API and stores them in `allDevices`.
 * Disables the keterangan select while loading.
 */
async function initializeDevices() {
    if (isLoadingDevices) return;
    isLoadingDevices = true;

    const keteranganSelect = document.getElementById('keterangan');
    if (keteranganSelect) {
        keteranganSelect.disabled = true;
    }

    try {
        const response = await fetch('api/devices.php?ts=' + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Response is not a valid array');
        }

        // Filter out header mapping rows (rows where SN is empty or purely numeric)
        allDevices = data.filter(item => {
            if (!item) return false;
            const sn = String(item.SN || '').trim();
            return sn !== '' && sn !== '1' && !/^\d+$/.test(sn);
        });

        if (keteranganSelect) {
            keteranganSelect.disabled = false;
        }

    } catch (err) {
        console.error('Failed to initialize devices list:', err);
        showFeedback('Gagal mengambil data inventory. Cek koneksi API/n8n.', 'danger');
    } finally {
        isLoadingDevices = false;
    }
}
