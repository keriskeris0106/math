# ⚡ 구구단 어드벤처 (Gugudan Adventure)

구구단을 재미있게 익힐 수 있는 3가지 미니게임, 10문제 보스 레이드전, 골드 시스템 및 Firebase 실시간 명예의 전당 랭킹 웹 게임입니다.

---

## 🌟 주요 기능

1. **3가지 미니게임 (20~30초 제한)**:
   - **미니게임 1: 정답 맞히기** ($A \times B = ?$)
   - **미니게임 2: 빈칸 맞히기** ($? \times B = C$ / $A \times ? = C$)
   - **미니게임 3: 인수 조합 맞히기** (목표 $C \rightarrow A \times B$ 선택)
   - *맞힌 문제 1개당 5 Gold 획득 (0문제 방치 시 클리어 불가)*

2. **👹 보스전 레이드 (10문제)**:
   - 입장료 100 Gold 소모
   - 10문제 연속 레이드 (틀려도 시간은 계속 흐르며 정답을 맞혀야 다음 문제 진입)
   - 정답 시 보스 HP 10% 감소 및 타격 연출 + 타격 효과음

3. **🏆 Firebase 실시간 명예의 전당 (Top 10)**:
   - 💰 총 누적 골드 랭킹
   - 🎮 미니게임 1, 2, 3 각각 완주 횟수 랭킹
   - ⏱️ 보스 최고 속도 클리어 타임 랭킹
   - 📅 주간 성실왕 (이번 주 푼 문제 수) 랭킹
   - 📍 11위 이하 사용자를 위한 하단 [내 순위: N위] 바 제공

4. **🌐 구글 & 익명 로그인 지원**:
   - 구글 로그인: Firestore DB와 연동되어 데이터 지속 누적
   - 익명 로그인: 일회성 체험 세션 (랭킹 데이터 미누적)

5. **🎨 눈이 편안한 아이보리 테마 & 오디오 FX**:
   - 파스텔 아이보리 배경 (`#fdfbf7`) & 100% 가로 대형 보스 배너
   - Web Audio API 기반 레트로 효과음 지원

---

## 🔥 Firebase 설정 가이드

`js/firebase-config.js` 파일의 `firebaseConfig` 객체에 본인의 Firebase 프로젝트 키를 입력해 주세요.

```javascript
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

1. [Firebase Console](https://console.firebase.google.com/) 접속 후 새 프로젝트 생성.
2. **Authentication** 설정: 구글(Google) 로그인 및 익명(Anonymous) 로그인 활성화.
3. **Firestore Database** 생성: 데이터베이스 생성 후 규칙(Rules)을 `allow read, write: if true;` 로 설정.

---

## 🚀 Vercel 배포 방법

1. GitHub 저장소 `https://github.com/keriskeris0106/math.git` 연결.
2. [Vercel Console](https://vercel.com/) 접속 후 `Add New Project` 클릭.
3. `math` 저장소를 임포트(Import)하고 **Deploy** 버튼 클릭하면 1분 안에 배포 완료!
