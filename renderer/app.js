const { ipcRenderer } = require("electron");

const startBtn = document.getElementById("startBtn");
const welcome = document.getElementById("welcome");
const modulos = document.getElementById("modulos");
const btnBacktracking = document.getElementById("backtracking");
const btnExpresiones = document.getElementById("ExpresioneS");
const btnUnificacion = document.getElementById("Unificacion");
const btnProlog = document.getElementById("Prolog");
const btnSalir = document.getElementById("salirBtn");

btnProlog.addEventListener("click", () => {
  window.location.href = "prolog.html";
});

btnBacktracking.addEventListener("click", () => {
  window.location.href = "backtracking.html";
});

btnExpresiones.addEventListener("click", () => {
  window.location.href = "expresiones.html";
});

btnUnificacion.addEventListener("click", () => {
  window.location.href = "unificacion.html";
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

btnSalir.addEventListener("click", () => {
  ipcRenderer.send("salir-app");
});
