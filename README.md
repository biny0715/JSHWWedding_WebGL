# 형원 ♥ 지수 모바일 청첩장

신랑 김형원 × 신부 박지수 모바일 청첩장 (2026.11.08 · 광주 운림제).
**동물의 숲 + 바다 섬 + 한옥** 무드의 정적 웹 + Unity WebGL 3D 예식장.

## 구조

```
index.html              ← 모바일 청첩장 (세로 스크롤, 진입 페이지)
venue.html              ← 모바일 예식장 (Unity WebGL 3D + 로비 HTML 오버레이)
assets/
  css/style.css         ← 청첩장 스타일
  css/venue.css         ← 예식장 오버레이 스타일
  js/config.js          ← ★ 콘텐츠/사진경로/계좌/지도좌표 한 곳 관리
  js/main.js            ← 청첩장 인터랙션 (갤러리·복사·방명록·카운트다운)
  js/venue.js           ← 로비 씬 UI 흐름 (이름→성별→커스텀→입장)
  images/               ← 실제 사진 넣는 곳 (README 참고)
Build/ TemplateData/    ← Unity WebGL 빌드 (그대로 유지)
server.js               ← 로컬 압축 빌드 서빙용(선택). Pages 배포엔 불필요
```

## 하이브리드 레이어 구조 (venue.html)
- **배경 레이어**: Unity 캔버스(`#unity-canvas`)가 전체화면.
- **오버레이 레이어**: `#ui-overlay`(투명). 기본은 `pointer-events:none`으로 터치가
  Unity로 통과하고, 실제 컨트롤(카드·버튼·입력)만 `pointer-events:auto`로 회수해
  **Unity 캔버스와 HTML UI의 터치 이벤트가 충돌하지 않도록** 분리.
- Unity ↔ JS 연동(`.jslib` / `SendMessage`)은 다음 단계. 연동 지점은
  `assets/js/venue.js`에 `TODO(Unity 연동)` 주석으로 표시됨.

## 콘텐츠 수정 방법
거의 모든 텍스트/사진/계좌/주소는 [`assets/js/config.js`](assets/js/config.js) 한 곳에서 수정.
`// TODO` 표시된 값(혼주·계좌번호·전화·주소·좌표·제작자)을 실제 정보로 교체하세요.

### 사진 교체
1. `assets/images/`에 사진을 넣고
2. `config.js`의 해당 `src`에 경로 입력 (예: `"assets/images/main.jpg"`)
3. `src`가 비어있으면 회색 "웨딩 사진 자리" 플레이스홀더가 자동 표시.

## 로컬 미리보기
정적 파일이라 어떤 정적 서버로도 가능. 예:
```
npx serve .
# 또는 (Unity 압축 빌드 헤더가 필요할 때)
node server.js   →  http://localhost:8080
```
> 브라우저에서 직접 `index.html`을 file://로 열면 폰트 CDN은 되지만
> 일부 기능 테스트는 로컬 서버 사용을 권장.

## GitHub Pages 배포
- 현재 빌드는 **무압축**이라 Pages에서 추가 설정 없이 정적 서빙 가능.
- `.nojekyll` 포함(대용량 빌드 파일 Jekyll 처리 방지).
- 저장소 Settings → Pages → Branch: `main` / `/ (root)` 선택.
- 배포 후 `https://<user>.github.io/<repo>/` → `index.html`이 진입 페이지.

## 진행 상태
- [x] 1순위: 일반 청첩장 전체 (플레이스홀더 기반, 배포 가능)
- [x] 2순위: 로비 씬 HTML UI 오버레이 (이름·성별·커스텀·입장)
- [ ] 3순위: Unity WebGL ↔ jslib 연동 (다음 단계)
