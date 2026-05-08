# 대시보드 UI 리디자인 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 장애 보고 대시보드를 주황+남색 다크 테마로 재디자인하고, 차트 4개(일자별/심각도별/상태별/팀별)와 반응형 레이아웃을 완성한다.

**Architecture:** `style.css`를 CSS 변수 기반 다크 테마로 전면 재작성하고, `dashboard.js`에 누락된 차트 3개 함수를 추가한다. `index.html`의 KPI 카드 마크업을 정돈하여 아이콘·레이블·값이 가로로 배치되도록 개선한다.

**Tech Stack:** Vanilla JS (ES modules), Chart.js 4, CSS3 (Custom Properties + Grid + Media Queries), Vite 5

---

## 파일 구조

| 파일 | 작업 |
|---|---|
| `style.css` | 전면 재작성 — CSS 변수, 다크 테마, 반응형 |
| `src/dashboard.js` | 차트 3개 함수 추가, trendChart 색상 수정 |
| `index.html` | KPI 카드 마크업 개선 |

---

### Task 1: CSS 변수 + 다크 테마 기반 스타일 전면 재작성

**Files:**
- Modify: `style.css`

- [ ] **Step 1: `style.css` 전체를 아래 내용으로 교체**

```css
/* ── CSS 변수 ── */
:root {
  --bg-base:    #0f0f1a;
  --bg-card:    #1a1a2e;
  --bg-header:  #0a0a14;
  --border:     #2d2d44;
  --accent:     #ff6b35;
  --accent-dark:#e65a1e;
  --text:       #e8e8f0;
  --text-muted: #8888aa;
  --success:    #2a9d8f;
  --danger:     #e63946;
  --info:       #4a9eff;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Pretendard', 'Segoe UI', sans-serif;
  background: var(--bg-base);
  color: var(--text);
  font-size: 14px;
  min-height: 100vh;
}

/* ── 헤더 ── */
.header {
  background: var(--bg-header);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 32px;
  height: 56px;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
  white-space: nowrap;
}

.tab-nav { display: flex; gap: 4px; }

.tab-link {
  color: var(--text-muted);
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: nowrap;
}

.tab-link:hover { background: var(--border); color: var(--text); }
.tab-link.active { background: var(--accent); color: #fff; }

/* ── 메인 레이아웃 ── */
main { padding: 24px; max-width: 1200px; margin: 0 auto; }

.tab-panel { display: block; }
.tab-panel.hidden { display: none; }

/* ── KPI 그리드 ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: border-color 0.15s;
}

.kpi-card:hover { border-color: var(--accent); }

.kpi-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.kpi-info { display: flex; flex-direction: column; gap: 4px; }

.kpi-label { font-size: 12px; color: var(--text-muted); font-weight: 500; }

.kpi-value { font-size: 28px; font-weight: 700; color: var(--text); line-height: 1; }

#kpi-total    .kpi-value { color: var(--text); }
#kpi-received .kpi-value { color: var(--info); }
#kpi-processing .kpi-value { color: var(--accent); }
#kpi-done     .kpi-value { color: var(--success); }

/* ── 차트 카드 ── */
.chart-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.chart-main { margin-bottom: 20px; }

.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

.chart-wrap { height: 260px; position: relative; }
.chart-wrap-sm { height: 220px; position: relative; }

/* ── 서브 차트 그리드 ── */
.chart-sub-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.chart-sub-grid .chart-card { margin-bottom: 0; }

/* ── 최근 목록 ── */
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 12px;
}

.incidents-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}

.incidents-table th, .incidents-table td {
  padding: 11px 14px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.incidents-table tr:last-child td { border-bottom: none; }

.incidents-table th {
  background: var(--bg-header);
  font-weight: 600;
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.incidents-table td { color: var(--text); font-size: 13px; }

.incidents-table tbody tr:hover { background: rgba(255,107,53,0.05); }

/* ── 뱃지 ── */
.badge-high { color: var(--danger); font-weight: 600; }
.badge-mid  { color: var(--accent); font-weight: 600; }
.badge-low  { color: var(--info);   font-weight: 600; }

/* ── 장애 등록 폼 ── */
.page-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--text);
}

.incident-form {
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 28px;
  border-radius: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  max-width: 720px;
}

.incident-form label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.incident-form input,
.incident-form select,
.incident-form textarea {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 9px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--text);
  transition: border-color 0.15s;
}

.incident-form input:focus,
.incident-form select:focus,
.incident-form textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.incident-form select option { background: var(--bg-card); }

.incident-form textarea { resize: vertical; }

.incident-form label:nth-child(7),
.incident-form label:nth-child(8),
.incident-form button { grid-column: 1 / -1; }

.btn-primary {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 10px 28px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  width: fit-content;
  transition: background 0.15s;
}

.btn-primary:hover { background: var(--accent-dark); }

/* ── 필터 바 ── */
.filter-bar {
  display: flex;
  gap: 10px;
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
  color: var(--text);
  font-family: inherit;
}

.filter-bar select:focus,
.filter-bar input:focus {
  outline: none;
  border-color: var(--accent);
}

/* ── 토스트 ── */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: var(--danger);
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  z-index: 9999;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}

.toast.hidden { display: none; }

/* ── 반응형 ── */
@media (max-width: 1023px) {
  .chart-sub-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 767px) {
  .header-inner { gap: 16px; }
  .header-title { font-size: 14px; }
  .tab-link { padding: 5px 10px; font-size: 12px; }

  main { padding: 16px; }

  .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .kpi-card { padding: 16px; gap: 12px; }
  .kpi-value { font-size: 22px; }

  .chart-sub-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }

  .incident-form { grid-template-columns: 1fr; max-width: 100%; }
  .incident-form label:nth-child(7),
  .incident-form label:nth-child(8),
  .incident-form button { grid-column: 1; }

  .incidents-table { font-size: 12px; }
  .incidents-table th, .incidents-table td { padding: 8px 10px; }
}

@media (max-width: 480px) {
  .tab-nav { gap: 2px; }
  .tab-link { padding: 4px 8px; }
  .chart-sub-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: 개발 서버로 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 → 헤더가 `#0a0a14`, 배경이 `#0f0f1a` 다크 테마인지 확인.

