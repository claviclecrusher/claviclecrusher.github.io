/* =========================================================================
 *  청첩장 정보 설정 파일
 *  ─ 이 파일의 값만 바꾸면 청첩장 내용이 전부 바뀝니다.
 *  ─ HTML / CSS 는 건드리지 않아도 됩니다.
 * ========================================================================= */

const CONFIG = {

  /* ── 1. 기본 정보 ───────────────────────────────────────────────── */
  meta: {
    title: '김민준 ♥ 이서연 결혼합니다',          // 브라우저 탭 / 카톡 공유 제목
    description: '2026년 11월 7일 토요일 낮 12시\n그랜드홀 3층 그랜드볼룸',
    url: 'https://example.com/wedding',           // 배포 후 실제 주소로 변경
  },

  /* ── 2. 신랑 · 신부 ─────────────────────────────────────────────── */
  couple: {
    groom: {
      name: '김민준',
      nameEn: 'Minjun',
      phone: '010-1234-5678',
      relation: '장남',                            // 장남 / 차남 / 아들 ...
      father: { name: '김대호', phone: '010-1111-2222', deceased: false },
      mother: { name: '박은영', phone: '010-3333-4444', deceased: false },
    },
    bride: {
      name: '이서연',
      nameEn: 'Seoyeon',
      phone: '010-8765-4321',
      relation: '장녀',
      father: { name: '이정환', phone: '010-5555-6666', deceased: false },
      mother: { name: '최수미', phone: '010-7777-8888', deceased: false },
    },
  },

  /* ── 3. 예식 일시 ───────────────────────────────────────────────── */
  wedding: {
    date: '2026-11-07',       // YYYY-MM-DD (달력 · D-day 계산에 사용)
    time: '12:00',            // HH:MM (24시간)
    timeText: '토요일 낮 12시',
  },

  /* ── 4. 예식장 ──────────────────────────────────────────────────── */
  venue: {
    name: '그랜드홀 웨딩',
    hall: '3층 그랜드볼룸',
    address: '서울특별시 강남구 테헤란로 123',
    tel: '02-1234-5678',
    lat: 37.5006,             // 지도 좌표 (선택)
    lng: 127.0364,
    // 교통편 안내 (필요한 만큼 추가/삭제)
    transport: [
      { icon: '🚇', title: '지하철', desc: '2호선 역삼역 3번 출구에서 도보 5분' },
      { icon: '🚌', title: '버스',   desc: '간선 146, 341 / 지선 3412 — 역삼역 하차' },
      { icon: '🚗', title: '자차',   desc: '건물 지하 주차장 2시간 무료 (주차권 수령)' },
    ],
  },

  /* ── 5. 인사말 ──────────────────────────────────────────────────── */
  greeting: {
    title: '초대합니다',
    body: `서로가 마주보며 다져온 사랑을
이제 함께 한 곳을 바라보며
걸어갈 수 있도록 허락해 주세요.

저희 두 사람이 사랑의 이름으로
새 인생을 시작하는 자리에
귀한 걸음 하시어 축복해 주시면
더없는 기쁨이 되겠습니다.`,
  },

  /* ── 6. 갤러리 ──────────────────────────────────────────────────── */
  gallery: [
    'assets/img/gallery-1.svg',
    'assets/img/gallery-2.svg',
    'assets/img/gallery-3.svg',
    'assets/img/gallery-4.svg',
    'assets/img/gallery-5.svg',
    'assets/img/gallery-6.svg',
  ],
  coverImage: 'assets/img/cover.svg',

  /* ── 7. 마음 전하실 곳 (계좌) ───────────────────────────────────── */
  accounts: {
    groom: {
      label: '신랑측',
      list: [
        { role: '신랑',     name: '김민준', bank: '국민은행', number: '123456-01-123456' },
        { role: '아버지',   name: '김대호', bank: '신한은행', number: '110-234-567890'   },
        { role: '어머니',   name: '박은영', bank: '농협',     number: '302-1234-5678-11' },
      ],
    },
    bride: {
      label: '신부측',
      list: [
        { role: '신부',     name: '이서연', bank: '카카오뱅크', number: '3333-01-1234567' },
        { role: '아버지',   name: '이정환', bank: '우리은행',   number: '1002-345-678901' },
        { role: '어머니',   name: '최수미', bank: '하나은행',   number: '123-456789-01234' },
      ],
    },
  },

  /* ── 8. 기능 On/Off ─────────────────────────────────────────────── */
  options: {
    showCalendar: true,      // 달력 + D-day
    showGallery: true,       // 사진첩
    showAccounts: true,      // 계좌 안내
    showGuestbook: true,     // 방명록 (브라우저에만 저장되는 데모)
    showBgm: false,          // 배경음악 버튼
    bgmSrc: 'assets/audio/bgm.mp3',
  },
};
