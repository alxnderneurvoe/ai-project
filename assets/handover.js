// let allDevices = [];
// let isLoadingDevices = false;

// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('handoverForm');
//     if (form) {
//         // Initial Fetch
//         initializeDevices();

//         // Listen to Keterangan changes
//         const keteranganSelect = document.getElementById('keterangan');
//         if (keteranganSelect) {
//             keteranganSelect.addEventListener('change', handleKeteranganChange);
//         }

//         // Listen to Name select changes
//         const nameSelect = document.getElementById('nameSelect');
//         if (nameSelect) {
//             nameSelect.addEventListener('change', handleNameSelectChange);
//         }

//         // Listen to SN select changes
//         const snSelect = document.getElementById('snSelect');
//         if (snSelect) {
//             snSelect.addEventListener('change', handleSnSelectChange);
//         }

//         // Handle form submission
//         form.addEventListener('submit', handleFormSubmit);
//     }
// });

// async function initializeDevices() {
//     if (isLoadingDevices) return;
//     isLoadingDevices = true;

//     // Show dynamic overlay loading status if select elements exist
//     const keteranganSelect = document.getElementById('keterangan');
//     if (keteranganSelect) {
//         keteranganSelect.disabled = true;
//     }

//     try {
//         const response = await fetch('api/devices.php?ts=' + Date.now());
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();

//         if (!Array.isArray(data)) {
//             throw new Error('Response is not a valid array');
//         }

//         // Securely filter out header mapping rows
//         allDevices = data.filter(item => {
//             if (!item) return false;
//             const sn = String(item.SN || '').trim();
//             return sn !== '' && sn !== '1' && !/^\d+$/.test(sn);
//         });

//         if (keteranganSelect) {
//             keteranganSelect.disabled = false;
//         }

//     } catch (err) {
//         console.error('Failed to initialize devices list:', err);
//         showFeedback('Gagal mengambil data inventory. Cek koneksi API/n8n.', 'danger');
//     } finally {
//         isLoadingDevices = false;
//     }
// }

// function handleKeteranganChange() {
//     const jenis = document.getElementById('keterangan').value;
//     clearForm();

//     const nameInputContainer = document.getElementById('nameInputContainer');
//     const nameSelectContainer = document.getElementById('nameSelectContainer');
//     const nameReadonlyContainer = document.getElementById('nameReadonlyContainer');

//     const snSelectContainer = document.getElementById('snSelectContainer');
//     const snInputContainer = document.getElementById('snInputContainer');

//     const divisionInput = document.getElementById('division');

//     // Reset visibility and required attributes
//     [nameInputContainer, nameSelectContainer, nameReadonlyContainer, snSelectContainer, snInputContainer].forEach(el => {
//         if (el) el.classList.add('d-none');
//     });

//     const nameInput = document.getElementById('nameInput');
//     const nameSelect = document.getElementById('nameSelect');
//     const nameReadonly = document.getElementById('nameReadonly');
//     const snSelect = document.getElementById('snSelect');
//     const snInput = document.getElementById('snInput');

//     if (nameInput) nameInput.required = false;
//     if (nameSelect) nameSelect.required = false;
//     if (nameReadonly) nameReadonly.required = false;
//     if (snSelect) snSelect.required = false;
//     if (snInput) snInput.required = false;

//     if (!jenis) return;

//     switch (jenis) {
//         case 'New Employee':
//         case 'Replacing-Baru':
//             // Name: Manual input
//             if (nameInputContainer) nameInputContainer.classList.remove('d-none');
//             if (nameInput) nameInput.required = true;

//             // SN: Select available
//             if (snSelectContainer) snSelectContainer.classList.remove('d-none');
//             if (snSelect) {
//                 snSelect.required = true;
//                 populateSnSelect('Available');
//             }

//             // Division: Editable
//             if (divisionInput) {
//                 divisionInput.removeAttribute('readonly');
//                 divisionInput.placeholder = 'Enter Division';
//                 divisionInput.required = true;
//             }
//             break;

//         case 'Replacing-Lama':
//         case 'Exit Clearance':
//         case 'Service':
//             // Name: Select assigned users
//             if (nameSelectContainer) nameSelectContainer.classList.remove('d-none');
//             if (nameSelect) {
//                 nameSelect.required = true;
//                 populateNameSelectService();
//             }

//             // SN: Readonly input (auto-filled)
//             if (snInputContainer) snInputContainer.classList.remove('d-none');
//             if (snInput) snInput.required = true;

