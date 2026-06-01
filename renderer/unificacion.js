const { parseTerm, unificar, formatSustitucion } = require("./unificador");

const input1 = document.getElementById("termino1");
const input2 = document.getElementById("termino2");
const btnUnificar = document.getElementById("unificar");
const btnVolver = document.getElementById("volver");
const resultadoDiv = document.getElementById("resultado");
const historialDiv = document.getElementById("historial");

function mostrarResultado(ok, sustitucion, pasos) {
  historialDiv.innerHTML = pasos.map((paso) => `<p>${paso}</p>`).join("");

  if (ok) {
    resultadoDiv.innerHTML = `
      <span class="resultado-ok">✔ Unificación exitosa</span><br>
      Sustitución: <strong>${formatSustitucion(sustitucion)}</strong>
    `;
  } else {
    resultadoDiv.innerHTML = `
      <span class="resultado-fallo">✖ Unificación fallida</span>
    `;
  }
}

btnUnificar.addEventListener("click", () => {
  const str1 = input1.value.trim();
  const str2 = input2.value.trim();

  if (!str1 || !str2) {
    alert("Introduce ambos términos");
    return;
  }

  try {
    const term1 = parseTerm(str1);
    const term2 = parseTerm(str2);
    const { ok, sustitucion, pasos } = unificar(term1, term2);

    mostrarResultado(ok, sustitucion, pasos);
  } catch (err) {
    historialDiv.innerHTML = "";
    resultadoDiv.innerHTML = `<span class="resultado-fallo">✖ Error: ${err.message}</span>`;
  }
});

document.querySelectorAll(".btn-ejemplo").forEach((btn) => {
  btn.addEventListener("click", () => {
    input1.value = btn.dataset.t1;
    input2.value = btn.dataset.t2;
  });
});

btnVolver.addEventListener("click", () => {
  window.location.href = "index.html#modulos";
});
