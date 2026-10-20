export const gameState = {
  playerName: "Desafiante",
  provider: "restcountries",
  playerHp: 100,
  maxPlayerHp: 100,
  apiHp: 100,
  maxApiHp: 100,
  score: 0,
  round: 1,
  maxRounds: 10,
  streak: 0,
  maxStreak: 0,
  correctAnswers: 0,
  totalAnswers: 0,
  timerSeconds: 15,
  currentTimer: 15,
  currentQuestion: null,
  status: "idle", // 'idle' | 'loading' | 'question' | 'evaluating' | 'gameover'
  timerInterval: null,

  reset(options = {}) {
    this.playerName = (options.playerName || "Desafiante").trim().slice(0, 15) || "Desafiante";
    this.provider = options.provider || "restcountries";
    this.playerHp = 100;
    this.maxPlayerHp = 100;
    this.apiHp = 100;
    this.maxApiHp = 100;
    this.score = 0;
    this.round = 1;
    this.maxRounds = options.maxRounds || 10;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctAnswers = 0;
    this.totalAnswers = 0;
    this.timerSeconds = options.timerSeconds || 15;
    this.currentTimer = this.timerSeconds;
    this.currentQuestion = null;
    this.status = "idle";
    this.clearTimer();
  },

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
};