//             // Division: Readonly (auto-filled)
//             if (divisionInput) {
//                 divisionInput.setAttribute('readonly', 'readonly');
//                 divisionInput.placeholder = 'Auto-filled from user selection';
//                 divisionInput.required = false;
//             }
//             break;

//         case 'Done Service':
//             // Name: Readonly input (auto-filled from device in service)
//             if (nameReadonlyContainer) nameReadonlyContainer.classList.remove('d-none');
//             if (nameReadonly) nameReadonly.required = true;

//             // SN: Select service devices
//             if (snSelectContainer) snSelectContainer.classList.remove('d-none');
//             if (snSelect) {
//                 snSelect.required = true;
//                 populateSnSelect('Service');
//             }

//             // Division: Readonly (auto-filled)
//             if (divisionInput) {
//                 divisionInput.setAttribute('readonly', 'readonly');
//                 divisionInput.placeholder = 'Auto-filled from device selection';
//                 divisionInput.required = false;
//             }
//             break;
//     }
// }

// function getspesifikasiString(item) {
//     return item.spesifikasi || '-';
// }

// function populateSnSelect(statusFilter) {
//     const snSelect = document.getElementById('snSelect');
//     if (!snSelect) return;

//     const filtered = allDevices.filter(d => {
//         const s = String(d.status || '').toLowerCase().trim();
//         return s === statusFilter.toLowerCase();
//     });

//     let html = `<option value="">Pilih SN (${statusFilter})</option>`;
//     filtered.forEach(item => {
//         const nameText = item.name ? ` [User: ${item.name}]` : '';
//         const spesifikasisText = getspesifikasiString(item);
//         html += `
//             <option value="${escapeHTML(item.SN)}" 
//                     data-laptop="${escapeHTML(item.laptop ?? '')}" 
//                     data-brand="${escapeHTML(item.brand ?? '')}"
//                     data-name="${escapeHTML(item.name ?? '')}"
//                     data-division="${escapeHTML(item.division ?? '')}"
//                     data-spesifikasi="${escapeHTML(spesifikasisText)}">
//                 ${escapeHTML(item.SN)} - ${escapeHTML(item.laptop ?? 'Unknown')} ${escapeHTML(nameText)}
//             </option>
//         `;
//     });
//     snSelect.innerHTML = html;
// }

// function populateNameSelect() {
//     const nameSelect = document.getElementById('nameSelect');
//     if (!nameSelect) return;

//     // Show users who currently have an Assigned device
//     const filtered = allDevices.filter(d => {
//         const s = String(d.status || '').toLowerCase().trim();
//         return s === 'assigned';
//     });

//     let html = '<option value="">Pilih User (Assigned)</option>';
//     filtered.forEach(item => {
//         const spesifikasisText = getspesifikasiString(item);
//         html += `
//             <option value="${escapeHTML(item.name)}" 
//                     data-sn="${escapeHTML(item.SN)}" 
//                     data-division="${escapeHTML(item.division ?? '')}"
//                     data-laptop="${escapeHTML(item.laptop ?? '')}"
//                     data-brand="${escapeHTML(item.brand ?? '')}"
//                     data-spesifikasi="${escapeHTML(spesifikasisText)}">
//                 ${escapeHTML(item.name)} (${escapeHTML(item.SN)})
//             </option>
//         `;
//     });
//     nameSelect.innerHTML = html;
// }

// // function populateNameSelectService() {
// //     const nameSelect = document.getElementById('nameSelect');
// //     if (!nameSelect) return;

// //     // Show users who currently have an Assigned device
// //     const filtered = allDevices.filter(d => {
// //         const s = String(d.status || '').toLowerCase().trim();
// //         return s === 'assigned' === true || s === 'available' === true ;
// //     });

// //     let html = '<option value="">Pilih User (Assigned)</option>';
// //     filtered.forEach(item => {
// //         const spesifikasisText = getspesifikasiString(item);
// //         html += `
// //             <option value="${escapeHTML(item.name)}" 
// //                     data-sn="${escapeHTML(item.SN)}" 
// //                     data-division="${escapeHTML(item.division ?? '')}"
// //                     data-laptop="${escapeHTML(item.laptop ?? '')}"
// //                     data-brand="${escapeHTML(item.brand ?? '')}"
// //                     data-spesifikasi="${escapeHTML(spesifikasisText)}">
// //                 ${escapeHTML(item.name)} (${escapeHTML(item.SN)})
// //             </option>
// //         `;
// //     });
// //     nameSelect.innerHTML = html;
// // }

