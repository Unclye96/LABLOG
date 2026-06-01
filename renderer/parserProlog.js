const { parseTerm, termToString } = require("./unificador");

function findRuleArrow(line) {
  let depth = 0;

  for (let i = 0; i < line.length - 1; i++) {
    if (line[i] === "(") depth++;
    if (line[i] === ")") depth--;

    if (depth === 0 && line[i] === ":" && line[i + 1] === "-") {
      return i;
    }
  }

  return -1;
}

function splitGoals(str) {
  const goals = [];
  let start = 0;
  let depth = 0;

  for (let i = 0; i <= str.length; i++) {
    if (i < str.length && str[i] === "(") depth++;
    if (i < str.length && str[i] === ")") depth--;

    if (i === str.length || (depth === 0 && str[i] === ",")) {
      const part = str.slice(start, i).trim();

      if (part) {
        goals.push(parseTerm(part));
      }

      start = i + 1;
    }
  }

  return goals;
}

function stripComment(line) {
  let depth = 0;

  for (let i = 0; i < line.length; i++) {
    if (line[i] === "(") depth++;
    if (line[i] === ")") depth--;

    if (line[i] === "%" && depth === 0) {
      return line.slice(0, i).trim();
    }
  }

  return line.trim();
}

function parseClause(line, lineNum) {
  if (!line.endsWith(".")) {
    throw new Error("Debe terminar con punto (.)");
  }

  const content = line.slice(0, -1).trim();
  const arrowIdx = findRuleArrow(content);

  if (arrowIdx >= 0) {
    const headStr = content.slice(0, arrowIdx).trim();
    const bodyStr = content.slice(arrowIdx + 2).trim();

    if (!headStr) {
      throw new Error("Falta la cabeza de la regla");
    }

    if (!bodyStr) {
      throw new Error("Falta el cuerpo de la regla después de :-");
    }

    return {
      head: parseTerm(headStr),
      body: splitGoals(bodyStr),
      text: line,
      lineNum,
      type: "rule"
    };
  }

  return {
    head: parseTerm(content),
    body: [],
    text: line,
    lineNum,
    type: "fact"
  };
}

function parseProgram(text) {
  const facts = [];
  const rules = [];
  const errors = [];
  const lines = text.split(/\r?\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = stripComment(lines[i]);

    if (!line) {
      continue;
    }

    try {
      const clause = parseClause(line, i + 1);

      if (clause.body.length === 0) {
        facts.push(clause);
      } else {
        rules.push(clause);
      }
    } catch (err) {
      errors.push(`Línea ${i + 1}: ${err.message}`);
    }
  }

  return {
    facts,
    rules,
    clauses: [...facts, ...rules],
    errors
  };
}

function parseQuery(text) {
  let query = text.trim();

  if (!query) {
    throw new Error("Consulta vacía");
  }

  if (query.startsWith("?-")) {
    query = query.slice(2).trim();
  }

  if (query.endsWith(".")) {
    query = query.slice(0, -1).trim();
  }

  if (!query) {
    throw new Error("Consulta vacía");
  }

  return splitGoals(query);
}

function validarPrograma(text) {
  const { facts, rules, errors } = parseProgram(text);

  if (errors.length > 0) {
    return { ok: false, errors, facts, rules, clauses: [] };
  }

  if (facts.length === 0 && rules.length === 0) {
    return {
      ok: false,
      errors: ["El programa no contiene hechos ni reglas"],
      facts,
      rules,
      clauses: []
    };
  }

  return {
    ok: true,
    errors: [],
    facts,
    rules,
    clauses: [...facts, ...rules]
  };
}

function validarConsulta(text) {
  try {
    const goals = parseQuery(text);
    return { ok: true, goals, error: null };
  } catch (err) {
    return { ok: false, goals: [], error: err.message };
  }
}

function describeClause(clause) {
  if (clause.body.length === 0) {
    return `hecho ${termToString(clause.head, {})}`;
  }

  const body = clause.body.map((g) => termToString(g, {})).join(", ");
  return `${termToString(clause.head, {})} :- ${body}`;
}

module.exports = {
  parseProgram,
  parseQuery,
  validarPrograma,
  validarConsulta,
  describeClause
};
