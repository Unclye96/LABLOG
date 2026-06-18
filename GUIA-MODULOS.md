# LABLOG — Guía de módulos para el usuario

**LABLOG** es una aplicación de escritorio para aprender conceptos de **lógica**, **tablas de verdad**, **unificación** y **programación lógica (estilo Prolog)**. Cada módulo es independiente: puedes entrar al que necesites desde el menú principal.

---

## Cómo empezar

1. Abre la aplicación (por ejemplo con `npm start` si la usas en desarrollo, o haciendo doble clic en el ejecutable si lo tienes empaquetado).
2. En la **pantalla de bienvenida** verás el logo y el botón **Iniciar**.
3. Pulsa **Iniciar** para acceder al **menú de módulos**.
4. Elige uno de los cuatro módulos.
5. En cualquier módulo, el botón **Volver** te devuelve al menú principal.
6. **Salir** cierra la aplicación por completo.

---

## Menú principal

Desde aquí accedes a:

| Módulo | Para qué sirve |
|--------|----------------|
| **Programa Prolog** | Escribir hechos y reglas, hacer consultas y ver cómo se resuelven |
| **Expresiones** | Construir expresiones booleanas y obtener su tabla de verdad |
| **Unificación** | Comparar dos términos y ver si se pueden igualar mediante sustituciones |
| **Backtracking** | Explorar paso a paso todas las combinaciones de variables y ver el árbol de búsqueda |

---

## Módulo: Expresiones

### ¿Qué hace?

Te permite **construir una expresión lógica** con variables y operadores, y generar automáticamente su **tabla de verdad**: todas las combinaciones posibles de verdadero (T) y falso (F) para cada variable, y el resultado final de la expresión.

### ¿Para quién es útil?

Si quieres comprobar cómo se comporta una fórmula booleana sin calcularla a mano, o si estás estudiando conectivos lógicos (AND, OR, NOT).

### Cómo usarlo

1. Escribe la expresión en el cuadro de texto o usa el **teclado en pantalla**:
   - Variables: **A**, **B**, **C** (puedes usar más letras si las escribes; se convierten a mayúsculas).
   - **AND** → `&&`
   - **OR** → `||`
   - **NOT** → `!`
   - Paréntesis: `( )`
2. **⌫** borra el último carácter; **Clear** limpia todo.
3. Pulsa **Generar tabla**.
4. La tabla muestra una columna por variable, más una columna con el resultado de tu expresión. Las filas donde el resultado es verdadero se resaltan en verde.

### Detalles importantes

- La expresión debe ser **válida** (paréntesis balanceados, operadores bien colocados). Si hay un error, verás un mensaje.
- Hay un límite de **8 variables** como máximo (256 filas en la tabla). Con más variables la tabla sería demasiado grande.

### Ejemplo

Expresión: `(A && B) || !C`

La tabla listará todas las combinaciones de A, B y C y el valor T o F de la expresión completa en cada fila.

---

## Módulo: Unificación

### ¿Qué hace?

Compara **dos términos** escritos al estilo Prolog e intenta **unificarlos**: encontrar valores para las variables (en mayúscula) de modo que ambos términos representen lo mismo. Muestra si la unificación tiene éxito, la **sustitución** resultante y un **historial** con los pasos del algoritmo.

### ¿Para quién es útil?

Para entender cómo Prolog (y la lógica de primer orden) “iguala” estructuras: variables, átomos y functores como `f(X, a)`.

### Cómo usarlo

1. Escribe el **primer término** y el **segundo término** en los dos campos.
2. Pulsa **Unificar**.
3. Revisa el **Resultado** (éxito o fallo) y el **Historial** (paso a paso).

### Convenciones de escritura

- **Variables**: letra en mayúscula (`X`, `Y`, `Z`).
- **Átomos / constantes**: minúsculas (`a`, `b`, `juan`).
- **Functores**: nombre seguido de argumentos entre paréntesis, separados por comas: `f(X, a)`, `padre(juan, pedro)`.

### Ejemplos integrados

Puedes cargar casos de prueba con los botones de ejemplo:

- `f(X,a)` y `f(b,Y)` — unificación con sustitución en ambos lados.
- `X` y `a` — variable frente a constante.
- `f(X,X)` y `f(a,b)` — caso que suele fallar.
- **Occur check** — cuando una variable no puede unificarse consigo misma dentro de una estructura más grande.

---

## Módulo: Backtracking

### ¿Qué hace?

