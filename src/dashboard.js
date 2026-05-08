import { supabase } from './supabase.js'
import { showToast } from './main.js'
import Chart from 'chart.js/auto'

// XSS 방지: HTML 특수문자 이스케이프
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

let trendChart = null
let severityChart = null
let statusChart = null
let deptChart = null

// 최근 7일 날짜 레이블 생성
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10) // 'YYYY-MM-DD'
  })
}

// KPI 카드 업데이트
export function updateKpiCards(data) {
  document.getElementById('kpi-total-val').textContent = data.length
  document.getElementById('kpi-received-val').textContent = data.filter(r => r.status === 'received').length
  document.getElementById('kpi-processing-val').textContent = data.filter(r => r.status === 'processing').length
  document.getElementById('kpi-done-val').textContent = data.filter(r => r.status === 'done').length
}

// 추이 차트 렌더링
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
        backgroundColor: '#ff6b35',
        hoverBackgroundColor: '#e65a1e',
        borderRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: '#8888aa' },
          grid: { color: '#2d2d44' }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: '#8888aa' },
          grid: { color: '#2d2d44' }
        }
      }
    }
  })
}

// 심각도별 Doughnut 차트
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
      backgroundColor: ['#e63946', '#ff6b35', '#4a9eff'],
      borderWidth: 0,
    }]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8888aa', font: { size: 12 }, padding: 12 }
      }
    },
    cutout: '65%',
  }

  if (severityChart) {
    severityChart.data = chartData
    severityChart.update()
    return
  }
  severityChart = new Chart(ctx, { type: 'doughnut', data: chartData, options })
}

// 상태별 Doughnut 차트
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
      backgroundColor: ['#8888aa', '#ff6b35', '#2a9d8f'],
      borderWidth: 0,
    }]
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8888aa', font: { size: 12 }, padding: 12 }
      }
    },
    cutout: '65%',
  }

  if (statusChart) {
    statusChart.data = chartData
    statusChart.update()
    return
  }
  statusChart = new Chart(ctx, { type: 'doughnut', data: chartData, options })
}

// 팀별 수평 Bar 차트 (상위 5)
export function renderDeptChart(data) {
  const counts = {}
  data.forEach(r => {
    const dept = r.department || '미지정'
    counts[dept] = (counts[dept] || 0) + 1
  })

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const labels = sorted.map(([k]) => k)
  const values = sorted.map(([, v]) => v)

  const ctx = document.getElementById('dept-chart').getContext('2d')
  const chartData = {
    labels,
    datasets: [{
      label: '건수',
      data: values,
      backgroundColor: '#ff6b35',
      borderRadius: 4,
    }]
  }
  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: '#8888aa', stepSize: 1 },
        grid: { color: '#2d2d44' }
      },
      y: {
        ticks: { color: '#8888aa', font: { size: 12 } },
        grid: { display: false }
      }
    }
  }

  if (deptChart) {
    deptChart.data = chartData
    deptChart.update()
    return
  }
  deptChart = new Chart(ctx, { type: 'bar', data: chartData, options })
}

// 최근 목록 렌더링 (최신 10건)
export function renderRecentList(data) {
  const tbody = document.getElementById('recent-tbody')
  const recent = [...data]
    .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
    .slice(0, 10)

  tbody.innerHTML = recent.map(r => `
    <tr>
      <td>${esc(r.title)}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="badge-${r.severity}">${{ high: '상', mid: '중', low: '하' }[r.severity]}</span></td>
      <td>${{ received: '접수', processing: '처리중', done: '완료' }[r.status]}</td>
      <td>${esc(r.assignee ?? '-')}</td>
      <td>${esc(r.department ?? '-')}</td>
    </tr>
  `).join('')
}

// 대시보드 전체 로드
export async function loadDashboardData() {
  const { data, error } = await supabase
    .from('incidents')
    .select('*')
    .order('occurred_at', { ascending: false })

  if (error) {
    showToast('데이터 로드 실패: ' + error.message)
    return
  }

  updateKpiCards(data)
  renderTrendChart(data)
  renderRecentList(data)
  renderSeverityChart(data)
  renderStatusChart(data)
  renderDeptChart(data)
}

export function initDashboard() {
  loadDashboardData()
}
