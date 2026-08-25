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

  // Simpan namaHari yang dipilih (dipakai HARI_SAMA untuk label titik chart, mis. "Sabtu 1").
  renderResult(currentMode, res.data, payload);
}

// Biru dulu, lalu hijau, baru warna lain kalau serinya lebih dari 2 (mis. bandingkan banyak tahun sekaligus).
const CHART_PALETTE = ['#2F6FB0', '#33513A', '#C08A34', '#A8433A', '#6B4FA0', '#1F8A8C'];
let comparisonChartInstance = null;

function renderResult(mode, data, payload) {
  const resultBox = document.getElementById('resultBox');

  if (data.perTahun) {
    const summaryHtml = '<div class="card"><div class="card-title">Hasil per Tahun</div>' +
      '<div class="per-year-list">' +
      data.perTahun.map(function (row) {
        let label = row.tahun;
        if (row.tanggal) label = row.tahun + ' &middot; ' + row.tanggal;
        else if (row.dari && row.sampai) label = row.tahun + ' &middot; ' + row.dari + ' - ' + row.sampai;

        return '<div class="per-year-row"><div class="tahun">' + label + '</div>' +
          '<div class="angka">' + formatAngka(row.total) +
          (row.average !== undefined ? '<br><span style="font-size:11px;color:var(--muted);">avg ' + formatAngka(row.average) + '</span>' : '') +
          '</div></div>';
      }).join('') +
      '</div></div>';

    resultBox.innerHTML = summaryHtml + chartCardHtml();

    const seriesList = data.perTahun
      .filter(function (row) { return row.detail && row.detail.length; })
      .map(function (row) { return { name: String(row.tahun), data: row.detail }; });

    const xLabels = buildXLabels(mode, payload, seriesList);
    renderWaveChart(seriesList, xLabels);
    return;
  }

  // mode HARI / BULAN / CUSTOM -> buildHasilDua
  const summaryHtml = '<div class="card">' +
    '<div class="result-compare-grid">' +
    '<div class="side"><div class="period-label">' + data.a.label + '</div><div class="total mono">' + formatAngka(data.a.total) + '</div></div>' +
    '<div class="vs">VS<br>selisih<br>' + formatAngka(data.difference) + '</div>' +
    '<div class="side"><div class="period-label">' + data.b.label + '</div><div class="total mono">' + formatAngka(data.b.total) + '</div></div>' +
    '</div>' +
    '<div style="text-align:center;margin-top:14px;">' +
    '<span class="delta ' + deltaClass(data.growthPercent) + '">' + formatPersen(data.growthPercent) + '</span>' +
    '</div>' +
    '</div>';

  // HARI -> bar horizontal (cuma 2 angka, gak perlu wave)
  if (mode === 'HARI') {
    resultBox.innerHTML = summaryHtml + barChartCardHtml();
    renderBarChart(data.a.label, data.a.total, data.b.label, data.b.total);
    return;
  }

  resultBox.innerHTML = summaryHtml + chartCardHtml();

  const seriesList = [];
  if (data.chart && data.chart.seriesA && data.chart.seriesA.length) {
    seriesList.push({ name: data.a.label, data: data.chart.seriesA });
  }
  if (data.chart && data.chart.seriesB && data.chart.seriesB.length) {
    seriesList.push({ name: data.b.label, data: data.chart.seriesB });
  }

  const xLabels = buildXLabels(mode, payload, seriesList);
  renderWaveChart(seriesList, xLabels);
}

/**
 * Bikin label sumbu-x sesuai mode, supaya "Titik 1, 2, 3" jadi lebih bermakna:
 * - HARI_SAMA -> nama hari yang dipilih + urutan ("Sabtu 1", "Sabtu 2", ...)
 * - MINGGU    -> nama hari Senin..Minggu (karena tiap titik = 1 hari dalam minggu itu)
 * - BULAN     -> angka tanggal saja ("1", "2", ... "31"), tanpa kata "Titik"
 * - lainnya (POSISI_HARI, CUSTOM) -> "Titik 1", "Titik 2", ... (default)
 */
function buildXLabels(mode, payload, seriesList) {
  const maxLen = seriesList.reduce(function (m, s) { return Math.max(m, s.data.length); }, 0);

  if (mode === 'HARI_SAMA' && payload && payload.namaHari) {
    return Array.from({ length: maxLen }, function (_, i) { return payload.namaHari + ' ' + (i + 1); });
  }

  if (mode === 'MINGGU') {
    const namaHariSenin = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return Array.from({ length: maxLen }, function (_, i) { return namaHariSenin[i] || ('Hari ' + (i + 1)); });
  }

  if (mode === 'BULAN') {
    return Array.from({ length: maxLen }, function (_, i) { return String(i + 1); });
  }

  return Array.from({ length: maxLen }, function (_, i) { return 'Titik ' + (i + 1); });
}

function chartCardHtml() {
  return '<div class="card"><div class="card-title">Grafik Tren</div>' +
    '<div class="compare-chart-wrap"><canvas id="comparisonChart"></canvas></div></div>';
}

function barChartCardHtml() {
  return '<div class="card"><div class="card-title">Perbandingan</div>' +
    '<div class="compare-chart-wrap-bar"><canvas id="comparisonChart"></canvas></div></div>';
}

/**
 * seriesList: [{ name, data: [{tanggal, total}, ...] }, ...]
 * xLabels: array label kategori sumbu-x, panjangnya = titik data terbanyak antar seri.
 * Digambar sebagai line chart (wave) memakai sumbu kategori (bukan angka polos),
 * supaya labelnya bisa "Sabtu 1", "Senin", "1", dst sesuai mode.
 */
function renderWaveChart(seriesList, xLabels) {
  const canvas = document.getElementById('comparisonChart');
  if (!canvas || !seriesList.length) return;

  const datasets = seriesList.map(function (s, idx) {
    const color = CHART_PALETTE[idx % CHART_PALETTE.length];
    return {
      label: s.name,
      data: s.data.map(function (d) { return d.total; }),
      borderColor: color,
      backgroundColor: hexToRgba(color, 0.1),
      borderWidth: 2.5,
      pointRadius: 3,
      pointBackgroundColor: color,
      fill: seriesList.length <= 2,
      spanGaps: true,
      tension: 0.35
    };
  });

  // Simpan tanggal asli tiap titik (buat tooltip) di luar dataset supaya gak ikut di-parse Chart.js.
  const tanggalPerSeri = seriesList.map(function (s) { return s.data.map(function (d) { return d.tanggal; }); });

  if (comparisonChartInstance) comparisonChartInstance.destroy();

  comparisonChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: { labels: xLabels, datasets: datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            afterLabel: function (item) {
              const tgl = tanggalPerSeri[item.datasetIndex] && tanggalPerSeri[item.datasetIndex][item.dataIndex];
              return tgl ? tgl : '';
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, grid: { color: '#EDEAE0' } }
      }
    }
  });
}

/** Bar horizontal 2 batang: A di atas, B di bawah. Dipakai khusus mode HARI. */
function renderBarChart(labelA, totalA, labelB, totalB) {
  const canvas = document.getElementById('comparisonChart');
  if (!canvas) return;

  if (comparisonChartInstance) comparisonChartInstance.destroy();

  comparisonChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels: [labelA, labelB],
      datasets: [{
        data: [totalA, totalB],
        backgroundColor: [CHART_PALETTE[0], CHART_PALETTE[1]],
        borderRadius: 8,
        barThickness: 36
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, grid: { color: '#EDEAE0' } },
        y: { grid: { display: false }, ticks: { font: { size: 12.5 } } }
      }
    }
  });
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}
