# 장애 보고 대시보드 설계 문서

## 개요

본부 장애 현황을 실시간으로 모니터링하고 장애를 등록/조회하는 단일 페이지 웹 애플리케이션.

- **배포**: Vercel
- **기술 스택**: HTML5, CSS3, Vanilla JS (ES modules), Vite 5, Supabase JS, Chart.js 4

---

## 화면 구성

탭 기반 단일 페이지 구성. URL 해시(`#dashboard`, `#register`, `#list`)로 탭 전환.

### 현황 탭 (`#dashboard`)

```
┌──────────────────────────────────────────────┐
│ [현황 대시보드] [장애 등록] [장애 목록]         │  ← 상단 탭
├──────────────────────────────────────────────┤
│ ┌────────┬────────┬────────┬────────┐        │
│ │ 전체   │ 접수   │ 처리중 │ 완료   │        │  ← KPI 카드
│ └────────┴────────┴────────┴────────┘        │
│ ┌──────────────────────────────────┐         │
│ │   일별 장애 발생 추이 (최근 7일)   │         │  ← Chart.js 막대/선
│ └──────────────────────────────────┘         │
│ ┌──────────────────────────────────┐         │
│ │   최근 장애 목록 (최신 10건)       │         │  ← 테이블
│ └──────────────────────────────────┘         │
└──────────────────────────────────────────────┘
```

### 등록 탭 (`#register`)

장애 등록 폼. 제출 후 목록 탭으로 이동.

### 목록 탭 (`#list`)

전체 장애 목록. 심각도·상태·본부 필터, 발생일시 내림차순 정렬.

---

## 데이터 모델

### Supabase 테이블: `incidents`

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid (PK) | 자동 생성 |
| `title` | text | 장애 제목 |
| `occurred_at` | timestamptz | 발생일시 |
| `severity` | text | 심각도: `high` / `mid` / `low` |
| `status` | text | 상태: `received` / `processing` / `done` |
| `assignee` | text | 담당자 이름 |
| `department` | text | 본부/팀 |
| `cause` | text | 원인 |
| `resolution` | text | 해결내용 |
| `created_at` | timestamptz | 등록일시 (자동) |

---

## 파일 구조

```
bug_report/
├── index.html
├── style.css
├── src/
│   ├── main.js          ← 앱 진입점, 탭 라우팅
│   ├── supabase.js      ← Supabase 클라이언트 초기화
│   ├── dashboard.js     ← KPI 카드, 차트, 최근 목록 렌더링
│   ├── form.js          ← 장애 등록 폼 처리
│   ├── list.js          ← 전체 목록 + 필터
│   └── realtime.js      ← Supabase Realtime 구독 관리
├── .env                 ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
├── .gitignore
├── CLAUDE.md
└── vite.config.js
```

---

## 데이터 흐름

```
앱 로드
  └─> supabase.js 초기화
  └─> dashboard.js: incidents 전체 조회 → KPI 카드 + 차트 + 목록 렌더링
  └─> realtime.js: incidents 테이블 INSERT/UPDATE 구독 시작
        └─> 변경 감지 시 dashboard.js 갱신 함수 호출 (페이지 새로고침 없음)
```

### Realtime 구독 처리

- `INSERT` → KPI 카운트 +1, 차트 해당 날짜 수치 업데이트, 최근 목록 prepend
- `UPDATE` → 해당 행 상태값 변경 반영 (KPI 재계산)
- 목록 탭은 탭 활성화 시점에 재조회

---

## 모듈별 책임

### `supabase.js`
Supabase 클라이언트 단일 인스턴스 생성 및 export. 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 사용.

### `dashboard.js`
- `loadDashboardData()` — incidents 조회, KPI·차트·목록 렌더링
- `updateKpiCards(data)` — 상태별 카운트 계산 및 DOM 업데이트
- `renderTrendChart(data)` — Chart.js로 최근 7일 막대 차트 렌더링
- `renderRecentList(data)` — 최신 10건 테이블 렌더링

### `form.js`
- `initForm()` — 폼 이벤트 바인딩
- `submitIncident(formData)` — Supabase INSERT 후 `#list` 탭으로 이동

### `list.js`
- `loadList(filters)` — 필터 조건으로 incidents 조회 및 테이블 렌더링
- `applyFilters()` — 심각도·상태·본부 필터 change 이벤트 처리

### `realtime.js`
- `subscribeRealtime(onInsert, onUpdate)` — incidents 채널 구독
- `unsubscribeRealtime()` — 구독 해제

### `main.js`
- 탭 전환 라우팅 (URL 해시 기반)
- 각 탭 활성화 시 해당 모듈 초기화

---

## 에러 처리

- Supabase 요청 실패 시 화면 상단에 토스트 메시지 표시
- 폼 제출 시 필수 필드(제목, 발생일시, 심각도, 상태) 클라이언트 유효성 검사
- Realtime 연결 끊김 시 자동 재연결 (Supabase JS 기본 동작)

---

## 환경변수

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```
