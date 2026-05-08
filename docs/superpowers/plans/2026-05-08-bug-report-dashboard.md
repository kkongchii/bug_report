# 장애 보고 대시보드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 본부 장애 현황을 실시간으로 모니터링하고 장애를 등록/조회하는 단일 페이지 웹 애플리케이션을 구축한다.

**Architecture:** Vite 5 기반 Vanilla JS ES modules 구성. 탭 라우팅은 URL 해시로 처리하며, Supabase Realtime으로 DB 변경사항을 WebSocket 구독하여 페이지 새로고침 없이 KPI·차트·목록을 갱신한다.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES modules), Vite 5, Supabase JS, Chart.js 4, Vercel

---

## 파일 맵

| 파일 | 역할 |
|------|------|
| `index.html` | 단일 HTML 진입점, 탭 마크업 |
| `style.css` | 전체 스타일 |
| `src/supabase.js` | Supabase 클라이언트 싱글톤 |
| `src/main.js` | 앱 진입점, URL 해시 기반 탭 라우팅 |
| `src/dashboard.js` | KPI 카드, 추이 차트, 최근 목록 렌더링 |
| `src/form.js` | 장애 등록 폼 처리 |
| `src/list.js` | 전체 목록 + 필터 |
| `src/realtime.js` | Supabase Realtime 구독 관리 |
| `vite.config.js` | Vite 설정 |
| `.env` | 환경변수 (Git 제외) |

---

## Task 1: 프로젝트 초기화

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `.env`
- Create: `index.html`

- [ ] **Step 1: npm 프로젝트 초기화 및 패키지 설치**

```bash
cd C:/pyb/my-first-project/bug_report
npm init -y
npm install @supabase/supabase-js chart.js
npm install -D vite
```

- [ ] **Step 2: package.json scripts 수정**

`package.json`의 `"scripts"` 섹션을 아래로 교체:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

- [ ] **Step 3: vite.config.js 생성**

```js
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
  },
})
```

- [ ] **Step 4: .env 생성 (값은 실제 Supabase 프로젝트 정보로 교체)**

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

- [ ] **Step 5: 개발 서버 기동 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 → 빈 화면 또는 Vite 기본 페이지 확인

- [ ] **Step 6: 커밋**

```bash
git add package.json package-lock.json vite.config.js
git commit -m "chore: Vite 프로젝트 초기화 및 패키지 설치"
```

---

## Task 2: Supabase 테이블 생성 및 클라이언트 초기화

**Files:**
- Create: `src/supabase.js`

- [ ] **Step 1: Supabase 대시보드에서 incidents 테이블 생성**

Supabase 프로젝트 > Table Editor > New Table. 테이블명: `incidents`

SQL Editor에서 아래 실행:

```sql
create table incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  occurred_at timestamptz not null,
  severity text not null check (severity in ('high', 'mid', 'low')),
  status text not null default 'received' check (status in ('received', 'processing', 'done')),
  assignee text,
  department text,
  cause text,
  resolution text,
  created_at timestamptz not null default now()
);

-- Realtime 활성화
alter publication supabase_realtime add table incidents;
```

- [ ] **Step 2: src/supabase.js 생성**

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 3: 연결 확인 (브라우저 콘솔)**

`src/main.js`를 임시로 아래와 같이 작성해 연결 확인:

```js
import { supabase } from './supabase.js'

const { data, error } = await supabase.from('incidents').select('id').limit(1)
console.log('연결 확인:', data, error)
```

브라우저 콘솔에서 `error: null` 확인

- [ ] **Step 4: 커밋**

```bash
git add src/supabase.js
git commit -m "feat: Supabase 클라이언트 초기화"
```

---

## Task 3: index.html 및 기본 스타일

