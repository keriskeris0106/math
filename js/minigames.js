// 3 Mini-Games Engine (5 Gold per problem, Idle prevention, '미니게임 성공' modal)

class MiniGameEngine {
  constructor() {
    this.timer = null;
    this.timeLeft = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.currentGame = null;
    this.currentQuestion = null;
    this.selectedNum1 = null;
    this.selectedEl1 = null;
  }

  generateQuestion() {
    const a = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const b = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const ans = a * b;

    const choicesSet = new Set([ans]);
    while (choicesSet.size < 4) {
      let offset = (Math.floor(Math.random() * 5) - 2) * (Math.random() > 0.5 ? 1 : 2);
      if (offset === 0) offset = 1;
      let wrong = ans + offset;
      if (wrong > 1 && wrong <= 81 && wrong !== ans) {
        choicesSet.add(wrong);
      } else {
        choicesSet.add(Math.floor(Math.random() * 70) + 4);
      }
    }

    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);
    return { a, b, ans, choices };
  }

  // --- Mini-Game 1: 정답 맞히기 (25s) ---
  startGame1() {
    this.currentGame = 'game1';
    this.timeLeft = 25;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    this.renderGameContainer('미니게임 1: 구구단 정답 맞히기', 'A × B = ? 의 정답을 빠르게 선택하세요!');
    this.nextGame1Question();
    this.startTimer(25);
  }

  nextGame1Question() {
    this.currentQuestion = this.generateQuestion();
    const { a, b, choices } = this.currentQuestion;

    const gameArea = document.getElementById('mg-game-area');
    if (!gameArea) return;

    gameArea.innerHTML = `
      <div class="q-card">
        <div class="q-expression">${a} × ${b} = ?</div>
      </div>
      <div class="choices-grid">
        ${choices.map(c => `<button class="btn choice-btn" onclick="miniGameEngine.handleGame1Answer(${c}, this)">${c}</button>`).join('')}
      </div>
    `;
  }

  handleGame1Answer(val, btnEl) {
    if (this.timeLeft <= 0) return;

    if (val === this.currentQuestion.ans) {
      window.soundEngine.playCorrect();
      this.score += 1;
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.updateComboDisplay();
      btnEl.classList.add('correct');
      setTimeout(() => this.nextGame1Question(), 150);
    } else {
      window.soundEngine.playWrong();
      this.combo = 0;
      this.updateComboDisplay();
      btnEl.classList.add('wrong');
      setTimeout(() => btnEl.classList.remove('wrong'), 300);
    }
  }

  // --- Mini-Game 2: 빈칸 맞히기 (25s) ---
  startGame2() {
    this.currentGame = 'game2';
    this.timeLeft = 25;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;

    this.renderGameContainer('미니게임 2: 빈칸 맞히기', '? × B = C 또는 A × ? = C 의 빈칸을 맞히세요!');
    this.nextGame2Question();
    this.startTimer(25);
  }

  nextGame2Question() {
    const q = this.generateQuestion();
    const missingFirst = Math.random() > 0.5;
    const targetAns = missingFirst ? q.a : q.b;

    const choicesSet = new Set([targetAns]);
    while (choicesSet.size < 4) {
      const rand = Math.floor(Math.random() * 8) + 2;
      choicesSet.add(rand);
    }
    const choices = Array.from(choicesSet).sort(() => Math.random() - 0.5);

    this.currentQuestion = { ...q, missingFirst, targetAns };

    const gameArea = document.getElementById('mg-game-area');
    if (!gameArea) return;

    const expr = missingFirst ? `? × ${q.b} = ${q.ans}` : `${q.a} × ? = ${q.ans}`;

    gameArea.innerHTML = `
      <div class="q-card">
        <div class="q-expression">${expr}</div>
      </div>
      <div class="choices-grid">
        ${choices.map(c => `<button class="btn choice-btn" onclick="miniGameEngine.handleGame2Answer(${c}, this)">${c}</button>`).join('')}
      </div>
    `;
  }

  handleGame2Answer(val, btnEl) {
    if (this.timeLeft <= 0) return;

    if (val === this.currentQuestion.targetAns) {
      window.soundEngine.playCorrect();
      this.score += 1;
      this.combo += 1;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;
      this.updateComboDisplay();
      btnEl.classList.add('correct');
      setTimeout(() => this.nextGame2Question(), 150);
    } else {
      window.soundEngine.playWrong();
      this.combo = 0;
      this.updateComboDisplay();
      btnEl.classList.add('wrong');
      setTimeout(() => btnEl.classList.remove('wrong'), 300);
    }
  }

  // --- Mini-Game 3: 인수 조합 맞히기 (30s) ---
  startGame3() {
    this.currentGame = 'game3';
    this.timeLeft = 30;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.selectedNum1 = null;
    this.selectedEl1 = null;

    this.renderGameContainer('미니게임 3: 인수 조합 맞히기', '목표 숫자를 만드는 두 수(A × B)를 순서대로 클릭하세요!');
    this.nextGame3Question();
    this.startTimer(30);
  }

  nextGame3Question() {
    this.selectedNum1 = null;
    this.selectedEl1 = null;

    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const targetProduct = a * b;

    const numSet = new Set([a, b]);
    while (numSet.size < 6) {
      numSet.add(Math.floor(Math.random() * 8) + 2);
    }
    const numbers = Array.from(numSet).sort(() => Math.random() - 0.5);

    this.currentQuestion = { a, b, targetProduct, numbers };

    const gameArea = document.getElementById('mg-game-area');
    if (!gameArea) return;

    gameArea.innerHTML = `
      <div class="q-card">
        <div class="q-sub">목표 곱 (A × B)</div>
        <div class="q-expression target-badge">${targetProduct}</div>
        <div class="q-instruction">아래에서 곱했을 때 ${targetProduct}이(가) 되는 두 수를 선택하세요.</div>
      </div>
      <div class="factor-grid">
        ${numbers.map((n) => `<button class="btn factor-btn" data-num="${n}" onclick="miniGameEngine.handleFactorClick(${n}, this)">${n}</button>`).join('')}
      </div>
    `;
  }

  handleFactorClick(num, btnEl) {
    if (this.timeLeft <= 0) return;
    window.soundEngine.playClick();

    if (!this.selectedNum1) {
      this.selectedNum1 = num;
      this.selectedEl1 = btnEl;
      btnEl.classList.add('selected');
    } else if (this.selectedEl1 === btnEl) {
      btnEl.classList.remove('selected');
      this.selectedNum1 = null;
      this.selectedEl1 = null;
    } else {
      const product = this.selectedNum1 * num;
      if (product === this.currentQuestion.targetProduct) {
        window.soundEngine.playCorrect();
        this.score += 1;
        this.combo += 1;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;
        this.updateComboDisplay();

        btnEl.classList.add('correct');
        this.selectedEl1.classList.add('correct');

        setTimeout(() => this.nextGame3Question(), 200);
      } else {
        window.soundEngine.playWrong();
        this.combo = 0;
        this.updateComboDisplay();

        btnEl.classList.add('wrong');
        this.selectedEl1.classList.add('wrong');

        const prevEl = this.selectedEl1;
        setTimeout(() => {
          btnEl.classList.remove('wrong', 'selected');
          prevEl.classList.remove('wrong', 'selected');
        }, 350);

        this.selectedNum1 = null;
        this.selectedEl1 = null;
      }
    }
  }

  renderGameContainer(title, sub) {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="game-wrapper">
        <div class="game-header">
          <button class="btn secondary-btn" onclick="miniGameEngine.quitGame()">⬅️ 메인으로</button>
          <div class="game-titles">
            <h2>${title}</h2>
            <p>${sub}</p>
          </div>
          <div class="combo-badge" id="combo-badge">Combo x0</div>
        </div>

        <div class="timer-section">
          <div class="timer-label">⏰ 남은 시간: <span id="timer-text">${this.timeLeft}</span>초</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" id="timer-progress"></div>
          </div>
        </div>

        <div class="game-score-board">
          <span>맞힌 문제 수: <strong id="score-text" class="text-highlight">0</strong>개 (문제당 +5 🪙)</span>
        </div>

        <div id="mg-game-area" class="mg-area"></div>
      </div>
    `;
  }

  startTimer(seconds) {
    if (this.timer) clearInterval(this.timer);
    const totalTime = seconds;

    const timerText = document.getElementById('timer-text');
    const timerProgress = document.getElementById('timer-progress');
    const scoreText = document.getElementById('score-text');

    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      if (timerText) timerText.textContent = this.timeLeft;
      if (scoreText) scoreText.textContent = this.score;

      if (timerProgress) {
        const pct = (this.timeLeft / totalTime) * 100;
        timerProgress.style.width = `${pct}%`;
      }

      if (this.timeLeft <= 3 && this.timeLeft > 0) {
        window.soundEngine.playCountdown();
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.finishGame();
      }
    }, 1000);
  }

  updateComboDisplay() {
    const comboBadge = document.getElementById('combo-badge');
    if (comboBadge) {
      comboBadge.textContent = `Combo x${this.combo}`;
      if (this.combo > 1) {
        comboBadge.classList.add('active');
        comboBadge.style.transform = 'scale(1.2)';
        setTimeout(() => comboBadge.style.transform = 'scale(1)', 150);
      } else {
        comboBadge.classList.remove('active');
      }
    }
  }

  quitGame() {
    if (this.timer) clearInterval(this.timer);
    app.showScreen('lobby');
  }

  finishGame() {
    if (this.score <= 0) {
      // Idle / 0-score prevention: Do NOT grant clear or gold!
      window.soundEngine.playWrong();
      const mainView = document.getElementById('main-view');
      mainView.innerHTML = `
        <div class="modal-overlay">
          <div class="result-modal glass-card animate-pop">
            <h2>⏳ 시간 종료</h2>
            <p class="modal-subtitle">맞힌 문제가 없어 게임 성공으로 기록되지 않았습니다.</p>

            <div class="result-stats">
              <div class="stat-box">
                <span class="label">맞힌 문제 수</span>
                <span class="value">0개</span>
              </div>
              <div class="stat-box gold-box">
                <span class="label">획득한 골드</span>
                <span class="value">0 🪙</span>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn primary-btn" onclick="miniGameEngine.restartCurrentGame()">🔄 다시 도전하기</button>
              <button class="btn secondary-btn" onclick="app.showScreen('lobby')">🏠 메인 로비로</button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Success! 5 Gold per solved problem
    window.soundEngine.playVictory();
    const goldEarned = this.score * 5;
    window.gameState.recordMiniGameClear(this.currentGame, this.score, goldEarned);

    const mainView = document.getElementById('main-view');
    mainView.innerHTML = `
      <div class="modal-overlay">
        <div class="result-modal glass-card animate-pop">
          <h2>🎉 미니게임 성공!</h2>
          <p class="modal-subtitle">축하합니다! 구구단 실력이 향상되었습니다.</p>

          <div class="result-stats">
            <div class="stat-box">
              <span class="label">맞힌 문제 수</span>
              <span class="value">${this.score}개</span>
            </div>
            <div class="stat-box">
              <span class="label">최고 콤보</span>
              <span class="value">x${this.maxCombo}</span>
            </div>
            <div class="stat-box gold-box">
              <span class="label">획득한 골드</span>
              <span class="value">+${goldEarned} 🪙</span>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn primary-btn" onclick="miniGameEngine.restartCurrentGame()">🔄 다시하기</button>
            <button class="btn secondary-btn" onclick="app.showScreen('lobby')">🏠 메인 로비로</button>
            <button class="btn accent-btn" onclick="app.showScreen('halloffame')">🏆 명예의 전당 보기</button>
          </div>
        </div>
      </div>
    `;
  }

  restartCurrentGame() {
    if (this.currentGame === 'game1') this.startGame1();
    else if (this.currentGame === 'game2') this.startGame2();
    else if (this.currentGame === 'game3') this.startGame3();
  }
}

window.miniGameEngine = new MiniGameEngine();