Combina **expresiones booleanas** con un algoritmo de **backtracking** (vuelta atrás): el sistema prueba asignar verdadero o falso a cada variable, explora todas las ramas posibles y te muestra **cada camino** que lleva a que la expresión sea verdadera o falsa.

Además puedes abrir una **ventana con el árbol de exploración** para ver gráficamente las decisiones (asignar T o F a cada variable) y los resultados.

### ¿Para quién es útil?

Si quieres ver *cómo* un programa de búsqueda recorre el espacio de soluciones, no solo el resultado final. Es el módulo más visual del proyecto.

### Cómo usarlo

1. Construye una expresión con el teclado (igual que en Expresiones: `&&`, `||`, `!`, variables, paréntesis).
2. Pulsa **Analizar**.
   - Se detectan las variables usadas.
   - Se genera internamente el árbol de todas las combinaciones.
3. Pulsa **Siguiente paso** para recorrer el historial de caminos (cada línea indica si esa combinación hace la expresión verdadera o falsa).
4. Pulsa **Dibujar árbol** para abrir la vista gráfica del árbol de búsqueda.

### Vista del árbol (Backtracking y Prolog)

En la ventana del árbol puedes:

- **Ampliar / reducir** el zoom.
- **Arrastrar** el lienzo para moverte por el árbol.
- Usar **Volver** para cerrar la vista y regresar al módulo.

Los nodos representan decisiones (por ejemplo asignar T o F a una variable) y las hojas muestran si esa rama es solución (verdadera) o no.

---

## Módulo: Programa Prolog

### ¿Qué hace?

Simula un **mini intérprete Prolog**: escribes **hechos** y **reglas**, lanzas una **consulta** y el sistema intenta resolverla usando **unificación** y **backtracking**. Puedes validar la sintaxis, ver todas las soluciones encontradas, recorrer el proceso paso a paso y, si hay búsqueda suficiente, **visualizar el árbol** de exploración.

### ¿Para quién es útil?

Para practicar relaciones familiares, reglas lógicas simples o cualquier programa pequeño en notación Prolog sin instalar un intérprete completo.

### Cómo usarlo

1. **Hechos y reglas** — escribe tu programa en el área de texto grande.
   - Cada hecho o regla termina en **punto** (`.`).
   - Los hechos son afirmaciones: `padre(juan, pedro).`
   - Las reglas usan `:-` : `abuelo(X, Z) :- padre(X, Y), padre(Y, Z).`
2. **Consulta** — en el campo inferior, escribe algo como `?- abuelo(juan, Z)` o solo `abuelo(juan, Z)` (el programa acepta la forma con o sin prefijo `?-`).
3. **Validar** — comprueba que el programa no tenga errores de sintaxis. Te indica cuántos hechos y reglas detectó.
4. **Ejecutar consulta** — resuelve la consulta y muestra:
   - Si es **verdadera** o **falsa**.
   - La lista de **soluciones** (sustituciones de variables).
5. **Siguiente paso** — recorre el historial del proceso de resolución (disponible tras ejecutar).
6. **Ver árbol** — abre la visualización del árbol de búsqueda (cuando la consulta genera un árbol con más de un nodo).
7. **Reiniciar** — limpia resultados, historial y pasos para empezar de nuevo.
8. **Ejemplo: Familia (abuelo)** — carga un programa y consulta de demostración.

### Ejemplo incluido

Programa de familia con hechos `padre(...)` y regla `abuelo(X, Z) :- padre(X, Y), padre(Y, Z).`

Consulta: `?- abuelo(juan, Z)` — el sistema buscará los valores de `Z` que cumplan la regla.

---

## Resumen: qué módulo elegir

| Si quieres… | Usa |
|-------------|-----|
| Ver la tabla de verdad de una fórmula | **Expresiones** |
| Entender si dos términos Prolog se pueden igualar | **Unificación** |
| Ver cómo se exploran combinaciones T/F con un árbol | **Backtracking** |
| Escribir hechos, reglas y consultas como en Prolog | **Programa Prolog** |

---

## Consejos generales

- Usa **Volver** para no cerrar la app al cambiar de módulo.
- Los iconos **ℹ** en algunas pantallas muestran ayuda breve al pasar el cursor o hacer clic.
- Si una expresión booleana da error, revisa paréntesis y que no falten operandos entre operadores.
- En Prolog, las **variables van en mayúscula**; los **nombres de hechos y functores en minúscula**.
- Tras cambios grandes en un módulo, **Clear** / **Reiniciar** ayudan a empezar de cero.

---

## Cerrar la aplicación

Desde el **menú principal**, pulsa **Salir**. También puedes cerrar la ventana con el botón habitual del sistema operativo.