**Files:**
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: index.html 생성**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>장애 보고 대시보드</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <header class="header">
    <h1>장애 보고 대시보드</h1>
    <nav class="tab-nav">
      <a href="#dashboard" class="tab-link" data-tab="dashboard">현황 대시보드</a>
      <a href="#register" class="tab-link" data-tab="register">장애 등록</a>
      <a href="#list" class="tab-link" data-tab="list">장애 목록</a>
    </nav>
  </header>

  <div id="toast" class="toast hidden"></div>

  <main>
    <section id="tab-dashboard" class="tab-panel">
      <div class="kpi-grid">
        <div class="kpi-card" id="kpi-total"><span class="kpi-label">전체</span><span class="kpi-value" id="kpi-total-val">-</span></div>
        <div class="kpi-card" id="kpi-received"><span class="kpi-label">접수</span><span class="kpi-value" id="kpi-received-val">-</span></div>
        <div class="kpi-card" id="kpi-processing"><span class="kpi-label">처리중</span><span class="kpi-value" id="kpi-processing-val">-</span></div>
        <div class="kpi-card" id="kpi-done"><span class="kpi-label">완료</span><span class="kpi-value" id="kpi-done-val">-</span></div>
      </div>
      <div class="chart-wrap">
        <canvas id="trend-chart"></canvas>
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
      <h2>장애 등록</h2>
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
      <h2>장애 목록</h2>
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

- [ ] **Step 2: style.css 생성**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Segoe UI', sans-serif;
  background: #f4f6f9;
  color: #1a1a2e;
  font-size: 14px;
}

