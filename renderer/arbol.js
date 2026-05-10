const { ipcRenderer } = require("electron");

// =====================================================
// 🔹 CANVAS
// =====================================================

const canvas =
  document.getElementById("canvas");

const ctx =
  canvas.getContext("2d");
const btnPlay =
  document.getElementById("btnPlay");

const btnPause =
  document.getElementById("btnPause");

const btnReset =
  document.getElementById("btnReset");

// =====================================================
// 🔹 VARIABLES GLOBALES
// =====================================================

let nodos = {};

let raiz = null;

let contadorX = 0;
// 🔥 ZOOM Y DESPLAZAMIENTO
let escala = 1;

let offsetX = 0;
let offsetY = 0;

let arrastrando = false;

let inicioX = 0;
let inicioY = 0;
// =====================================================
// 🔥 CONTROL DE ANIMACIÓN
// =====================================================

let pausado = false;

let reiniciado = false;

let timeoutActual = null;
// =====================================================
// 🔥 CONFIGURACIÓN DEL CANVAS
// =====================================================

ctx.font = "14px Arial";

ctx.textAlign = "center";

ctx.textBaseline = "middle";

// =====================================================
// 🔥 RECIBIR DATOS
// =====================================================

ipcRenderer.on(
  "datos-arbol",
  (event, eventos) => {

    construirArbol(eventos);

    contadorX = 0;

    asignarPosiciones(raiz);

    redrawTree();

    // 🔥 iniciar animación
    setTimeout(() => {

      animarDFS(raiz);

    }, 500);
  }
);

// =====================================================
// 🔥 CONSTRUIR ÁRBOL
// =====================================================

function construirArbol(eventos) {

  nodos = {};

  // 🔹 Crear nodos
  eventos.forEach(ev => {

    if (
      ev.tipo === "nodo" ||
      ev.tipo === "resultado"
    ) {

      nodos[ev.id] = {

        ...ev,

        hijos: [],

        estadoAnimacion:
          "normal",

        colapsado: false
      };
    }
  });

  // 🔹 Conectar nodos
  eventos.forEach(ev => {

    if (
      (ev.tipo === "nodo" ||
      ev.tipo === "resultado")
      &&
      ev.parent !== null
    ) {

      const padre =
        nodos[ev.parent];

      const hijo =
        nodos[ev.id];

      hijo.padre = padre;

      padre.hijos.push(hijo);
    }
  });

  // 🔹 Buscar raíz
  raiz =
    Object.values(nodos)
      .find(
        n => n.parent === null
      );
}

// =====================================================
// 🔥 POSICIONES DEL ÁRBOL
// =====================================================

function asignarPosiciones(
  nodo,
  nivel = 0
) {

  if (!nodo) return;

  nodo.y =
    nivel * 100 + 80;

  // 🔹 Nodo hoja
  if (nodo.hijos.length === 0) {

    nodo.x =
      contadorX * 140 + 100;

    contadorX++;
  }

  // 🔹 Nodo interno
  else {

    nodo.hijos.forEach(hijo => {

      asignarPosiciones(
        hijo,
        nivel + 1
      );
    });

    const primer =
      nodo.hijos[0];

    const ultimo =
      nodo.hijos[
        nodo.hijos.length - 1
      ];

    nodo.x =
      (primer.x + ultimo.x) / 2;
  }
}

// =====================================================
// 🔥 REDIBUJAR TODO
// =====================================================

function redrawTree() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // 🔥 guardar estado
  ctx.save();

  // 🔥 mover canvas
  ctx.translate(
    offsetX,
    offsetY
  );

  // 🔥 zoom
  ctx.scale(
    escala,
    escala
  );

  if (raiz) {

    dibujarArbol(raiz);
  }

  // 🔥 restaurar estado
  ctx.restore();
}

// =====================================================
// 🔥 DIBUJAR ÁRBOL
// =====================================================

function dibujarArbol(nodo) {

  if (!nodo) return;

  // 🔥 SI ESTÁ COLAPSADO
  // NO DIBUJAR HIJOS
  if (!nodo.colapsado) {

    nodo.hijos.forEach(hijo => {

      dibujarLinea(
        nodo,
        hijo
      );

      dibujarArbol(hijo);
    });
  }

  // 🔹 Dibujar nodo
  dibujarNodo(nodo);
}

// =====================================================
// 🔥 DIBUJAR NODO
// =====================================================

