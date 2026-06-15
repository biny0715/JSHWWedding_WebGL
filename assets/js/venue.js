/* =====================================================================
 * venue.js — 모바일 예식장 오버레이 로직 (로딩 게이팅 포함)
 *
 * 화면 흐름(상태):
 *   1) LOADING  : Unity 로비 씬이 준비될 때까지 로딩 화면 (입력칸 숨김)
 *   2) LOBBY    : 이름/성별 → 미리보기 → 입장하기
 *   3) ENTERING : 입장 신호 전송 후 Wedding 3D 씬 로드 대기 (로딩 화면)
 *   4) PLAYING  : Wedding 씬 로드 완료 → 커튼 제거(3D 노출)
 *
 * Unity ↔ 웹 (WebGL 빌드의 WebLobbyBridge + WeddingBridge.jslib):
 *   웹 → 유니티 : SendMessage("WebBridge","SetPlayerName",이름) / ("WebBridge","EnterVenue")
 *   유니티 → 웹 : window.OnWeddingLobbyReady()  (로비 준비 완료)
 *                 window.OnWeddingEntering()    (접속 시작)
 *                 window.OnWeddingSceneReady()  (Wedding 씬 로드 완료)
 * ===================================================================== */
(function () {
  "use strict";

  var state = { name: "", gender: "", entered: false };

  /* ---- 요소 ---- */
  var curtain = document.getElementById("venue-curtain");
  var loading = document.getElementById("venue-loading");
  var loadingText = document.getElementById("loading-text");
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

  var lobbyReady = false;
  var lobbyFallbackTimer, sceneFallbackTimer;

  /* ===== 상태 전환 ===== */
  function showLoading(text) {
    if (loadingText && text) loadingText.textContent = text;
    show(loading); hide(step1); hide(step2);
  }
  function showLobby() {        // Unity 로비 준비 완료 → 입력 화면
    if (state.entered) return;  // 이미 입장 진행 중이면 무시
    lobbyReady = true;
    clearTimeout(lobbyFallbackTimer);
    hide(loading); show(step1); hide(step2);
  }
  function reveal() {           // Wedding 씬 로드 완료 → 3D 노출
    clearTimeout(sceneFallbackTimer);
    hide(loading); hide(step1); hide(step2);
    if (curtain) curtain.classList.add("curtain--hidden");
    playUI.classList.remove("play-ui--hidden");
  }

  /* ===== 유니티 → 웹 콜백 ===== */
  window.OnWeddingLobbyReady = function () {
    console.log("[venue] Unity 로비 준비 완료");
    showLobby();
  };
  window.OnWeddingEntering = function () {
    console.log("[venue] Unity 입장(접속) 시작");
    showLoading("예식장에 입장하는 중…");
  };
  window.OnWeddingSceneReady = function () {
    console.log("[venue] Wedding 씬 로드 완료");
    reveal();
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

  /* ===== 로비 입력 ===== */
  function refreshNext() {
    nextBtn.disabled = !(state.name.trim() && state.gender);
  }
  nameInput.addEventListener("input", function () {
    state.name = nameInput.value;
    refreshNext();
  });
  genderBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.gender = btn.getAttribute("data-gender");
      genderBtns.forEach(function (b) {
        b.setAttribute("aria-pressed", b === btn ? "true" : "false");
      });
      refreshNext();
    });
  });

  nextBtn.addEventListener("click", function () { hide(step1); show(step2); });
  prevBtn.addEventListener("click", function () { hide(step2); show(step1); });

  enterBtn.addEventListener("click", function () {
    if (state.entered) return;
    state.entered = true;
    sendEnterToUnity();
    showLoading("예식장에 입장하는 중…");
    // Wedding 씬 로드 완료(OnWeddingSceneReady)를 기다린다.
    // 신호가 안 오면(구버전 빌드/지연) 안전하게 일정 시간 후 노출.
    sceneFallbackTimer = setTimeout(reveal, 25000);
  });

  /* ===== 초기 상태 ===== */
  showLoading("예식장을 불러오는 중…");
  // Unity 로비 준비 신호가 끝내 안 오면(로드 실패 등) 최소한 입력은 할 수 있게 노출
  lobbyFallbackTimer = setTimeout(function () {
    if (!lobbyReady && !state.entered) {
      console.warn("[venue] 로비 준비 신호 지연 — 폴백으로 입력 화면 표시");
      showLobby();
    }
  }, 40000);
})();
