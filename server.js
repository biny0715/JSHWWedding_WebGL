// server.js
// Unity WebGL 비압축 빌드를 Brotli로 on-the-fly 서빙
// index.html 수정 없이 .data/.wasm/.js 요청을 .br 버전으로 자동 전환
// 실행: node server.js

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const root = __dirname;
const buildDir = path.join(root, "Build");

// Build 폴더 내 .data/.wasm/.framework.js 요청 → .br 버전 자동 서빙
app.get("/Build/:filename", (req, res, next) => {
  const filename = req.params.filename;

  // .br 이미 요청한 경우는 제외
  if (filename.endsWith(".br")) return next();

  const brPath = path.join(buildDir, filename + ".br");

  // .br 파일이 존재하면 압축 버전 서빙
  if (fs.existsSync(brPath)) {
    res.setHeader("Content-Encoding", "br");

    if (filename.endsWith(".js"))        res.type("application/javascript");
    else if (filename.endsWith(".wasm")) res.type("application/wasm");
    else if (filename.endsWith(".data")) res.type("application/octet-stream");
    else                                 res.type("application/octet-stream");

    res.sendFile(brPath);
    return;
  }

  next();
});

// 기존 .br 파일 직접 요청 처리 (레거시)
app.get(/\.br$/, (req, res, next) => {
  res.setHeader("Content-Encoding", "br");

  if (req.path.endsWith(".js.br"))   res.type("application/javascript");
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
