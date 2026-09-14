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
├── update-photos.ps1       사진 목록 갱신 스크립트
├── update-guests.ps1       하객 명단 → 해시 변환 스크립트
├── guests.txt              평문 명단 (커밋 안 됨, 이 PC 에만)
└── wedding/                ← 청첩장
    ├── index.html          뼈대 (건드릴 일 거의 없음)
    └── assets/
        ├── css/style.css    디자인 (색·폰트는 맨 위 :root 변수)
        ├── js/config.js     ★ 모든 내용이 여기에 있습니다
        ├── js/main.js       화면을 그리는 로직
        ├── guests.json      하객 해시 (update-guests.ps1 이 만듭니다)
        └── img/
            ├── cover.svg        표지
            ├── gallery/         ★ 사진첩 (여기에 넣으면 자동 인식)
            └── manifest.json    사진 목록 (update-photos.ps1 이 만듭니다)
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
| 하객 명단 (이름 확인 후 입장) | `guestGate` |
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

# 하객 명단 (이름 확인 후 입장)

접속하면 청첩장이 바로 보이지 않고 **성함을 먼저 묻습니다.**
명단에 있는 이름이면 들어가지고, 표지 위에 `홍길동님께` 가 표시됩니다.

## 명단 적는 방법은 두 가지

둘 다 동시에 쓸 수 있습니다. **어느 쪽에든 있으면 입장됩니다.**

### 방법 1 — `config.js` 에 직접 (간편함)

`guestGate.guests` 에 한 줄에 한 명씩 적고 저장하면 **바로 적용됩니다.**
스크립트를 돌릴 필요가 없습니다.

```js
guests: [
  '홍길동',
  '김영희',
],
```

⚠ 대신 소스 보기로 **이름이 그대로 보입니다.**

### 방법 2 — `guests.txt` + 스크립트 (명단이 안 보임)

1. `guests.txt` 에 한 줄에 한 명씩 적습니다.
   이 파일은 `.gitignore` 에 있어 **GitHub 에 올라가지 않습니다.**
2. 아래를 실행합니다.

```
powershell -NoProfile -ExecutionPolicy Bypass -File update-guests.ps1
```

3. `wedding/assets/guests.json` 에 **해시만** 기록됩니다.
   소스를 봐도 명단을 읽을 수 없습니다.

이름을 추가·삭제할 때마다 스크립트를 다시 돌려야 합니다.

## ⚠ 어느 쪽이든 알아두실 것

**이건 잠금장치가 아니라 "문패" 입니다.**

- **게이트 자체는 개발자도구로 건너뛸 수 있습니다.** 명단을 해시로 숨겨도
  청첩장 '내용'은 볼 수 있습니다. 내용까지 막으려면 암호화나 서버가 필요합니다.
- 즉 **계좌번호나 연락처를 가리는 용도로는 쓸 수 없습니다.**
  그 목적이라면 그 항목 자체를 빼는 게 맞습니다 (`options.showAccounts: false`).
- 해시는 되돌릴 수 없지만, 한국 사람 이름은 경우의 수가 적어서
  작정하고 대입하면 알아낼 수 있습니다. PBKDF2 10만 회로 느리게 만들어 두었을 뿐입니다.
- **git 히스토리는 지워지지 않습니다.** 실제 이름을 한 번이라도 `config.js` 에
  평문으로 커밋하면 나중에 지워도 과거 커밋에 남습니다.
  가려야 할 이름이면 처음부터 `guests.txt` 쪽에 적으세요.

모르는 사람이 우연히 들어오는 걸 막고, 받는 분 이름을 불러주는
정도의 효과를 기대하시면 됩니다.

## 공통 규칙

- **띄어쓰기와 영문 대소문자는 무시**합니다. `홍 길동` 으로 입력해도 통과합니다.
- 한 사람이 여러 이름으로 들어올 수 있으면 그냥 여러 줄 적으세요.
  (`김영희` 와 `Kim Younghee` 를 둘 다)
- `config.js` 에서는 이름 뒤 쉼표 `,` 를 빠뜨리면 페이지가 통째로 안 뜹니다.
  `guests.txt` 는 그냥 한 줄에 하나씩이라 그럴 일이 없습니다.
