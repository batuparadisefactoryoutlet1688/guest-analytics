/**
 * DASHBOARD.JS
 * Logic untuk dashboard.html — KPI Today/This Month/This Year + trend 7 hari.
 */

let trendChartInstance = null;

document.addEventListener('DOMContentLoaded', async function () {
  if (!requireAuth()) return;
  renderShell('dashboard.html');
  document.querySelectorAll('.ridge-svg-slot').forEach(function (el) { el.innerHTML = ridgeSvg(); });

  await loadDashboard();
});

async function loadDashboard() {
  const wrap = document.getElementById('kpiWrap');
  const msgBox = document.getElementById('dashboardMessage');
  clearMessage(msgBox);

  const res = await callApi('GET_DASHBOARD', {});

  if (!res || res.status !== 'success') {
    showMessage(msgBox, (res && res.message) || 'Gagal memuat dashboard.', 'error');
    return;
  }

  const d = res.data;
  wrap.innerHTML = renderKpiCard('Hari Ini', d.today.total, d.today.growthPercent, 'dibanding kemarin') +
    renderKpiCard('Bulan Ini', d.thisMonth.total, d.thisMonth.growthPercent, 'dibanding bulan kemarin') +
    renderKpiCard('Tahun Ini', d.thisYear.total, d.thisYear.growthPercent, 'dibanding tahun kemarin');

  renderTrendChart(d.trend7hari);
}

function renderKpiCard(label, total, growth, pembandingLabel) {
  return '' +
    '<div class="kpi">' +
    '<div class="label">' + label + '</div>' +
    '<div class="value mono">' + formatAngka(total) + '</div>' +
    '<div class="delta ' + deltaClass(growth) + '">' + formatPersen(growth) + '</div>' +
    '<div class="kpi-note">(' + pembandingLabel + ')</div>' +
    '</div>';
}

function renderTrendChart(trendData) {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const labels = trendData.map(function (t) { return t.tanggal.slice(0, 5); }); // dd/MM
  const values = trendData.map(function (t) { return t.total; });

  if (trendChartInstance) trendChartInstance.destroy();

  trendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Tamu',
        data: values,
        borderColor: '#33513A',
        backgroundColor: 'rgba(51,81,58,0.08)',
        borderWidth: 2.5,
        pointRadius: 3,
        pointBackgroundColor: '#C08A34',
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: '#EDEAE0' } },
        x: { grid: { display: false } }
      }
    }
  });
}
