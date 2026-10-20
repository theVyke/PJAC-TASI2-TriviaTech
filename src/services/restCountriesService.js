import axios from "axios";

const KEY_RESTCOUNTRIES = import.meta.env.VITE_API_KEY_RESTCOUNTRIES;

const api = axios.create({
  baseURL: "https://api.restcountries.com/countries/v5",
  headers: KEY_RESTCOUNTRIES ? { Authorization: `Bearer ${KEY_RESTCOUNTRIES}` } : {},
  timeout: 8000
});

// Banco de reserva resiliente (fallback) caso a chave não esteja configurada ou ocorra erro de rede
const FALLBACK_COUNTRIES = [
  { country: "Brasil", capital: "Brasília" },
  { country: "França", capital: "Paris" },
  { country: "Japão", capital: "Tóquio" },
  { country: "Canadá", capital: "Ottawa" },
  { country: "Alemanha", capital: "Berlim" },
  { country: "Austrália", capital: "Camberra" },
  { country: "Argentina", capital: "Buenos Aires" },
  { country: "Itália", capital: "Roma" },
  { country: "Portugal", capital: "Lisboa" },
  { country: "Reino Unido", capital: "Londres" },
  { country: "Espanha", capital: "Madri" },
  { country: "Egito", capital: "Cairo" },
  { country: "México", capital: "Cidade do México" },
  { country: "Coreia do Sul", capital: "Seul" },
  { country: "Noruega", capital: "Oslo" },
  { country: "Suíça", capital: "Berna" },
  { country: "Grécia", capital: "Atenas" },
  { country: "Chile", capital: "Santiago" },
  { country: "Colômbia", capital: "Bogotá" },
  { country: "Holanda", capital: "Amsterdã" }
];

function obterPerguntaFallback() {
  const indiceAlvo = Math.floor(Math.random() * FALLBACK_COUNTRIES.length);
  const alvo = FALLBACK_COUNTRIES[indiceAlvo];

  const outrasCapitais = FALLBACK_COUNTRIES
    .filter((_, idx) => idx !== indiceAlvo)
    .map(c => c.capital)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const alternativas = [alvo.capital, ...outrasCapitais].sort(() => Math.random() - 0.5);

  return {
    id: `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    category: "Geografia & Nações (Modo Offline)",
    sourceApi: "RestCountries (Fallback Local)",
    question: `Qual é a capital de ${alvo.country}?`,
    options: alternativas,
    correctAnswer: alvo.capital
  };
}

// Busca país alvo através da API Rest Countries
async function buscarPaisAlvo() {
  const tamanhoAmostra = 12;
  const totalPaises = 240;
  const offsetAleatorio = Math.floor(Math.random() * (totalPaises - tamanhoAmostra));

  const resposta = await api.get("", {
    params: {
      limit: tamanhoAmostra,
      offset: offsetAleatorio,
      response_fields: "names.common,capitals"
    }
  });

  const listaPaises = resposta.data?.data?.objects || [];
  const paisesComCapital = listaPaises.filter(
    pais => pais.capitals && pais.capitals.length > 0 && pais.capitals[0]?.name
  );

  if (paisesComCapital.length === 0) {
    throw new Error("Nenhum país com capital encontrado na resposta da API.");
  }

  const indiceSorteado = Math.floor(Math.random() * paisesComCapital.length);
  return paisesComCapital[indiceSorteado];
}

// Busca capitais aleatórias para compor opções incorretas
async function buscarCapitaisAleatorias() {
  const limite = 60;
  const totalPaises = 240;
  const offsetAleatorio = Math.floor(Math.random() * (totalPaises - limite));

  const resposta = await api.get("", {
    params: {
      limit: limite,
      offset: offsetAleatorio,
      response_fields: "capitals"
    }
  });

  const todasCapitais = (resposta.data?.data?.objects || [])
    .map(pais => pais.capitals ? pais.capitals[0]?.name : null)
    .filter(Boolean);

  return todasCapitais;
}

export const restCountriesService = {
  async getQuestion() {
    // Se a chave não existir ou for o placeholder, utiliza o gerador local resiliente
    if (!KEY_RESTCOUNTRIES || KEY_RESTCOUNTRIES.includes("SUACHAVEAQUI")) {
      return obterPerguntaFallback();
    }

    try {
      const [paisAlvo, capitaisAleatorias] = await Promise.all([
        buscarPaisAlvo(),
        buscarCapitaisAleatorias()
      ]);

      const capitalCorreta = paisAlvo.capitals[0].name;
      const nomePais = paisAlvo.names?.common || "País Desconhecido";

      const capitaisUnicas = [...new Set(capitaisAleatorias)].filter(
        cap => cap !== capitalCorreta
      );

      const erradasEmbaralhadas = capitaisUnicas
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      // Se por acaso a API retornar menos de 3 capitais diferentes, completa com fallback
      while (erradasEmbaralhadas.length < 3) {
        const fallbackCap = FALLBACK_COUNTRIES[Math.floor(Math.random() * FALLBACK_COUNTRIES.length)].capital;
        if (fallbackCap !== capitalCorreta && !erradasEmbaralhadas.includes(fallbackCap)) {
          erradasEmbaralhadas.push(fallbackCap);
        }
      }

      const opcoes = [capitalCorreta, ...erradasEmbaralhadas].sort(() => Math.random() - 0.5);

      return {
        id: `rc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        category: "Geografia & Capitais Mundiais",
        sourceApi: "RestCountries V5",
        question: `Qual é a capital de ${nomePais}?`,
        options: opcoes,
        correctAnswer: capitalCorreta
      };
    } catch (error) {
      console.warn("Falha na chamada RestCountries API, alternando para fallback offline:", error.message);
      return obterPerguntaFallback();
    }
  }
};
