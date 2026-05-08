import { supabase } from './supabase.js'
import { showToast } from './main.js'
import { showModal } from './modal.js'
import Chart from 'chart.js/auto'

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

const C = {
  accent: '#c44a2a',
  amber:  '#d99752',
  blue:   '#6b8fc9',
  green:  '#5ea870',
  gray:   '#8a8278',
  grid:   '#e6e2d9',
  tick:   '#8a8278',
}

const SEVERITY_COLOR = { high: C.accent, mid: C.amber, low: C.blue }
const SEVERITY_KO    = { high: '상', mid: '중', low: '하' }
const STATUS_KO      = { received: '접수', processing: '처리중', done: '완료' }
const STATUS_COLOR   = { received: C.gray, processing: C.accent, done: C.green }

let trendChart    = null
let severityChart = null
let statusChart   = null
let deptChart     = null
let _allData      = []
let recentListenerAdded = false

// 차트 호버 시 커서 포인터로 변경
function pointerOnHover(event, elements) {
  const canvas = event.native?.target
  if (canvas) canvas.style.cursor = elements.length ? 'pointer' : 'default'
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

export function updateKpiCards(data) {
  document.getElementById('kpi-total-val').textContent      = data.length
  document.getElementById('kpi-received-val').textContent   = data.filter(r => r.status === 'received').length
  document.getElementById('kpi-processing-val').textContent = data.filter(r => r.status === 'processing').length
  document.getElementById('kpi-done-val').textContent       = data.filter(r => r.status === 'done').length
}

export function renderTrendChart(data) {
  const labels = getLast7Days()
  const counts = labels.map(day =>
    data.filter(r => r.occurred_at?.slice(0, 10) === day).length
  )

  const ctx = document.getElementById('trend-chart').getContext('2d')

  if (trendChart) {
    trendChart.data.labels = labels
    trendChart.data.datasets[0].data = counts
    trendChart.update()
    return
  }

  trendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '장애 발생 건수',
        data: counts,
        backgroundColor: C.accent,
        hoverBackgroundColor: '#a83b20',
        borderRadius: 5,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: C.tick }, grid: { color: C.grid } },
        y: { beginAtZero: true, ticks: { stepSize: 1, color: C.tick }, grid: { color: C.grid } },
      },
      onClick: (event, elements, chart) => {
        if (!elements.length) return
        const label    = chart.data.labels[elements[0].index]
        const filtered = _allData.filter(r => r.occurred_at?.slice(0, 10) === label)
        showModal(`${label} 장애 목록`, filtered)
      },
      onHover: pointerOnHover,
    },
  })
}

export function renderSeverityChart(data) {
  const counts = {
    high: data.filter(r => r.severity === 'high').length,
    mid:  data.filter(r => r.severity === 'mid').length,
    low:  data.filter(r => r.severity === 'low').length,
  }

  const ctx = document.getElementById('severity-chart').getContext('2d')
  const chartData = {
    labels: ['상', '중', '하'],
    datasets: [{
      data: [counts.high, counts.mid, counts.low],
      backgroundColor: [C.accent, C.amber, C.blue],
      borderWidth: 0,
    }],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: C.tick, font: { size: 12 }, padding: 12 } },
    },
    cutout: '65%',
    onClick: (event, elements, chart) => {
      if (!elements.length) return
      const idx      = elements[0].index
      const KEYS     = ['high', 'mid', 'low']
      const filtered = _allData.filter(r => r.severity === KEYS[idx])
      showModal(`심각도 "${chart.data.labels[idx]}" 장애 목록`, filtered)
    },
    onHover: pointerOnHover,
  }

  if (severityChart) { severityChart.data = chartData; severityChart.update(); return }
  severityChart = new Chart(ctx, { type: 'doughnut', data: chartData, options })
}

export function renderStatusChart(data) {
  const counts = {
    received:   data.filter(r => r.status === 'received').length,
    processing: data.filter(r => r.status === 'processing').length,
    done:       data.filter(r => r.status === 'done').length,
  }

  const ctx = document.getElementById('status-chart').getContext('2d')
  const chartData = {
    labels: ['접수', '처리중', '완료'],
    datasets: [{
      data: [counts.received, counts.processing, counts.done],
      backgroundColor: [C.gray, C.accent, C.green],
      borderWidth: 0,
    }],
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: C.tick, font: { size: 12 }, padding: 12 } },
    },
    cutout: '65%',
    onClick: (event, elements, chart) => {
      if (!elements.length) return
      const idx      = elements[0].index
      const KEYS     = ['received', 'processing', 'done']
      const filtered = _allData.filter(r => r.status === KEYS[idx])
      showModal(`상태 "${chart.data.labels[idx]}" 장애 목록`, filtered)
    },
    onHover: pointerOnHover,
  }

  if (statusChart) { statusChart.data = chartData; statusChart.update(); return }
  statusChart = new Chart(ctx, { type: 'doughnut', data: chartData, options })
}

export function renderDeptChart(data) {
  const counts = {}
  data.forEach(r => {
    const dept = r.department || '미지정'
    counts[dept] = (counts[dept] || 0) + 1
  })

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const labels = sorted.map(([k]) => k)
  const values = sorted.map(([, v]) => v)

  const ctx = document.getElementById('dept-chart').getContext('2d')
  const chartData = {
    labels,
    datasets: [{
      label: '건수',
      data: values,
      backgroundColor: C.accent,
      hoverBackgroundColor: '#a83b20',
      borderRadius: 4,
    }],
  }
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { beginAtZero: true, ticks: { color: C.tick, stepSize: 1 }, grid: { color: C.grid } },
      y: { ticks: { color: C.tick, font: { size: 12 } }, grid: { display: false } },
    },
    onClick: (event, elements, chart) => {
      if (!elements.length) return
      const label    = chart.data.labels[elements[0].index]
      const filtered = _allData.filter(r => (r.department || '미지정') === label)
      showModal(`${label} 장애 목록`, filtered)
    },
    onHover: pointerOnHover,
  }

  if (deptChart) { deptChart.data = chartData; deptChart.update(); return }
  deptChart = new Chart(ctx, { type: 'bar', data: chartData, options })
}

export function renderRecentList(data) {
  const tbody  = document.getElementById('recent-tbody')
  const recent = [...data]
    .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
    .slice(0, 10)

  tbody.innerHTML = recent.map(r => `
    <tr class="clickable-row" data-id="${r.id}">
      <td>${esc(r.title)}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="pill" style="background:${SEVERITY_COLOR[r.severity]};color:#fff">${SEVERITY_KO[r.severity]}</span></td>
      <td><span class="pill ghost" style="color:${STATUS_COLOR[r.status]}">${STATUS_KO[r.status]}</span></td>
      <td>${esc(r.assignee ?? '-')}</td>
      <td>${esc(r.department ?? '-')}</td>
    </tr>
  `).join('')
}

export async function loadDashboardData() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('occurred_at', { ascending: false })

  if (error) {
    showToast('데이터 로드 실패: ' + error.message)
    return
  }

  _allData = data
  updateKpiCards(data)
  renderTrendChart(data)
  renderRecentList(data)
  renderSeverityChart(data)
  renderStatusChart(data)
  renderDeptChart(data)
}

export function initDashboard() {
  if (!recentListenerAdded) {
    document.getElementById('recent-tbody').addEventListener('click', e => {
      const row = e.target.closest('.clickable-row')
      if (row) window.location.hash = `#detail/${row.dataset.id}`
    })
    recentListenerAdded = true
  }
  loadDashboardData()
}
