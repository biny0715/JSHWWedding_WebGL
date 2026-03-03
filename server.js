// server.js
// Unity WebGL Brotli(.br) 파일을 올바른 헤더(Content-Encoding: br)로 서빙
// 실행: (이 폴더에서) npm i express  /  node server.js

const express = require("express");
const path = require("path");

const app = express();
const root = __dirname; // ✅ index.html이 있는 WebGL 빌드 폴더(=현재 폴더)

app.get(/\.br$/, (req, res, next) => {
  res.setHeader("Content-Encoding", "br");

  // Content-Type 보정
  if (req.path.endsWith(".js.br")) res.type("application/javascript");
  else if (req.path.endsWith(".wasm.br")) res.type("application/wasm");
  else if (req.path.endsWith(".data.br")) res.type("application/octet-stream");
  else res.type("application/octet-stream");

  next();
});

// 정적 파일 서빙
app.use(express.static(root, { etag: false, maxAge: 0 }));

const port = process.env.PORT || 8080;
const host = "0.0.0.0";
app.listen(port, host, () => {
  console.log(`Open on this Mac:  http://localhost:${port}`);
  console.log(`Open on iPhone:   http://192.168.219.102:${port}`);
});