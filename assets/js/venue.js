/* =====================================================================
 * venue.js — 모바일 예식장 오버레이 로직 (로딩 게이팅 + 이름 기억/자동 재입장)
 *
 * 화면 흐름(상태):
 *   1) LOADING  : Unity 로비 씬이 준비될 때까지 로딩 화면 (입력칸 숨김)
 *   2) LOBBY    : 이름/성별 → 미리보기 → 입장하기
 *   3) ENTERING : 입장 신호 전송 후 Wedding 3D 씬 로드 대기 (로딩 화면)
 *   4) PLAYING  : Wedding 씬 로드 완료 → 커튼 제거(3D 노출)
 *
 * 모바일 복귀 대응:
 *   iOS 등에서 앱 전환 후 돌아오면 페이지가 통째로 리로드되는 경우가 많다.
 *   이름을 localStorage 에 기억해 두고, 다시 들어오면 입력을 건너뛰고 자동 입장한다.
 *   (이름 바꾸려면 로딩 화면의 "다른 이름으로 입장" 링크)
 *
 * 접속 지연 대응:
 *   저전력 모드/약한 기기에서 Photon 접속이 늦으면 무한 스피너처럼 보인다.
 *   일정 시간 후 안내문 + 새로고침 버튼을 노출한다.
 * ===================================================================== */
