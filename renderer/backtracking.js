const { ipcRenderer } = require("electron");

// =====================================================
// 🔹 ELEMENTOS DEL DOM
// =====================================================

const btnAnalizar =
  document.getElementById("analizar");

const btnPaso =
  document.getElementById("paso");

const btnVolver =
  document.getElementById("volver");

const btnDibujar =
  document.getElementById("dibujar");

const pasoActualDiv =
  document.getElementById("pasoActual");

const historialDiv =
  document.getElementById("historial");

const variablesDetectadasDiv =
  document.getElementById(
    "variablesDetectadas"
  );

// =====================================================
// 🔹 VARIABLES GLOBALES
// =====================================================

let input;

let eventosGlobal = [];
let pasos = [];
let indicePaso = 0;
// =====================================================
// 🔥 CUANDO CARGA LA VENTANA
// =====================================================

window.onload = () => {

  input =
    document.getElementById(
      "expresion"
    );
    input.addEventListener(
  "input",
  () => {

    input.value =
      input.value.toUpperCase();
  }
);
  // 🔹 Variables base
  actualizarBotones([
    "A",
    "B",
    "C"
  ]);

  // 🔹 Iniciar con siguiente paso deshabilitado
  btnPaso.disabled = true;
};

// =====================================================
// 🔥 TECLADO LÓGICO
// =====================================================

function agregar(valor) {

  input.value += valor;
}

function borrar() {

  input.value =
    input.value.slice(0, -1);
}

function limpiar() {

  input.value = "";

  historialDiv.innerHTML = "";

  pasoActualDiv.innerText = "";

  variablesDetectadasDiv.innerText =
    "Ninguna";

  pasos = [];
  indicePaso = 0;
  btnPaso.disabled = true;

  actualizarBotones([
    "A",
    "B",
    "C"
  ]);
}

// =====================================================
// 🔥 ANALIZAR
// =====================================================

btnAnalizar.addEventListener(
  "click",
  () => {
    pasos = [];
indicePaso = 0;

historialDiv.innerHTML = "";
    // 🔹 Obtener expresión
    const expresion =
      input.value.trim();

    // =================================================
    // 🔹 VALIDACIONES
    // =================================================

    if (!expresion) {

      alert(
        "Escribe una expresión lógica"
      );

      return;
    }

    const error =
  validarExpresion(expresion);

if (error) {

  alert(error);

  return;
}

    // =================================================
    // 🔥 DETECTAR VARIABLES
    // =================================================

    const variables =
      obtenerVariables(expresion);

    if (variables.length === 0) {

      alert(
        "No se detectaron variables"
      );

      return;
    }

    // 🔹 Mostrar variables
    variablesDetectadasDiv.innerText =
      variables.join(", ");

    // 🔹 Limpiar historial
    historialDiv.innerHTML = "";

    // =================================================
    // 🔥 GENERAR ÁRBOL
    // =================================================

    let eventos = [];

    let id = 0;

    function generar(
      index,
      parentId,
      valores = {},
      camino = []
    ) {

      // =============================================
      // 🔥 CASO FINAL
      // =============================================

      if (index >= variables.length) {

        // 🔹 Evaluar expresión
        const resultado =
          evaluarExpresion(
            expresion,
            valores
          );
          const pasosEvaluacion =
  evaluarPasoAPaso(
    expresion,
    valores
  );

        // 🔹 Expresión evaluada
        let expresionEvaluada =
          expresion;

        for (let variable in valores) {

          expresionEvaluada =
            expresionEvaluada.replaceAll(
              variable,
              valores[variable]
            );
        }

        // 🔹 Nodo resultado
        eventos.push({

          id: id++,

          parent: parentId,

          tipo: "resultado",

          estado:
            resultado
            ? "solucion"
            : "fallo",

          valor:
            resultado
            ? "✔ TRUE"
            : "✖ FALSE",

          camino: [...camino],

          expresionEvaluada,
          pasosEvaluacion
        });

        // 🔹 Guardar paso para mostrar más tarde
        pasos.push(
          `${resultado ? "✅" : "❌"} ${camino.join(" → ")}`
        );

        return;
      }

      // =============================================
      // 🔹 VARIABLE ACTUAL
      // =============================================

      const variable =
        variables[index];

      // =============================================
      // 🔹 RAMA TRUE
      // =============================================

      const idTrue = id++;

      eventos.push({

        id: idTrue,

        parent: parentId,

        tipo: "nodo",

        valor: `${variable}=T`,

        camino: [
          ...camino,
          `${variable}=T`
        ]
      });

      pasos.push(`➡️ Probando ${variable}=TRUE`);

      generar(

        index + 1,

        idTrue,

        {
          ...valores,
          [variable]: true
        },

        [
          ...camino,
          `${variable}=T`
        ]
      );

      // =============================================
      // 🔹 RAMA FALSE
      // =============================================

      const idFalse = id++;

      eventos.push({

        id: idFalse,

        parent: parentId,

        tipo: "nodo",

        valor: `${variable}=F`,

        camino: [
          ...camino,
          `${variable}=F`
        ]
      });

      pasos.push(`↩️ Retrocediendo desde ${variable}=TRUE`);
      pasos.push(`➡️ Probando ${variable}=FALSE`);

      generar(

        index + 1,

        idFalse,

        {
          ...valores,
          [variable]: false
        },

        [
          ...camino,
          `${variable}=F`
        ]
      );
    }

    // =================================================
    // 🔥 INICIAR GENERACIÓN
    // =================================================

    // =============================================
// 🔥 CREAR RAÍZ GENERAL
// =============================================

const raizId = id++;

eventos.push({

  id: raizId,

  parent: null,

  tipo: "nodo",

  valor: "INICIO",

  camino: []
});

// =============================================
// 🔥 INICIAR GENERACIÓN
// =============================================

generar(
  0,
  raizId
);

    // 🔹 Guardar globalmente
    eventosGlobal = eventos;

    // 🔹 Mensaje visual
    pasoActualDiv.innerText =
      "🌳 Árbol generado correctamente. Presiona Siguiente paso.";

    btnPaso.disabled = false;

    // 🔥 Enviar árbol
    ipcRenderer.send(
      "enviar-arbol",
      eventos
    );
  }
);

