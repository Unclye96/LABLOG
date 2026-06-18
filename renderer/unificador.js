function parseTerm(str) {
  const input = str.trim();

  if (!input) {
    throw new Error("Término vacío");
  }

  const { term, pos } = parseTermAt(input, 0);
  const end = skipSpaces(input, pos);

  if (end < input.length) {
    throw new Error(`Texto sobrante después del término: '${input.slice(end)}'`);
  }

  return term;
}

function parseTermAt(input, pos) {
  pos = skipSpaces(input, pos);

  if (pos >= input.length) {
    throw new Error("Entrada inesperada al final");
  }

  if (input[pos] === "'") {
    return parseQuotedAtom(input, pos);
  }

  if (/[A-Z]/.test(input[pos])) {
    return parseVariable(input, pos);
  }

  if (/[a-z]/.test(input[pos])) {
    return parseAtomOrCompound(input, pos);
  }

  throw new Error(`Carácter inválido en posición ${pos + 1}: '${input[pos]}'`);
}

function skipSpaces(input, pos) {
  while (pos < input.length && /\s/.test(input[pos])) {
    pos++;
  }
  return pos;
}

function parseVariable(input, pos) {
  const start = pos;

  while (pos < input.length && /[A-Za-z0-9_]/.test(input[pos])) {
    pos++;
  }

  const name = input.slice(start, pos);

  return {
    term: { type: "var", name },
    pos
  };
}

function parseQuotedAtom(input, pos) {
  const start = pos;
  pos++;

  while (pos < input.length && input[pos] !== "'") {
    pos++;
  }

  if (pos >= input.length) {
    throw new Error("Átomo entre comillas sin cerrar");
  }

  pos++;

  return {
    term: { type: "atom", value: input.slice(start, pos) },
    pos
  };
}

function parseAtomOrCompound(input, pos) {
  const start = pos;

  while (pos < input.length && /[a-zA-Z0-9_]/.test(input[pos])) {
    pos++;
  }

  const functor = input.slice(start, pos);
  pos = skipSpaces(input, pos);

  if (pos >= input.length || input[pos] !== "(") {
    return {
      term: { type: "atom", value: functor },
      pos
    };
  }

  pos++;
  const args = [];

  pos = skipSpaces(input, pos);

  if (pos < input.length && input[pos] !== ")") {
    while (true) {
      const parsed = parseTermAt(input, pos);
      args.push(parsed.term);
      pos = skipSpaces(input, parsed.pos);

      if (pos < input.length && input[pos] === ",") {
        pos++;
        pos = skipSpaces(input, pos);
        continue;
      }

      break;
    }
  }

  if (pos >= input.length || input[pos] !== ")") {
    throw new Error("Falta ')' en término compuesto");
  }

  pos++;

  return {
    term: { type: "compound", functor, args },
    pos: skipSpaces(input, pos)
  };
}

function termToString(term, sustitucion) {
  const resolved = applySubst(term, sustitucion);

  switch (resolved.type) {
    case "var":
      return resolved.name;
    case "atom":
      return resolved.value;
    case "compound":
      return `${resolved.functor}(${resolved.args.map((a) => termToString(a, {})).join(", ")})`;
    default:
      return String(resolved);
  }
}

function applySubst(term, sustitucion) {
  if (term.type === "var") {
    if (sustitucion[term.name]) {
      return applySubst(sustitucion[term.name], sustitucion);
    }
    return term;
  }

  if (term.type === "atom") {
    return term;
  }

  return {
    type: "compound",
    functor: term.functor,
    args: term.args.map((arg) => applySubst(arg, sustitucion))
  };
}

function occursIn(varName, term, sustitucion) {
  const resolved = applySubst(term, sustitucion);

  if (resolved.type === "var") {
    return resolved.name === varName;
  }

  if (resolved.type === "atom") {
    return false;
  }

  return resolved.args.some((arg) => occursIn(varName, arg, sustitucion));
}

function copySubst(sustitucion) {
  return { ...sustitucion };
}

function deepCloneTerm(term) {
  if (term.type === "var" || term.type === "atom") {
    return { ...term };
  }

  return {
    type: "compound",
    functor: term.functor,
    args: term.args.map(deepCloneTerm)
  };
}

function deepCloneSubst(sustitucion) {
  const result = {};

  for (const [name, term] of Object.entries(sustitucion)) {
    result[name] = deepCloneTerm(term);
  }

  return result;
}

function unificar(term1, term2) {
  const pasos = [];
  const sustitucion = {};

  const ok = unifyTerms(term1, term2, sustitucion, pasos);

  return {
    ok,
    sustitucion: ok ? sustitucion : {},
    pasos
  };
}

function unifyTerms(t1, t2, sustitucion, pasos) {
  const a = applySubst(t1, sustitucion);
  const b = applySubst(t2, sustitucion);

  if (termsEqual(a, b)) {
    pasos.push(`✓ ${termToString(a, {})} = ${termToString(b, {})} (iguales)`);
    return true;
  }

  if (a.type === "var") {
    return bindVar(a.name, b, sustitucion, pasos);
  }

  if (b.type === "var") {
    return bindVar(b.name, a, sustitucion, pasos);
  }

  if (a.type === "compound" && b.type === "compound") {
    if (a.functor !== b.functor || a.args.length !== b.args.length) {
      pasos.push(
        `✗ No unifican: ${termToString(a, {})} y ${termToString(b, {})} (distinto functor o aridad)`
      );
      return false;
    }

    pasos.push(
      `→ Unificando compuestos: ${a.functor}/${a.args.length} con ${b.functor}/${b.args.length}`
    );

    for (let i = 0; i < a.args.length; i++) {
      if (!unifyTerms(a.args[i], b.args[i], sustitucion, pasos)) {
        return false;
      }
    }

    return true;
  }

  pasos.push(
    `✗ No unifican: ${termToString(a, {})} y ${termToString(b, {})} (tipos incompatibles)`
  );
  return false;
}

function bindVar(varName, term, sustitucion, pasos) {
  const resolved = applySubst(term, sustitucion);

  if (resolved.type === "var" && resolved.name === varName) {
    pasos.push(`✓ ${varName} ya está ligada a sí misma`);
    return true;
  }

  if (occursIn(varName, resolved, sustitucion)) {
    pasos.push(
      `✗ Occur check fallido: ${varName} no puede unificarse con ${termToString(resolved, {})}`
    );
    return false;
  }

  sustitucion[varName] = resolved;
  pasos.push(`→ Ligando ${varName} = ${termToString(resolved, {})}`);
  return true;
}

function termsEqual(a, b) {
  if (a.type !== b.type) {
    return false;
  }

  if (a.type === "var") {
    return a.name === b.name;
  }

  if (a.type === "atom") {
    return a.value === b.value;
  }

  if (a.functor !== b.functor || a.args.length !== b.args.length) {
    return false;
  }

  return a.args.every((arg, i) => termsEqual(arg, b.args[i]));
}

function formatSustitucion(sustitucion) {
  const entries = Object.entries(sustitucion);

  if (entries.length === 0) {
    return "{}";
  }

  const parts = entries.map(
    ([name, term]) => `${name}/${termToString(term, {})}`
  );

  return `{ ${parts.join(", ")} }`;
}

module.exports = {
  parseTerm,
  unificar,
  termToString,
  formatSustitucion,
  applySubst,
  unifyTerms,
  deepCloneTerm,
  deepCloneSubst
};
