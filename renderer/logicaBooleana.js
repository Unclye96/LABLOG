function obtenerVariables(expresion) {
  const matches = expresion.match(/[A-Z]/g);

  if (!matches) {
    return [];
  }

  return [...new Set(matches)].sort();
}

function evaluarExpresion(expresion, valores) {
  let expr = expresion;

  for (let variable in valores) {
    expr = expr.replaceAll(variable, valores[variable]);
  }

  try {
    return eval(expr);
  } catch {
    return false;
  }
}

function validarExpresion(expresion) {
  if (!expresion.trim()) {
    return "La expresión está vacía";
  }

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

  if (expresion.startsWith("&&") || expresion.startsWith("||")) {
    return "La expresión no puede iniciar con AND u OR";
  }

  if (
    expresion.endsWith("&&") ||
    expresion.endsWith("||") ||
    expresion.endsWith("!")
  ) {
    return "La expresión termina incorrectamente";
  }

  if (expresion.includes("&&&&") || expresion.includes("||||")) {
    return "Hay operadores repetidos";
  }

  if (/[A-Z]{2,}/.test(expresion)) {
    return "Falta operador entre variables";
  }

  const permitido = /^[A-Z()!&|\s]+$/;

  if (!permitido.test(expresion)) {
    return "Hay caracteres inválidos";
  }

  if (/(&&\)|\|\|\))/.test(expresion)) {
    return "Operador antes de ')'";
  }

  return null;
}

module.exports = {
  obtenerVariables,
  validarExpresion,
  evaluarExpresion
};
