---
title: "WebMCP: le he puesto herramientas a mi web para que las use un agente"
date: 2026-09-16
summary: "Chrome está probando una forma de que una página le diga a un agente qué sabe hacer. Se lo he montado a este blog, lo he probado en Chrome 153 y no todo funcionó como dice la documentación. Con tutorial para probarlo."
image: "/images/webmcp-soporte.png"
draft: false
---

Hoy, cuando un agente de IA entra en una web para hacer algo por ti, lo hace a ciegas.
Mira capturas de pantalla, lee la estructura de la página e intenta adivinar qué botón
pulsar. A veces acierta. Es lento, y basta con mover un botón de sitio para que falle.

WebMCP es una propuesta que está probando Chrome para darle la vuelta: que sea la propia
página la que diga "sé hacer esto, y me lo pides así". Me pareció de las cosas que
conviene tocar antes de opinar, así que se la he puesto a este blog.

La demo está en [gdols.dev/webmcp](/webmcp/). Aquí cuento cómo está hecha, qué salió
distinto de lo que dice la documentación y cómo puedes probarla tú.

## Qué es una herramienta en WebMCP

Una herramienta es una función de tu página con tres cosas pegadas: un nombre, una
descripción en lenguaje normal y un esquema que dice qué parámetros acepta. El agente lee
eso y sabe qué puede pedir sin tener que mirar la pantalla.

Yo he registrado dos, las dos sobre las entradas de este blog: `buscar-notas`, que busca
por texto, y `resumen-de-nota`, que devuelve el título, la fecha y el resumen de una
entrada concreta.

```js
await document.modelContext.registerTool({
  name: "buscar-notas",
  description: "Busca entradas del blog de Guille por texto en el título, el resumen o el cuerpo.",
  inputSchema: {
    type: "object",
    properties: {
      consulta: { type: "string", description: "Palabras a buscar." },
    },
  },
  execute({ consulta }) {
    const encontradas = buscarNotas(consulta);
    return { content: [{ type: "text", text: JSON.stringify(encontradas) }] };
  },
});
```

La línea que importa es la del `execute`. `buscarNotas` es la misma función que usa el
buscador normal de la página, no una copia hecha para el agente. Por eso, cuando el
agente busca, quien está mirando ve cómo el buscador se rellena y la lista se filtra sola.

![La lista de entradas filtrada por markitdown después de que la herramienta rellene el buscador](/images/webmcp-lista-filtrada.png)

Esa es la diferencia con conectar un agente directamente a tu servidor. Ahí el agente
hace cosas por detrás y la pantalla se entera tarde o no se entera.

## Un agente de prueba dentro de la propia página

Para probarlo no hace falta ningún agente de verdad. WebMCP trae `getTools()` y
`executeTool()` para que un script de la propia página haga de agente, y eso es lo que
tiene la demo: un panel que le pregunta al navegador qué herramientas hay y construye los
campos leyendo el esquema. No sabe nada de mi web. Si mañana registro una tercera
herramienta, aparece sola.

![Panel con las dos herramientas, generado a partir de lo que devuelve getTools()](/images/webmcp-panel.png)

Al pulsar el botón no llamo yo a la función. Se la pido al navegador, que la ejecuta en la
página y me devuelve el resultado. Debajo queda un registro con cada paso.

![Registro de una llamada: el agente pide buscar markitdown, Chrome rechaza los argumentos, se repite con texto y la página devuelve seis entradas](/images/webmcp-registro.png)

Esa línea de aviso del medio no estaba en mis planes. Viene de lo siguiente.

## Lo que no cuenta la documentación

Monté el panel siguiendo el explainer, lo abrí en mi Chrome 153 y no pintaba los campos.
A partir de ahí fueron cayendo tres cosas.

**El esquema llega como texto.** `getTools()` devuelve el `inputSchema` como una cadena
JSON, no como un objeto. Mi panel buscaba `inputSchema.properties` y no encontraba nada.

