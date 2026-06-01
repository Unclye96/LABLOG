const { ipcRenderer } = require("electron");
const {
  validarPrograma,
  validarConsulta
} = require("./parserProlog");
const { ejecutarConsulta, formatAnswer } = require("./motorProlog");

const textareaPrograma = document.getElementById("programa");
const inputConsulta = document.getElementById("consulta");
const btnValidar = document.getElementById("validar");
const btnEjecutar = document.getElementById("ejecutar");
const btnPaso = document.getElementById("paso");
const btnLimpiar = document.getElementById("limpiar");
const btnVolver = document.getElementById("volver");
const btnDibujar = document.getElementById("dibujar");
const btnEjemplo = document.getElementById("cargarEjemplo");
const validacionDiv = document.getElementById("validacion");
const resultadoDiv = document.getElementById("resultado");
const pasoActualDiv = document.getElementById("pasoActual");
const historialDiv = document.getElementById("historial");

let pasos = [];
let indicePaso = 0;
let arbolGlobal = [];
let clausesGlobal = [];

const EJEMPLO_PROGRAMA = `padre(juan, pedro).
padre(pedro, ana).
padre(carlos, luis).
abuelo(X, Z) :- padre(X, Y), padre(Y, Z).`;

const EJEMPLO_CONSULTA = "?- abuelo(juan, Z)";

function mostrarValidacion(ok, mensajes) {
  if (ok) {
    validacionDiv.innerHTML =
      `<span class="resultado-ok">✔ Programa válido</span><br>${mensajes}`;
  } else {
    validacionDiv.innerHTML = mensajes
      .map((msg) => `<span class="resultado-fallo">✖ ${msg}</span>`)
      .join("<br>");
  }
}

function mostrarResultados(ok, soluciones) {
  if (!ok) {
    resultadoDiv.innerHTML =
      '<span class="resultado-fallo">✖ Consulta falsa — no hay soluciones</span>';
    return;
  }

  const lineas = soluciones.map(
    (sol, index) => `${index + 1}. ${formatAnswer(sol)}`
  );

  resultadoDiv.innerHTML = `
    <span class="resultado-ok">✔ Consulta verdadera</span><br>
    <strong>Soluciones (${soluciones.length}):</strong><br>
    ${lineas.join("<br>")}
  `;
}

function reiniciarEjecucion() {
  pasos = [];
  indicePaso = 0;
  arbolGlobal = [];
  clausesGlobal = [];
  historialDiv.innerHTML = "";
  pasoActualDiv.innerText = "";
  btnPaso.disabled = true;
  btnDibujar.disabled = true;
}

btnValidar.addEventListener("click", () => {
  const validacion = validarPrograma(textareaPrograma.value);

  if (validacion.ok) {
    mostrarValidacion(
      true,
      `${validacion.facts.length} hecho(s), ${validacion.rules.length} regla(s).`
    );
    clausesGlobal = validacion.facts.concat(validacion.rules);
  } else {
    mostrarValidacion(false, validacion.errors);
  }
});

btnEjecutar.addEventListener("click", () => {
  reiniciarEjecucion();

  const validacionPrograma = validarPrograma(textareaPrograma.value);

  if (!validacionPrograma.ok) {
    mostrarValidacion(false, validacionPrograma.errors);
    alert("Corrige los errores del programa antes de ejecutar.");
    return;
  }

  clausesGlobal = validacionPrograma.clauses;

  const validacionQuery = validarConsulta(inputConsulta.value);

  if (!validacionQuery.ok) {
    alert(`Consulta inválida: ${validacionQuery.error}`);
    return;
  }

  mostrarValidacion(
    true,
    `${validacionPrograma.facts.length} hecho(s), ${validacionPrograma.rules.length} regla(s).`
  );

  const resultado = ejecutarConsulta(
    clausesGlobal,
    validacionQuery.goals
  );

  pasos = resultado.pasos;
  arbolGlobal = resultado.arbol;

  mostrarResultados(resultado.ok, resultado.soluciones);

  if (pasos.length > 0) {
    pasoActualDiv.innerText =
      "Proceso registrado. Presiona «Siguiente paso» para recorrerlo.";
    btnPaso.disabled = false;
  }

  if (arbolGlobal.length > 1) {
    btnDibujar.disabled = false;
  }
});

btnPaso.addEventListener("click", () => {
  if (indicePaso >= pasos.length) {
    btnPaso.disabled = true;
    pasoActualDiv.innerText = "Historial completado.";
    return;
  }

  const paso = pasos[indicePaso++];
  historialDiv.innerHTML += `<p>${paso}</p>`;
  pasoActualDiv.innerText = paso;
  historialDiv.scrollTop = historialDiv.scrollHeight;

  if (indicePaso >= pasos.length) {
    btnPaso.disabled = true;
    pasoActualDiv.innerText = "Historial completado.";
  }
});

btnDibujar.addEventListener("click", () => {
  if (arbolGlobal.length === 0) {
    alert("Ejecuta una consulta primero.");
    return;
  }

  ipcRenderer.send("abrir-arbol", arbolGlobal);
});

btnLimpiar.addEventListener("click", () => {
  reiniciarEjecucion();
  validacionDiv.innerText = "Listo para validar el programa.";
  resultadoDiv.innerText = "Ejecuta una consulta para ver el resultado.";
});

btnEjemplo.addEventListener("click", () => {
  textareaPrograma.value = EJEMPLO_PROGRAMA;
  inputConsulta.value = EJEMPLO_CONSULTA;
});

btnVolver.addEventListener("click", () => {
  window.location.href = "index.html#modulos";
});
