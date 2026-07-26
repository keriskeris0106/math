// Hall of Fame (Leaderboard) Renderer with Firebase Firestore Realtime Query Support

class HallOfFame {
  constructor() {
    this.currentTab = 'totalGold';
  }

  async renderHallOfFame(tab = 'totalGold') {
    this.currentTab = tab;
    window.gameState.updateMyRankings();

    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="hof-wrapper">
        <div class="hof-header">
          <button class="btn secondary-btn" onclick="app.showScreen('lobby')">⬅️ 메인 로비로</button>
          <h2>🏆 명예의 전당 (Top 10)</h2>
          <p class="hof-sub">Firebase DB와 연동된 전 세계 구구단 도전자들의 실시간 랭킹입니다!</p>
        </div>

        <div class="hof-tabs">
          <button class="tab-btn ${tab === 'totalGold' ? 'active' : ''}" onclick="hallOfFame.renderHallOfFame('totalGold')">💰 총 누적 골드</button>
          <button class="tab-btn ${tab === 'game1Clears' ? 'active' : ''}" onclick="hallOfFame.renderHallOfFame('game1Clears')">🎮 게임 1 클리어</button>
          <button class="tab-btn ${tab === 'game2Clears' ? 'active' : ''}" onclick="hallOfFame.renderHallOfFame('game2Clears')">🎮 게임 2 클리어</button>
          <button class="tab-btn ${tab === 'game3Clears' ? 'active' : ''}" onclick="hallOfFame.renderHallOfFame('game3Clears')">🎮 게임 3 클리어</button>
          <button class="tab-btn ${tab === 'bossTime' ? 'active' : ''}" onclick="hallOfFame.renderHallOfFame('bossTime')">⏱️ 보스 타임</button>
          <button class="tab-btn ${tab === 'weeklyProblems' ? 'active' : ''}" onclick="hallOfFame.renderHallOfFame('weeklyProblems')">📅 주간 성실왕</button>
        </div>

        <div class="hof-content glass-card">
          ${this.getTabDescription(tab)}
          <div class="ranking-table-container" id="ranking-container">
            ${await this.renderRankingTable(tab)}
          </div>
        </div>
      </div>
    `;
  }

  getTabDescription(tab) {
    const descs = {
      totalGold: '<div class="tab-info">💰 <strong>총 누적 골드 랭킹</strong>: 보스전 입장에 골드를 사용하여도 차감되지 않는 지금까지 모은 총 골드입니다.</div>',
      game1Clears: '<div class="tab-info">🎮 <strong>미니게임 1(정답 맞히기) 클리어 수</strong>: 25초 완주 횟수 기준 랭킹입니다.</div>',
      game2Clears: '<div class="tab-info">🎮 <strong>미니게임 2(빈칸 맞히기) 클리어 수</strong>: 25초 완주 횟수 기준 랭킹입니다.</div>',
      game3Clears: '<div class="tab-info">🎮 <strong>미니게임 3(인수 조합) 클리어 수</strong>: 30초 완주 횟수 기준 랭킹입니다.</div>',
      bossTime: '<div class="tab-info">⏱️ <strong>보스 클리어 타임 랭킹</strong>: 보스전 10문제를 가장 빠른 시간 내에 통과한 시간 기록입니다.</div>',
      weeklyProblems: '<div class="tab-info">📅 <strong>주간 성실왕 (이번 주 푼 문제 수)</strong>: 이번 주에 미니게임과 보스전에서 푼 총 문제 수입니다. (매주 월요일 리셋)</div>'
    };
    return descs[tab] || '';
  }

  async renderRankingTable(tab) {
    // Try fetching from Firebase Firestore DB
    let list = await window.firebaseService.fetchTopRankings(tab);
    
    // Fallback to local rankings if Firestore is not configured or returns null
    if (!list) {
      list = window.gameState.rankings[tab] || [];
    }

    const myName = window.gameState.user.username;

    const formatScore = (val) => {
      if (tab === 'totalGold') return `${val.toLocaleString()} 🪙`;
      if (tab === 'bossTime') return `${val}초`;
      if (tab === 'weeklyProblems') return `${val}문제`;
      return `${val}회 완주`;
    };

    const myIndex = list.findIndex(item => item.name === myName);
    const myRank = myIndex >= 0 ? myIndex + 1 : list.length + 1;
    const top10 = list.slice(0, 10);

    let rowsHtml = top10.map((item, idx) => {
      const rankNum = idx + 1;
      let badge = `${rankNum}위`;
      if (rankNum === 1) badge = '🥇 1위';
      else if (rankNum === 2) badge = '🥈 2위';
      else if (rankNum === 3) badge = '🥉 3위';

      const isMe = item.name === myName;
      const meClass = isMe ? 'my-row' : '';

      return `
        <tr class="${meClass}">
          <td class="rank-col">${badge}</td>
          <td class="name-col">${this.escapeHtml(item.name)} ${isMe ? '<span class="me-tag">(나)</span>' : ''}</td>
          <td class="score-col">${formatScore(item.score)}</td>
        </tr>
      `;
    }).join('');

    if (top10.length === 0) {
      rowsHtml = `<tr><td colspan="3" class="empty-msg">아직 등록된 랭킹 기록이 없습니다. 도전에 참여해 보세요!</td></tr>`;
    }

    let myRowBottomHtml = '';
    if (myRank > 10) {
      let myScoreVal = 0;
      if (tab === 'totalGold') myScoreVal = window.gameState.user.totalGold;
      else if (tab === 'game1Clears') myScoreVal = window.gameState.user.clears.game1;
      else if (tab === 'game2Clears') myScoreVal = window.gameState.user.clears.game2;
      else if (tab === 'game3Clears') myScoreVal = window.gameState.user.clears.game3;
      else if (tab === 'bossTime') myScoreVal = window.gameState.user.bestBossTime || '기록 없음';
      else if (tab === 'weeklyProblems') myScoreVal = window.gameState.user.weeklyProblemsSolved;

      const formattedVal = typeof myScoreVal === 'number' ? formatScore(myScoreVal) : myScoreVal;

      myRowBottomHtml = `
        <div class="my-rank-divider"></div>
        <div class="my-rank-bar">
          <span class="my-rank-badge">📍 나의 순위: <strong>${myRank}위</strong></span>
          <span class="my-rank-name">${this.escapeHtml(myName)} (나)</span>
          <span class="my-rank-score">${formattedVal}</span>
        </div>
      `;
    }

    return `
      <table class="ranking-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>닉네임</th>
            <th>기록</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
      ${myRowBottomHtml}
    `;
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.hallOfFame = new HallOfFame();
