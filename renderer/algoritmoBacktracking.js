function backtracking(lista, objetivo) {
  const pasos = [];
  const eventos = [];
  const soluciones = [];

  let id = 0;

  function explorar(camino, suma, parentId = null) {
    const nodoId = id++;

    // 🔹 registrar nodo
    eventos.push({
      tipo: "nodo",
      id: nodoId,
      parent: parentId,
      valor: camino[camino.length - 1] || "Inicio",
      suma,
      camino: [...camino]
    });

    pasos.push(`➡️ Explorando: [${camino.join(",")}]`);

    if (suma === objetivo) {
      eventos.push({ tipo: "solucion", id: nodoId });
      pasos.push(`✅ Solución: [${camino.join(",")}]`);
      soluciones.push([...camino]);
      return;
    }

    if (suma > objetivo) {
      eventos.push({ tipo: "fallo", id: nodoId });
      pasos.push(`❌ Se pasa`);
      return;
    }

    for (let num of lista) {
      camino.push(num);

      explorar(camino, suma + num, nodoId);

      eventos.push({ tipo: "backtrack", id: nodoId });
      pasos.push(`↩️ Retroceder`);

      camino.pop();
    }
  }

  explorar([], 0);

  return { pasos, eventos, soluciones };
}

module.exports = backtracking;
