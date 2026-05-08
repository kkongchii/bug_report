# UI 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 장애 보고 대시보드를 짙은 남색+주황 다크 테마로 전환하고, 대시보드에 4개 차트(일자별/심각도별/상태별/팀별)와 반응형 레이아웃을 추가한다.

**Architecture:** `style.css`를 CSS 변수 기반 다크 테마로 전면 재작성하고, `index.html`에 Pretendard 폰트와 차트 canvas 3개를 추가한다. `src/dashboard.js`에 신규 차트 함수 3개(`renderSeverityChart`, `renderStatusChart`, `renderDeptChart`)를 추가하고 기존 `renderTrendChart`의 색상을 업데이트한다. 기능 로직(supabase, realtime, form, list, main)은 변경하지 않는다.

**Tech Stack:** Vanilla JavaScript ES Modules, Vite 8, Chart.js 4, CSS Custom Properties, Pretendard CDN

---

## 파일 변경 목록

| 파일 | 유형 | 내용 |
|------|------|------|
| `index.html` | 수정 | Pretendard CDN, canvas 3개 추가, 차트 섹션 마크업 |
| `style.css` | 전면 재작성 | CSS 변수 기반 다크 테마, 반응형 미디어 쿼리 |
| `src/dashboard.js` | 수정 | 기존 차트 색상 업데이트, 신규 차트 함수 3개 추가 |

---

## Task 1: index.html — Pretendard 폰트 + 차트 canvas 추가

**Files:**
- Modify: `index.html`

- [ ] **Step 1: `index.html` 전체를 아래 내용으로 교체한다**

`<head>`에 Pretendard CDN을 추가하고, `#tab-dashboard` 안에 보조 차트 3개용 섹션을 추가한다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>장애 보고 대시보드</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <h1 class="header-title">장애 보고 대시보드</h1>
      <nav class="tab-nav">
        <a href="#dashboard" class="tab-link" data-tab="dashboard">현황 대시보드</a>
        <a href="#register" class="tab-link" data-tab="register">장애 등록</a>
        <a href="#list" class="tab-link" data-tab="list">장애 목록</a>
      </nav>
    </div>
  </header>

  <div id="toast" class="toast hidden"></div>

  <main>
    <section id="tab-dashboard" class="tab-panel">
      <div class="kpi-grid">
        <div class="kpi-card" id="kpi-total">
          <div class="kpi-icon">📋</div>
          <div class="kpi-info">
            <span class="kpi-label">전체</span>
            <span class="kpi-value" id="kpi-total-val">-</span>
          </div>
        </div>
        <div class="kpi-card" id="kpi-received">
          <div class="kpi-icon">📥</div>
          <div class="kpi-info">
            <span class="kpi-label">접수</span>
            <span class="kpi-value" id="kpi-received-val">-</span>
          </div>
        </div>
        <div class="kpi-card" id="kpi-processing">
          <div class="kpi-icon">⚙️</div>
          <div class="kpi-info">
            <span class="kpi-label">처리중</span>
            <span class="kpi-value" id="kpi-processing-val">-</span>
          </div>
        </div>
        <div class="kpi-card" id="kpi-done">
          <div class="kpi-icon">✅</div>
          <div class="kpi-info">
            <span class="kpi-label">완료</span>
            <span class="kpi-value" id="kpi-done-val">-</span>
          </div>
        </div>
      </div>

      <div class="chart-card chart-main">
        <div class="chart-title">일자별 장애 추이 (최근 7일)</div>
        <div class="chart-wrap">
          <canvas id="trend-chart"></canvas>
        </div>
      </div>

      <div class="chart-sub-grid">
        <div class="chart-card">
          <div class="chart-title">심각도별 분포</div>
          <div class="chart-wrap chart-wrap-sm">
            <canvas id="severity-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">상태별 현황</div>
          <div class="chart-wrap chart-wrap-sm">
            <canvas id="status-chart"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">팀별 장애 건수 (상위 5)</div>
          <div class="chart-wrap chart-wrap-sm">
            <canvas id="dept-chart"></canvas>
          </div>
        </div>
      </div>

      <div class="section-title">최근 장애 목록</div>
      <table class="incidents-table" id="recent-table">
        <thead>
          <tr><th>제목</th><th>발생일시</th><th>심각도</th><th>상태</th><th>담당자</th><th>본부/팀</th></tr>
        </thead>
        <tbody id="recent-tbody"></tbody>
      </table>
    </section>

    <section id="tab-register" class="tab-panel hidden">
      <h2 class="page-title">장애 등록</h2>
      <form id="incident-form" class="incident-form">
        <label>제목 *<input type="text" name="title" required /></label>
        <label>발생일시 *<input type="datetime-local" name="occurred_at" required /></label>
        <label>심각도 *
          <select name="severity" required>
            <option value="">선택</option>
            <option value="high">상</option>
            <option value="mid">중</option>
            <option value="low">하</option>
          </select>
        </label>
        <label>상태 *
          <select name="status" required>
            <option value="received">접수</option>
            <option value="processing">처리중</option>
            <option value="done">완료</option>
          </select>
        </label>
        <label>담당자<input type="text" name="assignee" /></label>
        <label>본부/팀<input type="text" name="department" /></label>
        <label>원인<textarea name="cause" rows="3"></textarea></label>
        <label>해결내용<textarea name="resolution" rows="3"></textarea></label>
        <button type="submit" class="btn-primary">등록</button>
      </form>
    </section>

    <section id="tab-list" class="tab-panel hidden">
      <h2 class="page-title">장애 목록</h2>
      <div class="filter-bar">
        <select id="filter-severity"><option value="">심각도 전체</option><option value="high">상</option><option value="mid">중</option><option value="low">하</option></select>
        <select id="filter-status"><option value="">상태 전체</option><option value="received">접수</option><option value="processing">처리중</option><option value="done">완료</option></select>
        <input type="text" id="filter-department" placeholder="본부/팀 검색" />
      </div>
      <table class="incidents-table" id="list-table">
        <thead>
          <tr><th>제목</th><th>발생일시</th><th>심각도</th><th>상태</th><th>담당자</th><th>본부/팀</th></tr>
        </thead>
        <tbody id="list-tbody"></tbody>
      </table>
    </section>
  </main>

  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: 개발 서버를 실행해 HTML 구조가 깨지지 않는지 확인한다**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 → 헤더/탭/KPI 카드 4개/빈 차트 영역 3개가 표시되는지 확인. 스타일은 아직 적용 안 됨.

