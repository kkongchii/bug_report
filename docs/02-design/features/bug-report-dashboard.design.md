# 장애 보고 대시보드 Design Document

> **Summary**: 본부 장애 현황을 실시간으로 모니터링하고 장애를 등록/조회하는 단일 페이지 웹 애플리케이션
>
> **Project**: bug_report
> **Version**: 1.0.0
> **Author**: kkongchii
> **Date**: 2026-05-08
> **Status**: Implemented
> **Plan Doc**: [구현 계획](../../superpowers/plans/2026-05-08-bug-report-dashboard.md)

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | 본부 장애 현황을 한눈에 파악하고 신속하게 등록·추적하기 위해 |
| **WHO** | 본부 담당자 및 관리자 (데스크톱 환경) |
| **RISK** | Supabase Realtime 연결 불안정 시 갱신 누락 가능 |
| **SUCCESS** | 장애 등록 후 실시간으로 KPI/차트/목록이 새로고침 없이 갱신됨 |
| **SCOPE** | 장애 등록, 현황 모니터링, 목록 조회+필터 (인증 없음) |

---

## Design Anchor

| Category | Tokens |
|----------|--------|
| **Colors** | primary: `#1a1a2e`, hover: `#2d2d44`, bg: `#f4f6f9`, text: `#1a1a2e`, muted: `#6c757d` |
| **Severity** | high: `#e63946`, mid: `#f4a261`, low: `#2a9d8f` |
| **Typography** | Segoe UI, base: 14px, h1: 18px, kpi-value: 32px |
| **Spacing** | card padding: 20px, main padding: 24px, gap: 16px |
| **Radius** | default: `8px`, button: `4px` |
| **Tone** | 다크 헤더 + 라이트 콘텐츠, 관리자 대시보드 스타일 |
| **Layout** | 상단 고정 헤더 + 탭 네비게이션 + 메인 콘텐츠 영역 |

---

## 1. Overview

### 1.1 Design Goals

- **단일 페이지(SPA)**: 탭 전환으로 등록·현황·목록을 하나의 HTML에서 처리
- **실시간 반영**: Supabase Realtime WebSocket으로 INSERT/UPDATE 자동 감지
- **경량 스택**: 번들러(Vite) + Vanilla JS ES modules — 프레임워크 불필요
- **보안**: 사용자 입력 값 HTML 이스케이프(XSS 방지), 환경변수 누락 조기 감지

### 1.2 Design Principles

- **모듈 단일 책임**: 각 JS 파일은 하나의 탭/기능만 담당
- **중복 이벤트 방지**: `onsubmit`/`onchange`/`oninput` 패턴으로 리스너 중복 차단
- **싱글톤 관리**: Supabase 클라이언트·Chart.js 인스턴스·Realtime 채널 모두 1회만 생성

---

## 2. Architecture

### 2.0 Architecture Decision

| Criteria | 선택: Option C (Pragmatic) |
|----------|--------------------------|
| **Approach** | 탭별 모듈 분리, 공용 클라이언트 싱글톤 |
| **New Files** | 6개 (supabase, main, dashboard, form, list, realtime) |
| **Complexity** | 낮음 |
| **Maintainability** | 높음 (파일별 책임 명확) |
| **Rationale** | Vanilla JS 프로젝트에서 Clean Architecture 레이어 불필요. 탭 단위 모듈 분리로 충분 |

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────┐
│  Browser (index.html)                                │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │  Header + Tab Nav                            │    │
│  │  [현황 대시보드] [장애 등록] [장애 목록]       │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ #tab-    │  │ #tab-    │  │ #tab-list        │  │
│  │dashboard │  │register  │  │ (filter+table)   │  │
│  │ KPI카드  │  │ 등록폼   │  └──────────────────┘  │
│  │ 추이차트 │  └──────────┘                         │
│  │ 최근목록 │                                        │
│  └──────────┘                                        │
│                                                      │
│  src/main.js ──── 탭 라우팅 (URL hash)              │
│       ├── src/dashboard.js  KPI + Chart + List      │
│       ├── src/form.js       장애 등록 폼             │
│       ├── src/list.js       목록 + 필터              │
│       ├── src/realtime.js   Realtime 구독            │
│       └── src/supabase.js   클라이언트 싱글톤        │
└──────────────────────────────────────────────────────┘
                        │ Supabase JS SDK
                        ▼
              ┌──────────────────┐
              │  Supabase BaaS   │
              │  - incidents 테이블│
              │  - Realtime WS   │
              └──────────────────┘
