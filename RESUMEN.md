# LABLOG — Resumen del proyecto

## Descripción general

LABLOG es una aplicación de escritorio (Electron) con fines educativos, centrada en lógica proposicional y visualización de algoritmos de backtracking. Permite al usuario construir expresiones lógicas booleanas y observar paso a paso cómo se evalúan todas las combinaciones posibles de valores de verdad, presentando los resultados en forma de árbol interactivo.

## Funcionalidad principal

### 1. Construcción de expresiones lógicas
El usuario escribe expresiones booleanas usando:
- **Variables:** A, B, C
- **Operadores:** AND (`&&`), OR (`||`), NOT (`!`)
- **Paréntesis** para agrupar

La aplicación valida la expresión (paréntesis balanceados, operadores correctos, caracteres válidos) y detecta automáticamente las variables usadas.

### 2. Generación del árbol de backtracking
Al pulsar "Analizar", el programa genera un árbol binario donde cada rama representa una combinación de valores de verdad:
- Por cada variable, crea una rama con valor `TRUE` y otra con valor `FALSE`
- Al llegar a una hoja (todas las variables asignadas), evalúa la expresión y marca el nodo como solución (`✔ TRUE`) o fallo (`✖ FALSE`)

### 3. Navegación paso a paso
El botón "Siguiente paso" recorre el historial de decisiones tomadas por el algoritmo, mostrando cada exploración y retroceso.

### 4. Visualización gráfica del árbol
Al pulsar "Dibujar árbol", se abre una ventana modal independiente con un canvas interactivo que muestra el árbol generado. Características:
- **Colores por estado:**
  - Azul: nodo normal (sin explorar)
  - Amarillo: nodo en exploración actual
  - Verde: solución válida
  - Rojo: camino inválido
  - Naranja: retroceso (backtrack)
- **Animación DFS**: reproduce automáticamente el recorrido en profundidad con botones Play/Pause/Reiniciar
- **Zoom** con rueda del ratón
- **Arrastre** para desplazar el canvas
- **Click en nodos**: colapsa/expande subárboles y muestra panel con información del camino y pasos de evaluación

## Estructura del proyecto

| Archivo | Rol |
|---|---|
| `main.js` | Proceso principal de Electron: crea la ventana principal y maneja la apertura de la ventana del árbol vía IPC |
| `renderer/index.html` | Pantalla de bienvenida con logo y menú de módulos |
| `renderer/app.js` | Lógica de navegación entre pantallas |
| `renderer/backtracking.html` | Interfaz del módulo de backtracking (input, teclado lógico, historial) |
| `renderer/backtracking.js` | Lógica central: validación, generación del árbol, evaluación de expresiones paso a paso |
| `renderer/arbol.html` | Ventana modal del árbol con canvas y controles de animación |
| `renderer/arbol.js` | Renderizado del árbol en canvas, animación DFS, zoom, interacción |
| `renderer/algoritmoBacktracking.js` | Implementación alternativa del algoritmo (no usada en la UI actual; opera sobre listas numéricas) |
| `renderer/style.css` | Estilos de la pantalla principal |
| `renderer/styleback.css` | Estilos del módulo de backtracking |

## Estado del proyecto

- El módulo de **BACKTRACKING** está completamente funcional
- Los botones **EXPRESIONES** y **UNIFICACIÓN** aparecen en el menú pero no tienen lógica implementada (sus archivos están vacíos)
- `algoritmoBacktracking.js` contiene una versión alternativa del algoritmo que trabaja con listas de números y un objetivo de suma, pero no está conectada a la interfaz actual

## Cómo ejecutar

```bash
npm install
npm start
```

Requiere Node.js y Electron (v30.0.0 según `package.json`).
