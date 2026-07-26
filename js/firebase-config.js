// Firebase SDK Initialization & Helper Module

const firebaseConfig = {
  apiKey: "AIzaSyClOFJ5EHx2VgV4BVyLM2Id3TxUhz_HYvc",
  authDomain: "gugudan-adventure.firebaseapp.com",
  projectId: "gugudan-adventure",
  storageBucket: "gugudan-adventure.firebasestorage.app",
  messagingSenderId: "730563174250",
  appId: "1:730563174250:web:254e35c16ff9ffa05a8f13",
  measurementId: "G-9VQL5H51CQ"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isInitialized = false;
  }

  init() {
    if (typeof firebase !== 'undefined') {
      try {
        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(firebaseConfig);
        } else {
          this.app = firebase.app();
        }
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.isInitialized = true;
        console.log("🔥 Firebase Service initialized successfully for project gugudan-adventure!");
      } catch (e) {
        console.warn("Firebase init error. Operating in local fallback mode.", e);
        this.isInitialized = false;
      }
    } else {
      console.log("ℹ️ Operating in high-performance local mode!");
      this.isInitialized = false;
    }
  }

  async signInWithGoogle() {
    if (!this.isInitialized) {
      const name = prompt('구글 계정 닉네임을 입력하세요:', window.gameState.user.username || '구글학생');
      return {
        uid: 'local_google_' + Date.now(),
        displayName: name || '구글학생',
        isAnonymous: false
      };
    }

    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.auth.signInWithPopup(provider);
      return {
        uid: result.user.uid,
        displayName: result.user.displayName || '구글학생',
        isAnonymous: false
      };
    } catch (e) {
      console.error("Google sign in failed", e);
      alert("구글 로그인 실패: " + e.message);
      return null;
    }
  }

  async signInAnonymously() {
    if (!this.isInitialized) {
      return {
        uid: 'local_anon_' + Date.now(),
        displayName: '익명 도전자',
        isAnonymous: true
      };
    }

    try {
      const result = await this.auth.signInAnonymously();
      return {
        uid: result.user.uid,
        displayName: '익명 도전자',
        isAnonymous: true
      };
    } catch (e) {
      console.error("Anonymous sign in failed", e);
      return {
        uid: 'local_anon_' + Date.now(),
        displayName: '익명 도전자',
        isAnonymous: true
      };
    }
  }

  async saveUserToFirestore(uid, userData) {
    if (!this.isInitialized || !this.db) return;
    try {
      await this.db.collection('users').doc(uid).set(userData, { merge: true });
    } catch (e) {
      console.error("Firestore user save failed", e);
    }
  }

  async fetchTopRankings(category) {
    if (!this.isInitialized || !this.db) return null;
    try {
      const fieldMap = {
        totalGold: 'totalGold',
        game1Clears: 'clears.game1',
        game2Clears: 'clears.game2',
        game3Clears: 'clears.game3',
        bossTime: 'bestBossTime',
        weeklyProblems: 'weeklyProblemsSolved'
      };

      const field = fieldMap[category] || 'totalGold';
      const order = category === 'bossTime' ? 'asc' : 'desc';

      const snapshot = await this.db.collection('users')
        .where(field, '>', 0)
        .orderBy(field, order)
        .limit(10)
        .get();

      const list = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        let val = 0;
        if (category === 'totalGold') val = d.totalGold || 0;
        else if (category === 'game1Clears') val = d.clears?.game1 || 0;
        else if (category === 'game2Clears') val = d.clears?.game2 || 0;
        else if (category === 'game3Clears') val = d.clears?.game3 || 0;
        else if (category === 'bossTime') val = d.bestBossTime || 0;
        else if (category === 'weeklyProblems') val = d.weeklyProblemsSolved || 0;

        list.push({
          name: d.username || '학습자',
          score: val
        });
      });

      return list;
    } catch (e) {
      console.warn("Firestore fetch rankings fallback to local", e);
      return null;
    }
  }
}

window.firebaseService = new FirebaseService();
