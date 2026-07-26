// Boss Raid Battle Engine (With Insufficient Gold Custom Modal)

class BossEngine {
  constructor() {
    this.bossMaxHp = 10;
    this.currentHp = 10;
    this.questionIndex = 0;
    this.startTime = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.currentQuestion = null;
    this.ENTRY_FEE = 100;
  }

  tryEnterBossRaid() {
    const user = window.gameState.user;
    if (user.currentGold < this.ENTRY_FEE) {
      window.soundEngine.playWrong();
      this.showInsufficientGoldModal(user.currentGold);
      return;
    }

    if (confirm(`👹 보스 던전에 도전하시겠습니까?\n입장료 ${this.ENTRY_FEE} 골드가 차감됩니다.`)) {
      window.gameState.deductGold(this.ENTRY_FEE);
      this.startBossRaid();
    }
  }

  showInsufficientGoldModal(currentGold) {
    const mainView = document.getElementById('main-view');
    const modalDiv = document.createElement('div');
    modalDiv.className = 'modal-overlay';
    modalDiv.id = 'insufficient-gold-modal';
    modalDiv.innerHTML = `
      <div class="result-modal glass-card animate-pop border-forbidden">
        <div class="forbidden-icon">🛑</div>
        <h3 class="forbidden-title">보스전 입장 금지!</h3>
        <p class="modal-subtitle">골드가 부족하여 구구단 마왕에 도전할 수 없습니다.</p>

        <div class="result-stats">
          <div class="stat-box">
            <span class="label">필요 골드</span>
            <span class="value">${this.ENTRY_FEE} 🪙</span>
          </div>
          <div class="stat-box gold-box">
            <span class="label">현재 보유 골드</span>
            <span class="value">${currentGold} 🪙</span>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn primary-btn" onclick="app.closeModal('insufficient-gold-modal'); app.showScreen('minigame1');">🎮 미니게임 1 하고 골드 모으기</button>
          <button class="btn secondary-btn" onclick="app.closeModal('insufficient-gold-modal'); app.showScreen('lobby');">🏠 로비로 돌아가기</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalDiv);
  }

  startBossRaid() {
    this.currentHp = 10;
    this.questionIndex = 0;
    this.startTime = Date.now();
    this.elapsedSeconds = 0;

    this.renderBossScreen();
    this.startTimer();
    this.loadQuestion();
  }

  renderBossScreen() {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="boss-wrapper">
        <div class="boss-header">
          <button class="btn secondary-btn" onclick="bossEngine.quitBossRaid()">⬅️ 포기하고 나가기</button>
          <h2>👹 전설의 구구단 마왕 보스전</h2>
          <div class="timer-badge">⏱️ <span id="boss-timer">0.00</span>초</div>
        </div>

        <div class="boss-stage">
          <div class="boss-avatar-card" id="boss-card">
            <div class="boss-emoji" id="boss-emoji">👹</div>
            <div class="boss-name">구구단 마왕 (HP <span id="hp-count">10</span>/10)</div>
            <div class="hp-bar-bg">
              <div class="hp-bar-fill" id="hp-fill" style="width: 100%;"></div>
            </div>
          </div>
        </div>

        <div class="boss-quiz-section">
          <div class="boss-q-progress">문제 <span id="q-num" class="text-highlight">1</span> / 10</div>
          <div id="boss-q-area" class="boss-q-area"></div>
        </div>
      </div>
    `;
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const timerEl = document.getElementById('boss-timer');

    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = (Date.now() - this.startTime) / 1000;
      if (timerEl) {
        timerEl.textContent = this.elapsedSeconds.toFixed(2);
      }
    }, 30);
  }

  generateBossQuestion() {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const ans = a * b;

    const choicesSet = new Set([ans]);
    while (choicesSet.size < 4) {
      let wrong = ans + (Math.floor(Math.random() * 7) - 3);
      if (wrong > 1 && wrong <= 81 && wrong !== ans) {
        choicesSet.add(wrong);
      } else {
        choicesSet.add(Math.floor(Math.random() * 70) + 4);
      }
    }
    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    return { a, b, ans, choices };
  }

  loadQuestion() {
    this.currentQuestion = this.generateBossQuestion();
    const { a, b, choices } = this.currentQuestion;

    const qNumEl = document.getElementById('q-num');
    if (qNumEl) qNumEl.textContent = this.questionIndex + 1;

    const qArea = document.getElementById('boss-q-area');
    if (!qArea) return;

    qArea.innerHTML = `
      <div class="boss-q-card">
        <div class="boss-q-text">${a} × ${b} = ?</div>
      </div>
      <div class="choices-grid">
        ${choices.map(c => `<button class="btn choice-btn boss-choice" onclick="bossEngine.handleBossAnswer(${c}, this)">${c}</button>`).join('')}
      </div>
    `;
  }

  handleBossAnswer(selectedVal, btnEl) {
    if (selectedVal === this.currentQuestion.ans) {
      window.soundEngine.playBossHit();
      btnEl.classList.add('correct');

      this.currentHp -= 1;
      this.updateHpBar();
      this.triggerBossHitAnimation();

      this.questionIndex += 1;

      if (this.questionIndex >= 10) {
        clearInterval(this.timerInterval);
        setTimeout(() => this.finishBossRaid(), 400);
      } else {
        setTimeout(() => this.loadQuestion(), 250);
      }
    } else {
      window.soundEngine.playWrong();
      btnEl.classList.add('wrong');
      setTimeout(() => btnEl.classList.remove('wrong'), 350);
    }
  }

  updateHpBar() {
    const hpCount = document.getElementById('hp-count');
    const hpFill = document.getElementById('hp-fill');
    if (hpCount) hpCount.textContent = this.currentHp;
    if (hpFill) {
      const pct = (this.currentHp / 10) * 100;
      hpFill.style.width = `${pct}%`;
    }
  }

  triggerBossHitAnimation() {
    const bossCard = document.getElementById('boss-card');
    const bossEmoji = document.getElementById('boss-emoji');

    if (bossCard) {
      bossCard.classList.add('hit-shake');
      setTimeout(() => bossCard.classList.remove('hit-shake'), 300);
    }

    if (bossEmoji) {
      bossEmoji.textContent = '💥';
      setTimeout(() => {
        if (this.currentHp <= 0) bossEmoji.textContent = '😵';
        else bossEmoji.textContent = '👹';
      }, 300);
    }
  }

  quitBossRaid() {
    if (confirm('보스전을 중단하고 나가시겠습니까? 진행 기록은 저장되지 않습니다.')) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      app.showScreen('lobby');
    }
  }

  finishBossRaid() {
    window.soundEngine.playVictory();
    const finalTime = parseFloat(this.elapsedSeconds.toFixed(2));

    window.gameState.recordBossClear(finalTime, 10);

    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="modal-overlay">
        <div class="result-modal glass-card animate-pop">
          <h2>⚔️ 보스 퇴치 성공!</h2>
          <p class="modal-subtitle">구구단 마왕을 물리쳤습니다!</p>

          <div class="result-stats">
            <div class="stat-box time-box">
              <span class="label">보스 클리어 타임</span>
              <span class="value">${finalTime}초</span>
            </div>
            <div class="stat-box">
              <span class="label">최고 기록</span>
              <span class="value">${window.gameState.user.bestBossTime}초</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn primary-btn" onclick="bossEngine.tryEnterBossRaid()">🔄 다시 도전하기</button>
            <button class="btn secondary-btn" onclick="app.showScreen('lobby')">🏠 메인 로비로</button>
            <button class="btn accent-btn" onclick="app.showScreen('halloffame')">🏆 명예의 전당 보기</button>
          </div>
        </div>
      </div>
    `;
  }
}

window.bossEngine = new BossEngine();
