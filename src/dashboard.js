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
    data.filter(r => r.occurred_at.slice(0, 10) === day).length
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
        backgroundColor: '#1a1a2e',
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
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
}

export function initDashboard() {
  loadDashboardData()
}
