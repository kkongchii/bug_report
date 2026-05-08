# 장애 보고 대시보드 Planning Document

> **Summary**: 본부 장애 현황을 실시간으로 모니터링하고 장애를 등록/조회하는 단일 페이지 웹 애플리케이션
>
> **Project**: bug_report
> **Version**: 1.0.0
> **Author**: kkongchii
> **Date**: 2026-05-08
> **Status**: Completed

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | 본부 장애 발생 시 현황 파악이 분산되어 있고, 실시간으로 공유·모니터링할 수 있는 단일 창구가 없다 |
| **Solution** | Supabase Realtime 기반 단일 페이지 대시보드로 장애 등록·현황·목록을 한 곳에서 실시간 제공 |
| **Function/UX Effect** | 장애 등록 즉시 KPI 카드·차트·목록이 새로고침 없이 갱신되어 담당자 간 빠른 공유 가능 |
| **Core Value** | 장애 대응 속도 향상 및 현황 가시성 확보 |

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

## 1. Overview

### 1.1 Purpose

본부에서 발생하는 장애를 중앙에서 등록하고, 현황(건수·추이)과 목록을 실시간으로 모니터링한다. 기존에 분산된 장애 공유 방식을 단일 웹 대시보드로 통합하여 대응 속도를 높인다.

### 1.2 Background

- 장애 발생 시 담당자가 현황을 직접 공유해야 하는 비효율 존재
- 장애 건수·심각도별 추이를 한눈에 파악할 수 있는 도구 부재
- 빠른 구축을 위해 Serverless BaaS(Supabase) + Vanilla JS 경량 스택 채택

### 1.3 Related Documents

- Design: [bug-report-dashboard.design.md](../../02-design/features/bug-report-dashboard.design.md)
- 구현 계획: [2026-05-08-bug-report-dashboard.md](../../superpowers/plans/2026-05-08-bug-report-dashboard.md)
- 세션 요약: [session-summary.md](../../session-summary.md)

---

## 2. Scope

### 2.1 In Scope

- [x] 장애 등록 폼 (제목, 발생일시, 심각도, 상태, 담당자, 본부/팀, 원인, 해결내용)
- [x] 현황 대시보드 — KPI 카드 4개 (전체/접수/처리중/완료)
- [x] 일별 장애 발생 추이 차트 (최근 7일, Chart.js 막대)
- [x] 최근 장애 목록 (최신 10건)
- [x] 전체 장애 목록 + 3개 필터 (심각도, 상태, 본부/팀)
- [x] Supabase Realtime 실시간 갱신 (INSERT/UPDATE)
- [x] Vercel 배포

### 2.2 Out of Scope

