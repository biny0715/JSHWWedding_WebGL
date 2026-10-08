/* =====================================================================
 * main.js — 청첩장 인터랙션
 * config.js(window.WEDDING)를 읽어 화면을 채우고 동작을 붙입니다.
 * ===================================================================== */
(function () {
  "use strict";
  var W = window.WEDDING;

  /* ---- 작은 유틸 ---- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function get(path) { // "groom.name" -> 값
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, W);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* ---- 토스트 ---- */
  var toastEl = $("#toast"), toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 1800);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast("복사되었습니다"); },
        function () { fallbackCopy(text); });
    } else { fallbackCopy(text); }
  }
  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("복사되었습니다"); } catch (e) { toast("복사 실패"); }
    document.body.removeChild(ta);
  }

  /* ---- 텍스트 바인딩 ---- */
  $all("[data-bind]").forEach(function (el) {
    var v = get(el.getAttribute("data-bind"));
    if (v != null) el.textContent = v;
  });

  /* ---- 사진 플레이스홀더 채우기 ---- */
  function fillPhoto(el, photo) {
    if (!photo) return;
    if (photo.ratio) el.style.aspectRatio = photo.ratio;
    if (photo.src) {
      var img = new Image();
      img.src = photo.src; img.alt = photo.alt || "";
      img.onload = function () {
        // 플레이스홀더 라벨만 제거하고 이미지를 첫 자식으로 삽입 — 커버 사진처럼
        // 다른 오버레이 요소(문구 등)가 형제로 함께 있는 경우를 보존한다.
        var ph = el.querySelector(".ph-label");
        if (ph) ph.remove();
        el.insertBefore(img, el.firstChild);
        el.classList.add("has-img");
      };
    }
  }
  // 메인 표지 사진: srcs 배열이 있으면 그중 하나를 랜덤으로 선택
  function pickMain(photo) {
    if (photo && photo.srcs && photo.srcs.length) {
      var src = photo.srcs[Math.floor(Math.random() * photo.srcs.length)];
      return { src: src, alt: photo.alt, ratio: photo.ratio };
    }
    return photo;
  }
  // 화면에 가까워졌을 때(600px 전) 한 번만 실행 — 아래쪽 사진이 메인 사진과 대역폭을 다투지 않게
  function whenNear(el, fn) {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (en) { return en.isIntersecting; })) { io.disconnect(); fn(); }
    }, { rootMargin: "600px 0px" });
    io.observe(el);
  }
  var photoMap = { main: pickMain(W.mainPhoto), groom: W.groomPhoto, bride: W.bridePhoto };
  (W.whenPhotos || []).forEach(function (p, i) { photoMap["when" + (i + 1)] = p; });
  (W.life4cutPhotos || []).forEach(function (p, i) { photoMap["life" + (i + 1)] = p; });
  $all("[data-photo]").forEach(function (el) {
    var key = el.getAttribute("data-photo");
    var photo = photoMap[key];
    if (!photo) return;
    if (key === "main") fillPhoto(el, photo);   // 메인은 즉시
    else whenNear(el, function () { fillPhoto(el, photo); });
  });

  /* ---- 전화 버튼 ---- */
  $all("[data-call]").forEach(function (el) {
    var phone = get(el.getAttribute("data-call"));
    if (phone) el.href = "tel:" + phone.replace(/[^0-9+]/g, "");
    else el.style.display = "none";
  });

  /* ---- 예식장 TEL: 바로 걸리지 않도록 확인 모달 거쳐서 연결 ---- */
  (function () {
    var telLink = $("#venue-tel-link");
    var modal = $("#tel-notice");
    if (!telLink || !modal) return;
    var textEl = $("#tel-notice-text");
    var callBtn = $("#tel-notice-call");
    function closeTelNotice() { modal.hidden = true; document.body.style.overflow = ""; }
    telLink.addEventListener("click", function (e) {
      e.preventDefault();
      var number = telLink.textContent.replace(/^TEL\s*/, "").trim();
      textEl.textContent = (get("venue.name") || "") + "(" + number + ")로 전화를 거시겠습니까?";
      callBtn.href = telLink.href;
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    });
    callBtn.addEventListener("click", closeTelNotice);
    $("#tel-notice-close").addEventListener("click", closeTelNotice);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeTelNotice(); });
  })();

  /* ---- 오시는 길: 길찾기 앱 링크 ---- */
  (function () {
    var v = W.venue, q = encodeURIComponent(v.mapQuery || v.name);
    // config 에 직접 링크(mapLinks)가 있으면 그걸 우선 사용 (모바일에서 앱으로 바로 열림)
    var links = v.mapLinks || {
      kakao: "https://map.kakao.com/?q=" + q,
      naver: "https://map.naver.com/v5/search/" + q,
      tmap: "https://tmap.life/route?goalname=" + q + "&goalx=" + v.lng + "&goaly=" + v.lat,
    };
    $all("[data-map]").forEach(function (a) {
      var key = a.getAttribute("data-map");
      if (links[key]) a.href = links[key];
    });
  })();

  /* ---- 오시는 길: 네이버 지도 임베드 (NCP Web Dynamic Map) ---- */
  (function () {
    var el = document.getElementById("map-box");
    if (!el) return;
    var v = W.venue || {};
    if (!v.naverClientId) return;
    var params = ["ncpKeyId", "ncpClientId"], idx = 0; // 신/구 파라미터 자동 폴백

    window.navermap_authFailure = function () { next(); };

    function next() {
      var old = document.getElementById("naver-maps-sdk");
      if (old && old.parentNode) old.parentNode.removeChild(old);
      idx++;
      if (idx < params.length) loadSdk();
    }
    function loadSdk() {
      var s = document.createElement("script");
      s.id = "naver-maps-sdk";
      s.src = "https://oapi.map.naver.com/openapi/v3/maps.js?" + params[idx] +
        "=" + encodeURIComponent(v.naverClientId);
      s.onload = onReady;
      s.onerror = next;
      document.head.appendChild(s);
    }
    function onReady() {
      if (!window.naver || !window.naver.maps) { next(); return; }
      el.innerHTML = "";
      var p = new naver.maps.LatLng(v.lat || 35.1308, v.lng || 126.9483);
      var map = new naver.maps.Map(el, { center: p, zoom: 17 });
      new naver.maps.Marker({ position: p, map: map, title: v.name || "" });
    }
    loadSdk();
  })();

  /* ---- 복사 바인딩 (주소 등) ---- */
  $all("[data-copy-bind]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = get(btn.getAttribute("data-copy-bind"));
      if (v) copy(v);
    });
  });

  /* ---- 혼주 정보 ---- */
  (function () {
    var box = $("#family-grid"); if (!box) return;
    var p = W.parents;
    var sides = [
      { label: "신랑 측", who: p.groom, childLabel: "신랑", child: W.groom.name },
      { label: "신부 측", who: p.bride, childLabel: "신부", child: W.bride.name },
    ];
    box.innerHTML = sides.map(function (s) {
      return '<div class="family-card">' +
        '<p class="family-side">' + esc(s.label) + '</p>' +
        '<p class="family-people"><span class="rel">아버지</span><b>' + esc(s.who.father) + '</b></p>' +
        '<p class="family-people"><span class="rel">어머니</span><b>' + esc(s.who.mother) + '</b></p>' +
        '<p class="family-people"><span class="rel">' + esc(s.childLabel) + '</span><b>' + esc(s.child) + '</b></p>' +
        '</div>';
    }).join("");
  })();

  /* ---- 마음 전하기 (아코디언 + 복사) ---- */
  (function () {
    var box = $("#accounts"); if (!box) return;
    var groups = [
      { title: "신랑 측 마음 전하기", list: W.accounts.groom },
      { title: "신부 측 마음 전하기", list: W.accounts.bride },
    ];
    box.innerHTML = groups.map(function (g) {
      var rows = g.list.map(function (a) {
        var full = a.bank + " " + a.number;
        var who = a.label.indexOf(a.holder) !== -1 ? a.label : a.label + " · " + a.holder;
        return '<div class="acc-row">' +
          '<div><div class="who">' + esc(who) + '</div>' +
          '<div class="num">' + esc(full) + '</div></div>' +
          '<button class="acc-copy" data-acc="' + esc(full) + '">복사</button>' +
          '</div>';
      }).join("");
      return '<div class="acc-item"><button class="acc-head">' + esc(g.title) +
        '<span class="chev">▾</span></button><div class="acc-body">' + rows + '</div></div>';
    }).join("");

    box.addEventListener("click", function (e) {
      var head = e.target.closest(".acc-head");
      if (head) { head.parentElement.classList.toggle("open"); return; }
      var cp = e.target.closest(".acc-copy");
      if (cp) copy(cp.getAttribute("data-acc"));
    });
  })();

  /* ---- 방명록: assets/js/guestbook.js (Firestore) 로 이전됨 (index.html 모듈에서 마운트) ---- */

  /* ---- 웨딩 갤러리 슬라이더 ---- */
  (function () {
    var track = $("#gallery-track"), dotsEl = $("#gallery-dots");
    if (!track) return;
    // 첫 번째 등록 사진은 제외하고 실제 사진이 있는 항목만 표시
    var items = (W.gallery || []).filter(function (p) {
      return p.src && p.src !== "assets/images/gallery-1.jpg";
    });
    var n = items.length;
    // 무한 루프: [마지막 복제, 1..n, 첫 사진 복제] — 마지막에서 다음으로 넘기면 1번이 오른쪽에서,
    // 1번에서 이전으로 넘기면 마지막 사진이 왼쪽에서 자연스럽게 들어온다(되감기 애니메이션 없음).
    var loop = n > 1;
    var slidesData = loop ? [items[n - 1]].concat(items, [items[0]]) : items;
    track.innerHTML = slidesData.map(function (p) {
      return '<div class="slide"><div data-photo style="aspect-ratio:' + (p.ratio || "3 / 4") +
        '"><span class="ph-label">웨딩 사진 자리</span></div></div>';
    }).join("");
    // 이미지가 있으면 채우기 — 갤러리 영역이 화면에 가까워지면 슬라이드 전체를 한 번에 로드
    // (가로로 밀린 슬라이드는 개별 감지가 안 되므로 슬라이더 단위로 감지)
    whenNear($("#gallery-slider") || track, function () {
      $all(".slide [data-photo]", track).forEach(function (el, i) { fillPhoto(el, slidesData[i]); });
    });

    var pos = loop ? 1 : 0;   // track 상의 위치(복제 칸 포함)
    if (n <= 1) {
      $("#g-prev").style.display = "none";
      $("#g-next").style.display = "none";
      dotsEl.style.display = "none";
    }
    dotsEl.innerHTML = items.map(function (_, i) {
      return '<button class="dot' + (i === 0 ? " active" : "") + '" data-i="' + i + '"></button>';
    }).join("");
    var dots = $all(".dot", dotsEl);

    function setTrack(px, withTransition) {
      track.style.transition = withTransition ? "transform .35s ease" : "none";
      track.style.transform = "translateX(calc(" + (-pos * 100) + "% + " + px + "px))";
    }
    // 복제 칸에 서 있으면 같은 사진의 실제 칸으로 애니메이션 없이 옮긴다(눈에 보이는 변화 없음)
    function snap() {
      if (!loop) return;
      if (pos === 0) pos = n; else if (pos === n + 1) pos = 1; else return;
      setTrack(0, false);
      void track.offsetWidth;   // 강제 리플로우 — 다음 이동이 애니메이션되도록
    }
    function moveTo(p) {
      pos = Math.max(0, Math.min(slidesData.length - 1, p));
      setTrack(0, true);
      var real = loop ? (pos - 1 + n) % n : pos;
      dots.forEach(function (d, di) { d.classList.toggle("active", di === real); });
    }
    function step(d) { snap(); moveTo(pos + d); }
    track.addEventListener("transitionend", function (e) { if (e.target === track) snap(); });
    setTrack(0, false);

    // 좌우 화살표: 평소엔 숨김 → 터치/드래그하면 나타나고, 손을 뗀 뒤 2초 지나면 사라짐
    var slider = $("#gallery-slider") || track, navTimer = null;
    function showNav() { slider.classList.add("nav-on"); clearTimeout(navTimer); }
    function hideNavLater() { clearTimeout(navTimer); navTimer = setTimeout(function () { slider.classList.remove("nav-on"); }, 2000); }
    slider.addEventListener("mousemove", function () { showNav(); hideNavLater(); });

    $("#g-prev").addEventListener("click", function () { step(-1); showNav(); hideNavLater(); });
    $("#g-next").addEventListener("click", function () { step(1); showNav(); hideNavLater(); });
    dotsEl.addEventListener("click", function (e) {
      var d = e.target.closest(".dot"); if (d) { snap(); moveTo(Number(d.getAttribute("data-i")) + (loop ? 1 : 0)); }
    });
    // 터치 드래그: 손가락 움직임에 실시간으로 따라오다가 놓으면 스냅.
    // 가로 의도가 확정되면 preventDefault 로 iOS 사파리의 뒤로가기 스와이프/스크롤
    // 제스처가 가져가지 못하게 막는다(touch-action 만으로는 일부 기기에서 불충분).
    // 리스너는 움직이는 track 이 아니라 고정된 바깥 틀(.slider)에 건다 — iOS 사파리는
    // transform 으로 밀린 요소의 터치 영역을 원래 위치로 계산해서, track 에 걸면
    // 첫 번째 사진에서만 드래그가 잡히고 2번째부터는 사파리가 제스처를 가져간다.
    var area = $("#gallery-slider") || track;
    var x0 = null, y0 = null, dragging = false, horizLock = false;
    area.addEventListener("touchstart", function (e) {
      x0 = e.touches[0].clientX;
      y0 = e.touches[0].clientY;
      dragging = true;
      horizLock = false;
      snap();
      showNav();
    }, { passive: true });
    area.addEventListener("touchmove", function (e) {
      if (!dragging) return;
      var dx = e.touches[0].clientX - x0;
      var dy = e.touches[0].clientY - y0;
      if (!horizLock) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;   // 방향 판단 전
        if (Math.abs(dy) > Math.abs(dx)) { dragging = false; return; }   // 세로 스크롤로 판단 → 페이지에 양보
        horizLock = true;
      }
      e.preventDefault();
      setTrack(dx, false);
    }, { passive: false });
    area.addEventListener("touchend", function (e) {
      hideNavLater();
      if (!dragging) { x0 = null; y0 = null; return; }
      dragging = false;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null; y0 = null;
      if (horizLock && Math.abs(dx) > area.clientWidth * 0.15) moveTo(pos + (dx < 0 ? 1 : -1));
      else moveTo(pos);
    });
    // 화면 회전·알림 당김 등으로 제스처가 중간에 끊기면 touchend 없이 dragging=true 가
    // 남아 다음 터치가 엉뚱한 위치로 튀는 문제 방지
    area.addEventListener("touchcancel", function () {
      dragging = false; x0 = null; y0 = null; moveTo(pos); hideNavLater();
    });
    // 화면 회전 시 사파리에서 flex 자식(.slide) 폭 계산이 깨져 두 칸이 겹쳐 보이는
    // 문제 대응 — 강제로 리플로우시킨 뒤 현재 슬라이드로 재정렬
    function relayout() {
      track.style.display = "none";
      void track.offsetHeight;   // 강제 리플로우
      track.style.display = "";
      setTrack(0, false);
    }
    window.addEventListener("resize", relayout);
    window.addEventListener("orientationchange", relayout);
  })();

  /* ---- 모바일 예식장 입장 버튼 (섹션 버튼 + 떠다니는 FAB, 외부 호스트 URL) ---- */
  (function () {
    var btns = $all(".enter-btn, .venue-fab"); if (!btns.length) return;
    if (W.venueUrl && W.venueUrl.indexOf("YOUR-SITE") === -1) {
      btns.forEach(function (b) { b.href = W.venueUrl; });
    }
    // venueUrl 미설정 시 기본값(venue.html)은 HTML 의 href 그대로 사용

    // 리모컨(FAB) 노출 제어: 표지의 스크롤 아이콘(.scroll-hint)이 화면에 보이는 동안(=첫 표지)엔 숨기고,
    // 아래로 스크롤해 아이콘이 뷰포트를 벗어나면(=인사말 이후) 노출. 위로 올려 표지로 돌아오면 다시 숨김.
    var fab = $(".venue-fab"), scrollHint = $(".scroll-hint");
    if (fab && scrollHint) {
      // 스크롤 아이콘이 뷰포트 상단 위로 "완전히" 벗어났을 때(bottom<=0)만 노출.
      // → 아이콘 및 그 위쪽(표지) 전부 숨김. 인사말 이후부터 노출.
      //   맨 위 고무줄 오버스크롤(아이콘이 아래로 밀림)도 bottom>0 이라 숨김 유지.
      var fabTick = false;
      function updateFab() {
        fabTick = false;
        fab.classList.toggle("is-visible", scrollHint.getBoundingClientRect().bottom <= 0);
      }
      window.addEventListener("scroll", function () {
        if (!fabTick) { fabTick = true; window.requestAnimationFrame(updateFab); }
      }, { passive: true });
      window.addEventListener("resize", updateFab);
      updateFab();   // 로드 시 초기 상태(표지 → 숨김)
    }

    // 입장 안내 모달: 바로 이동하지 않고 안내 문구 → "입장하기" 를 눌러야 이동.
    // 모달 마크업이 없는 페이지는 기존처럼 바로 이동.
    var modal = $("#venue-notice");
    if (!modal) return;
    var enterLink = $("#venue-notice-enter");
    function closeNotice() { modal.hidden = true; document.body.style.overflow = ""; }
    btns.forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.preventDefault();
        enterLink.href = b.href;               // 클릭한 버튼의 목적지(venueUrl) 그대로 사용
        modal.hidden = false;
        document.body.style.overflow = "hidden";   // 모달 뒤 배경 스크롤 잠금
      });
    });
    $("#venue-notice-close").addEventListener("click", closeNotice);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeNotice(); });
  })();

  /* ---- 축하화환 보내기 링크 ---- */
  (function () {
    var a = $("#wreath-link"); if (!a) return;
    if (W.wreathUrl) {
      a.href = W.wreathUrl;
    } else {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        toast("화환 주문 링크는 준비 중입니다");
      });
    }
  })();

  /* ---- 참석 여부 확인: 토글/카운터 UI (제출 자체는 index.html의 module 스크립트가 처리) ---- */
  (function () {
    var form = $("#rsvp-form"); if (!form) return;

    // 토글 버튼(신랑측/신부측): 그룹 내 단일 선택
    $all(".rsvp-toggle", form).forEach(function (group) {
      $all(".rsvp-opt", group).forEach(function (btn) {
        btn.addEventListener("click", function () {
          $all(".rsvp-opt", group).forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
        });
      });
    });

    // 참석 인원 카운터
    var countEl = $("#rsvp-count", form);
    var count = 1;
    function renderCount() { countEl.textContent = count + "명"; }
    $("#rsvp-minus", form).addEventListener("click", function () { if (count > 1) { count--; renderCount(); } });
    $("#rsvp-plus", form).addEventListener("click", function () { if (count < 20) { count++; renderCount(); } });
  })();

  window.toast = toast; // rsvp 제출(module 스크립트)에서 동일한 토스트 UI 사용

  /* ---- 사진 라이트박스 (커버·프로필 공용) ---- */
  (function () {
    var modal = $("#photo-modal");
    var wrap  = $("#photo-modal-wrap");
    if (!modal || !wrap) return;

    function openModal(src, alt) {
      if (!src) return;
      wrap.innerHTML = '<img src="' + esc(src) + '" alt="' + esc(alt || "") + '">';
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }
    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
      wrap.innerHTML = "";
    }

    // 커버 메인 사진
    var coverEl = $('[data-photo="main"]');
    if (coverEl) {
      coverEl.addEventListener("click", function () {
        var img = coverEl.querySelector("img");
        if (img) openModal(img.src, img.alt);
      });
    }

    // 신랑·신부 프로필 (fullSrc 있으면 전체샷, 없으면 프로필 원본)
    [
      { key: "groom", photo: W.groomPhoto },
      { key: "bride", photo: W.bridePhoto },
    ].forEach(function (item) {
      var el = $('[data-photo="' + item.key + '"]');
      if (!el || !item.photo) return;
      el.addEventListener("click", function () {
        var p = item.photo;
        var src = p.fullSrc || p.src;
        var alt = p.fullAlt || p.alt;
        openModal(src, alt);
      });
    });

    $("#photo-modal-close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) closeModal(); });
  })();

  /* ---- 제작자 ---- */
  (function () {
    var box = $("#makers"); if (!box) return;
    box.innerHTML = (W.makers || []).map(function (m) {
      var name = m.contact
        ? '<a href="' + esc(m.contact) + '">' + esc(m.name) + "</a>"
        : esc(m.name);
      return '<div class="maker"><span class="m-role">' + esc(m.role) + "</span>" + name + "</div>";
    }).join("");
  })();

  /* ---- 카운트다운 ---- */
  (function () {
    var el = $("#countdown"); if (!el || !W.date.iso) return;
    var target = new Date(W.date.iso).getTime();
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        var past = Math.floor(-diff / 864e5);
        el.textContent = past <= 0 ? "오늘은 두 사람의 결혼식입니다 🎉" : "D+" + past;
        return;
      }
      var d = Math.floor(diff / 864e5);
      el.textContent = "D-" + d;
    }
    tick(); setInterval(tick, 60000);
  })();

  /* ---- 스크롤 등장 ---- */
  (function () {
    var els = $all(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  })();
})();
