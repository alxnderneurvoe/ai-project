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
    const res = await fetch(LIST_URL);
    if (!res.ok) throw new Error('bad status');
    const data = await res.json();
    allEntries = (Array.isArray(data) ? data : []).map(d => ({
      timestamp: d.timestamp, name: d.name, listing: d.listing, sn: d.sn
    })).filter(e => e.listing);
    setConn(true, 'Terhubung ke n8n');
    if (typeSelect.value) renderForType(typeSelect.value);
  } catch (err) {
    setConn(false, 'Gagal terhubung ke n8n');
  }
}

function renderForType(type) {
  const filtered = allEntries.filter(e => e.name === type);
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
      <td>${e.sn ? `<span>${e.sn}</span>` : '<span class="badge empty">belum ada</span>'}</td>
    </tr>`).join('') || '<tr><td colspan="2" style="text-align:center;color:#8a917f;">Belum ada data untuk tipe ini.</td></tr>';
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
    { fps: 10, qrbox: { width: 260, height: 140 } },
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
  ).catch(() => {
    toast('Kamera tidak bisa diakses — pastikan buka lewat HTTPS', true);
    document.getElementById('start-scan').style.display = 'inline-block';
    document.getElementById('stop-scan').style.display = 'none';
  });
};

document.getElementById('stop-scan').onclick = () => {
  scanLocked = true;
  if (html5QrCode) html5QrCode.stop().catch(() => {});
  document.getElementById('start-scan').style.display = 'inline-block';
  document.getElementById('stop-scan').style.display = 'none';
};

document.getElementById('submit-btn').onclick = async () => {
  const sn = document.getElementById('sn-input').value.trim();
  if (!sn) { toast('Isi/scan SN dulu', true); return; }
  if (!selectedListing) { toast('Pilih listing dulu', true); return; }
  try {
    const res = await fetch(SCAN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing: selectedListing, sn })
    });
    const data = await res.json();
    if (data.status === 'ok') {
      toast('SN tersimpan untuk ' + selectedListing);
      scanCard.style.display = 'none';
      listingSelect.value = '';
      await loadList();
    } else {
      toast(data.message || 'Gagal menyimpan', true);
    }
  } catch (err) {
    toast('Gagal kirim ke n8n — cek koneksi', true);
  }
};

document.getElementById('refresh-btn').onclick = loadList;

loadList();