- 사용자 인증/권한 관리 (로그인 없음)
- 장애 수정·삭제 기능
- 알림(이메일/슬랙 연동)
- 모바일 반응형 최적화
- 장애 상세 페이지

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 장애 등록 폼: 제목, 발생일시, 심각도(상/중/하), 상태(접수/처리중/완료) 필수 입력 | High | ✅ Done |
| FR-02 | 장애 등록 폼: 담당자, 본부/팀, 원인, 해결내용 선택 입력 | Medium | ✅ Done |
| FR-03 | 현황 탭: KPI 카드 (전체/접수/처리중/완료 건수) | High | ✅ Done |
| FR-04 | 현황 탭: 일별 장애 발생 추이 막대 차트 (최근 7일) | High | ✅ Done |
| FR-05 | 현황 탭: 최근 장애 목록 (최신 10건, 발생일시 내림차순) | Medium | ✅ Done |
| FR-06 | 목록 탭: 심각도·상태·본부/팀 필터 | Medium | ✅ Done |
| FR-07 | Supabase Realtime: INSERT/UPDATE 시 대시보드 자동 갱신 | High | ✅ Done |
| FR-08 | 탭 라우팅: URL 해시(#dashboard, #register, #list) 기반 이동 | Medium | ✅ Done |
| FR-09 | 에러 처리: Supabase 오류 시 토스트 메시지 표시 | Medium | ✅ Done |
| FR-10 | 보안: 사용자 입력 HTML 이스케이프(XSS 방지) | High | ✅ Done |

### 3.2 Non-Functional Requirements

| Category | Criteria | 결과 |
|----------|----------|------|
| 빌드 | `npm run build` 에러 없이 완료 | ✅ dist/ 생성 (165ms) |
| 배포 | Vercel 자동 배포 | ✅ vercel.json 구성 완료 |
| 보안 | XSS 방지 (사용자 입력 이스케이프) | ✅ esc() 함수 적용 |
| 환경변수 | `.env` Git 미포함, `VITE_` 접두사 사용 | ✅ .gitignore 포함 |
| 실시간 | INSERT 후 새로고침 없이 KPI/차트 갱신 | ✅ Realtime 구독 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [x] 모든 기능 요구사항 구현 (FR-01 ~ FR-10)
- [x] 프로덕션 빌드 성공 (`npm run build`)
- [x] GitHub 푸시 완료
- [x] XSS 취약점 코드 리뷰 후 수정
- [x] 설계 문서(design.md) 작성 완료

### 4.2 Quality Criteria

- [x] 빌드 성공 (에러 0)
- [x] 중복 이벤트 리스너 방지 패턴 적용
- [x] Supabase 환경변수 누락 시 명확한 에러 메시지
- [ ] Supabase incidents 테이블 생성 (사용자 직접 수행 필요)
- [ ] Vercel 환경변수 설정 (사용자 직접 수행 필요)
- [ ] 브라우저 동작 확인 (배포 후)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Supabase Realtime 연결 불안정 | Medium | Low | Supabase JS 자동 재연결 동작 활용 |
| .env 파일 Git 커밋 노출 | High | Low | .gitignore에 .env 포함, 환경변수 검증 코드 추가 |
| XSS 취약점 | High | Medium | `esc()` 함수로 사용자 입력 이스케이프 처리 (완료) |
| Vite 버전 불일치 (계획: v5, 설치: v8) | Low | Done | Vite 8이 Vite 5 API 호환, 동작 확인됨 |
| 환경변수 누락으로 빌드 실패 | Medium | Medium | supabase.js에 누락 시 명확한 에러 throw 추가 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `incidents` 테이블 | Supabase DB | 신규 생성 (기존 테이블 없음) |
| `supabase_realtime` publication | Supabase Config | incidents 테이블 추가 |

### 6.2 Current Consumers

신규 프로젝트이므로 기존 소비자 없음.

### 6.3 Verification

- [x] 신규 테이블 — 기존 기능 영향 없음
- [x] `.env` 환경변수 — 기존 파일 미수정

---

## 7. Architecture Considerations

### 7.1 Project Level

| Level | Selected | Rationale |
|-------|:--------:|-----------|
| Starter | ☐ | - |
| **Dynamic** | ✅ | Supabase BaaS + Vanilla JS ES modules. 프레임워크 없이 Vite 번들러만 사용 |
| Enterprise | ☐ | - |

### 7.2 Key Architectural Decisions

| Decision | Options Considered | Selected | Rationale |
|----------|--------------------|----------|-----------|
| Framework | React / Vue / **Vanilla JS** | Vanilla JS ES modules | 경량, 의존성 최소화 |
| 빌드 도구 | Webpack / **Vite** / Parcel | Vite 5 (설치 v8) | 빠른 개발 서버, ES modules 네이티브 지원 |
| 데이터베이스 | Firebase / **Supabase** / PocketBase | Supabase JS | PostgreSQL 기반, Realtime 내장, 무료 티어 |
| 차트 | D3.js / **Chart.js** / Recharts | Chart.js 4 | 간결한 API, Vanilla JS 친화적 |
| 상태 관리 | Redux / Zustand / **없음** | 없음 (모듈 변수) | 단순 SPA에 전역 상태 불필요 |
| 스타일 | Tailwind / CSS Modules / **Vanilla CSS** | Vanilla CSS | 의존성 최소화 |
| 배포 | Netlify / **Vercel** / GitHub Pages | Vercel | Vite 빌드 자동 감지, 환경변수 관리 용이 |

### 7.3 Architecture Approach

```
Dynamic Level — 탭별 모듈 분리 (Pragmatic Option C)

src/
├── supabase.js     Infrastructure: DB 클라이언트
├── main.js         Application: 라우팅, 이벤트 조율
├── dashboard.js    Feature: 현황 탭
├── form.js         Feature: 등록 탭
├── list.js         Feature: 목록 탭
└── realtime.js     Infrastructure: Realtime 구독
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] `CLAUDE.md` — 코딩 컨벤션 명시 (함수명 camelCase, 파일명 kebab-case, 들여쓰기 2칸, 주석 한국어)
- [ ] ESLint 미설정 (Vanilla JS 프로젝트)
- [ ] TypeScript 미사용

### 8.2 Conventions

| Category | Rule |
|----------|------|
| **함수명** | camelCase (`loadDashboardData`, `initForm`) |
| **파일명** | kebab-case (`dashboard.js`, `realtime.js`) |
| **들여쓰기** | 2칸 스페이스 |
| **주석** | 한국어 |
| **이벤트 바인딩** | `.on*` 프로퍼티 방식 (중복 방지) |
| **XSS 방지** | `esc()` 함수 통해 사용자 입력 이스케이프 |

### 8.3 Environment Variables

| Variable | Purpose | Scope | Status |
|----------|---------|-------|--------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL | Client (VITE_) | ✅ .env 정의됨 |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | Client (VITE_) | ✅ .env 정의됨 |

---

## 9. Next Steps

- [x] Design 문서 작성 (`bug-report-dashboard.design.md`)
- [x] 구현 완료 (9개 태스크)
- [ ] Supabase incidents 테이블 생성 SQL 실행
- [ ] `.env` 실제 값 입력
- [ ] Vercel GitHub 연동 + 환경변수 설정
- [ ] 브라우저 동작 확인 (등록 → Realtime 갱신)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-05-08 | 브레인스토밍 기반 초안 | kkongchii |
| 1.0 | 2026-05-08 | 구현 완료 반영, 요구사항 상태 업데이트 | kkongchii |
