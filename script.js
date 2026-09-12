import axios from "axios";

const KEY_RESTCOUNTRIES = import.meta.env.VITE_API_KEY_RESTCOUNTRIES;

const api = axios.create({
  baseURL: "https://api.restcountries.com/countries/v5",
  headers: {
    'Authorization': `Bearer ${KEY_RESTCOUNTRIES}`
  }
});

// Função para buscar informações de um país pelo nome
async function buscarPaisAlvo(nomePais) {
  const resposta = await api.get(`/names.common/${nomePais}`, {
    params: { response_fields: "names.common,capitals"}
    });
  return resposta.data.data.objects;
}

// Função para buscar informações de um país aleatório (irá comport as opções erradas)
async function buscarCapitaisAleatorias() {
  const resposta = await api.get(``,{
    params: { limit: 10, response_fields: "capitals"}
    });
  const todasCapitais = resposta.data.data.objects 
    .map(pais => pais.capitals ? pais.capitals[0]?.name : null)
    .filter(capital => capital !== null && capital !== undefined);
  
    return todasCapitais;
}

function criarAlternativas(capitalCorreta, listaOutrasCapitais) { 
  const capitaisErradas = listaOutrasCapitais
    .filter(capital => capital !== capitalCorreta)
    .slice(0, 3);

  const alternativas = [
    { texto: capitalCorreta, correta: true },
    { texto: capitaisErradas[0], correta: false },
    { texto: capitaisErradas[1], correta: false },
    { texto: capitaisErradas[2], correta: false },
  ];

  return alternativas.sort(() => Math.random() - 0.5); // Embaralha as alternativas

}

async function criarPergunta() {
  try {
    const [paisAlvo, capitaisAleatorias] = await Promise.all([
      buscarPaisAlvo("Brazil"),
      buscarCapitaisAleatorias()
    ]);

    console.log("País alvo:", paisAlvo);
    console.log("Capitais:", capitaisAleatorias);

    const capitalCorreta = paisAlvo[0].capitals?.[0]?.name;

    console.log("Capital correta:", capitalCorreta);

    const alternativas = criarAlternativas(
      capitalCorreta,
      capitaisAleatorias
    );

    console.log("Alternativas:", alternativas);

  } catch (erro) {
    console.error("Erro:", erro);
  }
}

criarPergunta();

// Exemplo de uso da função buscarCapitaisAleatorias
// buscarCapitaisAleatorias()
//   .then((capitais) => {
//     console.log("Capitais aleatórias:", capitais);
//   })
//   .catch((erro) => {
//     console.error("Erro ao buscar capitais aleatórias:", erro);
//   });
  

// Exemplo de uso da função buscarPaisAlvo
// buscarPaisAlvo("Brazil")
//   .then((pais) => {
//     console.log("País encontrado:", pais);
//   })
//   .catch((erro) => {
//     console.error("Erro ao buscar o país:", erro);
//   });


