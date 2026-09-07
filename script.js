import axios from "axios";

const KEY_RESTCOUNTRIES = import.meta.env.VITE_API_KEY_RESTCOUNTRIES;

var paisBuscado = 'Mexico';

async function buscarPaises() {
  try {
    const resposta = await axios.get(`https://api.restcountries.com/countries/v5`,{
        headers: { 'Authorization': `Bearer ${KEY_RESTCOUNTRIES}`  }, 
        params: { q: paisBuscado, response_fields: "names.common,capitals,population"},
    });
    return resposta.data;
  } catch (error) {
    console.error("Erro ao buscar países:", error);
    return [];
  }
}

buscarPaises().then(paises => console.log(paises));

const options = document.querySelectorAll(".option");

function handleAnswer(event) {
  const selected = event.target;
  const isCorrect = selected.dataset.correct === "true";

  options.forEach((option) => {
    option.disabled = true;
  });

  if (isCorrect) {
    selected.classList.add("correct");
  } else {
    selected.classList.add("wrong");
  }
}

options.forEach((option) => {
  option.addEventListener("click", handleAnswer);
});
