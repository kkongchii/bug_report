-- 장애 보고 대시보드 추가 더미 데이터 (70건)
-- Supabase SQL Editor에서 실행하세요.

insert into incidents (title, occurred_at, severity, status, assignee, department, cause, resolution) values

-- ── 7~10일 전 ──────────────────────────────────────────────────
('운영 DB 슬로우 쿼리 급증',           now() - interval '7 days 10 hours',  'high', 'done',       '김철수',  'IT인프라본부',    '인덱스 누락 쿼리 배포',           '인덱스 추가 및 실행계획 최적화'),
('그룹웨어 첨부파일 업로드 실패',       now() - interval '7 days 14 hours',  'mid',  'done',       '이영희',  '디지털혁신본부',  '파일 서버 마운트 해제',            '마운트 재설정 후 정상화'),
('보안 에이전트 오작동',               now() - interval '8 days 9 hours',   'mid',  'done',       '최수연',  '보안관제팀',      '에이전트 버전 충돌',              '이전 버전 롤백 후 패치 재배포'),
('클라우드 스토리지 접근 불가',         now() - interval '8 days 11 hours',  'high', 'done',       '정동훈',  '클라우드운영팀',  'IAM 정책 만료',                  '정책 갱신 및 권한 재설정'),
('배치 스케줄러 미기동',               now() - interval '9 days 3 hours',   'mid',  'done',       '박민준',  '데이터플랫폼본부','크론 표현식 오류',                '스케줄 수정 및 재기동'),
('사내 메신저 서버 과부하',            now() - interval '9 days 15 hours',  'low',  'done',       '한지원',  'IT인프라본부',    '동시접속 급증',                   '서버 스케일아웃'),
('ERP 전표 처리 지연',                 now() - interval '10 days 10 hours', 'high', 'done',       '김철수',  'ERP운영팀',       'DB Lock 경합',                   'Lock 해소 및 트랜잭션 최적화'),
('API 인증 토큰 갱신 오류',            now() - interval '10 days 16 hours', 'mid',  'done',       '이영희',  '개발지원팀',      'JWT 시크릿 키 불일치',            '키 동기화 후 정상화'),

-- ── 11~15일 전 ──────────────────────────────────────────────────
('재해복구(DR) 스위치오버 실패',        now() - interval '11 days 9 hours',  'high', 'done',       '정동훈',  'IT인프라본부',    'DR 환경 네트워크 설정 오류',      '네트워크 라우팅 수정 후 전환 완료'),
('이메일 수발신 장애',                 now() - interval '11 days 14 hours', 'mid',  'done',       '박민준',  '디지털혁신본부',  '메일 릴레이 서버 인증 만료',      '인증 갱신 및 재기동'),
('데이터 마이그레이션 오류',            now() - interval '12 days 2 hours',  'high', 'done',       '최수연',  '데이터플랫폼본부','컬럼 타입 불일치',                '변환 로직 수정 후 재이행'),
('VPN 접속 불안정',                    now() - interval '12 days 11 hours', 'low',  'done',       '한지원',  'IT인프라본부',    '게이트웨이 펌웨어 버그',          '펌웨어 업데이트'),
('CI/CD 파이프라인 빌드 실패',          now() - interval '13 days 10 hours', 'mid',  'done',       '김철수',  '개발지원팀',      '의존성 버전 충돌',                '의존성 고정 및 재빌드'),
('실시간 대시보드 데이터 갱신 지연',    now() - interval '13 days 15 hours', 'low',  'done',       '이영희',  '데이터플랫폼본부','WebSocket 연결 끊김',             '연결 재수립 로직 개선'),
('공개 API 오류율 급증',               now() - interval '14 days 9 hours',  'high', 'done',       '정동훈',  '클라우드운영팀',  'Auto Scaling 미동작',             '스케일링 정책 수정 후 정상화'),
('전자결재 알림 미발송',               now() - interval '14 days 13 hours', 'low',  'done',       '박민준',  '디지털혁신본부',  '이벤트 큐 적체',                  '큐 재처리 완료'),
('서버 시간 동기화 오류 (NTP)',         now() - interval '15 days 8 hours',  'mid',  'done',       '최수연',  'IT인프라본부',    'NTP 서버 응답 없음',              '보조 NTP 서버로 전환'),
('물류 시스템 인터페이스 오류',         now() - interval '15 days 14 hours', 'high', 'done',       '한지원',  'ERP운영팀',       '외부 연동 IP 변경',               '방화벽 예외 및 연동 IP 갱신'),