function dibujarNodo(nodo) {

  ctx.beginPath();

  ctx.arc(
    nodo.x,
    nodo.y,
    30,
    0,
    Math.PI * 2
  );

  // =================================================
  // 🔥 COLORES
  // =================================================

  // 🔹 Solución
  if (nodo.estado === "solucion") {

    ctx.fillStyle = "#4CAF50";
  }

  // 🔹 Fallo
  else if (
    nodo.estado === "fallo"
  ) {

    ctx.fillStyle = "#F44336";
  }

  // 🔹 Visitando
  else if (
    nodo.estadoAnimacion ===
    "visitando"
  ) {

    ctx.fillStyle = "#FFD54F";
  }

  // 🔹 Retroceso
  else if (
    nodo.estadoAnimacion ===
    "retroceso"
  ) {

    ctx.fillStyle = "#FF9800";
  }

  // 🔹 Normal
  else {

    ctx.fillStyle = "#64B5F6";
  }

  ctx.fill();

  ctx.strokeStyle = "#222";

  ctx.lineWidth = 2;

  ctx.stroke();

  // 🔹 Texto
  ctx.fillStyle = "black";

  ctx.font = "13px Arial";

  let texto = nodo.valor;

// 🔥 indicador visual
if (nodo.colapsado) {

  texto += " [+]";
}

ctx.fillText(
  texto,
  nodo.x,
  nodo.y
);
}

// =====================================================
// 🔥 DIBUJAR LÍNEA
// =====================================================

function dibujarLinea(
  padre,
  hijo
) {

  ctx.beginPath();

  ctx.moveTo(
    padre.x,
    padre.y + 30
  );

  ctx.lineTo(
    hijo.x,
    hijo.y - 30
  );

  ctx.strokeStyle = "#555";

  ctx.lineWidth = 2;

  ctx.stroke();
}

// =====================================================
// 🔥 ANIMACIÓN DFS
// =====================================================

function animarDFS(nodo) {

  if (!nodo) return;

  // 🔥 pausa
  if (pausado) {

    timeoutActual = setTimeout(() => {

      animarDFS(nodo);

    }, 200);

    return;
  }

  // 🔹 marcar visitando
  nodo.estadoAnimacion =
    "visitando";

  redrawTree();

  timeoutActual = setTimeout(() => {

    recorrerHijos(
      nodo,
      0
    );

  }, 700);
}

// =====================================================
// 🔥 RECORRER HIJOS
// =====================================================
function recorrerHijos(
  nodo,
  index
) {

  // 🔥 pausa
  if (pausado) {

    timeoutActual = setTimeout(() => {

      recorrerHijos(
        nodo,
        index
      );

    }, 200);

    return;
  }

  // 🔹 terminó hijos
  if (
    index >= nodo.hijos.length
  ) {

    nodo.estadoAnimacion =
      "retroceso";

    redrawTree();

    return;
  }

  const hijo =
    nodo.hijos[index];

  timeoutActual = setTimeout(() => {

    animarDFS(hijo);

    timeoutActual = setTimeout(() => {

      recorrerHijos(
        nodo,
        index + 1
      );

    }, 1200);

  }, 700);
}
// =====================================================
// 🔥 CLICK EN NODOS
// =====================================================

canvas.addEventListener(
  "click",
  (e) => {

    const nodo =
      detectarNodoClick(e);

    if (!nodo) return;
    // 🔥 alternar colapso
nodo.colapsado =
  !nodo.colapsado;

redrawTree();
    const camino =
      obtenerCamino(nodo);

    resaltarCamino(camino);

    mostrarInfoNodo(nodo);
  }
);

// =====================================================
// 🔥 DETECTAR CLICK
// =====================================================

function detectarNodoClick(e) {

  const rect =
    canvas.getBoundingClientRect();

  const x =
  (e.clientX - rect.left - offsetX)
  / escala;

  const y =
  (e.clientY - rect.top - offsetY)
  / escala;

  for (let id in nodos) {

    const nodo =
      nodos[id];

    const distancia =
      Math.sqrt(

        (x - nodo.x) ** 2 +

        (y - nodo.y) ** 2
      );

    if (distancia < 30) {

      return nodo;
    }
  }

  return null;
}

// =====================================================
// 🔥 OBTENER CAMINO
// =====================================================

