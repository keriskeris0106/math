// Main Application Controller & Router (With Firebase Login Handlers)

class App {
  constructor() {
    this.currentScreen = 'login';
  }

  init() {
    if (!window.gameState.isLoggedIn) {
      this.renderLoginScreen();
    } else {
      this.showScreen('lobby');
    }
  }

  renderLoginScreen() {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="login-wrapper glass-card animate-pop">
        <div class="login-header">
          <div class="game-logo-icon">⚡</div>
          <h2>구구단 어드벤처</h2>
          <p>모드를 선택하여 구구단 학습 탐험을 시작하세요!</p>
        </div>

        <div class="login-options">
          <div class="login-option-card google-card" onclick="app.handleLogin('google')">
            <div class="opt-icon">🌐</div>
            <div class="opt-text">
              <h3>구글 로그인으로 시작</h3>
              <p>골드, 미니게임 성적, 명예의 전당 랭킹이 모두 <strong>Firebase DB에 누적 저장</strong>됩니다.</p>
            </div>
            <button class="btn primary-btn">구글 로그인 ▶</button>
          </div>

          <div class="login-option-card anon-card" onclick="app.handleLogin('anonymous')">
            <div class="opt-icon">👤</div>
            <div class="opt-text">
              <h3>익명으로 시작</h3>
              <p>일회성 플레이 모드입니다. 기록이 명예의 전당에 <strong>누적되지 않습니다</strong>.</p>
            </div>
            <button class="btn secondary-btn">익명 시작 ▶</button>
          </div>
        </div>
      </div>
    `;
  }

  async handleLogin(type) {
    if (type === 'google') {
      const success = await window.gameState.handleGoogleLogin();
      if (success) this.showScreen('lobby');
    } else {
      const success = await window.gameState.handleAnonymousLogin();
      if (success) this.showScreen('lobby');
    }
  }

  showScreen(screen, extraData) {
    if (!window.gameState.isLoggedIn && screen !== 'login') {
      this.renderLoginScreen();
      return;
    }

    this.currentScreen = screen;

    if (screen === 'lobby') {
      this.renderLobby();
    } else if (screen === 'minigame1') {
      window.miniGameEngine.startGame1();
    } else if (screen === 'minigame2') {
      window.miniGameEngine.startGame2();
    } else if (screen === 'minigame3') {
      window.miniGameEngine.startGame3();
    } else if (screen === 'boss') {
      window.bossEngine.tryEnterBossRaid();
    } else if (screen === 'halloffame') {
      window.hallOfFame.renderHallOfFame(extraData || 'totalGold');
    }
  }

  renderLobby() {
    const user = window.gameState.user;
    const title = window.gameState.getUserTitle();
    const mainView = document.getElementById('main-view');

    const anonBadge = window.gameState.isAnonymous 
      ? '<span class="login-status-badge anon-tag">👤 익명 모드 (기록 미저장)</span>' 
      : '<span class="login-status-badge google-tag">🌐 구글 연결됨</span>';

    mainView.innerHTML = `
      <div class="lobby-wrapper">
        <!-- Top App Bar -->
        <header class="app-header glass-card">
          <div class="user-profile-bar">
            <div class="avatar-icon">👑</div>
            <div class="user-details">
              <div class="username-row">
                <span class="username">${this.escapeHtml(user.username)}</span>
                ${!window.gameState.isAnonymous ? `<button class="btn icon-btn" title="닉네임 변경" onclick="app.showEditNameModal()">✏️</button>` : ''}
                ${anonBadge}
              </div>
              <div class="user-title-badge" onclick="app.showTitleInfoModal()" title="클릭하여 전체 칭호 및 조건 보기">
                ${title} <span class="info-icon">ℹ️</span>
              </div>
            </div>
          </div>

          <div class="header-resources">
            <div class="resource-pill gold-pill">
              <span class="pill-icon">🪙</span>
              <span class="pill-value">${user.currentGold.toLocaleString()} Gold</span>
            </div>
            <button class="btn sound-btn" id="sound-btn" onclick="app.toggleSound()">
              ${window.soundEngine.muted ? '🔇 음소거' : '🔊 효과음 ON'}
            </button>
            <button class="btn secondary-btn small-btn" onclick="location.reload()" title="로그인 모드 재선택">🚪 전환</button>
          </div>
        </header>

        <!-- Main Banner -->
        <div class="lobby-banner glass-card animate-fade">
          <h1>⚡ 구구단 어드벤처 ⚡</h1>
          <p>미니게임으로 구구단을 마스터하고, 모은 골드로 강력한 보스전에 도전하세요!</p>
        </div>

        <!-- Modes Grid -->
        <div class="modes-grid">
          <!-- Game 1 -->
          <div class="mode-card glass-card hover-glow" onclick="app.showScreen('minigame1')">
            <div class="mode-badge">25초 제한</div>
            <div class="mode-icon">🎯</div>
            <h3>미니게임 1: 정답 맞히기</h3>
            <p>A × B = ? 의 올바른 정답을 빠르게 선택하세요!</p>
            <div class="mode-stats">완주: ${user.clears.game1}회</div>
            <button class="btn card-play-btn">게임 시작 ▶</button>
          </div>

          <!-- Game 2 -->
          <div class="mode-card glass-card hover-glow" onclick="app.showScreen('minigame2')">
            <div class="mode-badge">25초 제한</div>
            <div class="mode-icon">🔍</div>
            <h3>미니게임 2: 빈칸 맞히기</h3>
            <p>? × B = C 또는 A × ? = C 의 빈칸을 맞히세요!</p>
            <div class="mode-stats">완주: ${user.clears.game2}회</div>
            <button class="btn card-play-btn">게임 시작 ▶</button>
          </div>

          <!-- Game 3 -->
          <div class="mode-card glass-card hover-glow" onclick="app.showScreen('minigame3')">
            <div class="mode-badge">30초 제한</div>
            <div class="mode-icon">🧩</div>
            <h3>미니게임 3: 인수 조합 맞히기</h3>
            <p>목표 곱(C)을 만드는 두 수(A × B)를 선택하세요!</p>
            <div class="mode-stats">완주: ${user.clears.game3}회</div>
            <button class="btn card-play-btn">게임 시작 ▶</button>
          </div>

          <!-- Boss Raid -->
          <div class="mode-card glass-card boss-card-theme boss-full-banner hover-glow" onclick="app.showScreen('boss')">
            <div class="boss-banner-content">
              <div class="boss-left">
                <div class="mode-badge boss-badge">입장료 100 Gold</div>
                <div class="boss-icon-anim">👹</div>
              </div>
              <div class="boss-info">
                <h3>⚔️ 전설의 구구단 마왕 보스전</h3>
                <p>10개 문제 연속 레이드! 틀려도 시간은 흘러가며, 정답을 맞혀야 다음 문제 진입!</p>
                <div class="mode-stats">나의 최고기록: ${user.bestBossTime ? user.bestBossTime + '초' : '도전 전'}</div>
              </div>
              <div class="boss-action">
                <button class="btn boss-play-btn">보스 레이드 도전 ⚔️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="lobby-bottom-bar">
          <button class="btn hof-btn glass-card hover-glow" onclick="app.showScreen('halloffame')">
            🏆 명예의 전당 (Top 10 랭킹 보기)
          </button>
        </div>
      </div>
    `;
  }

  showTitleInfoModal() {
    const titles = window.gameState.allTitles;
    const currentTitle = window.gameState.getUserTitle();

    const titleItemsHtml = titles.map((t, idx) => {
      const isUnlocked = currentTitle.includes(t.name.replace(/^[^\s]+\s/, ''));
      return `
        <div class="title-info-card ${isUnlocked ? 'active-title' : ''}">
          <div class="title-head">
            <span class="title-step">Step ${idx + 1}</span>
            <span class="title-name">${t.name}</span>
            ${isUnlocked ? '<span class="unlocked-badge">✓ 착용 중</span>' : ''}
          </div>
          <p class="title-desc">${t.desc}</p>
          <div class="title-condition">🎯 획득 조건: <strong>${t.condition}</strong></div>
        </div>
      `;
    }).join('');

    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal-overlay';
    modalDiv.id = 'title-modal';
    modalDiv.innerHTML = `
      <div class="result-modal glass-card animate-pop title-modal-card">
        <h3>🎖️ 전체 유저 칭호 & 획득 조건</h3>
        <p class="modal-subtitle">낮은 단계부터 최고 단계까지 도전해보세요!</p>

        <div class="title-list-container">
          ${titleItemsHtml}
        </div>

        <div class="modal-actions" style="margin-top: 20px;">
          <button class="btn primary-btn" onclick="app.closeModal('title-modal')">확인 및 닫기</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  toggleSound() {
    window.soundEngine.muted = !window.soundEngine.muted;
    const btn = document.getElementById('sound-btn');
    if (btn) {
      btn.textContent = window.soundEngine.muted ? '🔇 음소거' : '🔊 효과음 ON';
    }
    window.soundEngine.playClick();
  }

  showEditNameModal() {
    const currentName = window.gameState.user.username;
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal-overlay';
    modalDiv.id = 'name-modal';
    modalDiv.innerHTML = `
      <div class="result-modal glass-card animate-pop">
        <h3>✏️ 닉네임 변경</h3>
        <p class="modal-subtitle">명예의 전당에 등록될 닉네임을 입력해 주세요.</p>
        <input type="text" id="name-input" class="text-input" value="${this.escapeHtml(currentName)}" maxlength="10" placeholder="닉네임 (최대 10자)">
        <div class="modal-actions" style="margin-top: 20px;">
          <button class="btn primary-btn" onclick="app.saveNewName()">저장하기</button>
          <button class="btn secondary-btn" onclick="app.closeModal('name-modal')">취소</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  saveNewName() {
    const input = document.getElementById('name-input');
    if (input) {
      const val = input.value.trim();
      if (val) {
        window.gameState.user.username = val;
        window.gameState.saveUserData();
        this.closeModal('name-modal');
        this.renderLobby();
      }
    }
  }

  closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.remove();
  }

  escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

window.app = new App();

document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});
