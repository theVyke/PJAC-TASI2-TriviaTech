import { restCountriesService } from "./restCountriesService.js";

const providers = {
  restcountries: restCountriesService
};

export const apiAdapter = {
  async fetchNextQuestion(providerName = "restcountries") {
    const provider = providers[providerName] || providers.restcountries;
    return await provider.getQuestion();
  },

  getAvailableProviders() {
    return [
      { id: "restcountries", name: "Rest Countries V5 (Capitais do Mundo)", bossName: "A.P.I. Geocore" }
    ];
  }
};