-- ── 16~20일 전 ──────────────────────────────────────────────────
('Kubernetes 파드 CrashLoopBackOff',   now() - interval '16 days 10 hours', 'high', 'done',       '김철수',  '클라우드운영팀',  'OOM으로 인한 컨테이너 강제 종료', '메모리 리밋 상향 및 누수 코드 수정'),
('사내 위키 접속 불가',                now() - interval '16 days 15 hours', 'low',  'done',       '이영희',  '디지털혁신본부',  '디스크 I/O 포화',                '디스크 교체 및 캐시 설정 최적화'),
('결산 배치 오류',                     now() - interval '17 days 3 hours',  'high', 'done',       '정동훈',  '데이터플랫폼본부','날짜 로직 버그',                  '핫픽스 배포 후 재수행'),
('방화벽 정책 배포 후 서비스 단절',    now() - interval '17 days 11 hours', 'high', 'done',       '박민준',  '보안관제팀',      '정책 오입력',                     '이전 정책 복원'),
('모니터링 알람 미수신',               now() - interval '18 days 10 hours', 'mid',  'done',       '최수연',  'IT인프라본부',    '알림 채널 토큰 만료',             '토큰 갱신 및 알림 재설정'),
('HR 시스템 로그인 불가',              now() - interval '18 days 14 hours', 'mid',  'done',       '한지원',  'ERP운영팀',       'SSO 연동 인증서 만료',            '인증서 갱신 후 정상화'),
('CDN 캐시 오염',                      now() - interval '19 days 9 hours',  'mid',  'done',       '김철수',  '클라우드운영팀',  '잘못된 캐시 키 설정',             'Cache Purge 및 설정 수정'),
('문서관리시스템 검색 불가',           now() - interval '19 days 15 hours', 'low',  'done',       '이영희',  '디지털혁신본부',  'Elasticsearch 힙 메모리 부족',    '힙 사이즈 증설 및 JVM 옵션 조정'),
('외부망 게이트웨이 간헐적 단절',      now() - interval '20 days 11 hours', 'high', 'done',       '정동훈',  'IT인프라본부',    '회선 품질 저하',                  '회선사 협의 후 우선 경로 변경'),
('운영 배포 자동화 스크립트 오류',      now() - interval '20 days 16 hours', 'mid',  'done',       '박민준',  '개발지원팀',      '환경 변수 누락',                  '배포 스크립트 수정 및 재배포'),

-- ── 21~25일 전 ──────────────────────────────────────────────────
('SAN 스토리지 I/O 오류',              now() - interval '21 days 9 hours',  'high', 'done',       '최수연',  'IT인프라본부',    '디스크 배드섹터 발생',            '디스크 교체 및 데이터 복구'),
('Push 알림 대량 미발송',              now() - interval '21 days 14 hours', 'mid',  'done',       '한지원',  '디지털혁신본부',  'FCM API 한도 초과',               '발송 분산 처리 로직 적용'),
('데이터레이크 수집 파이프라인 중단',  now() - interval '22 days 4 hours',  'high', 'done',       '김철수',  '데이터플랫폼본부','Kafka 브로커 다운',               '브로커 재기동 및 오프셋 복구'),
('테스트 환경 DB 접속 불가',           now() - interval '22 days 10 hours', 'low',  'done',       '이영희',  '개발지원팀',      '테스트 DB 포트 블락',             '방화벽 예외 추가'),
('ERP 인터페이스 배치 누락',           now() - interval '23 days 8 hours',  'mid',  'done',       '정동훈',  'ERP운영팀',       '배치 서버 재기동 누락',            '누락 배치 수동 수행'),
('SSL 인증서 만료 (운영 도메인)',       now() - interval '23 days 14 hours', 'high', 'done',       '박민준',  '클라우드운영팀',  '인증서 갱신 누락',                '인증서 갱신 및 자동 갱신 설정'),
('AP 서버 힙 메모리 부족',             now() - interval '24 days 10 hours', 'high', 'done',       '최수연',  'IT인프라본부',    '메모리 누수',                     '임시 재기동 후 누수 코드 패치'),
('배포 롤백 중 서비스 중단',           now() - interval '24 days 15 hours', 'high', 'done',       '한지원',  '개발지원팀',      '롤백 스크립트 오류',              '수동 롤백 후 서비스 복구'),
('내부 포털 이미지 로딩 실패',         now() - interval '25 days 9 hours',  'low',  'done',       '김철수',  '디지털혁신본부',  'CDN Origin 응답 없음',            'Origin 서버 재기동'),
('보안 취약점 스캔 시스템 오류',        now() - interval '25 days 13 hours', 'mid',  'done',       '이영희',  '보안관제팀',      '스캐너 업데이트 후 설정 초기화',   '설정 재적용'),

