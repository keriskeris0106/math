// Game State & Leaderboard Management Engine (With Firebase Firestore Sync & Fallback)

class GameState {
  constructor() {
    this.STORAGE_KEY_USER = 'gugudan_user_data_v1';
    this.STORAGE_KEY_RANKINGS = 'gugudan_rankings_data_v1';

    this.isAnonymous = false;
    this.isLoggedIn = false;
    this.loginType = null;
    this.firebaseUser = null;

    this.allTitles = [
      { name: '🌱 구구단 도전자', desc: '게임에 처음 입장한 신입 도전자', condition: '기본 부여' },
      { name: '🎮 미니게임 챔피언', desc: '미니게임을 30회 이상 완주한 부지런한 도전자', condition: '미니게임 총 30회 완주' },
      { name: '🔥 이번 주 성실왕', desc: '이번 주에 문제를 200개 이상 푼 열정 유저', condition: '주간 푼 문제 수 200개 이상' },
      { name: '💰 억만장자 수재', desc: '총 누적 1,000 골드 이상 모은 대표 부자 유저', condition: '총 누적 획득 골드 1,000 이상' },
      { name: '⚡ 구구단 마스터', desc: '보스전 10문제를 12초 이하로 무찌른 구구단 최고수', condition: '보스전 클리어 타임 12초 이하' }
    ];

    this.user = this.loadUserData();
    this.rankings = this.loadRankings();
    this.checkWeeklyReset();
  }

  async handleGoogleLogin() {
    window.firebaseService.init();
    const fbUser = await window.firebaseService.signInWithGoogle();
    if (!fbUser) return false;

    this.loginType = 'google';
    this.isLoggedIn = true;
    this.isAnonymous = false;
    this.firebaseUser = fbUser;

    this.user.username = fbUser.displayName || '구글학생';
    this.saveUserData();
    return true;
  }

  async handleAnonymousLogin() {
    window.firebaseService.init();
    const fbUser = await window.firebaseService.signInAnonymously();

    this.loginType = 'anonymous';
    this.isLoggedIn = true;
    this.isAnonymous = true;
    this.firebaseUser = fbUser;

    this.user = {
      username: '익명 도전자',
      currentGold: 50,
      totalGold: 50,
      clears: { game1: 0, game2: 0, game3: 0 },
      weeklyProblemsSolved: 0,
      weeklyResetTime: this.getWeekStartTimestamp(),
      bestBossTime: null
    };
    return true;
  }

  getDefaultUser() {
    return {
      username: '열정도전자',
      currentGold: 50,
      totalGold: 50,
      clears: { game1: 0, game2: 0, game3: 0 },
      weeklyProblemsSolved: 0,
      weeklyResetTime: this.getWeekStartTimestamp(),
      bestBossTime: null
    };
  }

