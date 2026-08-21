/**
 * COMPARISON.JS
 * Logic untuk comparison.html — jantung aplikasi.
 * Satu form area yang berubah field-nya sesuai mode yang dipilih,
 * memanggil action COMPARE dengan payload sesuai mode.
 */

const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const HARI_LIST = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

let currentMode = 'HARI';

document.addEventListener('DOMContentLoaded', function () {
  if (!requireAuth()) return;
  renderShell('comparison.html');
  document.querySelectorAll('.ridge-svg-slot').forEach(function (el) { el.innerHTML = ridgeSvg(); });

  document.querySelectorAll('.tabs button[data-mode]').forEach(function (btn) {
    btn.addEventListener('click', function () { switchMode(btn.dataset.mode); });
  });

  document.getElementById('compareForm').addEventListener('submit', onSubmit);

  buildFormFor('HARI');
});

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tabs button[data-mode]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  document.getElementById('resultBox').innerHTML = '';
  clearMessage(document.getElementById('compareMessage'));
  buildFormFor(mode);
}

function yearOptionsHtml(name) {
  const now = new Date().getFullYear();
  const years = [now, now - 1, now - 2, now - 3];
  return '<div class="year-checks">' + years.map(function (y, idx) {
    return '<label><input type="checkbox" name="' + name + '" value="' + y + '" ' + (idx < 2 ? 'checked' : '') + '> ' + y + '</label>';
  }).join('') + '</div>';
}

function selectOptionsHtml(id, list, offsetOne) {
  return '<select id="' + id + '">' + list.map(function (item, idx) {
    return '<option value="' + (offsetOne ? idx + 1 : item) + '">' + item + '</option>';
  }).join('') + '</select>';
}

function buildFormFor(mode) {
  const el = document.getElementById('formFields');

  if (mode === 'HARI') {
    el.innerHTML =
      '<div class="field-row">' +
      '<div class="field"><label>Tanggal A</label><input type="date" id="tanggalA" value="' + todayISO() + '"></div>' +
      '<div class="field"><label>Tanggal B (mis. tahun lalu)</label><input type="date" id="tanggalB" value="' + shiftYearISO(todayISO(), -1) + '"></div>' +
      '</div>';
  }

  if (mode === 'HARI_SAMA') {
    el.innerHTML =
      '<div class="field-row">' +
      '<div class="field"><label>Hari</label>' + selectOptionsHtml('namaHari', HARI_LIST) + '</div>' +
      '<div class="field"><label>Bulan</label>' + selectOptionsHtml('bulan', BULAN_LIST, true) + '</div>' +
      '</div>' +
      '<div class="field"><label>Tahun</label>' + yearOptionsHtml('tahunHariSama') + '</div>';
    document.getElementById('namaHari').value = 'Senin';
  }

  if (mode === 'MINGGU') {
    el.innerHTML =
      '<div class="field-row">' +
      '<div class="field"><label>Bulan</label>' + selectOptionsHtml('bulanMinggu', BULAN_LIST, true) + '</div>' +
      '<div class="field"><label>Minggu Ke-</label>' + selectOptionsHtml('mingguKe', ['1', '2', '3', '4', '5']) + '</div>' +
      '</div>' +
      '<div class="field"><label>Tahun</label>' + yearOptionsHtml('tahunMinggu') + '</div>';
  }

  if (mode === 'POSISI_HARI') {
    el.innerHTML =
      '<div class="field-row">' +
      '<div class="field"><label>Hari</label>' + selectOptionsHtml('namaHariPosisi', HARI_LIST) + '</div>' +
      '<div class="field"><label>Posisi</label>' + selectOptionsHtml('posisi', ['1', '2', '3', '4', 'terakhir']) + '</div>' +
      '</div>' +
      '<div class="field"><label>Bulan</label>' + selectOptionsHtml('bulanPosisi', BULAN_LIST, true) + '</div>' +
      '<div class="field"><label>Tahun</label>' + yearOptionsHtml('tahunPosisi') + '</div>';
    document.getElementById('namaHariPosisi').value = 'Sabtu';
    document.getElementById('posisi').value = '2';
  }

  if (mode === 'BULAN') {
    el.innerHTML =
      '<div class="card" style="padding:12px;margin-bottom:10px;"><div class="card-title">Bulan A</div>' +
      '<div class="field-row">' +
      '<div class="field"><label>Bulan</label>' + selectOptionsHtml('bulanA', BULAN_LIST, true) + '</div>' +
      '<div class="field"><label>Tahun</label><input type="number" id="tahunA" value="' + new Date().getFullYear() + '"></div>' +
      '</div></div>' +
      '<div class="card" style="padding:12px;"><div class="card-title">Bulan B</div>' +
      '<div class="field-row">' +
      '<div class="field"><label>Bulan</label>' + selectOptionsHtml('bulanB', BULAN_LIST, true) + '</div>' +
      '<div class="field"><label>Tahun</label><input type="number" id="tahunB" value="' + (new Date().getFullYear() - 1) + '"></div>' +
      '</div></div>';
  }

  if (mode === 'CUSTOM') {
    el.innerHTML =
      '<div class="card" style="padding:12px;margin-bottom:10px;"><div class="card-title">Periode A</div>' +
      '<div class="field-row">' +
      '<div class="field"><label>Dari</label><input type="date" id="dariA"></div>' +
      '<div class="field"><label>Sampai</label><input type="date" id="sampaiA" value="' + todayISO() + '"></div>' +
      '</div></div>' +
      '<div class="card" style="padding:12px;"><div class="card-title">Periode B</div>' +
      '<div class="field-row">' +
      '<div class="field"><label>Dari</label><input type="date" id="dariB"></div>' +
      '<div class="field"><label>Sampai</label><input type="date" id="sampaiB" value="' + shiftYearISO(todayISO(), -1) + '"></div>' +
      '</div></div>';
  }
}

