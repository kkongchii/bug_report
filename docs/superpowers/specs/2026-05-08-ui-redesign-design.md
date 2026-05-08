# 장애 보고 대시보드 UI 리디자인 설계 문서

**날짜**: 2026-05-08  
**작성자**: kkongchii  
**상태**: 승인됨

---

## 1. 개요

### 목표

현재 라이트 테마 기반 대시보드를 다크 테마(짙은 남색 + 주황 강조)로 전면 리디자인하고, 메인 대시보드의 차트를 4개(일자별/심각도별/상태별/팀별)로 확장하며, 반응형 웹 디자인을 적용한다.

### 변경 범위

| 파일 | 변경 유형 | 내용 |
|------|-----------|------|
| `style.css` | 전체 재작성 | 다크 테마 전환, 반응형 브레이크포인트 |
| `index.html` | 수정 | Pretendard 폰트 CDN 추가, 차트 canvas 3개 추가 |
| `src/dashboard.js` | 수정 | 기존 차트 스타일 업데이트, 신규 차트 3개 함수 추가 |

---

## 2. 색상 토큰

| 역할 | CSS 변수 | 값 |
|------|----------|----|
| 페이지 배경 | `--bg-base` | `#0f172a` |
| 카드/패널 배경 | `--bg-card` | `#1e293b` |
| 헤더 배경 | `--bg-header` | `#0b1120` |
| 보조 배경 / hover | `--bg-hover` | `#334155` |
| 기본 텍스트 | `--text-primary` | `#f1f5f9` |
| 보조 텍스트 | `--text-secondary` | `#94a3b8` |
| 구분선 | `--border` | `#334155` |
| 강조 (주황) | `--accent` | `#f97316` |
| 강조 hover | `--accent-hover` | `#ea6c00` |
| 심각도-상 | `--severity-high` | `#ef4444` |
| 심각도-중 | `--severity-mid` | `#f97316` |
| 심각도-하 | `--severity-low` | `#22c55e` |
| 상태-접수 | `--status-received` | `#3b82f6` |
| 상태-처리중 | `--status-processing` | `#f97316` |
| 상태-완료 | `--status-done` | `#22c55e` |

---

## 3. 타이포그래피

- **폰트**: Pretendard (CDN: `https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css`)
- **폴백**: `'Segoe UI', sans-serif`
- **기본 크기**: `14px`
- **제목**: `18px`, weight `700`
- **KPI 수치**: `32px`, weight `700`

---

## 4. 레이아웃 구조

### 4.1 헤더

```
+--[로고 + 제목]----[현황 대시보드] [장애 등록] [장애 목록]--+
```

- 높이: `56px`
- 배경: `--bg-header` (`#0b1120`)
- 탭 active: 하단 `border-bottom: 2px solid #f97316` + `color: #fff`
- 탭 비활성: `color: #94a3b8`
- 탭 hover: `color: #f1f5f9`

### 4.2 메인 대시보드 탭

```
[KPI 전체] [KPI 접수] [KPI 처리중] [KPI 완료]   ← 4열 그리드

[────────── 일자별 추이 막대 차트 (100%) ──────────]

[심각도별 도넛] [상태별 도넛] [팀별 가로 막대]   ← 3열 그리드

[────────── 최근 장애 목록 테이블 ──────────────]
```

### 4.3 KPI 카드

- 카드 좌측에 `3px solid --accent` 보더 포인트
- 내부: 좌측 주황 아이콘 원형 + 우측 레이블/수치
- hover: 배경 `--bg-hover`로 전환 (`transition: 0.2s`)

### 4.4 테이블

- 헤더 행: `--bg-hover` 배경, `--text-secondary` 텍스트
- 짝수 행: 미적용 (hover로 구분)
- 행 hover: `--bg-hover`
- 심각도/상태 배지: `border-radius: 9999px`, 반투명 배경 (`20% opacity`)

---

## 5. 반응형 브레이크포인트

| 브레이크포인트 | 변경 내용 |
|---------------|-----------|
| `1024px` 이하 | KPI 그리드 4열 → 2×2 |
| `768px` 이하 | KPI 1열, 보조 차트 3열 → 1열 스택, 폼 2열 → 1열 |
| `480px` 이하 | 헤더 폰트/패딩 축소, 탭 텍스트 축소 |

---

## 6. 차트 스펙

### 6.1 일자별 추이 막대 차트 (기존 → 스타일 업데이트)

| 항목 | 값 |
|------|----|
| 타입 | `bar` |
| 막대 색상 | `#f97316` |
| hover 색상 | `#ea6c00` |
| 그리드 라인 | `#334155` |
| 텍스트 색상 | `#94a3b8` |
| 범례 | 없음 |
| 배경 | 투명 |

### 6.2 심각도별 도넛 차트 (신규)

| 항목 | 값 |
|------|----|
| 타입 | `doughnut` |
| 색상 | 상: `#ef4444`, 중: `#f97316`, 하: `#22c55e` |
| 가운데 텍스트 | 전체 건수 |
| 범례 | 차트 하단 |
| canvas ID | `severity-chart` |

### 6.3 상태별 도넛 차트 (신규)

| 항목 | 값 |
|------|----|
| 타입 | `doughnut` |
| 색상 | 접수: `#3b82f6`, 처리중: `#f97316`, 완료: `#22c55e` |
| 가운데 텍스트 | 완료율 (완료/전체 × 100, %) |
| 범례 | 차트 하단 |
| canvas ID | `status-chart` |

### 6.4 팀별 가로 막대 차트 (신규)

| 항목 | 값 |
|------|----|
| 타입 | `bar` (horizontal, `indexAxis: 'y'`) |
| 색상 | `#f97316` |
| 표시 범위 | 건수 상위 5개 팀 |
| Y축 | 팀명 |
| X축 | 건수 |
| canvas ID | `dept-chart` |

---

## 7. 구현 순서

1. `index.html` — Pretendard CDN 추가, canvas 3개 추가 (`severity-chart`, `status-chart`, `dept-chart`)
2. `style.css` — CSS 변수 선언 + 전체 다크 테마 재작성 + 반응형 미디어 쿼리
3. `src/dashboard.js` — 기존 `renderTrendChart()` 스타일 업데이트 + `renderSeverityChart()`, `renderStatusChart()`, `renderDeptChart()` 추가 + `loadDashboardData()` 에서 3개 함수 호출

---

## 8. 제약 사항

- `src/supabase.js`, `src/realtime.js`, `src/form.js`, `src/list.js`, `src/main.js` 기능 로직은 변경하지 않음
- Chart.js 추가 설치 없음 (이미 설치됨)
- 기존 데이터 모델(incidents 테이블) 변경 없음
- `.env` 파일 수정 없음
