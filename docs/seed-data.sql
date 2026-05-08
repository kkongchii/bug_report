-- 장애 보고 대시보드 더미 데이터
-- Supabase SQL Editor에서 실행하세요.
-- incidents 테이블이 먼저 생성되어 있어야 합니다.

insert into incidents (title, occurred_at, severity, status, assignee, department, cause, resolution) values

-- 오늘 ~ 최근 7일 데이터 (차트에 표시됨)
('운영계 DB 연결 오류', now() - interval '0 days' + interval '9 hours', 'high', 'processing', '김철수', 'IT인프라본부', 'DB 커넥션 풀 고갈', null),
('결재 시스템 응답 지연', now() - interval '0 days' + interval '11 hours', 'mid', 'received', '이영희', '디지털혁신본부', null, null),
('사용자 포털 로그인 불가', now() - interval '1 days' + interval '8 hours', 'high', 'done', '박민준', 'IT인프라본부', '인증 서버 메모리 부족', '서버 재기동 및 메모리 증설'),
('배치 작업 실패 (야간)', now() - interval '1 days' + interval '2 hours', 'mid', 'done', '최수연', '데이터플랫폼본부', 'ETL 파이프라인 타임아웃', '쿼리 최적화 및 배치 분할 처리'),
('API 게이트웨이 500 오류', now() - interval '2 days' + interval '14 hours', 'high', 'done', '정동훈', 'IT인프라본부', '신규 배포 후 설정 오류', '이전 버전 롤백'),
('파일 서버 용량 초과', now() - interval '2 days' + interval '10 hours', 'mid', 'done', '한지원', 'IT인프라본부', '로그 파일 미정리', '임시 파일 삭제 및 아카이빙'),
('ERP 모듈 접속 불가', now() - interval '3 days' + interval '9 hours', 'high', 'done', '김철수', 'ERP운영팀', '패치 배포 중 서비스 중단', '패치 완료 후 정상화'),
('SMS 발송 지연', now() - interval '3 days' + interval '16 hours', 'low', 'done', '이영희', '디지털혁신본부', '외부 발송 업체 서버 불안정', '발송 재처리 완료'),
('데이터 동기화 오류', now() - interval '4 days' + interval '13 hours', 'mid', 'done', '박민준', '데이터플랫폼본부', '네트워크 순단으로 인한 싱크 누락', '수동 동기화 수행'),
('웹 방화벽 오탐 차단', now() - interval '4 days' + interval '11 hours', 'low', 'done', '최수연', 'IT인프라본부', 'WAF 정책 과도 적용', '예외 규칙 추가'),
('결제 모듈 오류', now() - interval '5 days' + interval '10 hours', 'high', 'done', '정동훈', '디지털혁신본부', '외부 PG사 장애', 'PG사 복구 후 자동 정상화'),
('보고서 생성 타임아웃', now() - interval '5 days' + interval '15 hours', 'mid', 'done', '한지원', '데이터플랫폼본부', '대용량 쿼리 미최적화', '페이징 처리 적용'),
('모바일 앱 푸시 미수신', now() - interval '6 days' + interval '9 hours', 'low', 'done', '김철수', '디지털혁신본부', 'FCM 토큰 만료', '토큰 갱신 로직 배포'),
('내부망 DNS 오류', now() - interval '6 days' + interval '14 hours', 'mid', 'done', '이영희', 'IT인프라본부', 'DNS 서버 설정 오류', 'DNS 설정 복구');