```

### 2.2 Data Flow

```
앱 로드
  └─> supabase.js: createClient (환경변수 검증)
  └─> main.js: DOMContentLoaded → route() → initDashboard()
        └─> dashboard.js: loadDashboardData()
              └─> supabase.from('incidents').select('*')
              └─> updateKpiCards(data)
              └─> renderTrendChart(data)   [Chart.js bar]
              └─> renderRecentList(data)   [최신 10건]
  └─> main.js: subscribeRealtime(onInsert, onUpdate)
        └─> realtime.js: supabase.channel('incidents-changes')
              └─> INSERT/UPDATE 감지 → loadDashboardData() 재호출

탭 전환 (URL hash 변경)
  └─> hashchange → route() → activateTab(tabName)
        ├─ 'dashboard' → initDashboard()
        ├─ 'register'  → initForm()
        └─ 'list'      → initList()
```

### 2.3 Module Dependencies

| 모듈 | 의존 | 이유 |
|------|------|------|
| `main.js` | dashboard, form, list, realtime | 탭 라우팅 및 구독 시작 |
| `dashboard.js` | supabase, main(showToast), chart.js | 데이터 조회 + 렌더링 |
| `form.js` | supabase, main(showToast) | INSERT + 에러 표시 |
| `list.js` | supabase, main(showToast) | 조회 + 필터 |
| `realtime.js` | supabase | 채널 구독만 담당 |
| `supabase.js` | @supabase/supabase-js | 클라이언트 초기화 |

---

## 3. Data Model

### 3.1 Entity: incidents

```js
// Supabase incidents 테이블
{
  id:          string,      // uuid PK (auto)
  title:       string,      // 장애 제목 (NOT NULL)
  occurred_at: string,      // 발생일시 timestamptz (NOT NULL)
  severity:    'high'|'mid'|'low',         // 심각도 (NOT NULL, CHECK)
  status:      'received'|'processing'|'done', // 상태 (NOT NULL, DEFAULT 'received')
  assignee:    string|null, // 담당자
  department:  string|null, // 본부/팀
  cause:       string|null, // 원인
  resolution:  string|null, // 해결내용
  created_at:  string,      // 등록일시 (auto)
}
```

### 3.2 Database Schema (Supabase SQL)

```sql
create table incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  occurred_at timestamptz not null,
  severity text not null check (severity in ('high', 'mid', 'low')),
  status text not null default 'received'
    check (status in ('received', 'processing', 'done')),
  assignee text,
  department text,
  cause text,
  resolution text,
  created_at timestamptz not null default now()
);