function shiftYearISO(iso, deltaYear) {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + deltaYear);
  return toISO(d);
}

function toISO(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + m + '-' + day;
}

function checkedYears(name) {
  return Array.from(document.querySelectorAll('input[name="' + name + '"]:checked')).map(function (i) { return Number(i.value); });
}

async function onSubmit(e) {
  e.preventDefault();
  const msgBox = document.getElementById('compareMessage');
  const resultBox = document.getElementById('resultBox');
  const submitBtn = document.getElementById('compareSubmit');
  clearMessage(msgBox);
  resultBox.innerHTML = '';

  let payload = { mode: currentMode };

  if (currentMode === 'HARI') {
    payload.tanggalA = document.getElementById('tanggalA').value;
    payload.tanggalB = document.getElementById('tanggalB').value;
  } else if (currentMode === 'HARI_SAMA') {
    payload.namaHari = document.getElementById('namaHari').value;
    payload.bulan = Number(document.getElementById('bulan').value);
    payload.tahunList = checkedYears('tahunHariSama');
  } else if (currentMode === 'MINGGU') {
    payload.bulan = Number(document.getElementById('bulanMinggu').value);
    payload.mingguKe = Number(document.getElementById('mingguKe').value);
    payload.tahunList = checkedYears('tahunMinggu');
  } else if (currentMode === 'POSISI_HARI') {
    payload.namaHari = document.getElementById('namaHariPosisi').value;
    const posisiVal = document.getElementById('posisi').value;
    payload.posisi = posisiVal === 'terakhir' ? 'terakhir' : Number(posisiVal);
    payload.bulan = Number(document.getElementById('bulanPosisi').value);
    payload.tahunList = checkedYears('tahunPosisi');
  } else if (currentMode === 'BULAN') {
    payload.bulanA = Number(document.getElementById('bulanA').value);
    payload.tahunA = Number(document.getElementById('tahunA').value);
    payload.bulanB = Number(document.getElementById('bulanB').value);
    payload.tahunB = Number(document.getElementById('tahunB').value);
  } else if (currentMode === 'CUSTOM') {
    payload.dariA = document.getElementById('dariA').value;
    payload.sampaiA = document.getElementById('sampaiA').value;
    payload.dariB = document.getElementById('dariB').value;
    payload.sampaiB = document.getElementById('sampaiB').value;
  }

  if ((currentMode === 'HARI_SAMA' || currentMode === 'MINGGU' || currentMode === 'POSISI_HARI') && !payload.tahunList.length) {
    showMessage(msgBox, 'Pilih minimal satu tahun.', 'error');
    return;
  }

  setButtonLoading(submitBtn, true, 'Bandingkan');
  const res = await callApi('COMPARE', payload);
  setButtonLoading(submitBtn, false, 'Bandingkan');

  if (!res || res.status !== 'success') {
    showMessage(msgBox, (res && res.message) || 'Gagal membandingkan data.', 'error');
    return;
  }

  renderResult(currentMode, res.data);
}

function renderResult(mode, data) {
  const resultBox = document.getElementById('resultBox');

  if (data.perTahun) {
    resultBox.innerHTML = '<div class="card"><div class="card-title">Hasil per Tahun</div>' +
      '<div class="per-year-list">' +
      data.perTahun.map(function (row) {
        const label = row.tanggal ? (row.tahun + ' &middot; ' + row.tanggal) : row.tahun;
        return '<div class="per-year-row"><div class="tahun">' + label + '</div>' +
          '<div class="angka">' + formatAngka(row.total) +
          (row.average !== undefined ? '<br><span style="font-size:11px;color:var(--muted);">avg ' + formatAngka(row.average) + '</span>' : '') +
          '</div></div>';
      }).join('') +
      '</div></div>';
    return;
  }

  // mode HARI / BULAN / CUSTOM -> buildHasilDua
  resultBox.innerHTML = '<div class="card">' +
    '<div class="result-compare-grid">' +
    '<div class="side"><div class="period-label">' + data.a.label + '</div><div class="total mono">' + formatAngka(data.a.total) + '</div></div>' +
    '<div class="vs">VS<br>selisih<br>' + formatAngka(data.difference) + '</div>' +
    '<div class="side"><div class="period-label">' + data.b.label + '</div><div class="total mono">' + formatAngka(data.b.total) + '</div></div>' +
    '</div>' +
    '<div style="text-align:center;margin-top:14px;">' +
    '<span class="delta ' + deltaClass(data.growthPercent) + '">' + formatPersen(data.growthPercent) + '</span>' +
    '</div>' +
    '</div>';
}
