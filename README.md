# claviclecrusher.github.io

GitHub Pages 개인 사이트 저장소.

| 주소 | 내용 |
|---|---|
| `https://claviclecrusher.github.io/wedding/` | 모바일 청첩장 |
| `https://claviclecrusher.github.io/` | 아직 비어 있음 (404) |

## 파일 구조

```
.
├── robots.txt              AI 수집 봇 차단
├── .nojekyll               Jekyll 처리 건너뛰기
├── dev-server.ps1          로컬 미리보기 서버
└── wedding/                ← 청첩장
    ├── index.html          뼈대 (건드릴 일 거의 없음)
    └── assets/
        ├── css/style.css   디자인 (색·폰트는 맨 위 :root 변수)
        ├── js/config.js    ★ 모든 내용이 여기에 있습니다
        ├── js/main.js      화면을 그리는 로직
        └── img/            사진 (지금은 임시 SVG)
```

---

# 내용 수정하는 법

## 1. 파일 열기

`wedding/assets/js/config.js` **이 파일 하나만** 고치면 됩니다.
메모장으로 열어도 되지만, 한글이 깨질 수 있어 VS Code 같은 편집기를 권합니다.

## 2. 고치기

파일 안이 항목별로 나뉘어 있습니다. **작은따옴표 안의 글자만** 바꾸세요.

```js
couple: {
  groom: {
    name: '김민준',              ← 여기를 신랑 이름으로
    nameEn: 'Minjun',            ← 맨 아래 영문 표기
    phone: '010-1234-5678',
    relation: '장남',            ← 장남 / 차남 / 아들 ...
    father: { name: '김대호', phone: '010-1111-2222', deceased: false },
    mother: { name: '박은영', phone: '010-3333-4444', deceased: false },
  },
```

**규칙 세 가지만 지키면 됩니다.**

1. 작은따옴표 `'` 는 지우지 마세요. 글자만 그 안에서 바꿉니다.
2. 줄 끝의 쉼표 `,` 를 지우지 마세요.
3. 이름에 작은따옴표가 들어가면 (`'` 같은 특수문자) 앞에 `\` 를 붙입니다.

고인이신 경우 `deceased: false` 를 `deceased: true` 로 바꾸면
이름 앞에 `故` 가 붙고 연락처 목록에서도 빠집니다.

## 3. 항목이 어디 있는지

| 바꾸고 싶은 것 | `config.js` 안의 위치 |
|---|---|
| 카톡 공유 제목 · 문구 | `meta` |
| 신랑 · 신부 · 혼주 이름과 전화번호 | `couple` |
| 예식 날짜 · 시간 | `wedding` |
| 예식장 이름 · 주소 · 전화 · 교통편 | `venue` |
| 인사말 | `greeting` |
| 사진 목록 | `gallery`, `coverImage` |
| 계좌번호 | `accounts` |
| 섹션 통째로 끄기 | `options` |

`options` 의 값을 `false` 로 바꾸면 해당 섹션이 사라집니다.
예: 방명록이 필요 없으면 `showGuestbook: false`

## 4. 날짜 형식 주의

```js
wedding: {
  date: '2026-11-07',        // 반드시 YYYY-MM-DD
  time: '12:00',             // 반드시 24시간 HH:MM
  timeText: '토요일 낮 12시',  // 화면에 보이는 문구 (자유롭게)
},
```

`date` 와 `time` 은 달력과 D-day 계산에 쓰이므로 형식을 지켜야 합니다.
`timeText` 는 그냥 표시용이라 아무렇게나 쓰셔도 됩니다.

## 5. 확인하기

파일을 저장한 뒤, 프로젝트 폴더에서:

```
powershell -NoProfile -ExecutionPolicy Bypass -File dev-server.ps1 -Port 5599
```

브라우저에서 http://localhost:5599/wedding/ 접속.
내용을 고칠 때마다 브라우저 새로고침(F5)만 하면 바로 반영됩니다.
서버를 끌 때는 그 창에서 `Ctrl + C`.

## 6. 실제 사이트에 반영하기

```
git add -A
git commit -m "내용 수정"
git push
```

1~2분 뒤 `https://claviclecrusher.github.io/wedding/` 에 반영됩니다.

---

# 사진 교체

`wedding/assets/img/` 에 실제 사진을 넣고, `config.js` 의 경로를 바꿉니다.

```js
coverImage: 'assets/img/cover.jpg',
gallery: [
  'assets/img/gallery-1.jpg',
  'assets/img/gallery-2.jpg',
],
```

- 경로는 `assets/img/` 로 시작합니다 (`wedding/` 은 붙이지 않습니다)
- 표지: 세로 3:4 비율 권장 (예: 900 × 1200)
- 갤러리: 정사각형으로 잘리므로 인물이 중앙에 오도록
- 장당 300KB 이하로 줄여야 모바일에서 빠릅니다 (JPG/WebP)
- 갯수는 자유입니다. 줄에 맞춰 3의 배수가 보기 좋습니다

# 색 · 폰트 바꾸기

`wedding/assets/css/style.css` 맨 위 `:root` 블록만 바꾸면 전체 톤이 바뀝니다.

```css
--paper:  #fbf8f4;   /* 배경 */
--ink:    #3b352f;   /* 글자 */
--accent: #a98b6f;   /* 포인트 색 */
```

폰트는 `wedding/index.html` 의 Google Fonts 링크와
`--serif` / `--sans` / `--latin` 변수를 함께 바꿉니다.

---

# 검색 노출 차단

- `wedding/index.html` 에 `noindex, nofollow` 메타 태그
- 루트 `robots.txt` 로 AI 수집 봇 차단

**단, 저장소가 Public 이라 코드 자체는 누구나 볼 수 있습니다.**
전화번호·계좌번호를 넣으면 GitHub 코드 검색에도 노출됩니다.
(`<사용자명>.github.io` 저장소는 Public 이어야 Pages 가 무료로 동작합니다.)

# 아직 예시(더미)인 것들

- 모든 이름 · 전화번호 · 주소 · 계좌번호
- 사진 7장 (임시 SVG)
- 지도: 카카오/네이버 **검색 링크**만 연결. 페이지 안에 지도를 박으려면 카카오맵 JavaScript 키가 필요합니다.
- 방명록: 브라우저 `localStorage` 데모라 남긴 기기에서만 보입니다. 실제로 하객 메시지를 받으려면 Firebase / Supabase 같은 백엔드가 필요합니다.
- 배경음악: `options.showBgm: true` 로 켜고 `wedding/assets/audio/bgm.mp3` 를 넣으면 동작합니다.
