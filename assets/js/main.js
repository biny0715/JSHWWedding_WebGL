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
      img.onload = function () { el.innerHTML = ""; el.appendChild(img); el.classList.add("has-img"); };
    }
  }
  var photoMap = { main: W.mainPhoto, groom: W.groomPhoto, bride: W.bridePhoto };
  $all("[data-photo]").forEach(function (el) {
    var key = el.getAttribute("data-photo");
    if (photoMap[key]) fillPhoto(el, photoMap[key]);
  });

  /* ---- 전화 버튼 ---- */
  $all("[data-call]").forEach(function (el) {
    var phone = get(el.getAttribute("data-call"));
    if (phone) el.href = "tel:" + phone.replace(/[^0-9+]/g, "");
    else el.style.display = "none";
  });

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
      { label: "신랑 측", who: p.groom, child: W.groom.name },
      { label: "신부 측", who: p.bride, child: W.bride.name },
    ];
    box.innerHTML = sides.map(function (s) {
      return '<div class="family-card">' +
        '<p class="family-side">' + esc(s.label) + '</p>' +
        '<p class="family-people"><span class="rel">아버지</span><b>' + esc(s.who.father) + '</b></p>' +
        '<p class="family-people"><span class="rel">어머니</span><b>' + esc(s.who.mother) + '</b></p>' +
        '<p class="family-people"><span class="rel">자녀</span><b>' + esc(s.child) + '</b></p>' +
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
        return '<div class="acc-row">' +
          '<div><div class="who">' + esc(a.label) + " · " + esc(a.holder) + '</div>' +
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
    var items = W.gallery || [];
    track.innerHTML = items.map(function (p) {
      return '<div class="slide"><div data-photo style="aspect-ratio:' + (p.ratio || "3 / 4") +
        '"><span class="ph-label">웨딩 사진 자리</span></div></div>';
    }).join("");
    // 이미지가 있으면 채우기
    $all(".slide [data-photo]", track).forEach(function (el, i) { fillPhoto(el, items[i]); });

    var idx = 0, n = items.length;
    dotsEl.innerHTML = items.map(function (_, i) {
      return '<button class="dot' + (i === 0 ? " active" : "") + '" data-i="' + i + '"></button>';
    }).join("");
    var dots = $all(".dot", dotsEl);

    function go(i) {
      idx = (i + n) % n;
      track.style.transform = "translateX(" + (-idx * 100) + "%)";
      dots.forEach(function (d, di) { d.classList.toggle("active", di === idx); });
    }
    $("#g-prev").addEventListener("click", function () { go(idx - 1); });
    $("#g-next").addEventListener("click", function () { go(idx + 1); });
    dotsEl.addEventListener("click", function (e) {
      var d = e.target.closest(".dot"); if (d) go(Number(d.getAttribute("data-i")));
    });
    // 터치 스와이프
    var x0 = null;
    track.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  })();

  /* ---- 모바일 예식장 입장 버튼 (섹션 버튼 + 떠다니는 FAB, 외부 호스트 URL) ---- */
  (function () {
    var btns = $all(".enter-btn, .venue-fab"); if (!btns.length) return;
    if (W.venueUrl && W.venueUrl.indexOf("YOUR-SITE") === -1) {
      btns.forEach(function (b) { b.href = W.venueUrl; });
    }
    // venueUrl 미설정 시 기본값(venue.html)은 HTML 의 href 그대로 사용

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
      if (diff <= 0) { el.textContent = "오늘은 두 사람의 결혼식입니다 🎉"; return; }
      var d = Math.floor(diff / 864e5);
      el.textContent = "예식까지 D-" + d;
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
