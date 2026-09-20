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
    eng: "Hyungwon",
    role: "신랑",
    desc: "목포 바다처럼 넓은 마음을 가진", // TODO: 소개 문구 다듬기
    phone: "010-2820-2131", // TODO
  },
  bride: {
    name: "박지수",
    short: "지수",
    eng: "Jisoo",
    role: "신부",
    desc: "누구보다 따뜻한 마음을 가진", // TODO: 소개 문구 다듬기
    phone: "010-0000-0000", // TODO
  },

  date: {
    iso: "2026-11-08T13:00:00+09:00",
    text: "2026년 11월 8일 일요일",
    timeText: "오후 1시",
  },

  venue: {
    name: "운림제",
    detail: "광주광역시 운림제 · 야외 한옥 예식장",
    address: "광주 동구 운림동 455",
    tel: "062-226-5900",
    lat: 35.1308,
    lng: 126.9483,
    mapQuery: "운림제 광주",
    // 모바일에서 각 앱으로 바로 열리는 공유 링크 (앱 미설치 시 웹으로 폴백)
    mapLinks: {
      kakao: "https://place.map.kakao.com/9308441",
      naver: "https://naver.me/xSFCVLXf",
      tmap: "https://tmap.life/d868f2fa",
    },
    // 네이버 지도(Web Dynamic Map) Client ID — NCP 발급. 공개돼도 안전(등록 도메인에서만 동작)
    naverClientId: "84o8zgwogu",
  },

  /* ---- 혼주 정보 ---- */
  parents: {
    groom: { father: "김종성", mother: "오현희" },
    bride: { father: "박세용", mother: "김경미" },
  },

  /* ---- 마음 전하기 (계좌) ---- */
  // TODO: 실제 계좌번호로 교체
  accounts: {
    groom: [
      {
        label: "신랑 김형원",
        bank: "○○은행",
        number: "000-0000-0000-00",
        holder: "김형원",
      },
      {
        label: "신랑 측 아버지",
        bank: "○○은행",
        number: "000-0000-0000-00",
        holder: "김종성",
      },
      {
        label: "신랑 측 어머니",
        bank: "○○은행",
        number: "000-0000-0000-00",
        holder: "오현희",
      },
    ],
    bride: [
      {
        label: "신부 박지수",
        bank: "○○은행",
        number: "000-0000-0000-00",
        holder: "박지수",
      },
      {
        label: "신부 측 아버지",
        bank: "○○은행",
        number: "000-0000-0000-00",
        holder: "박세용",
      },
      {
        label: "신부 측 어머니",
        bank: "○○은행",
        number: "000-0000-0000-00",
        holder: "김경미",
      },
    ],
  },

  /* ---- 사진 자리 ----
   * src 가 비어("")있으면 회색 플레이스홀더가 표시됩니다.
   * 실제 사진을 assets/images/ 에 넣고 경로를 채우면 자동으로 사진이 나옵니다.
   * 예: src: "assets/images/main.jpg"
   */
  mainPhoto: {
    srcs: ["assets/images/main-1.jpg", "assets/images/main-2.jpg"], // 랜덤으로 하나 표시 (main.js)
    alt: "메인 웨딩 사진",
    ratio: "3 / 4",
  },
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
  venueUrl: "https://pub-e2f0473c1db44b0ea4d9059179c8ff75.r2.dev/index.html", // Cloudflare R2 (무료 무제한 트래픽)

  /* ---- 축하화환 업체 주문 링크 ---- */
  wreathUrl: "", // TODO: 화환 업체 링크 확정되면 채우기

  /* ---- 제작자 ---- */
  makers: [
    { role: "개발", name: "어경빈", contact: "" },
    {
      role: "문의",
      name: "aa0715@naver.com",
      contact: "mailto:aa0715@naver.com",
    },
  ],

  /* ---- 인사말 ---- */
  greeting:
    "만화 같은 신랑과\n" +
    "동화같은 신부가 만나\n" +
    "\n" +
    "드라마를 만들며 만난 두 사람이\n" +
    "이번에는 우리의 이야기를 써 내려갑니다.\n" +
    "\n" +
    "푸른 하늘 아래 시작되는\n" +
    "저희의 첫 장면을 함께해 주세요.",
};
