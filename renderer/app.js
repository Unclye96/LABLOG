const startBtn = document.getElementById("startBtn");
const welcome = document.getElementById("welcome");
const modulos = document.getElementById("modulos");
const btnBacktracking = document.getElementById("backtracking");

btnBacktracking.addEventListener("click", () => {
  window.location.href = "backtracking.html";
});



const showModules = () => {
  welcome.style.display = "none";
  modulos.classList.remove("hidden");
  document.body.classList.remove("inicio");
  document.body.classList.add("modulos");
};

if (window.location.hash === "#modulos") {
  showModules();
}

startBtn.addEventListener("click", () => {
  welcome.classList.add("fade-out");

  setTimeout(() => {
    showModules();
  }, 1000);
});

const btnDibujar = document.getElementById("dibujar");


