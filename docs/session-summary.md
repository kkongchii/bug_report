# 작업 세션 요약 — 장애 보고 대시보드

**날짜**: 2026-05-08  
**저장소**: https://github.com/kkongchii/bug_report.git

---

## 완료된 작업

### 1단계: 프로젝트 설정
- `.gitignore` 생성 (node_modules, .env, dist, .bkit, .vercel 등)
- `CLAUDE.md` 생성 (프로젝트 개요, 기술 스택, 개발 명령어, 코딩 컨벤션, 작업 규칙)
- 별도 Git 저장소 초기화 및 GitHub 원격 연결

### 2단계: 기획 (Brainstorming)
- 레이아웃: **상단 탭 + KPI 카드 + 차트 + 테이블 그리드**
- 데이터 필드: 제목, 발생일시, 심각도, 상태, 담당자, 본부/팀, 원인, 해결내용
- 실시간: **Supabase Realtime** (WebSocket)
- 차트: **일별 장애 발생 추이** (최근 7일 막대)

### 3단계: 설계 문서
- `docs/superpowers/specs/2026-05-08-bug-report-dashboard-design.md`
- 화면 구성, 데이터 모델, 파일 구조, 데이터 흐름, 모듈별 책임, 에러 처리 포함

### 4단계: 구현 계획
- `docs/superpowers/plans/2026-05-08-bug-report-dashboard.md`
- 9개 태스크, 각 태스크별 파일/단계/커밋 명시

### 5단계: 구현 (서브에이전트 방식)

| 태스크 | 커밋 | 내용 |
|--------|------|------|
| Task 1 | `64c80bb`, `ca83f59` | Vite 초기화, package.json ES modules 수정 |
| Task 2 | `17acd20` | src/supabase.js — Supabase 클라이언트 싱글톤 |
| Task 3 | `103dc24` | index.html + style.css — 전체 마크업 및 스타일 |
| Task 4 | `f5d5eb8` | src/main.js — URL 해시 기반 탭 라우팅, showToast |
| Task 5 | `70fc0a5` | src/dashboard.js — KPI 카드, 추이 차트, 최근 목록 |
| Task 6 | `a80376d` | src/form.js — 장애 등록 폼, 유효성 검사 |
| Task 7 | `fdfbf71` | src/list.js — 전체 목록, 3개 필터 |
| Task 8 | `1202dc5` | src/realtime.js + main.js 수정 — Realtime 구독 |
| Task 9 | `4e540ae` | vercel.json — Vercel 배포 설정 |
| 보안 수정 | `8540704` | XSS 취약점 수정 (esc 함수), 환경변수 검증 |

---

## 최종 파일 구조

```
bug_report/
├── index.html          ← 단일 HTML 진입점, 탭 마크업
├── style.css           ← 전체 스타일
├── vite.config.js      ← Vite 빌드 설정
├── vercel.json         ← Vercel 배포 설정
├── package.json        ← 의존성 (supabase-js, chart.js, vite)
├── .env                ← 환경변수 (Git 제외)
├── .gitignore
├── CLAUDE.md
├── src/
│   ├── supabase.js     ← Supabase 클라이언트 싱글톤
│   ├── main.js         ← 탭 라우팅, showToast, Realtime 구독 시작
│   ├── dashboard.js    ← KPI 카드, 추이 차트, 최근 10건
│   ├── form.js         ← 장애 등록 폼 처리
│   ├── list.js         ← 전체 목록 + 필터
│   └── realtime.js     ← Supabase Realtime 구독 관리
└── docs/
    ├── session-summary.md  ← 이 파일
    └── superpowers/
        ├── specs/2026-05-08-bug-report-dashboard-design.md
        └── plans/2026-05-08-bug-report-dashboard.md
```

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 언어 | Vanilla JavaScript (ES modules) |
| 빌드 | Vite 8 (설치됨, Vite 5 API 호환) |
| 데이터베이스 | Supabase JS (@supabase/supabase-js ^2) |
| 차트 | Chart.js 4 |
| 배포 | Vercel |

---

## Supabase 설정 (직접 수행 필요)

**1. SQL Editor에서 테이블 생성 실행:**

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

alter publication supabase_realtime add table incidents;
```

**2. .env 파일 실제 값으로 교체:**

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

값 위치: Supabase 대시보드 → **Settings → API**

**3. Vercel 환경변수 설정:**

Vercel 프로젝트 → Settings → Environment Variables에 위 두 항목 추가

---

## 개발 명령어

```bash
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

---

## 주요 결정 및 특이사항

- **package.json `"type": "module"`**: npm init 시 자동으로 `"commonjs"`가 설정되어 수동 수정
- **XSS 수정**: 코드 리뷰에서 `innerHTML` 템플릿에 사용자 입력 데이터 비이스케이프 삽입 발견 → `esc()` 함수로 수정
- **Realtime 중복 구독 방지**: `channel` 변수로 가드, 앱 시작 시 1회만 구독
- **이벤트 중복 방지**: `form.onsubmit`, `el.onchange`, `el.oninput` 패턴 사용 (addEventListener 대신)
