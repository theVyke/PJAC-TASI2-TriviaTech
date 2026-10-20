import { gameState } from "./gameState.js";
import { rankingStorage } from "../storage/rankingStorage.js";

export const gameEngine = {
  // Retorna multiplicador de streak
  getStreakMultiplier(streak) {
    if (streak >= 5) return 2.0;
    if (streak >= 3) return 1.5;
    if (streak >= 2) return 1.25;
    return 1.0;
  },

  // Avalia a resposta escolhida
  evaluateAnswer(selectedAnswer) {
    if (!gameState.currentQuestion) return null;

    gameState.clearTimer();
    gameState.totalAnswers += 1;

    const isCorrect = selectedAnswer === gameState.currentQuestion.correctAnswer;
    let damageDealt = 0;
    let damageReceived = 0;
    let pointsGained = 0;

    if (isCorrect) {
      gameState.correctAnswers += 1;
      gameState.streak += 1;
      if (gameState.streak > gameState.maxStreak) {
        gameState.maxStreak = gameState.streak;
      }

      const multiplier = this.getStreakMultiplier(gameState.streak);
      
      // Bônus de velocidade proporcional ao tempo restante (se houver cronômetro ativado)
      const timeBonusRatio = gameState.timerSeconds > 0 ? (gameState.currentTimer / gameState.timerSeconds) : 0.5;
      const timeBonus = Math.round(50 * timeBonusRatio);
      
      pointsGained = Math.round(100 * multiplier) + timeBonus;
      gameState.score += pointsGained;

      // Dano à API: 25 base + bônus de combo
      damageDealt = Math.min(gameState.apiHp, Math.round(20 * multiplier));
      gameState.apiHp = Math.max(0, gameState.apiHp - damageDealt);
    } else {
      // Errou: zera o streak e a API contra-ataca
      gameState.streak = 0;
      damageReceived = 25;
      gameState.playerHp = Math.max(0, gameState.playerHp - damageReceived);
    }

    const isGameOver = this.checkGameOver();

    return {
      isCorrect,
      correctAnswer: gameState.currentQuestion.correctAnswer,
      selectedAnswer,
      damageDealt,
      damageReceived,
      pointsGained,
      isGameOver
    };
  },

  // Trata tempo esgotado (timeout) como erro
  handleTimeout() {
    return this.evaluateAnswer(null);
  },

  // Checa condições de fim de partida
  checkGameOver() {
    if (gameState.playerHp <= 0) {
      return { over: true, reason: "player_defeated", defeatedBoss: false };
    }
    if (gameState.apiHp <= 0) {
      return { over: true, reason: "boss_defeated", defeatedBoss: true };
    }
    if (gameState.round >= gameState.maxRounds) {
      const wonByPoints = gameState.playerHp > gameState.apiHp;
      return {
        over: true,
        reason: "rounds_finished",
        defeatedBoss: wonByPoints
      };
    }
    return { over: false };
  },

  // Finaliza a partida e salva estatísticas no ranking
  finishGame(gameOverResult) {
    gameState.status = "gameover";
    gameState.clearTimer();

    const accuracy = gameState.totalAnswers > 0
      ? (gameState.correctAnswers / gameState.totalAnswers) * 100
      : 0;

    const rankingResult = rankingStorage.saveScore({
      playerName: gameState.playerName,
      score: gameState.score,
      accuracy,
      defeatedBoss: Boolean(gameOverResult.defeatedBoss),
      roundsCompleted: gameState.round
    });

    return {
      playerName: gameState.playerName,
      score: gameState.score,
      accuracy,
      correctAnswers: gameState.correctAnswers,
      totalAnswers: gameState.totalAnswers,
      maxStreak: gameState.maxStreak,
      defeatedBoss: Boolean(gameOverResult.defeatedBoss),
      reason: gameOverResult.reason,
      rankingResult
    };
  }
};