  getWeekStartTimestamp() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday.getTime();
  }

  checkWeeklyReset() {
    const currentWeekStart = this.getWeekStartTimestamp();
    if (!this.user.weeklyResetTime || this.user.weeklyResetTime < currentWeekStart) {
      this.user.weeklyProblemsSolved = 0;
      this.user.weeklyResetTime = currentWeekStart;
      if (!this.isAnonymous) this.saveUserData();
    }
  }

  loadUserData() {
    const data = localStorage.getItem(this.STORAGE_KEY_USER);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return { ...this.getDefaultUser(), ...parsed };
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    return this.getDefaultUser();
  }

  saveUserData() {
    if (this.isAnonymous) return;
    localStorage.setItem(this.STORAGE_KEY_USER, JSON.stringify(this.user));
    this.updateMyRankings();

    // Sync user data to Firebase Firestore DB if logged in with Google
    if (this.firebaseUser && this.firebaseUser.uid) {
      window.firebaseService.saveUserToFirestore(this.firebaseUser.uid, this.user);
    }
  }

  getDefaultRankings() {
    return {
      totalGold: [
        { name: '구구단킹', score: 1850 },
        { name: '연산마스터', score: 1420 },
        { name: '빛의스피드', score: 1200 },
        { name: '수학요정', score: 980 },
        { name: '번개전사', score: 850 },
        { name: '열정왕', score: 720 },
        { name: '보스슬레이어', score: 650 },
        { name: '숫자술사', score: 540 },
        { name: '꿈나무', score: 430 },
        { name: '초음속이', score: 320 }
      ],
      game1Clears: [
        { name: '빛의스피드', score: 45 },
        { name: '구구단킹', score: 38 },
        { name: '연산마스터', score: 32 },
        { name: '초음속이', score: 28 },
        { name: '열정왕', score: 25 },
        { name: '수학요정', score: 20 },
        { name: '숫자술사', score: 18 },
        { name: '꿈나무', score: 14 },
        { name: '도전자A', score: 10 },
        { name: '도전자B', score: 8 }
      ],
      game2Clears: [
        { name: '연산마스터', score: 42 },
        { name: '구구단킹', score: 36 },
        { name: '수학요정', score: 30 },
        { name: '번개전사', score: 24 },
        { name: '열정왕', score: 21 },
        { name: '보스슬레이어', score: 19 },
        { name: '빛의스피드', score: 15 },
        { name: '숫자술사', score: 12 },
        { name: '꿈나무', score: 9 },
        { name: '도전자C', score: 7 }
      ],
      game3Clears: [
        { name: '수학요정', score: 40 },
        { name: '연산마스터', score: 35 },
        { name: '구구단킹', score: 31 },
        { name: '숫자술사', score: 27 },
        { name: '보스슬레이어', score: 22 },
        { name: '빛의스피드', score: 18 },
        { name: '번개전사', score: 16 },
        { name: '열정왕', score: 13 },
        { name: '꿈나무', score: 11 },
        { name: '도전자D', score: 6 }
      ],
      bossTime: [
        { name: '보스슬레이어', score: 8.42 },
        { name: '빛의스피드', score: 9.15 },
        { name: '구구단킹', score: 10.38 },
        { name: '연산마스터', score: 11.60 },
        { name: '번개전사', score: 12.85 },
        { name: '수학요정', score: 13.90 },
        { name: '초음속이', score: 15.24 },
        { name: '열정왕', score: 17.50 },
        { name: '숫자술사', score: 19.82 },
        { name: '꿈나무', score: 22.10 }
      ],
      weeklyProblems: [
        { name: '열정왕', score: 380 },
        { name: '구구단킹', score: 340 },
        { name: '연산마스터', score: 310 },
        { name: '수학요정', score: 280 },
        { name: '빛의스피드', score: 250 },
        { name: '번개전사', score: 220 },
        { name: '보스슬레이어', score: 190 },
        { name: '숫자술사', score: 160 },
        { name: '초음속이', score: 130 },
        { name: '꿈나무', score: 100 }
      ]
    };
  }

  loadRankings() {
    const data = localStorage.getItem(this.STORAGE_KEY_RANKINGS);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return { ...this.getDefaultRankings(), ...parsed };
      } catch (e) {
        console.error("Failed to parse rankings data", e);
      }
    }
    const defaults = this.getDefaultRankings();
    localStorage.setItem(this.STORAGE_KEY_RANKINGS, JSON.stringify(defaults));
    return defaults;
  }

  saveRankings() {
    if (this.isAnonymous) return;
    localStorage.setItem(this.STORAGE_KEY_RANKINGS, JSON.stringify(this.rankings));
  }

  updateMyRankings() {
    if (this.isAnonymous) return;
    const name = this.user.username || '열정도전자';

    this.upsertRanking('totalGold', name, this.user.totalGold, (a, b) => b.score - a.score);
    this.upsertRanking('game1Clears', name, this.user.clears.game1, (a, b) => b.score - a.score);
    this.upsertRanking('game2Clears', name, this.user.clears.game2, (a, b) => b.score - a.score);
    this.upsertRanking('game3Clears', name, this.user.clears.game3, (a, b) => b.score - a.score);
    this.upsertRanking('weeklyProblems', name, this.user.weeklyProblemsSolved, (a, b) => b.score - a.score);

    if (this.user.bestBossTime !== null && this.user.bestBossTime > 0) {
      this.upsertRanking('bossTime', name, this.user.bestBossTime, (a, b) => a.score - b.score);
    }

    this.saveRankings();
  }

  upsertRanking(category, name, score, sortFn) {
    if (!this.rankings[category]) this.rankings[category] = [];
    const list = this.rankings[category];
    const existingIdx = list.findIndex(item => item.name === name);

    if (existingIdx >= 0) {
      if (category === 'bossTime') {
        if (score < list[existingIdx].score) list[existingIdx].score = score;
      } else {
        if (score > list[existingIdx].score) list[existingIdx].score = score;
      }
    } else {
      if (score > 0) {
        list.push({ name, score });
      }
    }

    list.sort(sortFn);
  }

  addGold(amount) {
    this.user.currentGold += amount;
    this.user.totalGold += amount;
    this.saveUserData();
  }

  deductGold(amount) {
    if (this.user.currentGold >= amount) {
      this.user.currentGold -= amount;
      this.saveUserData();
      return true;
    }
    return false;
  }

  recordMiniGameClear(gameType, problemsSolvedInCycle, goldEarned) {
    if (this.user.clears[gameType] !== undefined) {
      this.user.clears[gameType] += 1;
    }
    this.user.weeklyProblemsSolved += problemsSolvedInCycle;
    this.addGold(goldEarned);
  }

  recordBossClear(timeTakenSeconds, problemsSolved = 10) {
    this.user.weeklyProblemsSolved += problemsSolved;
    if (this.user.bestBossTime === null || timeTakenSeconds < this.user.bestBossTime) {
      this.user.bestBossTime = parseFloat(timeTakenSeconds.toFixed(2));
    }
    this.saveUserData();
  }

  getUserTitle() {
    if (this.user.bestBossTime && this.user.bestBossTime <= 12) return '⚡ 구구단 마스터';
    if (this.user.totalGold >= 1000) return '💰 억만장자 수재';
    if (this.user.weeklyProblemsSolved >= 200) return '🔥 이번 주 성실왕';
    if (this.user.clears.game1 + this.user.clears.game2 + this.user.clears.game3 >= 30) return '🎮 미니게임 챔피언';
    return '🌱 구구단 도전자';
  }
}

window.gameState = new GameState();