-- Realtime 구독 활성화
alter publication supabase_realtime add table incidents;
```

---

## 4. API Specification

Supabase JS SDK를 통해 직접 호출 (별도 API 서버 없음).

| 동작 | SDK 호출 | 위치 |
|------|----------|------|
| 전체 조회 | `supabase.from('incidents').select('*').order(...)` | dashboard.js, list.js |
| 필터 조회 | `.eq('severity', v)` / `.ilike('department', '%v%')` | list.js |
| 등록 | `supabase.from('incidents').insert(payload)` | form.js |
| Realtime 구독 | `supabase.channel(...).on('postgres_changes', ...)` | realtime.js |

---

## 5. UI/UX Design

### 5.1 Screen Layout

```
┌──────────────────────────────────────────────────────┐
│  장애 보고 대시보드  [현황 대시보드][장애 등록][장애 목록] │ ← header.header
├──────────────────────────────────────────────────────┤
│                                                      │
│  [현황 탭] #tab-dashboard                            │
│  ┌────────┬────────┬────────┬────────┐               │
│  │ 전체   │ 접수   │ 처리중 │ 완료   │  ← .kpi-grid  │
│  │  #     │  #     │  #     │  #     │               │
│  └────────┴────────┴────────┴────────┘               │
│  ┌──────────────────────────────────┐                │
│  │   일별 장애 발생 추이 (최근 7일)  │  ← .chart-wrap │
│  └──────────────────────────────────┘                │
│  최근 장애 목록                                       │
│  ┌──────────────────────────────────┐                │
│  │ 제목 | 발생일시 | 심각도 | 상태..│  ← table       │
│  └──────────────────────────────────┘                │
│                                                      │
│  [등록 탭] #tab-register                             │
│  ┌──────────────────────────────────┐                │
│  │  제목* | 발생일시*               │  ← 2-col grid  │
│  │  심각도* | 상태*                 │               │
│  │  담당자 | 본부/팀               │               │
│  │  원인 (full-width)               │               │
│  │  해결내용 (full-width)           │               │
│  │  [등록] 버튼                     │               │
│  └──────────────────────────────────┘                │
│                                                      │
│  [목록 탭] #tab-list                                 │
│  [심각도 전체▼] [상태 전체▼] [본부/팀 검색]          │
│  ┌──────────────────────────────────┐                │
│  │ 제목 | 발생일시 | 심각도 | 상태..│  ← table       │
│  └──────────────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

### 5.2 User Flow

```
앱 접속(#dashboard)
  → KPI 카드 + 차트 + 최근 목록 확인
  → [장애 등록] 탭 이동
  → 폼 입력 후 [등록] 클릭
  → 자동으로 #list 탭 이동
  → 등록된 내역 확인
  → #dashboard 탭: Realtime으로 KPI/차트 자동 갱신 (새로고침 없음)
```

### 5.3 Component 목록

| 파일 | DOM 요소 | 책임 |
|------|----------|------|
| `main.js` | `.tab-link`, `.tab-panel`, `#toast` | 탭 전환, 토스트 |
| `dashboard.js` | `#kpi-*-val`, `#trend-chart`, `#recent-tbody` | KPI, 차트, 최근 목록 |
| `form.js` | `#incident-form` | 등록 폼 처리 |
| `list.js` | `#list-tbody`, `#filter-*` | 목록 + 필터 |

### 5.4 Page UI Checklist

#### 현황 탭 (#tab-dashboard)

- [x] KPI 카드: 전체 건수 (`#kpi-total-val`)
- [x] KPI 카드: 접수 건수 (`#kpi-received-val`)
- [x] KPI 카드: 처리중 건수 (`#kpi-processing-val`)
- [x] KPI 카드: 완료 건수 (`#kpi-done-val`)
- [x] 차트: 일별 발생 추이 막대 차트 — 최근 7일 (`#trend-chart`, Chart.js bar)
- [x] 테이블: 최근 장애 목록 10건 (`#recent-tbody`) — 제목, 발생일시, 심각도 배지, 상태, 담당자, 본부/팀
- [x] 심각도 배지: `.badge-high`(상/빨강), `.badge-mid`(중/주황), `.badge-low`(하/초록)

#### 등록 탭 (#tab-register)

- [x] 입력 필드: 제목 (text, required)
- [x] 입력 필드: 발생일시 (datetime-local, required)
- [x] 선택 필드: 심각도 (select — 선택/상/중/하, required)
- [x] 선택 필드: 상태 (select — 접수/처리중/완료, required)
- [x] 입력 필드: 담당자 (text, optional)
- [x] 입력 필드: 본부/팀 (text, optional)
- [x] 텍스트에어리어: 원인 (3rows, optional)
- [x] 텍스트에어리어: 해결내용 (3rows, optional)
- [x] 버튼: 등록 (`.btn-primary`)
- [x] 토스트: 필수 항목 미입력 시 에러 메시지
- [x] 토스트: Supabase 오류 시 에러 메시지