function obtenerCamino(nodo) {

  let camino = [];

  while (nodo) {

    camino.unshift(nodo);

    nodo = nodo.padre;
  }

  return camino;
}

// =====================================================
// 🔥 RESALTAR CAMINO
// =====================================================

function resaltarCamino(camino) {

  redrawTree();

  camino.forEach(nodo => {

    ctx.beginPath();

    ctx.arc(
      nodo.x,
      nodo.y,
      38,
      0,
      Math.PI * 2
    );

    ctx.strokeStyle =
      "#FFEB3B";

    ctx.lineWidth = 5;

    ctx.stroke();
  });
}

// =====================================================
// 🔥 MOSTRAR INFO DEL NODO
// =====================================================

function mostrarInfoNodo(nodo) {

  let panel =
    document.getElementById(
      "infoNodo"
    );

  // 🔹 Crear panel si no existe
  if (!panel) {

    panel =
      document.createElement(
        "div"
      );

    panel.id = "infoNodo";

    panel.style.position =
      "absolute";

    panel.style.top = "10px";

    panel.style.right = "10px";

    panel.style.width = "320px";

    panel.style.background =
      "white";

    panel.style.padding =
      "12px";

    panel.style.borderRadius =
      "12px";

    panel.style.boxShadow =
      "0 0 10px rgba(0,0,0,0.3)";

    panel.style.fontFamily =
      "Arial";

    panel.style.zIndex =
      "1000";

    document.body.appendChild(
      panel
    );
  }

  panel.innerHTML = `

    <h3>
      Información del nodo
    </h3>

    <p>
      <strong>Valor:</strong><br>
      ${nodo.valor}
    </p>

    <p>
      <strong>Camino:</strong><br>
      ${
        nodo.camino
        ? nodo.camino.join(" → ")
        : "Sin camino"
      }
    </p>

    <p>
      <strong>Expresión evaluada:</strong><br>
      ${
        nodo.expresionEvaluada
        || "N/A"
      }
    </p>
    <p>
  <strong>
    Evaluación paso a paso:
  </strong>
</p>

<div style="
  background:#f5f5f5;
  padding:8px;
  border-radius:8px;
">

  ${
    nodo.pasosEvaluacion
    ? nodo.pasosEvaluacion
        .map(
          p => `<p>${p}</p>`
        )
        .join("")
    : "N/A"
  }

</div>
  `;
}
// =====================================================
// 🔥 ZOOM CON RUEDA
// =====================================================

canvas.addEventListener(
  "wheel",
  (e) => {

    e.preventDefault();

    // 🔹 zoom in/out
    if (e.deltaY < 0) {

      escala += 0.1;

    } else {

      escala -= 0.1;
    }

    // 🔹 límites
    escala = Math.max(
      0.3,
      Math.min(escala, 3)
    );

    redrawTree();
  }
);
// =====================================================
// 🔥 INICIAR ARRASTRE
// =====================================================

canvas.addEventListener(
  "mousedown",
  (e) => {

    arrastrando = true;

    inicioX =
      e.clientX - offsetX;

    inicioY =
      e.clientY - offsetY;
  }
);

// =====================================================
// 🔥 MOVER
// =====================================================

canvas.addEventListener(
  "mousemove",
  (e) => {

    if (!arrastrando) return;

    offsetX =
      e.clientX - inicioX;

    offsetY =
      e.clientY - inicioY;

    redrawTree();
  }
);

// =====================================================
// 🔥 SOLTAR
// =====================================================

canvas.addEventListener(
  "mouseup",
  () => {

    arrastrando = false;
  }
);

// =====================================================
// 🔥 SALIR DEL CANVAS
// =====================================================

canvas.addEventListener(
  "mouseleave",
  () => {

    arrastrando = false;
  }
);
btnPlay.addEventListener(
  "click",
  () => {

    pausado = false;
  }
);
btnPause.addEventListener(
  "click",
  () => {

    pausado = true;
  }
);
btnReset.addEventListener(
  "click",
  () => {

    reiniciado = true;

    clearTimeout(timeoutActual);

    // 🔹 reset estados
    for (let id in nodos) {

      nodos[id].estadoAnimacion =
        "normal";
    }

    redrawTree();

    // 🔹 reiniciar flags
    pausado = false;

    reiniciado = false;

    // 🔹 reiniciar animación
    setTimeout(() => {

      animarDFS(raiz);

    }, 500);
  }
);