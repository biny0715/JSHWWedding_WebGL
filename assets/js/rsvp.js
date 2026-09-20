// rsvp.js — 참석 여부 확인 모듈 (Firestore)
// 하객이 남기는 참석 의사(이름/신랑측·신부측/인원). guestbook.js·wreaths.js 와 같은 프로젝트(hwjswedding) 사용.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0PT7VDzovTPiYKOruK-yOhZjWz-zpIF8",
  authDomain: "hwjswedding.firebaseapp.com",
  projectId: "hwjswedding",
  storageBucket: "hwjswedding.firebasestorage.app",
  messagingSenderId: "592953144182",
  appId: "1:592953144182:web:221b5c449fa1b7eed0057",
};
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const COL = "rsvp";
const MAX_NAME = 30;

/** 참석 의사 등록. side = "groom" | "bride", count = 참석 인원(1~20). */
export async function addRsvp(name, side, count) {
  name = (name || "").trim();
  if (!name) throw new Error("이름을 입력해주세요.");
  if (name.length > MAX_NAME) name = name.slice(0, MAX_NAME);
  if (side !== "groom" && side !== "bride") throw new Error("신랑측/신부측을 선택해주세요.");
  count = Math.max(1, Math.min(20, parseInt(count, 10) || 1));
  await addDoc(collection(db, COL), { name, side, count, createdAt: serverTimestamp() });
}

/** 실시간 구독(작성순). cb(list) — list[i] = {id, name, side, count, at}. 반환값 = 구독 해제 함수. */
export function subscribeRsvps(cb) {
  return onSnapshot(
    query(collection(db, COL), orderBy("createdAt", "desc")),
    (snap) => {
      cb(snap.docs.map((d) => {
        const x = d.data();
        return {
          id: d.id, name: x.name || "", side: x.side || "", count: x.count || 1,
          at: x.createdAt && x.createdAt.toDate ? x.createdAt.toDate() : null,
        };
      }));
    },
    (err) => console.error("[rsvp] 구독 실패:", err)
  );
}

// 관리자 전용 — 로그인(인증)된 상태에서만 Firestore 규칙이 삭제를 허용 (guestbook·wreaths 와 동일 패턴).
export async function deleteRsvp(id) {
  await deleteDoc(doc(db, COL, id));
}