- [ ] **Step 3: 커밋**

```bash
git add index.html
git commit -m "feat: Pretendard 폰트 및 차트 canvas 3개 추가"
```

---

## Task 2: style.css — CSS 변수 기반 다크 테마 전면 재작성

**Files:**
- Modify: `style.css`

- [ ] **Step 1: `style.css` 전체를 아래 내용으로 교체한다**

```css
/* CSS 변수 */
:root {
  --bg-base: #0f172a;
  --bg-card: #1e293b;
  --bg-header: #0b1120;
  --bg-hover: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border: #334155;
  --accent: #f97316;
  --accent-hover: #ea6c00;
  --severity-high: #ef4444;
  --severity-mid: #f97316;
  --severity-low: #22c55e;
  --status-received: #3b82f6;
  --status-processing: #f97316;
  --status-done: #22c55e;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Pretendard', 'Segoe UI', sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
  font-size: 14px;
  min-height: 100vh;
}

/* 헤더 */
.header {
  background: var(--bg-header);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.header-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
}

.tab-nav { display: flex; gap: 4px; }

.tab-link {
  color: var(--text-secondary);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.15s, background 0.15s;
  border-bottom: 2px solid transparent;
}

.tab-link:hover { color: var(--text-primary); }

.tab-link.active {
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
}

/* 메인 컨테이너 */
main {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}

.tab-panel { display: block; }
.tab-panel.hidden { display: none; }

/* KPI 카드 그리드 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-left: 3px solid var(--accent);
  transition: background 0.2s;
  cursor: default;
}

.kpi-card:hover { background: var(--bg-hover); }

.kpi-icon {
  font-size: 24px;
  width: 44px;
  height: 44px;
  background: rgba(249, 115, 22, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-label { font-size: 12px; color: var(--text-secondary); }
.kpi-value { font-size: 28px; font-weight: 700; color: var(--text-primary); }

/* 차트 카드 */
.chart-card {
  background: var(--bg-card);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.chart-main { margin-bottom: 20px; }

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.chart-wrap {
  position: relative;
  height: 260px;
}

.chart-wrap-sm {
  height: 220px;
}

/* 보조 차트 3열 그리드 */
.chart-sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.chart-sub-grid .chart-card { margin-bottom: 0; }

/* 섹션 제목 */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 20px;
}

/* 테이블 */
.incidents-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border-radius: 10px;
  overflow: hidden;
}

.incidents-table th,
.incidents-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.incidents-table th {
  background: var(--bg-hover);
  font-weight: 600;
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.incidents-table tbody tr:hover { background: var(--bg-hover); }
.incidents-table tbody tr:last-child td { border-bottom: none; }

/* 심각도/상태 배지 */
.badge-high, .badge-mid, .badge-low,
.badge-received, .badge-processing, .badge-done {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

.badge-high { background: rgba(239,68,68,0.15); color: var(--severity-high); }
.badge-mid  { background: rgba(249,115,22,0.15); color: var(--severity-mid); }
.badge-low  { background: rgba(34,197,94,0.15); color: var(--severity-low); }
.badge-received   { background: rgba(59,130,246,0.15); color: var(--status-received); }
.badge-processing { background: rgba(249,115,22,0.15); color: var(--status-processing); }
.badge-done       { background: rgba(34,197,94,0.15); color: var(--status-done); }

/* 폼 */
.incident-form {
  background: var(--bg-card);
  padding: 28px;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 760px;
}

.incident-form label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.incident-form input,
.incident-form select,
.incident-form textarea {
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text-primary);
  transition: border-color 0.15s;
}

.incident-form input:focus,
.incident-form select:focus,
.incident-form textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.incident-form textarea { resize: vertical; }

.incident-form label:nth-child(7),
.incident-form label:nth-child(8),
.incident-form button { grid-column: 1 / -1; }

/* 버튼 */
.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  transition: background 0.15s;
  width: fit-content;
}

.btn-primary:hover { background: var(--accent-hover); }

/* 필터 바 */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-bar select,
.filter-bar input {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text-primary);
  transition: border-color 0.15s;
}

.filter-bar select:focus,
.filter-bar input:focus {
  outline: none;
  border-color: var(--accent);
}

/* 토스트 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #dc2626;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 9999;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.toast.hidden { display: none; }

/* 반응형 — 1024px 이하: KPI 2×2 */
@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

/* 반응형 — 768px 이하: 세로 스택 */
@media (max-width: 768px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .chart-sub-grid { grid-template-columns: 1fr; }
  .incident-form { grid-template-columns: 1fr; }
  .incident-form label:nth-child(7),
  .incident-form label:nth-child(8),
  .incident-form button { grid-column: 1; }
  main { padding: 16px; }
}

/* 반응형 — 480px 이하: 헤더 축소 */
@media (max-width: 480px) {
  .header-inner { padding: 0 12px; gap: 12px; }
  .header-title { font-size: 15px; }
  .tab-link { padding: 6px 10px; font-size: 13px; }
  .kpi-value { font-size: 22px; }
}
```

