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
    phone: "010-5130-7391",
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
  accounts: {
    groom: [
      {
        label: "신랑 김형원",
        bank: "토스뱅크",
        number: "100002364045",
        holder: "김형원",
      },
      {
        label: "신랑 측 아버지",
        bank: "하나은행",
        number: "19691026272107",
        holder: "김종성",
      },
      {
        label: "신랑 측 어머니",
        bank: "신한은행",
        number: "110309932227",
        holder: "오현희",
      },
    ],
    bride: [
      {
        label: "신부 박지수",
        bank: "농협은행",
        number: "62402037835",
        holder: "박지수",
      },
      {
        label: "신부 측 아버지",
        bank: "하나은행",
        number: "11491005389307",
        holder: "박세용",
      },
      {
        label: "신부 측 어머니",
        bank: "국민은행",
        number: "557210453914",
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
    src: "assets/images/main-10853.jpg",
    alt: "메인 웨딩 사진",
    ratio: "3 / 4",
  },
  // 프로필: 얼굴을 정사각으로 크롭(원형 틀에 맞춤), 누르면 같은 원본의 전체 사진(fullSrc)
  groomPhoto: { src: "assets/images/profile-groom.jpg", alt: "신랑 프로필", ratio: "1 / 1", fullSrc: "assets/images/gallery-9905.jpg", fullAlt: "신랑 전체 사진" },
  bridePhoto: { src: "assets/images/profile-bride.jpg", alt: "신부 프로필", ratio: "1 / 1", fullSrc: "assets/images/gallery-10043.jpg", fullAlt: "신부 전체 사진" },

  gallery: [
    { src: "assets/images/gallery-9732.jpg", alt: "웨딩 사진 1", ratio: "2 / 3" },
    { src: "assets/images/gallery-9905.jpg", alt: "웨딩 사진 2", ratio: "2 / 3" },
    { src: "assets/images/gallery-10043.jpg", alt: "웨딩 사진 3", ratio: "2 / 3" },
    { src: "assets/images/gallery-10833.jpg", alt: "웨딩 사진 4", ratio: "2 / 3" },
    { src: "assets/images/gallery-11382.jpg", alt: "웨딩 사진 5", ratio: "2 / 3" },
    { src: "assets/images/gallery-11636.jpg", alt: "웨딩 사진 6", ratio: "2 / 3" },
    { src: "assets/images/gallery-11755.jpg", alt: "웨딩 사진 7", ratio: "2 / 3" },
  ],

  /* ---- 예식 안내 사진 4칸(26/11/08/13시 문구가 각 사진 위에 겹쳐 표시됨) ---- */
  whenPhotos: [
    { src: "assets/images/when-1.jpg", alt: "예식 안내 사진 1" },
    { src: "assets/images/when-2.jpg", alt: "예식 안내 사진 2" },
    { src: "assets/images/when-3.jpg", alt: "예식 안내 사진 3" },
    { src: "assets/images/when-4.jpg", alt: "예식 안내 사진 4" },
  ],

  /* ---- 인생네컷(3컷 세로 스트립) — 실제 사진 준비되면 src만 교체 ---- */
  life4cutPhotos: [
    { src: "assets/images/life4cut-1.jpg", alt: "인생네컷 사진 1", ratio: "474 / 305" },
    { src: "assets/images/life4cut-2.jpg", alt: "인생네컷 사진 2", ratio: "474 / 305" },
    { src: "assets/images/life4cut-3.jpg", alt: "인생네컷 사진 3", ratio: "474 / 306" },
  ],

  /* ---- 모바일 예식장(Unity) 외부 호스트 주소 ----
   * 무거운 WebGL 빌드는 GitHub Pages(100MB 제한) 대신 외부 호스트(Netlify 등)에 올립니다.
   * 배포 후 받은 주소로 교체하세요. (비워두면 같은 사이트의 venue.html 로 이동)
   */
  venueUrl: "https://pub-e2f0473c1db44b0ea4d9059179c8ff75.r2.dev/index.html", // Cloudflare R2 (무료 무제한 트래픽)

  /* ---- 축하화환 업체 주문 링크 ---- */
  wreathUrl: "https://xn--wh1br48ap0ao51bua.com/w/6Z6sMXsWSw/order", // 모바일 화환 주문 링크

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
    "수많은 엔딩을 그려왔던 두 사람.\n" +
    "이번엔 평생을 함께할 이야기를 시작합니다.\n" +
    "\n" +
    "해피엔딩을 향해 나아가는 첫 걸음,\n" +
    "그 시작에 함께 해주세요.",
};
