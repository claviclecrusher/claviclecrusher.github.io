# 모바일 청첩장

휴대폰 화면(폭 460px 기준)에 맞춘 한 페이지짜리 청첩장입니다.
빌드 도구·프레임워크 없이 HTML / CSS / JS 파일만으로 동작합니다.

## 파일 구조

```
wedding-invitation/
├── index.html              페이지 뼈대 (건드릴 일 거의 없음)
├── dev-server.ps1          로컬 미리보기용 간이 서버
└── assets/
    ├── css/style.css       디자인 (색·폰트는 맨 위 :root 변수)
    ├── js/config.js        ★ 모든 내용이 여기에 있습니다
    ├── js/main.js          화면을 그리는 로직
    └── img/                사진 (지금은 임시 SVG)
```

## 미리보기

로컬에 Python / Node 가 없어서 PowerShell 서버를 같이 넣어 두었습니다.
프로젝트 폴더에서:

```bash
powershell -NoProfile -ExecutionPolicy Bypass -File wedding-invitation/dev-server.ps1 -Root wedding-invitation -Port 5599
```

그 다음 브라우저에서 http://localhost:5599 접속.
(`index.html` 을 더블클릭해도 열리지만, 일부 브라우저에서 공유·복사 기능이 막힙니다.)

## 내용 수정하기

**`assets/js/config.js` 하나만 고치면 됩니다.**

| 항목 | 위치 |
|---|---|
| 탭 제목 · 공유 문구 · 배포 주소 | `meta` |
| 신랑 · 신부 · 혼주 이름/연락처 | `couple` |
| 예식 날짜 · 시간 | `wedding` |
| 예식장 이름 · 주소 · 교통편 | `venue` |
| 인사말 | `greeting` |
| 사진 목록 | `gallery`, `coverImage` |
| 계좌번호 | `accounts` |
| 섹션 켜고 끄기 | `options` |

- 부모님이 고인이신 경우 `deceased: true` 로 두면 이름 앞에 `故` 가 붙고,
  연락처 목록에서도 빠집니다.
- `options` 의 값을 `false` 로 바꾸면 해당 섹션이 통째로 사라집니다.

## 사진 교체

`assets/img/` 에 실제 사진을 넣고 `config.js` 의 경로를 바꾸면 됩니다.

- 표지: 세로 3:4 비율 권장 (예: 900 × 1200)
- 갤러리: 정사각형으로 잘려 보이므로 1:1 또는 중앙에 인물이 오도록
- 용량은 장당 300KB 이하로 줄여야 모바일에서 빠릅니다 (JPG/WebP)

## 색 · 폰트 바꾸기

`assets/css/style.css` 맨 위 `:root` 블록의 변수만 바꾸면 전체 톤이 바뀝니다.

```css
--paper:  #fbf8f4;   /* 배경 */
--ink:    #3b352f;   /* 글자 */
--accent: #a98b6f;   /* 포인트 색 */
```

폰트는 `index.html` 의 Google Fonts 링크와 `--serif` / `--sans` / `--latin` 변수를 함께 바꿉니다.

## 아직 예시(더미)인 것들

- 모든 이름·전화번호·주소·계좌번호
- 사진 7장 (임시 SVG)
- 지도: 카카오/네이버 **검색 링크**만 연결되어 있습니다.
  지도를 페이지 안에 박아 넣으려면 카카오맵 JavaScript 키가 필요합니다.
- 방명록: 브라우저 `localStorage` 에만 저장되는 데모입니다.
  실제로 하객 메시지를 받으려면 Firebase / Supabase 같은 백엔드가 필요합니다.
- 배경음악: `options.showBgm: true` 로 켜고 `assets/audio/bgm.mp3` 를 넣으면 동작합니다.

## 배포

정적 파일이라 어디든 올릴 수 있습니다. GitHub Pages, Netlify, Vercel 모두 무료입니다.
배포 후 `config.js` 의 `meta.url` 을 실제 주소로 바꿔야 공유 링크가 제대로 동작합니다.

카카오톡 공유 시 미리보기 이미지가 나오게 하려면 표지 사진이 `https://` 주소로
접근 가능해야 합니다 (배포하면 자동으로 해결됩니다).