- [ ] **Step 2: 개발 서버에서 다크 테마가 적용됐는지 확인한다**

```bash
npm run dev
```

`http://localhost:5173` 접속 → 배경 `#0f172a`, 카드 `#1e293b`, 헤더 `#0b1120` 확인. KPI 카드 좌측 주황 보더 확인.

- [ ] **Step 3: 커밋**

```bash
git add style.css
git commit -m "feat: CSS 변수 기반 다크 테마 전면 적용 및 반응형 추가"
```

---

## Task 3: dashboard.js — 기존 차트 색상 업데이트 + 신규 차트 3개 추가

**Files:**
- Modify: `src/dashboard.js`

- [ ] **Step 1: `src/dashboard.js` 전체를 아래 내용으로 교체한다**

Chart.js 인스턴스 변수를 4개로 관리하고, 신규 함수 3개를 추가한다. 재렌더링 시 기존 차트를 destroy 후 재생성하는 패턴을 적용한다.

```js
import { supabase } from './supabase.js'
import { showToast } from './main.js'
import Chart from 'chart.js/auto'

// XSS 방지: HTML 특수문자 이스케이프
const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))

// Chart.js 공통 다크 테마 기본값
const CHART_DEFAULTS = {
  color: '#94a3b8',
  borderColor: '#334155',
}

let trendChart = null
let severityChart = null
let statusChart = null
let deptChart = null

// 최근 7일 날짜 레이블 생성
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
}

// KPI 카드 업데이트
export function updateKpiCards(data) {
  document.getElementById('kpi-total-val').textContent = data.length
  document.getElementById('kpi-received-val').textContent = data.filter(r => r.status === 'received').length
  document.getElementById('kpi-processing-val').textContent = data.filter(r => r.status === 'processing').length
  document.getElementById('kpi-done-val').textContent = data.filter(r => r.status === 'done').length
}

// 일자별 추이 막대 차트
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
        backgroundColor: '#f97316',
        hoverBackgroundColor: '#ea6c00',
        borderRadius: 5,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          ticks: { color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.borderColor },
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.borderColor },
        }
      }
    }
  })
}

// 심각도별 도넛 차트
export function renderSeverityChart(data) {
  const high = data.filter(r => r.severity === 'high').length
  const mid  = data.filter(r => r.severity === 'mid').length
  const low  = data.filter(r => r.severity === 'low').length

  const ctx = document.getElementById('severity-chart').getContext('2d')

  if (severityChart) { severityChart.destroy(); severityChart = null }

  severityChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['상', '중', '하'],
      datasets: [{
        data: [high, mid, low],
        backgroundColor: ['#ef4444', '#f97316', '#22c55e'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: CHART_DEFAULTS.color, padding: 12, font: { size: 12 } },
        },
      },
      cutout: '65%',
    }
  })
}

// 상태별 도넛 차트
export function renderStatusChart(data) {
  const received   = data.filter(r => r.status === 'received').length
  const processing = data.filter(r => r.status === 'processing').length
  const done       = data.filter(r => r.status === 'done').length

  const ctx = document.getElementById('status-chart').getContext('2d')

  if (statusChart) { statusChart.destroy(); statusChart = null }

  statusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['접수', '처리중', '완료'],
      datasets: [{
        data: [received, processing, done],
        backgroundColor: ['#3b82f6', '#f97316', '#22c55e'],
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: CHART_DEFAULTS.color, padding: 12, font: { size: 12 } },
        },
      },
      cutout: '65%',
    }
  })
}

// 팀별 가로 막대 차트 (상위 5개)
export function renderDeptChart(data) {
  // 팀별 건수 집계
  const deptMap = {}
  data.forEach(r => {
    if (r.department) {
      deptMap[r.department] = (deptMap[r.department] ?? 0) + 1
    }
  })

  // 건수 내림차순 정렬 후 상위 5개
  const sorted = Object.entries(deptMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const labels = sorted.map(([dept]) => dept)
  const counts = sorted.map(([, cnt]) => cnt)

  const ctx = document.getElementById('dept-chart').getContext('2d')

  if (deptChart) { deptChart.destroy(); deptChart = null }

  deptChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: '장애 건수',
        data: counts,
        backgroundColor: '#f97316',
        hoverBackgroundColor: '#ea6c00',
        borderRadius: 4,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 1, color: CHART_DEFAULTS.color },
          grid: { color: CHART_DEFAULTS.borderColor },
        },
        y: {
          ticks: { color: CHART_DEFAULTS.color },
          grid: { display: false },
        }
      }
    }
  })
}

// 최근 목록 렌더링 (최신 10건)
export function renderRecentList(data) {
  const tbody = document.getElementById('recent-tbody')
  const recent = [...data]
    .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
    .slice(0, 10)

  const severityLabel = { high: '상', mid: '중', low: '하' }
  const statusLabel   = { received: '접수', processing: '처리중', done: '완료' }

  tbody.innerHTML = recent.map(r => `
    <tr>
      <td>${esc(r.title)}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="badge-${r.severity}">${severityLabel[r.severity]}</span></td>
      <td><span class="badge-${r.status}">${statusLabel[r.status]}</span></td>
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
  renderSeverityChart(data)
  renderStatusChart(data)
  renderDeptChart(data)
  renderRecentList(data)
}