#### 목록 탭 (#tab-list)

- [x] 필터: 심각도 select (`#filter-severity` — 전체/상/중/하)
- [x] 필터: 상태 select (`#filter-status` — 전체/접수/처리중/완료)
- [x] 필터: 본부/팀 텍스트 검색 (`#filter-department`, ilike)
- [x] 테이블: 전체 목록 (`#list-tbody`) — occurred_at 내림차순
- [x] 빈 데이터: "장애 내역이 없습니다." 메시지

---

## 6. Error Handling

| 상황 | 처리 방식 | 위치 |
|------|----------|------|
| Supabase 조회 실패 | `showToast('데이터 로드 실패: ' + error.message)` | dashboard.js, list.js |
| Supabase INSERT 실패 | `showToast('등록 실패: ' + error.message)` | form.js |
| 필수 필드 미입력 | `showToast('필수 항목을 모두 입력해주세요.')` | form.js |
| 환경변수 누락 | `throw new Error('...환경변수가 설정되지 않았습니다...')` | supabase.js |
| Realtime 연결 끊김 | Supabase JS 자동 재연결 (기본 동작) | realtime.js |

### Toast 동작

```js
// 3초 후 자동 숨김
export function showToast(message) {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.classList.remove('hidden')
  setTimeout(() => toast.classList.add('hidden'), 3000)
}
```

---

## 7. Security Considerations

- [x] **XSS 방지**: `esc()` 함수로 사용자 입력 필드(`title`, `assignee`, `department`) HTML 이스케이프 처리
- [x] **환경변수 보호**: `.env`는 `.gitignore`에 포함, Git 커밋 대상에서 제외
- [x] **환경변수 검증**: `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 누락 시 앱 기동 불가
- [x] **anon key 사용**: `service_role` key 미사용, 최소 권한 원칙
- [ ] **RLS(Row Level Security)**: 현재 미적용 — 추후 인증 도입 시 추가 필요
- [ ] **Rate Limiting**: Supabase 기본 제한 외 별도 미적용

---

## 8. Test Plan

### 8.1 Test Scope

| Type | 대상 | 방법 |
|------|------|------|
| L1: 데이터 연결 | Supabase incidents 조회 | 브라우저 콘솔 확인 |
| L2: UI 동작 | KPI 카드, 차트, 필터, 폼 | 수동 브라우저 테스트 |
| L3: E2E 시나리오 | 등록 → 목록 확인 → 대시보드 갱신 | 수동 + Realtime 확인 |

### 8.2 L2: UI Action Test Scenarios

| # | 탭 | 동작 | 기대 결과 |
|---|----|----- |----------|
| 1 | 현황 | 페이지 로드 | KPI 카드 숫자 표시, 차트 렌더링, 최근 목록 표시 |
| 2 | 현황 | Supabase에서 행 추가 | KPI/차트/목록 새로고침 없이 자동 갱신 |
| 3 | 등록 | 필수 항목 미입력 후 등록 | 토스트 에러 메시지 표시 |
| 4 | 등록 | 전체 입력 후 등록 | #list 탭으로 이동, 목록에 신규 행 표시 |
| 5 | 목록 | 심각도 필터 변경 | 해당 심각도만 표시 |
| 6 | 목록 | 상태 필터 변경 | 해당 상태만 표시 |
| 7 | 목록 | 본부/팀 검색어 입력 | 부분 일치 행만 표시 |
| 8 | 목록 | 데이터 없음 | "장애 내역이 없습니다." 메시지 표시 |

### 8.3 L3: E2E Scenario

| # | 시나리오 | 단계 | 성공 기준 |
|---|----------|------|----------|
| 1 | 장애 등록 후 실시간 갱신 | 현황 탭 열기 → 등록 탭에서 등록 → 현황 탭 확인 | KPI 전체 건수 +1, 최근 목록 최상단에 신규 건 |
| 2 | 필터 조합 | 목록 탭 → 심각도 '상' + 상태 '처리중' 선택 | 해당 조건 행만 표시 |
| 3 | 탭 라우팅 | URL 해시 직접 변경 (#register, #list) | 해당 탭 패널 활성화, 링크 active 상태 |

---

## 9. Module Structure

### 9.1 파일 구조

```
bug_report/
├── index.html          ← 단일 진입점, 전체 탭 마크업
├── style.css           ← 전체 스타일 (CSS Custom Properties 미사용, 직접 값 사용)
├── vite.config.js      ← root: '.', outDir: 'dist'
├── vercel.json         ← buildCommand, outputDirectory
├── package.json        ← type: "module", scripts: dev/build/preview
├── .env                ← VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (Git 제외)
└── src/
    ├── supabase.js     ← Supabase 클라이언트 싱글톤 + 환경변수 검증
    ├── main.js         ← 탭 라우팅, showToast, Realtime 구독 시작
    ├── dashboard.js    ← KPI 카드, 추이 차트(Chart.js), 최근 10건
    ├── form.js         ← 폼 처리, 유효성 검사, INSERT
    ├── list.js         ← 전체 목록, 3개 필터(eq/ilike)
    └── realtime.js     ← incidents 채널 구독, channel 가드