(function () {
  "use strict";

  var NAME_KEY = "jshw_visitor_name";
  var GENDER_KEY = "jshw_visitor_gender";

  function lsGet(k) { try { return window.localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { window.localStorage.removeItem(k); } catch (e) {} }

  var state = { name: "", gender: "", entered: false };

  /* ---- 요소 ---- */
  var curtain = document.getElementById("venue-curtain");
  var loading = document.getElementById("venue-loading");
  var loadingText = document.getElementById("loading-text");
  var loadingSub = document.getElementById("loading-sub");
  var retryBtn = document.getElementById("loading-retry");
  var changeNameLink = document.getElementById("change-name-link");
  var lobbyNotice = document.getElementById("lobby-notice");
  var step1 = document.getElementById("lobby-step1");
  var step2 = document.getElementById("lobby-step2");
  var playUI = document.getElementById("play-ui");

  var nameInput = document.getElementById("visitor-name");
  var nextBtn = document.getElementById("lobby-next-btn");
  var prevBtn = document.getElementById("lobby-prev-btn");
  var enterBtn = document.getElementById("lobby-enter-btn");
  var genderBtns = Array.prototype.slice.call(document.querySelectorAll(".gender-btn"));

  function hide(el) { if (el) el.classList.add("lobby--hidden"); }
  function show(el) { if (el) el.classList.remove("lobby--hidden"); }
  function setDisplay(el, v) { if (el) el.style.display = v; }

  var lobbyReady = false;
  var autoEnter = false;
  var hasAttemptedAuto = false;   // 자동입장은 첫 진입에만(끊김→재진입 루프 방지)
  var pendingNotice = "";         // 끊김 등 안내문(다음 입력화면에 표시)
  var lobbyFallbackTimer, sceneFallbackTimer, slowTimer;

  /* ===== 상태 전환 ===== */
  function showLoading(text, sub) {
    if (loadingText && text) loadingText.textContent = text;
    if (loadingSub) loadingSub.textContent = sub != null ? sub : "잠시만 기다려 주세요";
    show(loading); hide(step1); hide(step2);
  }
  function showLobby() {        // Unity 로비 (재)진입 → 입력(또는 자동 입장)
    lobbyReady = true;
    clearTimeout(lobbyFallbackTimer);
    state.entered = false;       // 로비로 (재)진입 → 입장 상태 리셋(재입장 가능)

    if (autoEnter && state.name.trim() && !hasAttemptedAuto) {
      hasAttemptedAuto = true;   // 기억된 이름 → 첫 진입엔 자동 입장
      doEnter();
      return;
    }

    // 입력 화면: 재진입이면 3D 커튼 복원 + 플레이 UI 숨김
    if (curtain) curtain.classList.remove("curtain--hidden");
    if (playUI) playUI.classList.add("play-ui--hidden");
    setDisplay(retryBtn, "none");
    setDisplay(changeNameLink, "none");
    if (lobbyNotice) {
      lobbyNotice.textContent = pendingNotice;
      lobbyNotice.style.display = pendingNotice ? "" : "none";
    }
    pendingNotice = "";
    hide(loading); show(step1); hide(step2);
  }
  function reveal() {           // Wedding 씬 로드 완료 → 3D 노출
    clearTimeout(sceneFallbackTimer);
    clearTimeout(slowTimer);
    hide(loading); hide(step1); hide(step2);
    if (curtain) curtain.classList.add("curtain--hidden");
    playUI.classList.remove("play-ui--hidden");
  }

  /* ===== 유니티 → 웹 콜백 ===== */
  window.OnWeddingLobbyReady = function () { console.log("[venue] Unity 로비 준비 완료"); showLobby(); };
  window.OnWeddingEntering = function () { console.log("[venue] Unity 입장(접속) 시작"); };
  window.OnWeddingSceneReady = function () { console.log("[venue] Wedding 씬 로드 완료"); reveal(); };
  window.OnWeddingDisconnected = function (cause) {
    console.warn("[venue] Photon 끊김:", cause);
    window.__lastDisconnect = cause;   // 콘솔에서 확인용
    // 끊기면 Unity가 곧 로비로 되돌리고 OnWeddingLobbyReady 가 와서 입력칸이 다시 뜸.
    pendingNotice = "연결이 끊겨 로비로 돌아왔어요 (사유: " + cause + "). 다시 입장해 주세요.";
  };

  /* ===== 웹 → 유니티 ===== */
  function sendEnterToUnity() {
    var u = window.unityInstance;
    if (!u) return;
    try {
      u.SendMessage("WebBridge", "SetPlayerName", state.name.trim() || "하객");
      u.SendMessage("WebBridge", "EnterVenue");
    } catch (e) {
      console.warn("[venue] Unity SendMessage 실패:", e);
    }
  }

  /* ===== 입장 처리(버튼 / 자동 공통) ===== */
  function doEnter() {
    if (state.entered) return;
    state.entered = true;

    // 이름/성별 기억 (다음 방문/복귀 시 자동 입장)
    lsSet(NAME_KEY, state.name.trim());
    if (state.gender) lsSet(GENDER_KEY, state.gender);

    sendEnterToUnity();
    showLoading((state.name.trim() || "하객") + "님, 예식장에 입장하는 중…");
    setDisplay(changeNameLink, "");   // 입장 중에는 "다른 이름으로 입장" 노출

    // 접속 지연 안내 + 안전 폴백
    clearTimeout(slowTimer);
    clearTimeout(sceneFallbackTimer);
    slowTimer = setTimeout(showSlowGuide, 12000);
    sceneFallbackTimer = setTimeout(reveal, 25000);  // 신호 누락 대비 최종 노출
  }

  function showSlowGuide() {
    if (loadingSub) loadingSub.textContent = "접속이 지연되고 있어요. 저전력 모드를 끄고 새로고침 해 주세요.";
    setDisplay(retryBtn, "");
  }

  /* ===== 로비 입력 ===== */
  function refreshNext() {
    nextBtn.disabled = !(state.name.trim() && state.gender);
  }
  nameInput.addEventListener("input", function () { state.name = nameInput.value; refreshNext(); });
  genderBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.gender = btn.getAttribute("data-gender");
      genderBtns.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
      refreshNext();
    });
  });

  nextBtn.addEventListener("click", function () { hide(step1); show(step2); });
  prevBtn.addEventListener("click", function () { hide(step2); show(step1); });
  enterBtn.addEventListener("click", doEnter);

  if (retryBtn) retryBtn.addEventListener("click", function () { location.reload(); });
  if (changeNameLink) changeNameLink.addEventListener("click", function () {
    lsDel(NAME_KEY); lsDel(GENDER_KEY);   // 기억 삭제 후 새로고침 → 이름 입력부터
    location.reload();
  });

  /* ===== 초기 상태 ===== */
  // 기억된 이름 복원 → 있으면 자동 입장 모드
  var savedName = lsGet(NAME_KEY), savedGender = lsGet(GENDER_KEY);
  if (savedName) {
    state.name = savedName;
    if (nameInput) nameInput.value = savedName;
    if (savedGender) {
      state.gender = savedGender;
      genderBtns.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-gender") === savedGender ? "true" : "false"); });
    }
    autoEnter = true;
    refreshNext();
  }

  showLoading("예식장을 불러오는 중…");
  // Unity 로비 준비 신호가 끝내 안 오면(로드 실패 등) 최소한 입력은 할 수 있게 노출
  lobbyFallbackTimer = setTimeout(function () {
    if (!lobbyReady && !state.entered) {
      console.warn("[venue] 로비 준비 신호 지연 — 폴백으로 입력 화면 표시");
      autoEnter = false;          // 자동입장 대신 안전하게 입력 화면
      showLobby();
    }
  }, 40000);
})();
