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