- [ ] **Step 3: 커밋**

```bash
git add style.css
git commit -m "style: 다크 테마 CSS 전면 재작성 (주황+남색, CSS 변수, 반응형)"
```

---

### Task 2: index.html KPI 카드 마크업 개선

**Files:**
- Modify: `index.html`

현재 KPI 카드는 `flex-direction: column` (세로)이지만, 새 CSS는 `flex-direction: row` (아이콘 | 텍스트 세로)로 개선한다.

- [ ] **Step 1: KPI 그리드 섹션을 아래로 교체**

`index.html`의 `<div class="kpi-grid">` 블록 전체를 찾아 아래로 교체:

```html
<div class="kpi-grid">
  <div class="kpi-card" id="kpi-total">
    <div class="kpi-icon" aria-hidden="true">📋</div>
    <div class="kpi-info">
      <span class="kpi-label">전체</span>
      <span class="kpi-value" id="kpi-total-val">-</span>
    </div>
  </div>
  <div class="kpi-card" id="kpi-received">
    <div class="kpi-icon" aria-hidden="true">📥</div>
    <div class="kpi-info">
      <span class="kpi-label">접수</span>
      <span class="kpi-value" id="kpi-received-val">-</span>
    </div>
  </div>
  <div class="kpi-card" id="kpi-processing">
    <div class="kpi-icon" aria-hidden="true">⚙️</div>
    <div class="kpi-info">
      <span class="kpi-label">처리중</span>
      <span class="kpi-value" id="kpi-processing-val">-</span>
    </div>
  </div>
  <div class="kpi-card" id="kpi-done">
    <div class="kpi-icon" aria-hidden="true">✅</div>
    <div class="kpi-info">
      <span class="kpi-label">완료</span>
      <span class="kpi-value" id="kpi-done-val">-</span>
    </div>
  </div>
</div>
```

- [ ] **Step 2: 브라우저 확인**

KPI 카드에서 아이콘이 왼쪽, 레이블+숫자가 오른쪽에 세로로 배치되는지 확인.

- [ ] **Step 3: 커밋**

```bash
git add index.html
git commit -m "style: KPI 카드 마크업 가로 배치로 개선"
```

---

### Task 3: dashboard.js — 심각도별 Doughnut 차트 추가

**Files:**
- Modify: `src/dashboard.js`

- [ ] **Step 1: `dashboard.js` 상단에 차트 인스턴스 변수 3개 추가**