export function initDashboard() {
  loadDashboardData()
}
```

- [ ] **Step 2: 개발 서버에서 4개 차트가 모두 렌더링되는지 확인한다**

```bash
npm run dev
```

`http://localhost:5173/#dashboard` 접속 → 일자별 막대, 심각도 도넛, 상태 도넛, 팀별 가로 막대 4개 차트 확인. 콘솔 오류 없어야 함.

- [ ] **Step 3: 프로덕션 빌드 확인**

```bash
npm run build
```

Expected: `dist/` 생성, 오류 없음.

- [ ] **Step 4: 커밋**

```bash
git add src/dashboard.js
git commit -m "feat: 심각도별/상태별/팀별 차트 추가, 다크 테마 색상 적용"
```

---

## Task 4: 최종 검증 및 배포

**Files:**
- 변경 없음 (빌드/배포 확인)

- [ ] **Step 1: 반응형 확인**

개발 서버(`npm run dev`) 실행 후 브라우저 DevTools → 반응형 모드에서 아래 너비 확인:
- `1280px`: KPI 4열, 보조 차트 3열
- `900px`: KPI 2×2, 보조 차트 3열
- `700px`: KPI 1열, 보조 차트 1열 스택
- `400px`: 헤더 폰트 축소, 탭 패딩 축소

- [ ] **Step 2: 프로덕션 빌드 최종 확인**

```bash
npm run build && npm run preview
```

`http://localhost:4173` 에서 빌드 결과물 확인.

- [ ] **Step 3: GitHub 푸시**

```bash
git push origin main
```

Vercel 자동 배포 트리거 확인. 배포 완료 후 `https://bug-report-tau.vercel.app` 접속하여 다크 테마 + 4개 차트 동작 확인.