// =====================================================
// 🔹 SIGUIENTE PASO
// =====================================================

btnPaso.addEventListener(
  "click",
  () => {
    if (indicePaso >= pasos.length) {
      btnPaso.disabled = true;
      pasoActualDiv.innerText =
        "Historial completado.";
      return;
    }

    const paso = pasos[indicePaso++];

    historialDiv.innerHTML +=
      `<p>${paso}</p>`;

    pasoActualDiv.innerText = paso;

    if (indicePaso >= pasos.length) {
      btnPaso.disabled = true;
      pasoActualDiv.innerText =
        "Historial completado.";
    }
  }
);

// =====================================================
// 🌳 DIBUJAR ÁRBOL
// =====================================================

btnDibujar.addEventListener(
  "click",
  () => {

    ipcRenderer.send(
      "abrir-arbol",
      eventosGlobal
    );
  }
);

// =====================================================
// 🔙 VOLVER
// =====================================================

btnVolver.addEventListener(
  "click",
  () => {

    window.location.href =
      "index.html#modulos";
  }
);

// =====================================================
// 🔥 OBTENER VARIABLES
// =====================================================

function obtenerVariables(
  expresion
) {

  const matches =
    expresion.match(/[A-Z]/g);

  if (!matches) {

    return [];
  }

  return [...new Set(matches)];
}

// =====================================================
// 🔥 EVALUAR EXPRESIÓN
// =====================================================

function evaluarExpresion(
  expresion,
  valores
) {

  let expr = expresion;

  // 🔹 Reemplazar variables
  for (let variable in valores) {

    expr =
      expr.replaceAll(
        variable,
        valores[variable]
      );
  }

  try {

    return eval(expr);

  } catch {

    return false;
  }
}

// =====================================================
// 🔥 ACTUALIZAR BOTONES
// =====================================================

