/* =====================================================================
 * venue.js — 로비 씬 HTML UI 오버레이 로직
 * 흐름: 이름/성별 → 미리보기 → 입장하기
 *
 * Unity 연동 규약 (WebGL 빌드에 WebLobbyBridge 포함 시 동작):
 *  - 웹 → 유니티 : unityInstance.SendMessage("WebBridge", "SetPlayerName", 이름)
 *                  unityInstance.SendMessage("WebBridge", "EnterVenue")
 *  - 유니티 → 웹 : jslib(WeddingBridge.jslib) 가 아래 콜백을 호출
 *                  window.OnWeddingLobbyReady() / window.OnWeddingEntering()
 *  ※ 현재 Build/ 가 브리지 미포함 구버전이면 SendMessage 는 조용히 무시됨(에러 없음).
 *    새 WebGL 빌드로 교체하면 자동 연동됩니다.
 * ===================================================================== */
(function () {
  "use strict";

  var state = { name: "", gender: "" };

  /* ---- 유니티 → 웹 콜백 (jslib에서 호출) ---- */
  window.OnWeddingLobbyReady = function () {
    console.log("[venue] Unity 로비 준비 완료");
  };
  window.OnWeddingEntering = function () {
    console.log("[venue] Unity 입장(접속) 시작");
  };

  /* ---- 웹 → 유니티 : 이름 전달 + 입장 신호 ---- */
  function sendEnterToUnity() {
    var u = window.unityInstance;
    if (!u) return; // 빌드 로딩 전이거나 브리지 미포함 → 무시
    try {
      u.SendMessage("WebBridge", "SetPlayerName", state.name.trim() || "하객");
      u.SendMessage("WebBridge", "EnterVenue");
    } catch (e) {
      console.warn("[venue] Unity SendMessage 실패:", e);
    }
  }

  var step1 = document.getElementById("lobby-step1");
  var step2 = document.getElementById("lobby-step2");
  var playUI = document.getElementById("play-ui");

  var nameInput = document.getElementById("visitor-name");
  var nextBtn = document.getElementById("lobby-next-btn");
  var prevBtn = document.getElementById("lobby-prev-btn");
  var enterBtn = document.getElementById("lobby-enter-btn");
  var genderBtns = Array.prototype.slice.call(document.querySelectorAll(".gender-btn"));

  /* ---- 스텝 1: 다음 버튼 활성화 조건 ---- */
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

  /* ---- 스텝 이동 ---- */
  nextBtn.addEventListener("click", function () {
    step1.classList.add("lobby--hidden");
    step2.classList.remove("lobby--hidden");
  });
  prevBtn.addEventListener("click", function () {
    step2.classList.add("lobby--hidden");
    step1.classList.remove("lobby--hidden");
  });

  /* ---- 입장하기 ---- */
  enterBtn.addEventListener("click", function () {
    sendEnterToUnity(); // 유니티에 이름 + 입장 신호 전달
    step2.classList.add("lobby--hidden");
    playUI.classList.remove("play-ui--hidden");
  });
})();
