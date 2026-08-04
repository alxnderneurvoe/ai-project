// ====== Konfigurasi backend (n8n) — statis, tidak perlu diisi manual ======
const SCAN_URL = 'https://n8n.alxnderneurvoe.xyz/webhook/scan-sn';
const LIST_URL = 'https://n8n.alxnderneurvoe.xyz/webhook/list-sn';

let allEntries = [];   // {timestamp, name, listing, sn}
let selectedListing = null;
let html5QrCode = null;
let scanLocked = false; // cegah callback scan kepanggil berkali-kali (blast) untuk 1x scan

const typeSelect = document.getElementById('type-select');
const listingSelect = document.getElementById('listing-select');
const scanCard = document.getElementById('scan-card');
const rowsEl = document.getElementById('rows');
const countBadge = document.getElementById('count-badge');
const listingEmptyNote = document.getElementById('listing-empty-note');

function toast(msg, danger) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (danger ? ' danger' : '');
  setTimeout(() => t.className = 'toast', 2500);
}

function setConn(ok, msg) {
  document.getElementById('conn-dot').className = 'dot ' + (ok ? 'on' : 'off');
  document.getElementById('conn-text').textContent = msg;
}

async function loadList() {
  try {
    const res = await fetch(LIST_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('bad status ' + res.status);
    const data = await res.json();
    console.log('[sn-scanner] data mentah dari n8n:', data);
    allEntries = (Array.isArray(data) ? data : [])
      .map(d => ({
        timestamp: d.timestamp,
        type: (d.type || '').toString().trim(),
        name: (d.name || '').toString().trim(),
        listing: (d.listing || '').toString().trim(),
        sn: (d.sn || '').toString().trim()
      }))
      // buang baris artefak (mis. baris header ganda) yang listing-nya bukan format kode asli
      .filter(e => e.listing.includes('/'));
    console.log('[sn-scanner] entries setelah dibersihkan:', allEntries);
    console.log('[sn-scanner] daftar type unik yang terbaca:', [...new Set(allEntries.map(e => e.type))]);
    setConn(true, 'Terhubung ke n8n (' + allEntries.length + ' baris)');
    if (typeSelect.value) renderForType(typeSelect.value);
  } catch (err) {
    console.error('[sn-scanner] gagal load list:', err);
    setConn(false, 'Gagal terhubung ke n8n');
  }
}

function renderForType(type) {
  const filtered = allEntries.filter(e => e.type === type);
  console.log('[sn-scanner] filter tipe "' + type + '" ->', filtered.length, 'baris cocok');
  const emptyOnes = filtered.filter(e => !e.sn);

  listingSelect.innerHTML = '<option value="">— pilih listing —</option>' +
    emptyOnes.map(e => `<option value="${e.listing}">${e.listing}</option>`).join('');
  listingSelect.disabled = emptyOnes.length === 0;
  listingEmptyNote.textContent = emptyOnes.length === 0
    ? 'Semua listing tipe ini sudah ada SN-nya.'
    : `${emptyOnes.length} listing belum ada SN.`;

  countBadge.textContent = filtered.length;
  rowsEl.innerHTML = filtered.map(e => `
    <tr>
      <td class="sn">${e.listing}</td>
      <td>${e.name || '—'}</td>
      <td>${e.sn ? `<span>${e.sn}</span>` : '<span class="badge empty">belum ada</span>'}</td>
    </tr>`).join('') || '<tr><td colspan="3" style="text-align:center;color:#8a917f;">Belum ada data untuk tipe ini.</td></tr>';
}

typeSelect.onchange = () => {
  scanCard.style.display = 'none';
  if (typeSelect.value) {
    renderForType(typeSelect.value);
  } else {
    listingSelect.innerHTML = '<option value="">— pilih listing —</option>';
    listingSelect.disabled = true;
    rowsEl.innerHTML = '';
    countBadge.textContent = 0;
    listingEmptyNote.textContent = '';
  }
};

listingSelect.onchange = () => {
  selectedListing = listingSelect.value;
  if (selectedListing) {
    document.getElementById('active-listing').textContent = selectedListing;
    scanCard.style.display = 'block';
    document.getElementById('sn-input').value = '';
  } else {
    scanCard.style.display = 'none';
  }
};

document.getElementById('cancel-btn').onclick = () => {
  scanLocked = true;
  if (html5QrCode) { html5QrCode.stop().catch(() => {}); }
  document.getElementById('start-scan').style.display = 'inline-block';
  document.getElementById('stop-scan').style.display = 'none';
  listingSelect.value = '';
  scanCard.style.display = 'none';
};

document.getElementById('start-scan').onclick = () => {
  scanLocked = false;
  document.getElementById('start-scan').style.display = 'none';
  document.getElementById('stop-scan').style.display = 'inline-block';
  html5QrCode = new Html5Qrcode('reader');
  html5QrCode.start(
    { facingMode: 'environment' },
    {
      fps: 10,
      qrbox: { width: 260, height: 140 }
      // Sengaja TIDAK isi videoConstraints tambahan (mis. focusMode) di sini —
      // Safari iOS suka menolak (OverconstrainedError) constraint yang gak dikenal
      // saat getUserMedia awal, dan itu bikin kamera gagal start total.
    },
    (decodedText) => {
      if (scanLocked) return;
      scanLocked = true;
      document.getElementById('sn-input').value = decodedText;
      document.getElementById('start-scan').style.display = 'inline-block';
      document.getElementById('stop-scan').style.display = 'none';
      toast('SN terbaca: ' + decodedText);
      html5QrCode.stop().catch(() => {});
    },
    () => {}
  ).then(() => {
    applyContinuousFocus();
    applyZoom(currentZoom); // terapkan level zoom yang sedang aktif begitu kamera nyala
  }).catch((err) => {
    console.error('[sn-scanner] gagal start kamera:', err);
    toast('Kamera tidak bisa diakses — pastikan buka lewat HTTPS', true);
    document.getElementById('start-scan').style.display = 'inline-block';
    document.getElementById('stop-scan').style.display = 'none';
  });
};

// Coba aktifkan continuous autofocus SETELAH kamera nyala (bukan saat request awal),
// supaya browser yang gak dukung constraint ini (Safari iOS) tetap bisa jalan normal, cuma tanpa efek ini.
function applyContinuousFocus() {
  try {
    const videoEl = document.querySelector('#reader video');
    if (!videoEl || !videoEl.srcObject) return;
    const track = videoEl.srcObject.getVideoTracks()[0];
    if (!track || !track.applyConstraints) return;
    track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(() => {});
  } catch (err) {
    // diam-diam skip, gak perlu ganggu proses scan
  }
}

// ====== Zoom manual: tombol 1x / 2x / 5x / 10x ======
let currentZoom = 1;

document.querySelectorAll('.btn-zoom').forEach(btn => {
  btn.onclick = () => {
    const z = parseFloat(btn.dataset.zoom);
    console.log('[sn-scanner] tombol zoom diklik:', z + 'x');
    currentZoom = z;
    document.querySelectorAll('.btn-zoom').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const applied = applyZoom(z);
    if (!applied) {
      toast('Zoom diset ' + z + 'x — akan aktif saat kamera dimulai');
    }
  };
});

function applyZoom(zoomValue) {
  const videoEl = document.querySelector('#reader video');
  if (!videoEl || !videoEl.srcObject) {
    console.log('[sn-scanner] applyZoom: video belum aktif, nilai disimpan untuk nanti');
    return false; // kamera belum nyala, nilai tersimpan & dipakai saat start
  }

  let track = null;
  try {
    track = videoEl.srcObject.getVideoTracks()[0];
  } catch (err) { /* noop */ }

  let capabilities = {};
  try {
    // Safari iOS sering gak punya getCapabilities() sama sekali — bungkus try-catch.
    capabilities = (track && track.getCapabilities) ? track.getCapabilities() : {};
  } catch (err) {
    capabilities = {};
  }
  console.log('[sn-scanner] applyZoom: capabilities kamera =', capabilities);

  if (capabilities.zoom && track.applyConstraints) {
    // Zoom optik asli (Chrome Android biasanya support) — clamp ke batas kemampuan device.
    const z = Math.min(zoomValue, capabilities.zoom.max || zoomValue);
    track.applyConstraints({ advanced: [{ zoom: z }] })
      .then(() => console.log('[sn-scanner] zoom optik diterapkan:', z))
      .catch((err) => { console.warn('[sn-scanner] zoom optik gagal, fallback CSS:', err); applyCssZoom(videoEl, zoomValue); });
  } else {
    // Fallback zoom digital (CSS scale) — selalu jalan, termasuk di Safari iOS.
    console.log('[sn-scanner] pakai CSS zoom fallback:', zoomValue + 'x');
    applyCssZoom(videoEl, zoomValue);
  }
  return true;
}

function applyCssZoom(videoEl, scale) {
  videoEl.style.transformOrigin = 'center center';
  videoEl.style.transform = `scale(${scale})`;
  console.log('[sn-scanner] CSS transform diterapkan ke video:', videoEl.style.transform);
}

document.getElementById('stop-scan').onclick = () => {
  scanLocked = true;
  if (html5QrCode) html5QrCode.stop().catch(() => {});
  document.getElementById('start-scan').style.display = 'inline-block';
  document.getElementById('stop-scan').style.display = 'none';
};

function showLoading(text) {
  document.getElementById('loading-text').textContent = text || 'Memproses…';
  document.getElementById('loading-overlay').classList.add('show');
}

function hideLoading() {
  document.getElementById('loading-overlay').classList.remove('show');
}

document.getElementById('submit-btn').onclick = async () => {
  const sn = document.getElementById('sn-input').value.trim();
  if (!sn) { toast('Isi/scan SN dulu', true); return; }
  if (!selectedListing) { toast('Pilih listing dulu', true); return; }

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  showLoading('Menyimpan SN…');
  try {
    const res = await fetch(SCAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing: selectedListing, sn })
    });
    const data = await res.json();
    if (data.status === 'ok') {
      showLoading('Memuat ulang data…');
      toast('SN tersimpan untuk ' + selectedListing);
      scanCard.style.display = 'none';
      listingSelect.value = '';
      await loadList();
    } else {
      toast(data.message || 'Gagal menyimpan', true);
    }
  } catch (err) {
    toast('Gagal kirim ke n8n — cek koneksi', true);
  } finally {
    hideLoading();
    submitBtn.disabled = false;
  }
};

document.getElementById('refresh-btn').onclick = loadList;

loadList();