파일 상단 `let trendChart = null` 아래에 추가:

```js
let severityChart = null
let statusChart = null
let deptChart = null
```

- [ ] **Step 2: `renderSeverityChart` 함수 추가**

`renderTrendChart` 함수 아래에 추가:

```js
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
```

- [ ] **Step 3: `loadDashboardData`에서 `renderSeverityChart` 호출 추가**

`loadDashboardData` 함수 내 `renderRecentList(data)` 아래에 추가:

```js
renderSeverityChart(data)
```

- [ ] **Step 4: 브라우저 확인**

대시보드 탭에서 "심각도별 분포" 도넛 차트가 렌더링되는지 확인.

- [ ] **Step 5: 커밋**

```bash
git add src/dashboard.js
git commit -m "feat: 심각도별 Doughnut 차트 추가"
```

---

### Task 4: dashboard.js — 상태별 Doughnut 차트 추가

**Files:**
- Modify: `src/dashboard.js`

- [ ] **Step 1: `renderStatusChart` 함수 추가**

`renderSeverityChart` 함수 아래에 추가:

```js
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
```

- [ ] **Step 2: `loadDashboardData`에서 `renderStatusChart` 호출 추가**

`renderSeverityChart(data)` 바로 아래에 추가:

```js
renderStatusChart(data)
```

- [ ] **Step 3: 브라우저 확인**

"상태별 현황" 도넛 차트가 렌더링되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/dashboard.js
git commit -m "feat: 상태별 Doughnut 차트 추가"
```

---

### Task 5: dashboard.js — 팀별 수평 Bar 차트 추가

**Files:**
- Modify: `src/dashboard.js`

- [ ] **Step 1: `renderDeptChart` 함수 추가**

`renderStatusChart` 함수 아래에 추가:

```js
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
```

- [ ] **Step 2: `loadDashboardData`에서 `renderDeptChart` 호출 추가**

`renderStatusChart(data)` 바로 아래에 추가:

```js
renderDeptChart(data)
```

- [ ] **Step 3: 브라우저 확인**

"팀별 장애 건수" 수평 Bar 차트가 렌더링되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/dashboard.js
git commit -m "feat: 팀별 수평 Bar 차트 추가"
```

---

### Task 6: dashboard.js — 일자별 Bar 차트 색상 및 그리드 다크 테마 적용

**Files:**
- Modify: `src/dashboard.js`

현재 `trendChart`는 `backgroundColor: '#1a1a2e'`(남색)이고 축 스타일이 라이트 테마 기본값이다. 다크 테마에 맞게 수정한다.

- [ ] **Step 1: `renderTrendChart` 내 Chart 생성 옵션을 아래로 교체**

기존 `trendChart = new Chart(ctx, { ... })` 블록 전체를:

```js
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
```

- [ ] **Step 2: 기존 `trendChart.update()` 경로도 dataset 색상 반영 확인**

`trendChart.update()` 전에 backgroundColor가 이미 dataset에 정의되어 있으므로 추가 수정 불필요.

- [ ] **Step 3: 브라우저 확인**

"일자별 장애 추이" Bar 차트가 주황색으로, 그리드가 `#2d2d44` 어두운 색으로 표시되는지 확인.

- [ ] **Step 4: 커밋**

```bash
git add src/dashboard.js
git commit -m "style: 일자별 Bar 차트 다크 테마 색상 적용"
```

---

### Task 7: 반응형 최종 확인 및 마무리

**Files:**
- 없음 (브라우저 검증 단계)

- [ ] **Step 1: 데스크톱(1200px) 레이아웃 확인**

브라우저 개발자 도구 없이 전체 화면에서:
- KPI 4열, 서브 차트 3열, 일자별 차트 전체 폭

- [ ] **Step 2: 태블릿(768~1023px) 레이아웃 확인**

브라우저 너비를 900px로 조절:
- KPI 2×2, 서브 차트 2열

- [ ] **Step 3: 모바일(≤767px) 레이아웃 확인**

브라우저 너비를 375px로 조절:
- KPI 2×2, 일자별 차트 전체 폭, 서브 차트 2열

- [ ] **Step 4: 480px 이하 확인**

브라우저 너비를 375px로 조절:
- 서브 차트 1열

- [ ] **Step 5: 장애 등록 / 목록 탭 확인**

각 탭 클릭 후 다크 테마가 정상 적용되는지 확인.