// function populateNameSelectService() {

//     const nameSelect = document.getElementById('nameSelect');
//     if (!nameSelect) return;

//     const filtered = allDevices
//         .filter(d => {
//             const s = String(d.status || '').toLowerCase().trim();
//             return s === 'assigned' || s === 'available';
//         })
//         .sort((a, b) =>
//             String(a.name || '').localeCompare(
//                 String(b.name || ''),
//                 'id',
//                 { sensitivity: 'base' }
//             )
//         );

//     let html = `
//         <option value="">
//             Pilih User / SN
//         </option>
//     `;

//     filtered.forEach(item => {

//         const spesifikasisText = getspesifikasiString(item);

//         html += `
//             <option
//                 value="${escapeHTML(item.SN)}"
//                 data-name="${escapeHTML(item.name)}"
//                 data-sn="${escapeHTML(item.SN)}"
//                 data-division="${escapeHTML(item.division ?? '')}"
//                 data-laptop="${escapeHTML(item.laptop ?? '')}"
//                 data-brand="${escapeHTML(item.brand ?? '')}"
//                 data-spesifikasi="${escapeHTML(spesifikasisText)}">

//                 ${escapeHTML(item.name)}
//                 - ${escapeHTML(item.SN)}
//                 - ${escapeHTML(item.laptop)}

//             </option>
//         `;
//     });

//     nameSelect.innerHTML = html;
// }

// function adjustTextareaHeight(textarea) {
//     if (!textarea) return;
//     textarea.style.height = 'auto';
//     textarea.style.height = textarea.scrollHeight + 'px';
// }

// function handleNameSelectChange() {
//     const nameSelect = document.getElementById('nameSelect');
//     if (!nameSelect || nameSelect.selectedIndex <= 0) {
//         clearAutoFilledFields();
//         return;
//     }

//     const option = nameSelect.options[nameSelect.selectedIndex];

//     document.getElementById('snInput').value = option.dataset.sn || '';
//     document.getElementById('division').value = option.dataset.division || '';
//     document.getElementById('laptop').value = option.dataset.laptop || '';
//     document.getElementById('brand').value = option.dataset.brand || '';

//     const spesifikasiEl = document.getElementById('spesifikasi');
//     if (spesifikasiEl) {
//         spesifikasiEl.value = option.dataset.spesifikasi || '';
//         adjustTextareaHeight(spesifikasiEl);
//     }
// }

// function handleSnSelectChange() {
//     const snSelect = document.getElementById('snSelect');
//     if (!snSelect || snSelect.selectedIndex <= 0) {
//         clearAutoFilledFields();
//         return;
//     }

//     const option = snSelect.options[snSelect.selectedIndex];
//     const jenis = document.getElementById('keterangan').value;

//     document.getElementById('laptop').value = option.dataset.laptop || '';
//     document.getElementById('brand').value = option.dataset.brand || '';

//     const spesifikasiEl = document.getElementById('spesifikasi');
//     if (spesifikasiEl) {
//         spesifikasiEl.value = option.dataset.spesifikasi || '';
//         adjustTextareaHeight(spesifikasiEl);
//     }

//     if (jenis === 'Done Service') {
//         // Auto-fill Name and Division from the service device record
//         document.getElementById('nameReadonly').value = option.dataset.name || '';
//         document.getElementById('division').value = option.dataset.division || '';
//     }
// }

// async function handleFormSubmit(e) {
//     e.preventDefault();

//     const form = document.getElementById('handoverForm');
//     const submitBtn = form.querySelector('button[type="submit"]');

//     const keterangan = document.getElementById('keterangan').value;
//     const division = document.getElementById('division').value.trim();

//     // Determine values based on active fields
//     let name = '';
//     if (keterangan === 'New Employee' || keterangan === 'Replacing-Baru') {
//         name = document.getElementById('nameInput').value.trim();
//     } else if (keterangan === 'Done Service') {
//         name = document.getElementById('nameReadonly').value.trim();
//     } else {
//         name = document.getElementById('nameSelect').value.trim();
//     }

//     let sn = '';
//     if (keterangan === 'Replacing-Lama' || keterangan === 'Exit Clearance' || keterangan === 'Service' || keterangan === 'Done Service') {
//         sn = document.getElementById('snInput').value.trim();
//     } else {
//         sn = document.getElementById('snSelect').value.trim();
//     }

