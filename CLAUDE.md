# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

- **프로젝트명**: 장애 보고 대시보드
- **목적**: 본부 장애 현황 및 등록 실시간 모니터링
- **배포**: Vercel

## 기술 스택

| 분류 | 기술 |
|------|------|
| 마크업/스타일 | HTML5, CSS3 |
| 언어 | Vanilla JavaScript (ES modules) |
| 빌드 도구 | Vite 5 |
| 데이터베이스 | Supabase JS |
| 차트 | Chart.js 4 |

## 개발 명령어

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## 환경변수

`.env` 파일에 아래 변수를 설정해야 한다. `.env`는 Git에 추가하지 않는다.

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- 모든 Supabase 환경변수는 `VITE_` 접두사를 사용해야 Vite에서 클라이언트에 노출된다.

## 코딩 컨벤션

- **함수명**: camelCase (예: `loadDashboardData`)
- **파일명**: kebab-case (예: `dashboard-chart.js`)
- **들여쓰기**: 2칸
- **주석**: 한국어

## 작업 규칙

- `.env` 파일은 절대 수정하거나 Git에 추가하지 말 것
- 기능 완성 후 반드시 브라우저에서 동작 확인
- 커밋은 Conventional Commit 형식 사용 (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`)
