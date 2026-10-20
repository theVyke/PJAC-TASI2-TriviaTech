const STORAGE_KEY = "triviatech_ranking_v1";

export const rankingStorage = {
  getRanking() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const ranking = JSON.parse(data);
      return Array.isArray(ranking) ? ranking : [];
    } catch (error) {
      console.error("Erro ao ler ranking do localStorage:", error);
      return [];
    }
  },

  saveScore({ playerName, score, accuracy, defeatedBoss, roundsCompleted }) {
    try {
      const currentRanking = this.getRanking();
      const newEntry = {
        id: Date.now().toString(),
        playerName: (playerName || "Desafiante").trim().slice(0, 15),
        score: Math.max(0, Math.round(score)),
        accuracy: Math.round(accuracy),
        defeatedBoss: Boolean(defeatedBoss),
        roundsCompleted: roundsCompleted || 0,
        date: new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      currentRanking.push(newEntry);
      // Ordena por maior pontuação
      currentRanking.sort((a, b) => b.score - a.score);

      // Mantém o top 10
      const top10 = currentRanking.slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));

      const isTopScore = top10[0]?.id === newEntry.id;
      return { saved: true, isTopScore, entry: newEntry };
    } catch (error) {
      console.error("Erro ao salvar score no localStorage:", error);
      return { saved: false, isTopScore: false };
    }
  },

  clearRanking() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Erro ao limpar ranking:", error);
      return false;
    }
  }
};