.header {
  background: #1a1a2e;
  color: #fff;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.header h1 { font-size: 18px; }

.tab-nav { display: flex; gap: 8px; }

.tab-link {
  color: #adb5bd;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 4px;
  transition: background 0.2s;
}

.tab-link:hover, .tab-link.active {
  background: #2d2d44;
  color: #fff;
}

main { padding: 24px; max-width: 1200px; margin: 0 auto; }

.tab-panel { display: block; }
.tab-panel.hidden { display: none; }

/* KPI 카드 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.kpi-label { font-size: 12px; color: #6c757d; margin-bottom: 8px; }
.kpi-value { font-size: 32px; font-weight: 700; color: #1a1a2e; }

/* 차트 */
.chart-wrap {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  height: 280px;
}

/* 테이블 */
.section-title { font-size: 15px; font-weight: 600; margin-bottom: 12px; }

.incidents-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.incidents-table th, .incidents-table td {
  padding: 10px 14px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.incidents-table th { background: #f8f9fa; font-weight: 600; font-size: 12px; color: #6c757d; }

/* 폼 */
.incident-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 720px;
}

.incident-form label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
}

.incident-form input,
.incident-form select,
.incident-form textarea {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 14px;
  font-family: inherit;
}

.incident-form textarea { resize: vertical; }

.incident-form label:nth-child(7),
.incident-form label:nth-child(8),
.incident-form button { grid-column: 1 / -1; }

.btn-primary {
  background: #1a1a2e;
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  width: fit-content;
}

.btn-primary:hover { background: #2d2d44; }

/* 필터 바 */
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-bar select,
.filter-bar input {
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 7px 10px;
  font-size: 13px;
}

/* 토스트 */
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #e63946;
  color: #fff;
  padding: 12px 20px;
  border-radius: 6px;
  z-index: 9999;
  font-size: 14px;
}

.toast.hidden { display: none; }

/* 심각도 배지 */
.badge-high { color: #e63946; font-weight: 600; }
.badge-mid  { color: #f4a261; font-weight: 600; }
.badge-low  { color: #2a9d8f; font-weight: 600; }
```

- [ ] **Step 3: 브라우저에서 마크업 확인**

```bash
npm run dev
```

`http://localhost:5173` 접속 → 탭 3개, KPI 카드 4개, 폼 레이아웃 확인

- [ ] **Step 4: 커밋**

```bash
git add index.html style.css
git commit -m "feat: 기본 HTML 마크업 및 스타일 구성"
```

---

## Task 4: 탭 라우팅 (main.js)

**Files:**
- Create: `src/main.js`

- [ ] **Step 1: src/main.js 작성**

```js
import { initDashboard } from './dashboard.js'
import { initForm } from './form.js'
import { initList } from './list.js'

// 토스트 메시지 표시
export function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.remove('hidden')
  setTimeout(() => toast.classList.add('hidden'), 3000)
}

// 탭 전환
function activateTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'))
  document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'))

  const panel = document.getElementById(`tab-${tabName}`)
  const link = document.querySelector(`.tab-link[data-tab="${tabName}"]`)
  if (panel) panel.classList.remove('hidden')
  if (link) link.classList.add('active')

  if (tabName === 'dashboard') initDashboard()
  if (tabName === 'register') initForm()
  if (tabName === 'list') initList()
}

// 해시 기반 라우팅
function route() {
  const hash = window.location.hash.replace('#', '') || 'dashboard'
  activateTab(hash)
}

window.addEventListener('hashchange', route)
document.addEventListener('DOMContentLoaded', route)
```

- [ ] **Step 2: 브라우저에서 탭 전환 확인**

탭 클릭 시 URL 해시 변경 및 패널 전환 확인 (각 모듈 미구현 에러는 무시)

- [ ] **Step 3: 커밋**

```bash
git add src/main.js
git commit -m "feat: URL 해시 기반 탭 라우팅 구현"
```

---

## Task 5: 현황 대시보드 (dashboard.js)

**Files:**
- Create: `src/dashboard.js`

- [ ] **Step 1: src/dashboard.js 작성**

```js
import { supabase } from './supabase.js'
import { showToast } from './main.js'
import Chart from 'chart.js/auto'

let trendChart = null

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

// 최근 목록 렌더링 (최신 10건)
export function renderRecentList(data) {
  const tbody = document.getElementById('recent-tbody')
  const recent = [...data]
    .sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at))
    .slice(0, 10)

  tbody.innerHTML = recent.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="badge-${r.severity}">${{ high: '상', mid: '중', low: '하' }[r.severity]}</span></td>
      <td>${{ received: '접수', processing: '처리중', done: '완료' }[r.status]}</td>
      <td>${r.assignee ?? '-'}</td>
      <td>${r.department ?? '-'}</td>
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
}

export function initDashboard() {
  loadDashboardData()
}
```

- [ ] **Step 2: 브라우저에서 현황 탭 확인**

`http://localhost:5173#dashboard` 접속 → KPI 카드 숫자, 차트, 테이블 렌더링 확인

- [ ] **Step 3: 커밋**

```bash
git add src/dashboard.js
git commit -m "feat: 현황 대시보드 KPI 카드, 추이 차트, 최근 목록 구현"
```

---

## Task 6: 장애 등록 폼 (form.js)

**Files:**
- Create: `src/form.js`

- [ ] **Step 1: src/form.js 작성**

```js
import { supabase } from './supabase.js'
import { showToast } from './main.js'

export function initForm() {
  const form = document.getElementById('incident-form')
  // 중복 이벤트 방지
  form.onsubmit = handleSubmit
}

async function handleSubmit(e) {
  e.preventDefault()
  const fd = new FormData(e.target)

  // 필수 필드 유효성 검사
  const title = fd.get('title').trim()
  const occurred_at = fd.get('occurred_at')
  const severity = fd.get('severity')
  const status = fd.get('status')

  if (!title || !occurred_at || !severity || !status) {
    showToast('필수 항목을 모두 입력해주세요.')
    return
  }

  const payload = {
    title,
    occurred_at: new Date(occurred_at).toISOString(),
    severity,
    status,
    assignee: fd.get('assignee').trim() || null,
    department: fd.get('department').trim() || null,
    cause: fd.get('cause').trim() || null,
    resolution: fd.get('resolution').trim() || null,
  }

  const { error } = await supabase.from('incidents').insert(payload)

  if (error) {
    showToast('등록 실패: ' + error.message)
    return
  }

  e.target.reset()
  window.location.hash = 'list'
}
```

- [ ] **Step 2: 브라우저에서 등록 테스트**

`#register` 탭 → 필수 항목 입력 → 등록 버튼 클릭 → `#list` 탭으로 이동 확인. Supabase 테이블에 행 추가 확인.

- [ ] **Step 3: 필수 항목 미입력 시 토스트 확인**

제목 비워두고 등록 클릭 → "필수 항목을 모두 입력해주세요." 토스트 표시 확인

- [ ] **Step 4: 커밋**

```bash
git add src/form.js
git commit -m "feat: 장애 등록 폼 구현"
```

---

## Task 7: 장애 목록 + 필터 (list.js)

**Files:**
- Create: `src/list.js`

- [ ] **Step 1: src/list.js 작성**

```js
import { supabase } from './supabase.js'
import { showToast } from './main.js'

// 목록 테이블 렌더링
function renderListTable(data) {
  const tbody = document.getElementById('list-tbody')
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#6c757d;">장애 내역이 없습니다.</td></tr>'
    return
  }
  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.title}</td>
      <td>${new Date(r.occurred_at).toLocaleString('ko-KR')}</td>
      <td><span class="badge-${r.severity}">${{ high: '상', mid: '중', low: '하' }[r.severity]}</span></td>
      <td>${{ received: '접수', processing: '처리중', done: '완료' }[r.status]}</td>
      <td>${r.assignee ?? '-'}</td>
      <td>${r.department ?? '-'}</td>
    </tr>
  `).join('')
}

// 필터 조건으로 조회
export async function loadList(filters = {}) {
  let query = supabase
    .from('incidents')
    .select('*')
    .order('occurred_at', { ascending: false })

  if (filters.severity) query = query.eq('severity', filters.severity)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.department) query = query.ilike('department', `%${filters.department}%`)

  const { data, error } = await query

  if (error) {
    showToast('목록 로드 실패: ' + error.message)
    return
  }

  renderListTable(data)
}

// 필터 이벤트 처리
function applyFilters() {
  const filters = {
    severity: document.getElementById('filter-severity').value,
    status: document.getElementById('filter-status').value,
    department: document.getElementById('filter-department').value.trim(),
  }
  loadList(filters)
}

export function initList() {
  loadList()

  // 중복 이벤트 방지
  const severityEl = document.getElementById('filter-severity')
  const statusEl = document.getElementById('filter-status')
  const deptEl = document.getElementById('filter-department')

  severityEl.onchange = applyFilters
  statusEl.onchange = applyFilters
  deptEl.oninput = applyFilters
}
```

- [ ] **Step 2: 브라우저에서 목록 탭 확인**

`#list` 탭 → 전체 목록 표시 확인. 심각도 필터 변경 → 목록 필터링 확인.

- [ ] **Step 3: 커밋**

```bash
git add src/list.js
git commit -m "feat: 장애 목록 및 필터 구현"
```

---

## Task 8: Supabase Realtime 구독 (realtime.js)

**Files:**
- Create: `src/realtime.js`
- Modify: `src/main.js`

- [ ] **Step 1: src/realtime.js 작성**

```js
import { supabase } from './supabase.js'

let channel = null

// incidents 테이블 변경 구독
export function subscribeRealtime(onInsert, onUpdate) {
  if (channel) return // 이미 구독 중

  channel = supabase
    .channel('incidents-changes')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'incidents' },
      payload => onInsert(payload.new)
    )
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'incidents' },
      payload => onUpdate(payload.new)
    )
    .subscribe()
}

export function unsubscribeRealtime() {
  if (channel) {
    supabase.removeChannel(channel)
    channel = null
  }
}
```

- [ ] **Step 2: src/main.js에 Realtime 연동 추가**

`src/main.js` 상단 import에 추가:

```js
import { subscribeRealtime } from './realtime.js'
import { loadDashboardData } from './dashboard.js'
```

`document.addEventListener('DOMContentLoaded', route)` 아래에 추가:

```js
// 앱 시작 시 Realtime 구독 — 대시보드 자동 갱신
subscribeRealtime(
  () => loadDashboardData(), // INSERT 시 대시보드 전체 갱신
  () => loadDashboardData()  // UPDATE 시 대시보드 전체 갱신
)
```

- [ ] **Step 3: Realtime 동작 확인**

브라우저 `#dashboard` 탭 열어둔 상태에서 Supabase Table Editor에서 행 직접 추가 → KPI 카드 숫자 자동 갱신 확인 (새로고침 없이)

- [ ] **Step 4: 커밋**

```bash
git add src/realtime.js src/main.js
git commit -m "feat: Supabase Realtime 구독으로 대시보드 실시간 갱신"
```

---

## Task 9: Vercel 배포

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: vercel.json 생성**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": null
}
```

- [ ] **Step 2: 프로덕션 빌드 확인**

```bash
npm run build
```

`dist/` 폴더 생성 확인. 에러 없이 완료 확인.

- [ ] **Step 3: .gitignore에 dist/ 이미 포함 확인**

```bash
cat .gitignore | grep dist
```

`dist/` 출력 확인. 없으면 `.gitignore`에 추가.

- [ ] **Step 4: Vercel에 환경변수 설정**

Vercel 프로젝트 > Settings > Environment Variables에 아래 두 항목 추가:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

- [ ] **Step 5: GitHub 연동 후 배포**

```bash
git add vercel.json
git commit -m "chore: Vercel 배포 설정 추가"
git push origin main
```

Vercel 대시보드에서 GitHub 저장소 연결 → 자동 배포 확인

- [ ] **Step 6: 배포 URL에서 동작 확인**

배포된 URL 접속 → 탭 전환, 데이터 로드, 장애 등록 동작 확인
