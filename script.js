// ============================================================================
// TriviaTech - Ponto de Entrada Principal (Vite ES Module)
// ============================================================================

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import * as bootstrap from "bootstrap";

import { themeManager } from "./src/ui/themeManager.js";
import { rankingStorage } from "./src/storage/rankingStorage.js";
import { apiAdapter } from "./src/services/apiAdapter.js";
import { gameState } from "./src/game/gameState.js";
import { gameEngine } from "./src/game/gameEngine.js";
import { uiManager } from "./src/ui/uiManager.js";

// Torna o objeto bootstrap disponível globalmente caso necessário por componentes dinâmicos
window.bootstrap = bootstrap;

// ============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inicializa gerenciador de temas (Dark / Light)
  themeManager.init();

  // 2. Configura ranking no offcanvas
  uiManager.renderRankingTable();

  const btnOpenRanking = document.getElementById("btn-open-ranking");
  if (btnOpenRanking) {
    btnOpenRanking.addEventListener("click", () => {
      uiManager.renderRankingTable();
    });
  }

  const btnClearRanking = document.getElementById("btn-clear-ranking");
  if (btnClearRanking) {
    btnClearRanking.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja apagar todo o histórico de recordes locais?")) {
        rankingStorage.clearRanking();
        uiManager.renderRankingTable();
      }
    });
  }

  // 3. Configura formulário do Lobby
  const formLobby = document.getElementById("form-lobby");
  if (formLobby) {
    formLobby.addEventListener("submit", (e) => {
      e.preventDefault();
      const playerName = document.getElementById("input-player-name")?.value || "Desafiante";
      const rounds = parseInt(document.getElementById("select-rounds")?.value || "10", 10);
      const timer = parseInt(document.getElementById("select-timer")?.value || "15", 10);

      iniciarNovaPartida({ playerName, rounds, timerSeconds: timer });
    });
  }
});

// ============================================================================
// FLUXO DO MINIGAME
// ============================================================================

function iniciarNovaPartida({ playerName, rounds, timerSeconds }) {
  gameState.reset({
    playerName,
    maxRounds: rounds,
    timerSeconds
  });

  uiManager.showView("arena");
  uiManager.updateHud(gameState);
  carregarProximaPergunta();
}

async function carregarProximaPergunta() {
  gameState.status = "loading";
  uiManager.showQuestionLoading();

  try {
    const question = await apiAdapter.fetchNextQuestion(gameState.provider);
    gameState.currentQuestion = question;
    gameState.status = "question";

    // Atualiza HUD da rodada
    uiManager.updateHud(gameState);

    // Inicia cronômetro da rodada
    iniciarCronometroRodada();

    // Renderiza pergunta e botões de alternativas
    uiManager.renderQuestion(question, tratarSelecaoAlternativa);

  } catch (error) {
    console.error("Erro ao carregar pergunta:", error);
    gameState.status = "idle";
    alert("Ocorreu um problema ao conectar com a API. Tentando novamente...");
    carregarProximaPergunta();
  }
}

function iniciarCronometroRodada() {
  gameState.clearTimer();

  if (gameState.timerSeconds <= 0) {
    uiManager.updateTimerBadge(0, 0);
    return;
  }

  gameState.currentTimer = gameState.timerSeconds;
  uiManager.updateTimerBadge(gameState.currentTimer, gameState.timerSeconds);

  gameState.timerInterval = setInterval(() => {
    gameState.currentTimer -= 1;
    uiManager.updateTimerBadge(gameState.currentTimer, gameState.timerSeconds);

    if (gameState.currentTimer <= 0) {
      gameState.clearTimer();
      tratarTempoEsgotado();
    }
  }, 1000);
}

function tratarSelecaoAlternativa(opcaoEscolhida) {
  if (gameState.status !== "question") return;

  gameState.status = "evaluating";
  gameState.clearTimer();

  const evalResult = gameEngine.evaluateAnswer(opcaoEscolhida);

  // Atualiza HUD imediatamente com novos HPs, score e combo
  uiManager.updateHud(gameState);

  // Renderiza feedback visual nos botões e banner com botão "Próximo"
  uiManager.renderEvaluation(evalResult, () => {
    avancarAposTurno(evalResult);
  });
}

function tratarTempoEsgotado() {
  if (gameState.status !== "question") return;

  gameState.status = "evaluating";
  const evalResult = gameEngine.handleTimeout();

  uiManager.updateHud(gameState);
  uiManager.renderEvaluation(evalResult, () => {
    avancarAposTurno(evalResult);
  });
}

function avancarAposTurno(evalResult) {
  if (evalResult.isGameOver.over) {
    encerrarPartida(evalResult.isGameOver);
    return;
  }

  // Próxima rodada
  gameState.round += 1;
  uiManager.updateHud(gameState);
  carregarProximaPergunta();
}

function encerrarPartida(gameOverResult) {
  const summary = gameEngine.finishGame(gameOverResult);

  uiManager.renderRankingTable();

  uiManager.renderGameOver(
    summary,
    // Callback: Jogar Novamente
    () => {
      iniciarNovaPartida({
        playerName: gameState.playerName,
        rounds: gameState.maxRounds,
        timerSeconds: gameState.timerSeconds
      });
    },
    // Callback: Voltar ao Menu
    () => {
      uiManager.showView("lobby");
    }
  );
}