/* =========================================================================
 *  모바일 청첩장 동작 스크립트
 *  config.js 의 CONFIG 값을 읽어 화면을 그립니다.
 *  내용을 바꿀 때는 config.js 만 수정하세요.
 * ========================================================================= */

(function () {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const C = CONFIG;
  const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];
  const WEEKDAY_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  /* 예식 일시를 Date 객체로 (로컬 시간 기준) */
  const [wy, wm, wd] = C.wedding.date.split('-').map(Number);
  const [wh, wmin]   = C.wedding.time.split(':').map(Number);
  const weddingDate  = new Date(wy, wm - 1, wd, wh, wmin);

  /* ──────────────────────────────────────────────────────────────
   *  공통 유틸
   * ────────────────────────────────────────────────────────────── */

  /** 화면 아래 토스트 메시지 */
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-on'), 1800);
  }

  /** 클립보드 복사 (구형 브라우저 대비 fallback 포함) */
  async function copy(text, message) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast(message || '복사되었습니다');
  }

  /** CONFIG 경로 문자열("couple.groom.name")로 값 꺼내기 */
  function pick(path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
  }

  /** 전화번호에서 숫자만 남기기 */
  const telHref = (phone) => 'tel:' + String(phone).replace(/[^0-9+]/g, '');

  /* ──────────────────────────────────────────────────────────────
   *  1. 기본 정보 · 표지
   * ────────────────────────────────────────────────────────────── */
  function renderMeta() {
    document.title = C.meta.title;
    $('#ogTitle').content = C.meta.title;
    $('#ogDesc').content  = C.meta.description.replace(/\n/g, ' ');
    // 카카오톡 등 공유 미리보기는 절대 주소를 요구한다
    if (location.protocol.startsWith('http')) {
      $('#ogImage').content = new URL(C.coverImage, location.href).href;
    }
  }

  function renderCover() {
    $('#coverImage').src  = C.coverImage;
    $('#footerImage').src = C.coverImage;

    const dateText = `${wy}. ${String(wm).padStart(2, '0')}. ${String(wd).padStart(2, '0')}`;
    $('#coverDate').textContent  = `${dateText}  ${WEEKDAY_KO[weddingDate.getDay()]}`;
    $('#coverPlace').textContent = `${C.venue.name} ${C.venue.hall}`;

    $('#footerNames').textContent = `${C.couple.groom.nameEn} & ${C.couple.bride.nameEn}`;

    // data-bind 속성이 붙은 요소를 CONFIG 값으로 채움
    $$('[data-bind]').forEach((el) => {
      const value = pick(el.dataset.bind);
      if (value != null) el.textContent = value;
    });
  }

  /* ──────────────────────────────────────────────────────────────
   *  2. 인사말 · 혼주
   * ────────────────────────────────────────────────────────────── */
  function renderGreeting() {
    $('#greetingBody').textContent = C.greeting.body;

    const line = (side) => {
      const p = C.couple[side];
      const nameOf = (parent) => (parent.deceased ? '故 ' : '') + parent.name;
      return `
        <p class="parents__row">
          <span class="parents__p">${nameOf(p.father)} · ${nameOf(p.mother)}<span class="parents__rel">의 ${p.relation}</span></span>
          <span class="parents__child">${p.name}</span>
        </p>`;
    };
    $('#parents').innerHTML = line('groom') + line('bride');
  }

  /* ──────────────────────────────────────────────────────────────
   *  3. 연락처 바텀시트
   * ────────────────────────────────────────────────────────────── */
  function initContactSheet() {
    const backdrop = $('#sheetBackdrop');

    const openSheet = (side) => {
      const p = C.couple[side];
      const label = side === 'groom' ? '신랑' : '신부';
      const rows = [
        { role: label,              person: p },
        { role: label + ' 아버지',  person: p.father },
        { role: label + ' 어머니',  person: p.mother },
      ].filter((r) => r.person && r.person.phone && !r.person.deceased);

      $('#sheetTitle').textContent = `${label}측에 연락하기`;
      $('#sheetList').innerHTML = rows.map((r) => `
        <li class="sheet__row">
          <span class="sheet__who">
            ${r.person.name}
            <small>${r.role}</small>
          </span>
          <span class="sheet__acts">
            <a class="sheet__act" href="${telHref(r.person.phone)}" aria-label="${r.person.name}에게 전화">📞</a>
            <a class="sheet__act" href="sms:${String(r.person.phone).replace(/[^0-9+]/g, '')}" aria-label="${r.person.name}에게 문자">✉️</a>
          </span>
        </li>`).join('');

      backdrop.hidden = false;
      document.body.style.overflow = 'hidden';
    };

    const closeSheet = () => {
      backdrop.hidden = true;
      document.body.style.overflow = '';
    };

    $$('[data-sheet]').forEach((btn) =>
      btn.addEventListener('click', () => openSheet(btn.dataset.sheet))
    );
    $('#sheetClose').addEventListener('click', closeSheet);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeSheet();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !backdrop.hidden) closeSheet();
    });
  }

  /* ──────────────────────────────────────────────────────────────
   *  4. 달력 · D-day
   * ────────────────────────────────────────────────────────────── */
  function renderCalendar() {
    if (!C.options.showCalendar) {
      $('#calendarSection').remove();
      return;
    }

    $('#calendarTitle').textContent =
      `${wy}년 ${wm}월 ${wd}일 ${WEEKDAY_KO[weddingDate.getDay()]}요일`;
    $('#calendarSub').textContent = C.wedding.timeText;

    const firstDay   = new Date(wy, wm - 1, 1).getDay();  // 해당 월 1일의 요일
    const lastDate   = new Date(wy, wm, 0).getDate();     // 해당 월 마지막 날짜
    const cells      = [];

    WEEKDAY_EN.forEach((w, i) =>
      cells.push(`<div class="calendar__head ${i === 0 ? 'calendar__head--sun' : ''}">${w}</div>`)
    );
    for (let i = 0; i < firstDay; i++) {
      cells.push('<div class="calendar__cell calendar__cell--muted">·</div>');
    }
    for (let d = 1; d <= lastDate; d++) {
      const isSun = (firstDay + d - 1) % 7 === 0;
      const isWed = d === wd;
      const cls = [
        'calendar__cell',
        isSun ? 'calendar__cell--sun' : '',
        isWed ? 'calendar__cell--wed' : '',
      ].join(' ').trim();
      cells.push(`<div class="${cls}"><span>${d}</span></div>`);
    }

    $('#calendar').innerHTML = `<div class="calendar__grid">${cells.join('')}</div>`;

    // D-day
    const today = new Date();
    const startOfDay = (dt) => new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
    const diff = Math.round((startOfDay(weddingDate) - startOfDay(today)) / 86400000);

    const groom = C.couple.groom.name;
    const bride = C.couple.bride.name;
    $('#dday').innerHTML =
      diff > 0  ? `${groom} · ${bride}의 결혼식이 <b>${diff}일</b> 남았습니다.`
    : diff === 0 ? `오늘은 <b>${groom} · ${bride}</b>의 결혼식입니다.`
    :              `${groom} · ${bride}가 결혼한 지 <b>${-diff}일</b> 되었습니다.`;
  }

  /* ──────────────────────────────────────────────────────────────
   *  5. 갤러리 · 라이트박스
   * ────────────────────────────────────────────────────────────── */
  function renderGallery() {
    if (!C.options.showGallery || !C.gallery.length) {
      $('#gallerySection').remove();
      return;
    }

    $('#gallery').innerHTML = C.gallery.map((src, i) => `
      <button class="gallery__item" data-index="${i}" aria-label="사진 ${i + 1} 크게 보기">
        <img src="${src}" alt="웨딩 사진 ${i + 1}" loading="lazy" />
      </button>`).join('');

    const lightbox = $('#lightbox');
    const image    = $('#lbImage');
    const count    = $('#lbCount');
    let current    = 0;

    const show = (i) => {
      current = (i + C.gallery.length) % C.gallery.length;
      image.src = C.gallery[current];
      image.alt = `웨딩 사진 ${current + 1}`;
      count.textContent = `${current + 1} / ${C.gallery.length}`;
    };

    const open = (i) => {
      show(i);
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.hidden = true;
      document.body.style.overflow = '';
    };

    $$('.gallery__item').forEach((btn) =>
      btn.addEventListener('click', () => open(Number(btn.dataset.index)))
    );
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', () => show(current - 1));
    $('#lbNext').addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) close();
    });
    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape')     close();
      if (e.key === 'ArrowLeft')  show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    // 좌우 스와이프
    let startX = null;
    lightbox.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ──────────────────────────────────────────────────────────────
   *  6. 오시는 길
   * ────────────────────────────────────────────────────────────── */
  function renderLocation() {
    const v = C.venue;
    $('#venueName').textContent    = v.name;
    $('#venueHall').textContent    = v.hall;
    $('#venueAddress').textContent = v.address;
    $('#venueTel').textContent     = v.tel || '';

    const query = encodeURIComponent(`${v.name} ${v.address}`);
    $('#mapNaver').href = `https://map.naver.com/v5/search/${query}`;
    $('#mapKakao').href = `https://map.kakao.com/link/search/${query}`;

    $('#copyAddress').addEventListener('click', () =>
      copy(v.address, '주소가 복사되었습니다')
    );

    $('#transport').innerHTML = (v.transport || []).map((t) => `
      <li>
        <span class="transport__icon">${t.icon}</span>
        <span>
          <p class="transport__title">${t.title}</p>
          <p class="transport__desc">${t.desc}</p>
        </span>
      </li>`).join('');
  }

  /* ──────────────────────────────────────────────────────────────
   *  7. 마음 전하실 곳
   * ────────────────────────────────────────────────────────────── */
  function renderAccounts() {
    if (!C.options.showAccounts) {
      $('#accountsSection').remove();
      return;
    }

    const block = (group) => `
      <div class="accordion">
        <button class="accordion__head" type="button">
          <span>${group.label}</span>
          <span class="accordion__arrow">⌄</span>
        </button>
        <div class="accordion__body">
          <div class="accordion__inner">
            ${group.list.map((a) => `
              <div class="account-row">
                <span>
                  <p class="account-row__who">${a.role} ${a.name}</p>
                  <p class="account-row__info">${a.bank} ${a.number}</p>
                </span>
                <button class="account-row__copy" type="button"
                        data-copy="${a.bank} ${a.number}">복사</button>
              </div>`).join('')}
          </div>
        </div>
      </div>`;

    $('#accounts').innerHTML = block(C.accounts.groom) + block(C.accounts.bride);

    $$('.accordion__head').forEach((head) =>
      head.addEventListener('click', () => head.parentElement.classList.toggle('is-open'))
    );
    $$('[data-copy]').forEach((btn) =>
      btn.addEventListener('click', () => copy(btn.dataset.copy, '계좌번호가 복사되었습니다'))
    );
  }

  /* ──────────────────────────────────────────────────────────────
   *  8. 방명록 (localStorage 데모)
   * ────────────────────────────────────────────────────────────── */
  function initGuestbook() {
    if (!C.options.showGuestbook) {
      $('#guestbookSection').remove();
      return;
    }

    const KEY = 'wedding-guestbook';
    const list = $('#guestbookList');

    const load = () => {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; }
      catch (e) { return []; }
    };
    const save = (items) => {
      try { localStorage.setItem(KEY, JSON.stringify(items)); }
      catch (e) { /* 시크릿 모드 등 저장 불가 */ }
    };

    // 사용자 입력은 textContent 로만 넣어 XSS 를 피한다
    const render = () => {
      const items = load();
      list.innerHTML = '';
      items.forEach((item, i) => {
        const li = document.createElement('li');
        li.className = 'guestbook__item';

        const meta = document.createElement('div');
        meta.className = 'guestbook__meta';

        const who = document.createElement('span');
        who.className = 'guestbook__who';
        who.textContent = item.name;

        const when = document.createElement('span');
        when.className = 'guestbook__when';
        when.textContent = new Date(item.at).toLocaleDateString('ko-KR');

        const text = document.createElement('p');
        text.className = 'guestbook__text';
        text.textContent = item.message;

        const del = document.createElement('button');
        del.className = 'guestbook__del';
        del.type = 'button';
        del.textContent = '✕';
        del.setAttribute('aria-label', '메시지 삭제');
        del.addEventListener('click', () => {
          const next = load();
          next.splice(i, 1);
          save(next);
          render();
        });

        meta.append(who, when);
        li.append(meta, text, del);
        list.appendChild(li);
      });
    };

    $('#guestbookForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#gbName').value.trim();
      const message = $('#gbMessage').value.trim();
      if (!name || !message) return;

      const items = load();
      items.unshift({ name, message, at: Date.now() });
      save(items);
      e.target.reset();
      render();
      toast('축하 메시지가 등록되었습니다');
    });

    render();
  }

  /* ──────────────────────────────────────────────────────────────
   *  9. 공유하기
   * ────────────────────────────────────────────────────────────── */
  function initShare() {
    const url = C.meta.url || location.href;

    $('#shareLink').addEventListener('click', () =>
      copy(url, '청첩장 링크가 복사되었습니다')
    );

    const nativeBtn = $('#shareNative');
    if (navigator.share) {
      nativeBtn.addEventListener('click', () => {
        navigator.share({
          title: C.meta.title,
          text: C.meta.description.replace(/\n/g, ' '),
          url,
        }).catch(() => { /* 사용자가 취소한 경우 */ });
      });
    } else {
      nativeBtn.remove();
    }
  }

  /* ──────────────────────────────────────────────────────────────
   *  10. 배경음악
   * ────────────────────────────────────────────────────────────── */
  function initBgm() {
    if (!C.options.showBgm) return;

    const audio = $('#bgm');
    const btn   = $('#bgmToggle');
    audio.src = C.options.bgmSrc;
    btn.hidden = false;

    btn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play()
          .then(() => btn.classList.add('is-playing'))
          .catch(() => toast('음악을 재생할 수 없습니다'));
      } else {
        audio.pause();
        btn.classList.remove('is-playing');
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
   *  11. 스크롤 등장 애니메이션
   * ────────────────────────────────────────────────────────────── */
  function initReveal() {
    const targets = $$('.reveal');

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((el) => io.observe(el));
  }

  /* ──────────────────────────────────────────────────────────────
   *  실행
   * ────────────────────────────────────────────────────────────── */
  renderMeta();
  renderCover();
  renderGreeting();
  initContactSheet();
  renderCalendar();
  renderGallery();
  renderLocation();
  renderAccounts();
  initGuestbook();
  initShare();
  initBgm();
  initReveal();
})();
