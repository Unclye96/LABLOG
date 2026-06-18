# Guía de demostración — LABLOG

## Pantalla de inicio
1. Al abrir la app, ves el logo LABLOG con el botón **Iniciar**
2. Pulsa **Iniciar** → transición al menú con 4 módulos

---

## 1. PROGRAMA PROLOG (recomendado empezar aquí)

El módulo más completo. Simula un intérprete Prolog con hechos, reglas, unificación y backtracking.

### Paso a paso:
1. Pulsa **"Cargar ejemplo (Familia)"** → se autocompletan hechos y reglas:
   ```
   padre(juan, pedro).
   padre(pedro, ana).
   padre(carlos, luis).
   abuelo(X, Z) :- padre(X, Y), padre(Y, Z).
   ```
   Y la consulta: `?- abuelo(juan, Z)`

2. Pulsa **Validar** → muestra "2 hecho(s), 1 regla(s)."

3. Pulsa **Ejecutar consulta** → devuelve las soluciones (`Z = ana`).
   - Se activa el botón **Siguiente paso**
   - Se activa el botón **Ver árbol**

4. Pulsa **Siguiente paso** repetidamente → ves cada paso del proceso: unificación de `abuelo(juan, Z)` con la regla, sustitución de variables, backtracking.

5. Pulsa **Ver árbol** → ventana modal con árbol de backtracking animado (misma visualización que el módulo Backtracking).

### Otros ejemplos para probar:
- Cambia la consulta a `?- abuelo(X, ana)` y ejecuta → encuentra `X = juan`
- Consulta que falla: `?- abuelo(ana, juan)` → "✖ Consulta falsa"

---

## 2. EXPRESIONES (tablas de verdad)

Genera la tabla de verdad de una expresión lógica booleana.

### Paso a paso:
1. Construye una expresión usando el teclado lógico:
   - Variables: **A**, **B**, **C**
   - Operadores: **AND** (`&&`), **OR** (`||`), **NOT** (`!`)
   - Paréntesis: `( )`

2. Ejemplo: escribe `(A && B) || C`

3. Pulsa **"Generar tabla"** → tabla con todas las combinaciones (2³ = 8 filas), cada una con su resultado T/F.

### Ideas para demostrar:
| Expresión | Qué muestra |
|---|---|
| `A && B` | AND básico |
| `A \|\| B` | OR básico |
| `!A` | Negación |
| `(A && B) \|\| C` | Combinación con paréntesis |
| `A && !A` | Contradicción (todo F) |
| `A \|\| !A` | Tautología (todo T) |
| `(A && B) \|\| (!A && C)` | Expresión más compleja |

---

## 3. UNIFICACIÓN

Algoritmo de unificación estilo Prolog (Martelli-Montanari simplificado). Intenta encontrar una sustitución que haga iguales dos términos.

### Convenciones:
- **Minúscula** = átomo/constante (ej: `a`, `b`, `f`)
- **Mayúscula** = variable (ej: `X`, `Y`, `Z`)
- `f(X, a)` = término compuesto (functor `f` con argumentos)

### Paso a paso:
1. Usa los botones de ejemplo precargados (los más demostrativos):

| Ejemplo | Término 1 | Término 2 | Resultado |
|---|---|---|---|
| `f(X,a) + f(b,Y)` | `f(X, a)` | `f(b, Y)` | ✔ `{ X/b, Y/a }` |
| `X + a` | `X` | `a` | ✔ `{ X/a }` |
| `f(X,X) + f(a,b)` | `f(X, X)` | `f(a, b)` | ✖ Fallida (X no puede ser a y b a la vez) |
| Occur check | `X` | `f(X)` | ✖ Fallida (X no puede contenerse a sí misma) |

2. Cada ejemplo muestra el **historial paso a paso** del algoritmo (ligaduras, comprobaciones, occur check).

### Ejemplos manuales adicionales:
- `h(X, g(Y))` con `h(a, g(b))` → ✔ `{ X/a, Y/b }`
- `p(X, Y, X)` con `p(a, b, c)` → ✖ Fallida

---

## 4. BACKTRACKING

Exploración de expresiones lógicas con visualización de árbol de backtracking.

### Paso a paso:
1. Construye una expresión con el teclado lógico (igual que en Expresiones)
2. Ejemplo: `(A && B) || C`
3. Pulsa **Analizar** → detecta variables (A, B, C) y genera el árbol internamente
4. Pulsa **Siguiente paso** repetidamente → historial mostrando cada rama explorada:
   - `➡️ Probando A=TRUE`
   - `➡️ Probando B=TRUE`
   - `✅ A=T → B=T → ...` (solución)
   - `↩️ Retrocediendo desde B=TRUE`
   - ...
5. Pulsa **Dibujar árbol** → ventana modal con:
   - Árbol animado con recorrido DFS automático
   - Colores: azul (normal), amarillo (explorando), verde (solución), rojo (fallo), naranja (backtrack)
   - Controles: **Play / Pause / Reiniciar**
   - **Zoom** con rueda del ratón y **arrastre** con clic sostenido
   - **Click en nodos** para colapsar/expandir y ver info del camino

### Diferencias con EXPRESIONES:
- Expresiones: tabla estática con todos los resultados de una vez
- Backtracking: muestra el **proceso** de búsqueda, paso a paso, con árbol animado

---

## Orden recomendado para la demo

1. **Expresiones** (5 min) — lo más simple, entrada rápida: tabla de verdad
2. **Backtracking** (5 min) — el mismo concepto pero mostrando el proceso de exploración + árbol animado
3. **Unificación** (5 min) — concepto nuevo, ejemplos precargados muy visuales
4. **Programa Prolog** (10 min) — integra todo lo anterior: unificación + backtracking + reglas, es el módulo estrella