//     // Client-side validations
//     if (!keterangan) {
//         showFeedback('Silakan pilih Keterangan.', 'warning');
//         return;
//     }
//     if (!name) {
//         showFeedback('Nama tidak boleh kosong.', 'warning');
//         return;
//     }
//     if (!sn) {
//         showFeedback('Serial Number tidak boleh kosong.', 'warning');
//         return;
//     }

//     // Set loading state on submit button
//     const origBtnText = submitBtn.innerHTML;
//     submitBtn.disabled = true;
//     submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin me-2"></i>Submitting...';

//     // Construct URL encoded payload
//     const payload = new URLSearchParams();
//     payload.append('keterangan', keterangan);
//     payload.append('name', name);
//     payload.append('sn', sn);
//     payload.append('division', division);
//     console.log('Submitting payload:', payload.toString());

//     try {
//         const response = await fetch('api/submit.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             body: payload.toString()
//         });

//         const result = await response.json();

//         if (response.ok && result.success) {
//             showFeedback(`<strong>Sukses!</strong> ${escapeHTML(result.message || 'Transaksi berhasil dikirim.')}`, 'success');
//             form.reset();
//             clearForm();
//             // Re-fetch latest inventory statuses
//             await initializeDevices();
//         } else {
//             showFeedback(`<strong>Gagal:</strong> ${escapeHTML(result.message || 'Terjadi kesalahan pada webhook.')}`, 'danger');
//         }
//     } catch (err) {
//         console.error('Error submitting form:', err);
//         showFeedback('<strong>Error:</strong> Tidak dapat terhubung ke server PHP API.', 'danger');
//     } finally {
//         submitBtn.disabled = false;
//         submitBtn.innerHTML = origBtnText;
//     }
// }

// function showFeedback(msg, type) {
//     const existingAlert = document.getElementById('formAlert');
//     if (existingAlert) existingAlert.remove();

//     const alertHtml = `
//         <div id="formAlert" class="alert alert-${type} alert-dismissible fade show" role="alert" style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
//             <div class="d-flex align-items-center">
//                 <i class="fas ${getAlertIcon(type)} me-3" style="font-size: 1.3rem;"></i>
//                 <div>${msg}</div>
//             </div>
//             <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//         </div>
//     `;

//     const form = document.getElementById('handoverForm');
//     form.insertAdjacentHTML('beforebegin', alertHtml);

//     // Scroll to alert
//     document.getElementById('formAlert').scrollIntoView({ behavior: 'smooth', block: 'center' });
// }

// function getAlertIcon(type) {
//     switch (type) {
//         case 'success': return 'fa-check-circle';
//         case 'danger': return 'fa-exclamation-triangle';
//         case 'warning': return 'fa-exclamation-circle';
//         default: return 'fa-info-circle';
//     }
// }

// function clearForm() {
//     const alert = document.getElementById('formAlert');
//     if (alert) alert.remove();

//     // Empty values
//     const nameInput = document.getElementById('nameInput');
//     const nameSelect = document.getElementById('nameSelect');
//     const nameReadonly = document.getElementById('nameReadonly');
//     const snSelect = document.getElementById('snSelect');
//     const snInput = document.getElementById('snInput');

//     if (nameInput) nameInput.value = '';
//     if (nameSelect) nameSelect.innerHTML = '<option value="">Pilih Keterangan Terlebih Dahulu</option>';
//     if (nameReadonly) nameReadonly.value = '';

//     if (snSelect) snSelect.innerHTML = '<option value="">Pilih Keterangan Terlebih Dahulu</option>';
//     if (snInput) snInput.value = '';

//     clearAutoFilledFields();
// }

// function clearAutoFilledFields() {
//     const division = document.getElementById('division');
//     const laptop = document.getElementById('laptop');
//     const brand = document.getElementById('brand');
//     const spesifikasi = document.getElementById('spesifikasi');

//     if (division) division.value = '';
//     if (laptop) laptop.value = '';
//     if (brand) brand.value = '';
//     if (spesifikasi) {
//         spesifikasi.value = '';
//         spesifikasi.style.height = 'auto';
//     }
// }

// function escapeHTML(str) {
//     if (str === null || str === undefined) return '';
//     return String(str)
//         .replace(/&/g, '&amp;')
//         .replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;')
//         .replace(/"/g, '&quot;')
//         .replace(/'/g, '&#039;');
// }