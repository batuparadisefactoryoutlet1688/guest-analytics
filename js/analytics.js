/**
 * ANALYTICS.JS
 * Logic untuk analytics.html — analisis Lantai 1 vs 2, Pagi vs Sore, Weekend vs Weekday.
 */

document.addEventListener('DOMContentLoaded', async function () {
  renderShell('analytics.html');
  document.querySelectorAll('.ridge-svg-slot').forEach(function (el) { el.innerHTML = ridgeSvg(); });

  const dariInput = document.getElementById('dariTanggal');
  const sampaiInput = document.getElementById('sampaiTanggal');

  const now = new Date();
  const dari30 = new Date(now);
  dari30.setDate(dari30.getDate() - 29);
  dariInput.value = toISO(dari30);
  sampaiInput.value = toISO(now);

  document.getElementById('analyticsForm').addEventListener('submit', function (e) {
    e.preventDefault();
    loadAnalytics();
  });

  await loadAnalytics();
});

function toISO(date) {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return date.getFullYear() + '-' + m + '-' + d;
}

async function loadAnalytics() {
  const msgBox = document.getElementById('analyticsMessage');
  const wrap = document.getElementById('analyticsResult');
  clearMessage(msgBox);

  const dari = document.getElementById('dariTanggal').value;
  const sampai = document.getElementById('sampaiTanggal').value;

  const res = await callApi('GET_ANALYTICS', { dariTanggal: dari, sampaiTanggal: sampai });

  if (!res || res.status !== 'success') {
    wrap.innerHTML = '';
    showMessage(msgBox, (res && res.message) || 'Gagal memuat analytics.', 'error');
    return;
  }

  const d = res.data;
  wrap.innerHTML =
    renderRingkasan(d.ringkasan) +
    renderSplitCard('Lantai 1 vs Lantai 2', 'Lantai 1', d.lantai.lantai1, 'Lantai 2', d.lantai.lantai2, d.lantai.proporsiLantai1Persen) +
    renderSplitCard('Pagi vs Sore', 'Pagi', d.pagiSore.pagi, 'Sore', d.pagiSore.sore, d.pagiSore.proporsiPagiPersen) +
    renderWeekendCard(d.weekendWeekday);
}

function renderRingkasan(r) {
  return '<div class="kpi-grid" style="margin-bottom:14px;">' +
    '<div class="kpi"><div class="label">Total</div><div class="value mono">' + formatAngka(r.total) + '</div></div>' +
    '<div class="kpi"><div class="label">Rata-rata / Hari</div><div class="value mono">' + formatAngka(r.average) + '</div></div>' +
    '<div class="kpi"><div class="label">Tertinggi / Terendah</div><div class="value mono" style="font-size:20px;">' + formatAngka(r.highest) + ' / ' + formatAngka(r.lowest) + '</div></div>' +
    '</div>';
}

function renderSplitCard(title, labelA, valA, labelB, valB, proporsiAPersen) {
  const total = valA + valB;
  const persenA = total ? (valA / total * 100) : 0;
  const persenB = 100 - persenA;

  return '<div class="card"><div class="card-title">' + title + '</div>' +
    '<div class="split-bar-row">' +
    '<div style="width:70px;font-size:13px;">' + labelA + '</div>' +
    '<div class="bar-track"><div class="bar-fill" style="width:' + persenA.toFixed(1) + '%;"></div></div>' +
    '<div class="bar-value">' + formatAngka(valA) + '</div>' +
    '</div>' +
    '<div class="split-bar-row">' +
    '<div style="width:70px;font-size:13px;">' + labelB + '</div>' +
    '<div class="bar-track"><div class="bar-fill accent" style="width:' + persenB.toFixed(1) + '%;"></div></div>' +
    '<div class="bar-value">' + formatAngka(valB) + '</div>' +
    '</div>' +
    '</div>';
}

function renderWeekendCard(ww) {
  return '<div class="card"><div class="card-title">Weekend vs Weekday</div>' +
    '<div class="floor-split">' +
    '<div><div style="font-size:12px;color:var(--muted);margin-bottom:4px;">Weekend</div>' +
    '<div class="value mono" style="font-family:var(--font-display);font-size:22px;">' + formatAngka(ww.weekend.total) + '</div>' +
    '<div style="font-size:12px;color:var(--muted);">avg ' + formatAngka(ww.weekend.average) + ' / hari</div></div>' +
    '<div><div style="font-size:12px;color:var(--muted);margin-bottom:4px;">Weekday</div>' +
    '<div class="value mono" style="font-family:var(--font-display);font-size:22px;">' + formatAngka(ww.weekday.total) + '</div>' +
    '<div style="font-size:12px;color:var(--muted);">avg ' + formatAngka(ww.weekday.average) + ' / hari</div></div>' +
    '</div></div>';
}