```

### 9.2 레이어 역할

| 레이어 | 파일 | 역할 |
|--------|------|------|
| Presentation | index.html, style.css | 마크업 + 스타일 |
| Application | main.js | 탭 라우팅, 모듈 조율 |
| Feature | dashboard.js, form.js, list.js | 각 탭 비즈니스 로직 |
| Infrastructure | supabase.js, realtime.js | DB 접근, Realtime |

---

## 10. Coding Convention

| 항목 | 규칙 | 예시 |
|------|------|------|
| 함수명 | camelCase | `loadDashboardData`, `initForm` |
| 파일명 | kebab-case | `dashboard.js`, `realtime.js` |
| 들여쓰기 | 2칸 스페이스 | - |
| 주석 언어 | 한국어 | `// 최근 7일 날짜 레이블 생성` |
| 환경변수 접두사 | `VITE_` | `VITE_SUPABASE_URL` |
| 이벤트 바인딩 | `.on*` 프로퍼티 | `form.onsubmit`, `el.onchange` |
| XSS 방지 | `esc()` 함수 | `${esc(r.title)}` |

---

## 11. Implementation Guide

### 11.1 구현 완료 현황

| 태스크 | 커밋 | 상태 |
|--------|------|------|
| 프로젝트 초기화 | `64c80bb`, `ca83f59` | ✅ |
| Supabase 클라이언트 | `17acd20` | ✅ |
| HTML + CSS | `103dc24` | ✅ |
| 탭 라우팅 | `f5d5eb8` | ✅ |
| 현황 대시보드 | `70fc0a5` | ✅ |
| 장애 등록 폼 | `a80376d` | ✅ |
| 목록 + 필터 | `fdfbf71` | ✅ |
| Realtime 구독 | `1202dc5` | ✅ |
| Vercel 배포 설정 | `4e540ae` | ✅ |
| XSS 수정 | `8540704` | ✅ |

### 11.2 배포 전 체크리스트

- [ ] Supabase 대시보드에서 incidents 테이블 생성 SQL 실행
- [ ] `.env` 파일에 실제 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 입력
- [ ] Vercel 프로젝트에 동일 환경변수 추가
- [ ] `npm run build` 빌드 성공 확인
- [ ] Vercel에 GitHub 저장소 연결 및 배포 확인

### 11.3 Session Guide

| 세션 | 작업 | 상태 |
|------|------|------|
| Session 1 | 기획(Brainstorming) + 설계 문서 작성 | ✅ 완료 |
| Session 2 | 구현 (Task 1~9, 서브에이전트 방식) | ✅ 완료 |
| Session 3 | 배포 연동 + 운영 (Supabase 설정, Vercel 연결) | 🔲 진행 예정 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-08 | 브레인스토밍 기반 초안 작성 | kkongchii |
| 1.0 | 2026-05-08 | 구현 완료 반영, XSS 수정 포함 | kkongchii |
