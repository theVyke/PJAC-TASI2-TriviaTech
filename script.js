import axios from "axios";

const KEY_RESTCOUNTRIES = import.meta.env.VITE_API_KEY_RESTCOUNTRIES;

const api = axios.create({
  baseURL: "https://api.restcountries.com/countries/v5",
  headers: {
    'Authorization': `Bearer ${KEY_RESTCOUNTRIES}`
  }
});

// Função para buscar informações de um país pelo nome
async function buscarPaisAlvo() {
  const tamanhoAmostra = 10;
  const totalPaises = 250;
  const offsetAleatorio = Math.floor(Math.random() * (totalPaises - tamanhoAmostra));

  const resposta = await api.get("", {
    params: { 
      limit: tamanhoAmostra,
      offset: offsetAleatorio,
      response_fields: "names.common,capitals"}
    });

  const listaPaises = resposta.data.data.objects || [];

  const paisesComCapital = listaPaises.filter(
    pais => pais.capitals && pais.capitals.length > 0 && pais.capitals[0]?.name
  );

  const indiceSorteado = Math.floor(Math.random() * paisesComCapital.length);
  
  return paisesComCapital[indiceSorteado];
}

// Função para buscar informações de um país aleatório (irá comport as opções erradas)
async function buscarCapitaisAleatorias() {

  const limite = 70; 
  const totalPaises = 250;
  const offsetAleatorio = Math.floor(Math.random() * (totalPaises - limite));

  const resposta = await api.get("",{
    params: { 
      limit: limite, 
      offset: offsetAleatorio,
      response_fields: "capitals"}
    });

  const todasCapitais = (resposta.data.data.objects || [])
    .map(pais => pais.capitals ? pais.capitals[0]?.name : null)
    .filter(capital => capital !== null && capital !== undefined);
  
    return todasCapitais;
}

function criarAlternativas(capitalCorreta, listaOutrasCapitais) { 
  
  const capitaisUnicas = [...new Set(listaOutrasCapitais)]
    .filter(capital => capital !== capitalCorreta);
  
  const capitaisEmbaralhadas = capitaisUnicas.sort(() => Math.random() - 0.5);

  const capitaisErradas = capitaisEmbaralhadas.slice(0, 3);

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

    const nomePaisBuscado = "Brazil";

    const [paisAlvo, capitaisAleatorias] = await Promise.all([
      buscarPaisAlvo(nomePaisBuscado),
      buscarCapitaisAleatorias()
    ]);

    const capitalCorreta = paisAlvo[0].capitals?.[0]?.name;
    const nomePaisExibicao = paisAlvo[0].names?.common || nomePaisBuscado;


    const alternativas = criarAlternativas(
      capitalCorreta,
      capitaisAleatorias
    );

    exibirPergunta(nomePaisExibicao, alternativas);

  } catch (erro) {
    console.error("Erro:", erro);
  }
}

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


// FUNÇÕES PARA MANIPULAR O DOM E EXIBIR A PERGUNTA E AS ALTERNATIVAS


// --- FUNÇÕES DE MANIPULAÇÃO DO DOM ---

// 1. Função para desenhar a pergunta e as opções na tela
function exibirPergunta(nomePais, alternativas) {
  const elementoPergunta = document.getElementById("quiz-question");
  const containerOpcoes = document.getElementById("quiz-options");

  // Atualiza o texto do h1 com o nome do país vindo da API
  elementoPergunta.textContent = `Qual é a capital de ${nomePais}?`;

  // Limpa os botões anteriores (caso existam)
  containerOpcoes.innerHTML = "";

  // Cria um botão para cada alternativa do array
  alternativas.forEach((opcao) => {
    const botao = document.createElement("button");
    botao.classList.add("option");
    botao.textContent = opcao.texto;
    
    // Guarda se a opção é verdadeira ou falsa no atributo data-correct
    botao.dataset.correct = opcao.correta;

    // Adiciona o evento de clique ao botão
    botao.addEventListener("click", clicarPergunta);

    // Adiciona o botão na div #quiz-options
    containerOpcoes.appendChild(botao);
  });
}

// // 2. Função disparada ao clicar em uma opção
function clicarPergunta(event) {
  const botaoSelecionado = event.target;
  const acertou = botaoSelecionado.dataset.correct === "true";

  // Seleciona todos os botões para desabilitá-los após uma resposta
  const todosOsBotoes = document.querySelectorAll(".option");
  todosOsBotoes.forEach((btn) => {
    btn.disabled = true;
  });

  // Aplica o estilo visual de acordo com o acerto ou erro
  if (acertou) {
    botaoSelecionado.classList.add("correct");
  } else {
    botaoSelecionado.classList.add("wrong");

    // (Opcional) Mostra também qual era a resposta correta em verde
    todosOsBotoes.forEach((btn) => {
      if (btn.dataset.correct === "true") {
        btn.classList.add("correct");
      }
    });
  }
}


// DISPARO

criarPergunta();