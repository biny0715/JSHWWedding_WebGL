/* =====================================================================
 * config.js — 청첩장 콘텐츠 한 곳에서 관리
 * ---------------------------------------------------------------------
 * 실제 사진/정보가 준비되면 이 파일만 수정하면 됩니다.
 * 사진은 assets/images/ 에 넣고 아래 경로만 교체하세요.
 * "TODO" 표시된 곳은 실제 정보로 반드시 바꿔주세요.
 * ===================================================================== */

window.WEDDING = {
  /* ---- 기본 정보 ---- */
  groom: {
    name: "김형원",
    short: "형원",
    role: "신랑",
    desc: "목포 출신, 바다를 닮은 사람",      // TODO: 소개 문구 다듬기
    phone: "010-0000-0000",                  // TODO
  },
  bride: {
    name: "박지수",
    short: "지수",
    role: "신부",
    desc: "동물의 숲을 좋아하는 사람",        // TODO: 소개 문구 다듬기
    phone: "010-0000-0000",                  // TODO
  },

  date: {
    iso: "2026-11-08T11:00:00+09:00",        // TODO: 정확한 예식 시간
    text: "2026년 11월 8일 일요일",
    timeText: "오전 11시",                    // TODO
  },

  venue: {
    name: "운림재",
    detail: "광주광역시 운림재 · 야외 한옥 예식장",
    address: "광주광역시 동구 ○○로 ○○",      // TODO: 정확한 주소
    lat: 35.1366,                            // TODO: 정확한 위도
    lng: 126.9215,                           // TODO: 정확한 경도
    // 길찾기 버튼이 검색할 장소명
    mapQuery: "운림재 광주",
  },

  /* ---- 혼주 정보 ---- */
  parents: {
    groom: { father: "김○○", mother: "○○○" }, // TODO
    bride: { father: "박○○", mother: "○○○" }, // TODO
  },

  /* ---- 마음 전하기 (계좌) ---- */
  // TODO: 실제 계좌번호로 교체
  accounts: {
    groom: [
      { label: "신랑 김형원", bank: "○○은행", number: "000-0000-0000-00", holder: "김형원" },
      { label: "신랑 측 혼주", bank: "○○은행", number: "000-0000-0000-00", holder: "김○○" },
    ],
    bride: [
      { label: "신부 박지수", bank: "○○은행", number: "000-0000-0000-00", holder: "박지수" },
      { label: "신부 측 혼주", bank: "○○은행", number: "000-0000-0000-00", holder: "박○○" },
    ],
  },

  /* ---- 사진 자리 ----
   * src 가 비어("")있으면 회색 플레이스홀더가 표시됩니다.
   * 실제 사진을 assets/images/ 에 넣고 경로를 채우면 자동으로 사진이 나옵니다.
   * 예: src: "assets/images/main.jpg"
   */
  mainPhoto: { src: "", alt: "메인 웨딩 사진", ratio: "3 / 4" },
  groomPhoto: { src: "", alt: "신랑 사진", ratio: "1 / 1" },
  bridePhoto: { src: "", alt: "신부 사진", ratio: "1 / 1" },

  gallery: [
    { src: "", alt: "웨딩 사진 1", ratio: "3 / 4" },
    { src: "", alt: "웨딩 사진 2", ratio: "3 / 4" },
    { src: "", alt: "웨딩 사진 3", ratio: "3 / 4" },
    { src: "", alt: "웨딩 사진 4", ratio: "3 / 4" },
    { src: "", alt: "웨딩 사진 5", ratio: "3 / 4" },
  ],

  /* ---- 모바일 예식장(Unity) 외부 호스트 주소 ----
   * 무거운 WebGL 빌드는 GitHub Pages(100MB 제한) 대신 외부 호스트(Netlify 등)에 올립니다.
   * 배포 후 받은 주소로 교체하세요. (비워두면 같은 사이트의 venue.html 로 이동)
   */
  venueUrl: "https://soft-mermaid-cf7c33.netlify.app/", // Netlify 외부 호스트

  /* ---- 제작자 ---- */
  makers: [
    { role: "개발", name: "어경빈", contact: "" },
    { role: "문의", name: "aa0715@naver.com", contact: "mailto:aa0715@naver.com" },
  ],

  /* ---- 인사말 ---- */
  greeting:
    "바다 건너 섬 하나,\n" +
    "그 위에 작은 한옥 마당을 지었습니다.\n" +
    "두 사람이 함께 걷기로 한 첫날,\n" +
    "귀한 걸음으로 축복해 주세요.",
};
