const {
  obtenerVariables,
  validarExpresion,
  evaluarExpresion
} = require("./logicaBooleana");

const input = document.getElementById("expresion");
const btnGenerar = document.getElementById("generar");
const btnVolver = document.getElementById("volver");
const tablaContenedor = document.getElementById("tablaContenedor");

const MAX_VARIABLES = 8;

window.onload = () => {
  input.addEventListener("input", () => {
    input.value = input.value.toUpperCase();
  });
};

function agregar(valor) {
  input.value += valor;
}

function borrar() {
  input.value = input.value.slice(0, -1);
}

function limpiar() {
  input.value = "";
  tablaContenedor.innerHTML =
    '<p class="placeholder-text">La tabla aparecerá aquí.</p>';
}

function generarCombinaciones(variables) {
  const total = 2 ** variables.length;
  const filas = [];

  for (let i = 0; i < total; i++) {
    const valores = {};

    variables.forEach((variable, index) => {
      valores[variable] = Boolean((i >> (variables.length - 1 - index)) & 1);
    });

    filas.push(valores);
  }

  return filas;
}

function renderTabla(expresion, variables, filas) {
  const thead = variables
    .map((v) => `<th>${v}</th>`)
    .join("");

  const tbody = filas
    .map((valores) => {
      const resultado = evaluarExpresion(expresion, valores);
      const celdas = variables
        .map((v) => `<td>${valores[v] ? "T" : "F"}</td>`)
        .join("");
      const clase = resultado ? "fila-true" : "";

      return `<tr class="${clase}">${celdas}<td>${resultado ? "T" : "F"}</td></tr>`;
    })
    .join("");

  tablaContenedor.innerHTML = `
    <table class="truth-table">
      <thead>
        <tr>${thead}<th>${expresion}</th></tr>
      </thead>
      <tbody>${tbody}</tbody>
    </table>
  `;
}

btnGenerar.addEventListener("click", () => {
  const expresion = input.value.trim();

  if (!expresion) {
    alert("Escribe una expresión lógica");
    return;
  }

  const error = validarExpresion(expresion);

  if (error) {
    alert(error);
    return;
  }

  const variables = obtenerVariables(expresion);

  if (variables.length === 0) {
    alert("No se detectaron variables");
    return;
  }

  if (variables.length > MAX_VARIABLES) {
    alert(
      `Demasiadas variables (${variables.length}). El límite es ${MAX_VARIABLES} (${2 ** MAX_VARIABLES} filas).`
    );
    return;
  }

  const filas = generarCombinaciones(variables);
  renderTabla(expresion, variables, filas);
});

btnVolver.addEventListener("click", () => {
  window.location.href = "index.html#modulos";
});

window.agregar = agregar;
window.borrar = borrar;
window.limpiar = limpiar;