-- ── 26~30일 전 ──────────────────────────────────────────────────
('실시간 재고 시스템 동기화 실패',      now() - interval '26 days 10 hours', 'high', 'done',       '정동훈',  'ERP운영팀',       '연동 API 응답 타임아웃',          'API 타임아웃 설정 및 재시도 로직 추가'),
('운영망 스위치 포트 다운',            now() - interval '26 days 14 hours', 'mid',  'done',       '박민준',  'IT인프라본부',    '포트 불량',                       '포트 교체 후 복구'),
('통합 인증 서버 이중화 장애',          now() - interval '27 days 9 hours',  'high', 'done',       '최수연',  'IT인프라본부',    '세션 DB 장애로 Failover 미동작',  '세션 DB 복구 및 이중화 재설정'),
('월말 정산 배치 누락',               now() - interval '27 days 3 hours',  'high', 'done',       '한지원',  '데이터플랫폼본부','서버 점검 중 스케줄 미복원',       '누락 배치 재수행 완료'),
('클라우드 비용 모니터링 오류',         now() - interval '28 days 11 hours', 'low',  'done',       '김철수',  '클라우드운영팀',  'API 키 만료',                    '키 갱신 후 정상화'),
('협력사 EDI 연동 오류',               now() - interval '28 days 15 hours', 'mid',  'done',       '이영희',  'ERP운영팀',       '협력사 IP 변경 미통보',           '방화벽 규칙 갱신'),
('운영 서버 CPU 과부하',              now() - interval '29 days 8 hours',  'high', 'done',       '정동훈',  'IT인프라본부',    '무한 루프 프로세스 발생',          '프로세스 강제 종료 및 코드 수정'),
('개발 배포 브랜치 충돌',              now() - interval '29 days 14 hours', 'low',  'done',       '박민준',  '개발지원팀',      '코드 머지 충돌',                  '수동 머지 후 재배포'),
('네트워크 장비 펌웨어 업그레이드 실패', now() - interval '30 days 10 hours', 'high', 'done',      '최수연',  'IT인프라본부',    '호환성 문제',                     '이전 펌웨어 롤백'),
('DLP 솔루션 오탐 차단',              now() - interval '30 days 14 hours', 'low',  'done',       '한지원',  '보안관제팀',      '정책 민감도 과도 설정',            '예외 처리 정책 추가'),

-- ── 현재 진행 중인 장애 (미해결) ──────────────────────────────
('운영 WAS 간헐적 응답 없음',          now() - interval '12 hours',         'high', 'processing', '김철수',  'IT인프라본부',    '스레드 풀 고갈 의심',             null),
('데이터 수집 지연 (실시간 파이프라인)', now() - interval '6 hours',          'mid',  'processing', '이영희',  '데이터플랫폼본부','네트워크 대역폭 부족',            null),
('ERP 물류모듈 오류 (특정 창고)',       now() - interval '4 hours',          'mid',  'received',   '정동훈',  'ERP운영팀',       null,                             null),
('보안 이벤트 대량 발생',              now() - interval '2 hours',          'high', 'received',   '박민준',  '보안관제팀',      null,                             null),
('클라우드 오토스케일링 미동작',        now() - interval '1 hour 30 minutes','mid',  'received',   '최수연',  '클라우드운영팀',  null,                             null),
('내부 API 게이트웨이 4xx 급증',       now() - interval '45 minutes',       'high', 'processing', '한지원',  '개발지원팀',      '잘못된 요청 패턴 급증',           null),
('SSO 인증 간헐적 실패',               now() - interval '30 minutes',       'mid',  'received',   '김철수',  'IT인프라본부',    null,                             null),
('운영 DB 복제 지연',                  now() - interval '15 minutes',       'high', 'processing', '이영희',  '데이터플랫폼본부','Replica 랙 2분 초과',            null);
