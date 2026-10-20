import { rankingStorage } from "../storage/rankingStorage.js";

export const uiManager = {
  // Alterna visibilidade entre visões
  showView(viewName) {
    const views = ["lobby", "arena", "gameover"];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) {
        if (v === viewName) {
          el.classList.remove("d-none");
          el.classList.add("fade-in");
        } else {
          el.classList.add("d-none");
          el.classList.remove("fade-in");
        }
      }
    });
  },

  // Atualiza todo o HUD durante o duelo
  updateHud(state) {
    // 1. Jogador
    const playerNameEl = document.getElementById("hud-player-name");
    const playerHpBar = document.getElementById("hud-player-hp");
    const playerHpText = document.getElementById("hud-player-hp-text");
    const scoreEl = document.getElementById("hud-score-value");
    const streakEl = document.getElementById("hud-streak-badge");

    if (playerNameEl) playerNameEl.textContent = state.playerName;
    if (scoreEl) scoreEl.textContent = state.score.toLocaleString("pt-BR");

    if (playerHpBar && playerHpText) {
      const pct = Math.max(0, Math.min(100, state.playerHp));
      playerHpBar.style.width = `${pct}%`;
      playerHpText.textContent = `${pct} HP`;

      playerHpBar.className = "progress-bar progress-bar-striped progress-bar-animated";
      if (pct > 50) playerHpBar.classList.add("bg-success");
      else if (pct > 25) playerHpBar.classList.add("bg-warning");
      else playerHpBar.classList.add("bg-danger");
    }

    if (streakEl) {
      if (state.streak >= 2) {
        streakEl.classList.remove("d-none");
        streakEl.innerHTML = `<i class="bi bi-fire text-warning me-1"></i>Combo ${state.streak}x`;
      } else {
        streakEl.classList.add("d-none");
      }
    }

    // 2. A.P.I. Core
    const apiHpBar = document.getElementById("hud-api-hp");
    const apiHpText = document.getElementById("hud-api-hp-text");

    if (apiHpBar && apiHpText) {
      const pct = Math.max(0, Math.min(100, state.apiHp));
      apiHpBar.style.width = `${pct}%`;
      apiHpText.textContent = `${pct} HP`;

      apiHpBar.className = "progress-bar progress-bar-striped progress-bar-animated";
      if (pct > 50) apiHpBar.classList.add("bg-danger");
      else if (pct > 25) apiHpBar.classList.add("bg-warning");
      else apiHpBar.classList.add("bg-secondary");
    }

    // 3. Rodada & Tempo
    const roundEl = document.getElementById("hud-round-badge");
    if (roundEl) {
      roundEl.textContent = `Rodada ${state.round} de ${state.maxRounds}`;
    }

    this.updateTimerBadge(state.currentTimer, state.timerSeconds);
  },

  updateTimerBadge(current, total) {
    const timerBadge = document.getElementById("hud-timer-badge");
    if (!timerBadge) return;

    if (total <= 0) {
      timerBadge.innerHTML = `<i class="bi bi-infinity me-1"></i>Sem limite`;
      timerBadge.className = "badge bg-secondary-subtle text-body border";
      return;
    }

    const pct = current / total;
    let colorClass = "bg-primary";
    if (pct <= 0.3) colorClass = "bg-danger";
    else if (pct <= 0.6) colorClass = "bg-warning text-dark";

    timerBadge.className = `badge ${colorClass} fs-6 shadow-sm`;
    timerBadge.innerHTML = `<i class="bi bi-stopwatch me-1"></i>${current}s`;
  },

  // Exibe o estado de carregamento de pergunta
  showQuestionLoading() {
    const questionCard = document.getElementById("question-card-body");
    const optionsContainer = document.getElementById("quiz-options");
    const feedbackBox = document.getElementById("round-feedback-box");

    if (feedbackBox) feedbackBox.classList.add("d-none");

    if (questionCard) {
      questionCard.innerHTML = `
        <div class="py-5 text-center">
          <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <h4 class="text-body-secondary fw-semibold">Consultando A.P.I. Core...</h4>
          <p class="text-muted small">Gerando novo desafio e sincronizando opções</p>
        </div>
      `;
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = "";
    }
  },

  // Renderiza a pergunta e as alternativas
  renderQuestion(question, onSelectOption) {
    const questionCard = document.getElementById("question-card-body");
    const optionsContainer = document.getElementById("quiz-options");
    const feedbackBox = document.getElementById("round-feedback-box");

    if (feedbackBox) feedbackBox.classList.add("d-none");

    if (questionCard) {
      questionCard.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle px-3 py-2 rounded-pill">
            <i class="bi bi-globe2 me-1"></i>${question.category}
          </span>
          <span class="badge bg-secondary-subtle text-secondary-emphasis px-2 py-1 rounded-pill small">
            <i class="bi bi-cloud-arrow-down me-1"></i>${question.sourceApi}
          </span>
        </div>
        <h2 class="card-title fw-bold text-center py-3 fs-3 mb-0" id="quiz-question-title">
          ${question.question}
        </h2>
      `;
    }

    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      const letters = ["A", "B", "C", "D"];

      question.options.forEach((optText, index) => {
        const col = document.createElement("div");
        col.className = "col";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-outline-secondary btn-lg p-3 w-100 text-start d-flex align-items-center justify-content-between option-btn shadow-sm";
        btn.dataset.option = optText;

        btn.innerHTML = `
          <div class="d-flex align-items-center">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-circle p-2 me-3 fw-bold option-letter" style="width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center;">
              ${letters[index] || "•"}
            </span>
            <span class="fw-semibold text-break option-text">${optText}</span>
          </div>
          <span class="option-icon-slot"></span>
        `;

        btn.addEventListener("click", () => {
          onSelectOption(optText);
        });

        col.appendChild(btn);
        optionsContainer.appendChild(col);
      });
    }
  },

  // Feedback visual após clique da resposta
  renderEvaluation(evalResult, onNext) {
    const allButtons = document.querySelectorAll(".option-btn");
    allButtons.forEach(btn => {
      btn.disabled = true;
      const optValue = btn.dataset.option;
      const iconSlot = btn.querySelector(".option-icon-slot");

      if (optValue === evalResult.correctAnswer) {
        btn.className = "btn btn-success btn-lg p-3 w-100 text-start d-flex align-items-center justify-content-between option-btn shadow correct-highlight";
        if (iconSlot) {
          iconSlot.innerHTML = `<i class="bi bi-check-circle-fill text-white fs-4"></i>`;
        }
      } else if (optValue === evalResult.selectedAnswer && !evalResult.isCorrect) {
        btn.className = "btn btn-danger btn-lg p-3 w-100 text-start d-flex align-items-center justify-content-between option-btn shadow wrong-highlight";
        if (iconSlot) {
          iconSlot.innerHTML = `<i class="bi bi-x-circle-fill text-white fs-4"></i>`;
        }
      } else {
        btn.className = "btn btn-outline-secondary btn-lg p-3 w-100 text-start d-flex align-items-center justify-content-between option-btn opacity-50";
      }
    });

    // Exibe banner de feedback de duelo
    const feedbackBox = document.getElementById("round-feedback-box");
    if (feedbackBox) {
      feedbackBox.classList.remove("d-none");
      const messageHtml = evalResult.isCorrect
        ? `
          <div class="alert alert-success d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-sm mb-0 p-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-lightning-charge-fill fs-2 me-3 text-warning"></i>
              <div>
                <h5 class="alert-heading fw-bold mb-1">Acerto Crítico! +${evalResult.pointsGained} pontos</h5>
                <p class="mb-0 small">Você causou <strong>${evalResult.damageDealt} de dano</strong> na integridade da A.P.I. Core!</p>
              </div>
            </div>
            <button id="btn-next-round" class="btn btn-success fw-bold px-4 py-2 text-nowrap">
              Próximo <i class="bi bi-arrow-right-circle ms-1"></i>
            </button>
          </div>
        `
        : `
          <div class="alert alert-danger d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 shadow-sm mb-0 p-3">
            <div class="d-flex align-items-center">
              <i class="bi bi-shield-x fs-2 me-3 text-danger"></i>
              <div>
                <h5 class="alert-heading fw-bold mb-1">${evalResult.selectedAnswer === null ? "Tempo esgotado! " : ""}A A.P.I. Contra-atacou!</h5>
                <p class="mb-0 small">Você sofreu <strong>${evalResult.damageReceived} de dano</strong>. A resposta correta era: <em>${evalResult.correctAnswer}</em></p>
              </div>
            </div>
            <button id="btn-next-round" class="btn btn-danger fw-bold px-4 py-2 text-nowrap">
              Continuar <i class="bi bi-arrow-right-circle ms-1"></i>
            </button>
          </div>
        `;

      feedbackBox.innerHTML = messageHtml;

      const nextBtn = document.getElementById("btn-next-round");
      if (nextBtn) {
        nextBtn.focus();
        nextBtn.addEventListener("click", () => {
          onNext();
        });
      }
    }
  },

  // Renderiza a tela de Game Over / Vitória
  renderGameOver(summary, onPlayAgain, onBackToLobby) {
    this.showView("gameover");

    const titleEl = document.getElementById("gameover-title");
    const iconEl = document.getElementById("gameover-icon");
    const descEl = document.getElementById("gameover-desc");
    const scoreEl = document.getElementById("gameover-score");
    const accuracyEl = document.getElementById("gameover-accuracy");
    const streakEl = document.getElementById("gameover-streak");
    const recordBadge = document.getElementById("gameover-record-badge");

    if (summary.defeatedBoss) {
      if (titleEl) titleEl.textContent = "Vitória! Você Derrotou a A.P.I.!";
      if (iconEl) iconEl.innerHTML = `<i class="bi bi-trophy-fill text-warning display-1"></i>`;
      if (descEl) descEl.textContent = "Parabéns! Sua destreza técnica superou o processamento do Boss da API!";
    } else {
      if (titleEl) titleEl.textContent = "Fim de Jogo! A A.P.I. Prevaleceu";
      if (iconEl) iconEl.innerHTML = `<i class="bi bi-robot text-danger display-1"></i>`;
      if (descEl) descEl.textContent = "Sua energia foi esgotada pelo fogo cruzado de perguntas da máquina. Tente novamente!";
    }

    if (scoreEl) scoreEl.textContent = summary.score.toLocaleString("pt-BR");
    if (accuracyEl) accuracyEl.textContent = `${Math.round(summary.accuracy)}%`;
    if (streakEl) streakEl.textContent = `${summary.maxStreak}x`;

    if (recordBadge) {
      if (summary.rankingResult?.isTopScore) {
        recordBadge.classList.remove("d-none");
      } else {
        recordBadge.classList.add("d-none");
      }
    }

    const playAgainBtn = document.getElementById("btn-play-again");
    if (playAgainBtn) {
      playAgainBtn.onclick = onPlayAgain;
    }

    const backLobbyBtn = document.getElementById("btn-back-lobby");
    if (backLobbyBtn) {
      backLobbyBtn.onclick = onBackToLobby;
    }
  },

  // Atualiza a tabela do Offcanvas de Ranking
  renderRankingTable() {
    const list = rankingStorage.getRanking();
    const tbody = document.getElementById("ranking-table-body");
    const emptyNotice = document.getElementById("ranking-empty-notice");

    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = "";
      if (emptyNotice) emptyNotice.classList.remove("d-none");
      return;
    }

    if (emptyNotice) emptyNotice.classList.add("d-none");

    tbody.innerHTML = list.map((item, index) => {
      let medal = `<span class="badge bg-secondary rounded-pill">${index + 1}º</span>`;
      if (index === 0) medal = `<i class="bi bi-trophy-fill text-warning fs-5"></i>`;
      else if (index === 1) medal = `<i class="bi bi-award-fill text-secondary fs-5"></i>`;
      else if (index === 2) medal = `<i class="bi bi-award text-bronze fs-5" style="color: #cd7f32;"></i>`;

      const statusBadge = item.defeatedBoss
        ? `<span class="badge bg-success-subtle text-success border border-success-subtle"><i class="bi bi-check-lg me-1"></i>Venceu</span>`
        : `<span class="badge bg-danger-subtle text-danger border border-danger-subtle"><i class="bi bi-x-lg me-1"></i>Derrota</span>`;

      return `
        <tr>
          <td class="text-center align-middle">${medal}</td>
          <td class="align-middle fw-semibold">${item.playerName}</td>
          <td class="text-end align-middle fw-bold text-primary">${item.score.toLocaleString("pt-BR")}</td>
          <td class="text-center align-middle">${statusBadge}</td>
          <td class="text-end align-middle text-body-secondary small">${item.date}</td>
        </tr>
      `;
    }).join("");
  }
};
