# 사진 넣는 곳

실제 웨딩 사진이 준비되면 이 폴더에 넣고, `assets/js/config.js` 의 경로만 바꾸면 됩니다.

## 예시
```js
// config.js
mainPhoto: { src: "assets/images/main.jpg", alt: "메인 웨딩 사진", ratio: "3 / 4" },
groomPhoto: { src: "assets/images/groom.jpg", ... },
bridePhoto: { src: "assets/images/bride.jpg", ... },
gallery: [
  { src: "assets/images/gallery-1.jpg", alt: "웨딩 사진 1", ratio: "3 / 4" },
  ...
],
```

`src` 가 비어있으면("") 회색 "웨딩 사진 자리" 플레이스홀더가 자동으로 표시됩니다.
사진을 넣으면 같은 자리에 사진이 들어갑니다 (HTML 수정 불필요).

## 권장 사항
- 비율: 세로 사진 권장 (3:4). config 의 `ratio` 로 자리 비율을 맞출 수 있습니다.
- 카카오톡 공유 썸네일: `assets/images/og.jpg` (1200×630 권장)
- 용량: 모바일 최적화를 위해 1장당 300KB 이하 권장