**Los argumentos tienen que ir como texto.** Tanto el explainer como la documentación de
Chrome pasan un objeto a `executeTool()`. En Chrome 153 eso da este error:

```text
UnknownError: Failed to parse input arguments
```

Pasándole los mismos argumentos con `JSON.stringify` funciona.

**Y en la 155 cambia.** La documentación de Chrome, actualizada el 11 de septiembre, avisa
de que pasar los argumentos como JSON queda obsoleto a partir de Chrome 155. Lo que hoy es
la única forma que funciona en mi navegador deja de ser la buena en unas semanas.

La demo ahora prueba primero con un objeto, que es lo documentado, y solo si Chrome lo
rechaza repite con texto. Por eso sale ese aviso en el registro, y lo he dejado a la
vista a propósito.

Hubo una cuarta, más tonta: activé el flag y seguía sin funcionar, porque Chrome no se
había reiniciado de verdad. Con el botón de *Reiniciar*, sí.

## Cómo probarlo tú

Necesitas Chrome 149 o superior. Yo lo he probado en Windows, y según el propio flag vale
también en Mac, Linux y Android. Firefox y Safari no lo tienen.

**1.** Copia esto en la barra de direcciones y cambia *WebMCP for testing* a *Enabled*:

```text
chrome://flags/#enable-webmcp-testing
```

![El flag WebMCP for testing puesto en Enabled](/images/webmcp-flag.png)

**2.** Pulsa *Reiniciar* en la barra que aparece abajo. Usa el botón y no cierres la
ventana a mano, porque Chrome puede seguir abierto por detrás y el flag no se aplica.

![Barra de Chrome avisando de que hay que reiniciar, con el botón Reiniciar](/images/webmcp-reiniciar.png)

**3.** Abre [gdols.dev/webmcp](/webmcp/). Arriba tiene que decir que tu navegador soporta
WebMCP y que la página ha registrado dos herramientas.

![Aviso de la demo diciendo que el navegador soporta WebMCP y que hay dos herramientas registradas](/images/webmcp-soporte.png)

**4.** Baja hasta el panel, escribe algo en `consulta` (prueba con "mallorca") y pulsa
`executeTool()`. Sube un momento: el buscador se ha rellenado solo y la lista está
filtrada. En `resumen-de-nota` puedes poner `un-bug-en-las-ecuaciones-de-markitdown` y
verás esa entrada marcada en la lista.

Si en el paso 3 sale un aviso gris diciendo que tu navegador no expone
`document.modelContext`, es que el flag no está activo o Chrome no se ha reiniciado.

Cuando acabes, vuelve a dejar el flag en *Default*. Es una API experimental y no hace
falta tenerla puesta para nada más.

## Dónde está esto a día de hoy

Es una propuesta, no un estándar. Chrome tiene un origin trial abierto hasta la 156 y
Edge otro desde la 150. Firefox y Safari no se han posicionado. Las revisiones de
seguridad y privacidad siguen pendientes, y la propia ficha de Chrome pone la inyección de
prompt como riesgo conocido: una web que expone herramientas le está dando a un agente
algo más que texto que leer.

Mis dos herramientas solo leen cosas que ya son públicas, así que aquí no hay nada que
romper. En una web con sesión y un botón de comprar me pensaría mucho más cada
herramienta antes de registrarla.

## Lo que me llevo

Registrar la herramienta fueron veinte líneas. Lo que costó fue descubrir que el
navegador no hacía lo que decía la documentación, y eso solo lo supe porque lo abrí.

Con una API que todavía se está escribiendo, el explainer te cuenta lo que se quiere que
haga y el navegador te cuenta lo que hace hoy. No siempre coinciden, y la diferencia
cambia de una versión a la siguiente.

[Probar la demo](/webmcp/)
· [Explainer de WebMCP](https://github.com/webmachinelearning/webmcp)
· [Documentación de Chrome](https://developer.chrome.com/docs/ai/webmcp)
· [Ficha en Chrome Status](https://chromestatus.com/feature/5117755740913664)
