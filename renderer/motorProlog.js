const {
  applySubst,
  unifyTerms,
  termToString,
  formatSustitucion,
  deepCloneTerm,
  deepCloneSubst
} = require("./unificador");
const { describeClause } = require("./parserProlog");

function collectVars(terms) {
  const vars = new Set();

  function walk(term) {
    if (term.type === "var") {
      vars.add(term.name);
    } else if (term.type === "compound") {
      term.args.forEach(walk);
    }
  }

  terms.forEach(walk);
  return [...vars].sort();
}

function extractAnswerSubst(subst, queryVars) {
  const answer = {};

  for (const varName of queryVars) {
    if (subst[varName]) {
      answer[varName] = applySubst(subst[varName], subst);
    } else {
      answer[varName] = { type: "var", name: varName };
    }
  }

  return answer;
}

function formatAnswer(answer) {
  const entries = Object.entries(answer);

  if (entries.length === 0) {
    return "verdadero";
  }

  return formatSustitucion(answer);
}

function ejecutarConsulta(clauses, queryGoals) {
  const pasos = [];
  const soluciones = [];
  const arbol = [];
  let idCounter = 0;
  const queryVars = collectVars(queryGoals);
  const queryLabel = queryGoals.map((g) => termToString(g, {})).join(", ");

  const raizId = idCounter++;
  arbol.push({
    id: raizId,
    parent: null,
    tipo: "nodo",
    valor: `CONSULTA: ${queryLabel}`
  });

  pasos.push(`📋 Consulta: ${queryLabel}`);
  pasos.push(`📚 Cláusulas disponibles: ${clauses.length}`);

  function resolver(goals, subst, parentId, depth) {
    if (depth > 100) {
      pasos.push("✗ Límite de profundidad alcanzado");
      return;
    }

    if (goals.length === 0) {
      const answer = extractAnswerSubst(subst, queryVars);
      soluciones.push(answer);

      const nodeId = idCounter++;
      arbol.push({
        id: nodeId,
        parent: parentId,
        tipo: "resultado",
        estado: "solucion",
        valor: `✔ ${formatAnswer(answer)}`
      });

      pasos.push(`✅ Solución: ${formatAnswer(answer)}`);
      return;
    }

    const goal = applySubst(goals[0], subst);
    const rest = goals.slice(1);

    pasos.push(`🎯 Objetivo: ${termToString(goal, {})}`);

    let matched = false;

    for (const clause of clauses) {
      const newSubst = deepCloneSubst(subst);
      const unifyLog = [];
      const head = deepCloneTerm(clause.head);

      if (!unifyTerms(goal, head, newSubst, unifyLog)) {
        continue;
      }

      matched = true;
      const tryId = idCounter++;
      const label = describeClause(clause);

      arbol.push({
        id: tryId,
        parent: parentId,
        tipo: "nodo",
        valor: label
      });

      pasos.push(`→ Probar ${label}`);
      unifyLog.forEach((line) => pasos.push(`   ${line}`));

      const bodyGoals = clause.body.map((b) => deepCloneTerm(b));
      const restGoals = rest.map((g) => deepCloneTerm(g));
      const newGoals = bodyGoals.concat(restGoals);

      if (newGoals.length > 0) {
        pasos.push(
          `   Subobjetivos: ${newGoals.map((g) => termToString(g, {})).join(", ")}`
        );
      }

      resolver(newGoals, newSubst, tryId, depth + 1);
    }

    if (!matched) {
      const failId = idCounter++;
      arbol.push({
        id: failId,
        parent: parentId,
        tipo: "resultado",
        estado: "fallo",
        valor: `✖ Fallo en ${termToString(goal, {})}`
      });

      pasos.push(`✗ Sin cláusula para: ${termToString(goal, {})}`);
      pasos.push("↩️ Retroceso (backtracking)");
    }
  }

  const initialGoals = queryGoals.map((g) => deepCloneTerm(g));
  resolver(initialGoals, {}, raizId, 0);

  if (soluciones.length === 0) {
    pasos.push("❌ Consulta falsa: no se encontraron soluciones");
  } else {
    pasos.push(`🏁 Total de soluciones: ${soluciones.length}`);
  }

  return {
    ok: soluciones.length > 0,
    soluciones,
    pasos,
    arbol,
    queryVars
  };
}

module.exports = {
  ejecutarConsulta,
  formatAnswer
};
