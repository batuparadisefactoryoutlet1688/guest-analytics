/**
 * INPUT.JS
 * Logic untuk input.html — hanya ADMIN. Input, edit, hapus data harian.
 */

let currentEditingExisting = false;

document.addEventListener('DOMContentLoaded', async function () {
  if (!requireAdmin()) return;
  renderShell('input.html');
  document.querySelectorAll('.ridge-svg-slot').forEach(function (el) { el.innerHTML = ridgeSvg(); });

  const dateInput = document.getElementById('tanggal');
  dateInput.value = todayISO();
  dateInput.addEventListener('change', onDateChange);

  ['l1pagi', 'l1sore', 'l2pagi', 'l2sore'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', updateTotalPreview);
  });

  document.getElementById('inputForm').addEventListener('submit', onSubmit);
  document.getElementById('deleteBtn').addEventListener('click', onDelete);

  await onDateChange();
  await loadRecentData();
});

function updateTotalPreview() {
  const total = toNum('l1pagi') + toNum('l1sore') + toNum('l2pagi') + toNum('l2sore');
  document.getElementById('totalPreview').textContent = formatAngka(total);
}

function toNum(id) {
  const v = document.getElementById(id).value;
  return Number(v) || 0;
}

async function onDateChange() {
  const msgBox = document.getElementById('inputMessage');
  clearMessage(msgBox);
  const tanggal = document.getElementById('tanggal').value;
  if (!tanggal) return;

  const res = await callApi('GET_DATA', { dariTanggal: tanggal, sampaiTanggal: tanggal });
  const existing = (res && res.status === 'success' && res.data.length) ? res.data[0] : null;

  currentEditingExisting = !!existing;
  document.getElementById('formModeLabel').textContent = existing ? 'Mode: Edit data yang sudah ada' : 'Mode: Input data baru';
  document.getElementById('deleteBtn').classList.toggle('hidden', !existing);
  document.getElementById('submitBtn').textContent = existing ? 'Simpan Perubahan' : 'Simpan Data';

  document.getElementById('l1pagi').value = existing ? existing.LANTAI_1_PAGI : '';
  document.getElementById('l1sore').value = existing ? existing.LANTAI_1_SORE : '';
  document.getElementById('l2pagi').value = existing ? existing.LANTAI_2_PAGI : '';
  document.getElementById('l2sore').value = existing ? existing.LANTAI_2_SORE : '';
  document.getElementById('catatan').value = existing ? (existing.CATATAN || '') : '';

  updateTotalPreview();
}

async function onSubmit(e) {
  e.preventDefault();
  const msgBox = document.getElementById('inputMessage');
  clearMessage(msgBox);
  const submitBtn = document.getElementById('submitBtn');

  const payload = {
    tanggal: document.getElementById('tanggal').value,
    lantai1Pagi: document.getElementById('l1pagi').value,
    lantai1Sore: document.getElementById('l1sore').value,
    lantai2Pagi: document.getElementById('l2pagi').value,
    lantai2Sore: document.getElementById('l2sore').value,
    catatan: document.getElementById('catatan').value
  };

  const defaultLabel = currentEditingExisting ? 'Simpan Perubahan' : 'Simpan Data';
  setButtonLoading(submitBtn, true, defaultLabel);
  const res = await callApi(currentEditingExisting ? 'UPDATE_DATA' : 'INPUT_DATA', payload);
  setButtonLoading(submitBtn, false, defaultLabel);

  if (res && res.status === 'success') {
    showMessage(msgBox, res.message, 'success');
    await onDateChange();
    await loadRecentData();
  } else {
    showMessage(msgBox, (res && res.message) || 'Gagal menyimpan data.', 'error');
  }
}

async function onDelete() {
  if (!confirm('Hapus data tanggal ini? Tindakan ini tidak bisa dibatalkan.')) return;

  const msgBox = document.getElementById('inputMessage');
  clearMessage(msgBox);
  const tanggal = document.getElementById('tanggal').value;

  const res = await callApi('DELETE_DATA', { tanggal: tanggal });
  if (res && res.status === 'success') {
    showMessage(msgBox, res.message, 'success');
    await onDateChange();
    await loadRecentData();
  } else {
    showMessage(msgBox, (res && res.message) || 'Gagal menghapus data.', 'error');
  }
}

async function loadRecentData() {
  const tbody = document.getElementById('recentDataBody');
  const today = new Date();
  const dari = new Date(today);
  dari.setDate(dari.getDate() - 13);

  const res = await callApi('GET_DATA', {
    dariTanggal: toISO(dari),
    sampaiTanggal: toISO(today)
  });

  if (!res || res.status !== 'success' || !res.data.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Belum ada data pada 14 hari terakhir.</td></tr>';
    return;
  }

  const rows = res.data.slice().sort(function (a, b) { return new Date(b.TANGGAL) - new Date(a.TANGGAL); });

  tbody.innerHTML = rows.map(function (r) {
    const tgl = new Date(r.TANGGAL);
    return '<tr>' +
      '<td>' + formatTglSingkat(tgl) + '</td>' +
      '<td class="num">' + formatAngka(r.LANTAI_1_PAGI) + '</td>' +
      '<td class="num">' + formatAngka(r.LANTAI_1_SORE) + '</td>' +
      '<td class="num">' + formatAngka(r.LANTAI_2_PAGI) + '</td>' +
      '<td class="num">' + formatAngka(r.LANTAI_2_SORE) + '</td>' +
      '<td class="num" style="font-weight:700;">' + formatAngka(r.TOTAL_TAMU) + '</td>' +
      '</tr>';
  }).join('');
}

function toISO(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + m + '-' + d;
}

function formatTglSingkat(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return d + '/' + m + '/' + date.getFullYear();
}