function actualizarBotones(
  variables
) {

  const contenedor =
    document.getElementById(
      "variables"
    );

  contenedor.innerHTML = "";

  variables.forEach(v => {

    const btn =
      document.createElement(
        "button"
      );

    btn.textContent = v;

    btn.onclick =
      () => agregar(v);

    contenedor.appendChild(btn);
  });
}
function validarExpresion(expresion) {

  // 🔹 No vacía
  if (!expresion.trim()) {

    return "La expresión está vacía";
  }

  // =================================================
  // 🔹 PARÉNTESIS BALANCEADOS
  // =================================================

  let balance = 0;

  for (let char of expresion) {

    if (char === "(") balance++;

    if (char === ")") balance--;

    if (balance < 0) {

      return "Hay un paréntesis ')' incorrecto";
    }
  }

  if (balance !== 0) {

    return "Los paréntesis están desbalanceados";
  }

  // =================================================
  // 🔹 NO INICIAR MAL
  // =================================================

  if (
    expresion.startsWith("&&") ||
    expresion.startsWith("||")
  ) {

    return "La expresión no puede iniciar con AND u OR";
  }

  // =================================================
  // 🔹 NO TERMINAR MAL
  // =================================================

  if (
    expresion.endsWith("&&") ||
    expresion.endsWith("||") ||
    expresion.endsWith("!")
  ) {

    return "La expresión termina incorrectamente";
  }

  // =================================================
  // 🔹 OPERADORES REPETIDOS
  // =================================================

  if (
    expresion.includes("&&&&") ||
    expresion.includes("||||")
  ) {

    return "Hay operadores repetidos";
  }

  // =================================================
  // 🔹 DOS VARIABLES JUNTAS
  // =================================================

  if (/[A-Z]{2,}/.test(expresion)) {

    return "Falta operador entre variables";
  }

  // =================================================
  // 🔹 CARACTERES INVÁLIDOS
  // =================================================

  const permitido =
    /^[A-Z()!&|\s]+$/;

  if (!permitido.test(expresion)) {

    return "Hay caracteres inválidos";
  }

  // =================================================
  // 🔹 OPERADOR SIN VARIABLE
  // =================================================

  if (
    /(&&\)|\|\|\))/.test(expresion)
  ) {

    return "Operador antes de ')'";
  }

  // =================================================
  // 🔹 TODO OK
  // =================================================

  return null;
}
function evaluarPasoAPaso(
  expresion,
  valores
) {

  let pasos = [];

  // 🔹 expresión original
  let expr = expresion;

  pasos.push(expr);

  // =============================================
  // 🔹 REEMPLAZAR VARIABLES
  // =============================================

  for (let variable in valores) {

    expr = expr.replaceAll(
      variable,
      valores[variable]
    );
  }

  pasos.push(expr);

  // =============================================
  // 🔹 EVALUAR PASO A PASO
  // =============================================

  try {

    let actual = expr;

    // 🔹 Mientras haya operadores
    while (
      actual.includes("&&") ||
      actual.includes("||") ||
      actual.includes("!")
    ) {

      // =========================================
      // 🔹 NOT
      // =========================================

      actual = actual.replace(
        /!true/g,
        "false"
      );

      actual = actual.replace(
        /!false/g,
        "true"
      );

      // =========================================
      // 🔹 AND
      // =========================================

      actual = actual.replace(
        /true&&true/g,
        "true"
      );

      actual = actual.replace(
        /true&&false/g,
        "false"
      );

      actual = actual.replace(
        /false&&true/g,
        "false"
      );

      actual = actual.replace(
        /false&&false/g,
        "false"
      );

      // =========================================
      // 🔹 OR
      // =========================================

      actual = actual.replace(
        /true\|\|true/g,
        "true"
      );

      actual = actual.replace(
        /true\|\|false/g,
        "true"
      );

      actual = actual.replace(
        /false\|\|true/g,
        "true"
      );

      actual = actual.replace(
        /false\|\|false/g,
        "false"
      );

      // 🔹 quitar paréntesis inútiles
      actual = actual.replace(
        /\((true|false)\)/g,
        "$1"
      );

      pasos.push(actual);

      // 🔹 evitar loop infinito
      if (
        pasos.length > 20
      ) break;
    }

    return pasos;

  } catch {

    return [
      "Error al evaluar"
    ];
  }
}