// Firebase SDK Initialization & Helper Module

// NOTE: Replace the values below with your Firebase Project Configuration from Firebase Console
// https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isInitialized = false;
  }

  init() {
    // Check if Firebase JS SDK is loaded and API key is configured
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
      try {
        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(firebaseConfig);
        } else {
          this.app = firebase.app();
        }
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.isInitialized = true;
        console.log("🔥 Firebase Service initialized successfully!");
      } catch (e) {
        console.warn("Firebase init error. Operating in local fallback mode.", e);
        this.isInitialized = false;
      }
    } else {
      console.log("ℹ️ Firebase API key is template/placeholder. Operating in high-performance local mode!");
      this.isInitialized = false;
    }
  }

  async signInWithGoogle() {
    if (!this.isInitialized) {
      // Local fallback simulation for Google login
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

  // Save user document to Firestore
  async saveUserToFirestore(uid, userData) {
    if (!this.isInitialized || !this.db) return;
    try {
      await this.db.collection('users').doc(uid).set(userData, { merge: true });
    } catch (e) {
      console.error("Firestore user save failed", e);
    }
  }

  // Fetch real-time leaderboard top 10 from Firestore
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