- 확인에 0.2초쯤 걸립니다. 일부러 느리게 만든 것이니 정상입니다.

## 문구 바꾸기

```js
guestGate: {
  title: '성함을 알려주세요',
  description: '청첩장을 받으신 분의 성함을 입력해 주세요.',
  placeholder: '예) 홍길동',
  buttonText: '입장하기',
  errorText: '명단에서 성함을 찾지 못했습니다.\n...',
  remember: true,           // 한 번 입장하면 다음 방문 때 안 물어봄
  greetingSuffix: '님께',    // 표지 표시. 안 쓰려면 '' 로 비우세요
},
```

## 기능 자체를 끄려면

`options.showGate` 를 `false` 로 바꾸면 게이트 없이 바로 열립니다.
명단은 지우지 않아도 됩니다.

## 테스트할 때

`remember: true` 라서 한 번 입장하면 브라우저가 이름을 기억합니다.
다시 입력 화면을 보려면 페이지 맨 아래 **`다른 이름으로 보기`** 를 누르세요.

---

# 사진 교체

**`config.js` 를 건드릴 필요 없습니다.** 폴더에 넣고 명령 한 번이면 됩니다.

## 1. 사진을 폴더에 넣습니다

```
wedding/assets/img/
├── cover.jpg          ← 표지 (파일명이 'cover' 로 시작하면 됨)
└── gallery/           ← 이 폴더 안의 사진 전부가 사진첩에 들어갑니다
    ├── 01.jpg
    ├── 02.jpg
    └── ...
```

기존 임시 SVG(`gallery/1.svg` ~ `6.svg`, `cover.svg`)는 지우시면 됩니다.

## 2. 목록을 갱신합니다

```
powershell -NoProfile -ExecutionPolicy Bypass -File update-photos.ps1
```

폴더를 훑어서 `manifest.json` 을 다시 만듭니다. 실행하면 이렇게 나옵니다:

```
표지  : cover.jpg  (248KB)
  + 01.jpg  (180KB)
  + 02.jpg  (620KB)  ← 용량이 큽니다. 300KB 이하 권장
  ! 사진.heic 는 브라우저가 열지 못해 건너뜁니다. jpg 로 변환해 주세요.

갤러리 2장, 합계 800KB
```

## 3. 올립니다

```
git add -A
git commit -m "사진 교체"
git push
```

## 알아두실 것

- **jpg, png, webp, gif, avif, svg** 모두 됩니다. 확장자 대소문자도 상관없습니다.
- **heic / tiff / raw 는 안 됩니다.** 브라우저가 못 엽니다.
  아이폰 사진이 heic 로 나오면, 아이폰 설정 → 카메라 → 포맷 → `높은 호환성`
  으로 바꾸거나 jpg 로 변환해서 넣으세요. 스크립트가 걸러내고 알려줍니다.
- **순서는 파일 이름순**입니다. `사진2` 가 `사진10` 보다 앞에 옵니다 (숫자로 비교).
  순서를 정하고 싶으면 `01_`, `02_` 처럼 앞에 번호를 붙이세요.
- 한글 파일명도 되지만, 문제가 생기면 영문/숫자로 바꿔보세요.
- **왜 스크립트가 필요한가**: GitHub Pages 는 정적 호스팅이라 브라우저가
  폴더 안에 무슨 파일이 있는지 알아낼 방법이 없습니다. 그래서 목록을
  파일로 미리 만들어 둡니다.

## 사진 규격

- 표지: 세로 3:4 비율 권장 (예: 900 × 1200)
- 갤러리: 정사각형으로 잘리므로 인물이 중앙에 오도록
- 장당 300KB 이하로 줄여야 모바일에서 빠릅니다 (JPG/WebP)
- 갯수는 자유입니다. 줄에 맞춰 3의 배수가 보기 좋습니다

## 직접 목록을 정하고 싶다면

`options.autoPhotos` 를 `false` 로 바꾸면 `config.js` 의
`gallery` / `coverImage` 목록을 그대로 씁니다. 스크립트도 필요 없습니다.

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
