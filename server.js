// server.js
// Unity WebGL 압축 빌드(.gz / .br)를 올바른 헤더로 서빙
// index.html 수정 없이 .data/.wasm/.js 요청을 압축 버전으로 자동 전환
// 실행: node server.js

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const root = __dirname;
const buildDir = path.join(root, "Build");

function getContentType(filename) {
  if (filename.endsWith(".js"))   return "application/javascript";
  if (filename.endsWith(".wasm")) return "application/wasm";
  if (filename.endsWith(".data")) return "application/octet-stream";
  return "application/octet-stream";
}

// Build 폴더 내 요청 → .gz 또는 .br 압축 버전 자동 서빙
app.get("/Build/:filename", (req, res, next) => {
  const filename = req.params.filename;

  // 이미 압축 파일 직접 요청 시 패스
  if (filename.endsWith(".gz") || filename.endsWith(".br")) return next();

  const gzPath = path.join(buildDir, filename + ".gz");
  const brPath = path.join(buildDir, filename + ".br");

  if (fs.existsSync(gzPath)) {
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Type", getContentType(filename));
    res.sendFile(gzPath);
    return;
  }

  if (fs.existsSync(brPath)) {
    res.setHeader("Content-Encoding", "br");
    res.setHeader("Content-Type", getContentType(filename));
    res.sendFile(brPath);
    return;
  }

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
