---
title: "Cómo convertir tus documentos a Markdown para usarlos con ChatGPT"
date: 2026-09-08
summary: "Subir un PDF a una IA funciona hasta que deja de funcionar: cuando son cuarenta, cuando llevan tablas, o cuando el modelo que quieres usar no acepta PDFs. La solución es pasarlos a texto antes, y en Windows se puede hacer sin instalar nada."
draft: false
---

Puedes subir un PDF a ChatGPT y normalmente lo lee. El problema aparece un poco más
tarde, cuando ya te has acostumbrado.

Aparece cuando no es un documento sino cuarenta. Cuando el PDF lleva tablas y lo que
llega al otro lado es una sopa de números sin columnas. Cuando quieres usar un modelo
que corre en tu ordenador y resulta que solo acepta texto. O cuando no era para una IA
siquiera, sino para meter años de apuntes en Obsidian.

En todos esos casos la respuesta es la misma: convertir los documentos a texto antes,
y concretamente a Markdown.

## Por qué Markdown y no texto a secas

Markdown es texto plano que conserva la estructura. Un título sigue siendo un título,
una tabla sigue siendo una tabla, una lista sigue siendo una lista, y todo eso se
escribe con cuatro símbolos que cualquier modelo entiende sin que nadie se lo explique.

Es la diferencia entre darle a la IA un documento y darle un amasijo. Y como no hay
nada de formato debajo, ni fuentes, ni cajas, ni metadatos, no gastas contexto en cosas
que no dicen nada.

Es también lo que leen Obsidian, Notion y prácticamente cualquier aplicación de notas
que se haya escrito en los últimos diez años.

## Cómo lo hago yo

Escribí una aplicación para esto, [MdPipe](https://github.com/gdols/mdpipe), porque me
cansé de explicarle a la gente cómo instalar Python.

Es un solo archivo. Lo descargas, haces doble clic y arrastras encima los documentos o
la carpeta entera. No hay instalador, no hay que configurar nada y no necesitas tener
Python ni .NET.

![MdPipe con dos documentos en la lista, listo para convertir](/images/mdpipe-app-es.png)

La primera vez que lo abres tarda un minuto en prepararse, porque se descarga su propio
Python en una carpeta suya. No toca el que puedas tener instalado ni cambia nada del
sistema. A partir de ahí funciona sin conexión.

La conversión ocurre entera en tu ordenador. No se sube ningún documento a ningún
sitio, que para papeles del trabajo o del médico no es un detalle menor.

## Qué convierte bien y qué no

Lee PDF, Word, Excel, PowerPoint, EPUB, páginas web, imágenes, audio, correos de Outlook
y ficheros ZIP con todo lo anterior dentro. Son 28 formatos, y la propia aplicación te
enseña la lista real de tu ordenador en vez de una escrita a mano.

![Diálogo con los 28 formatos que reconoce](/images/mdpipe-formatos.png)

Ahora lo que no funciona, que conviene saberlo antes de perder la tarde:

**Los PDFs escaneados no.** Si el PDF es una foto de unas páginas, no hay texto que
extraer y no sale nada. Para eso hace falta OCR, que es otro problema y MdPipe no lo
hace. Si al abrir el PDF no puedes seleccionar el texto con el ratón, es un escaneo.

**Los Word y PowerPoint de los noventa tampoco**, los de extensión `.doc` y `.ppt`.
Ábrelos y guárdalos como `.docx` o `.pptx`, y entonces sí.

**Las tablas muy complicadas salen regular.** Una tabla normal se convierte bien; una
con celdas combinadas y tres cabeceras, no esperes milagros.

## Si ya tienes Python, no necesitas nada de esto

Por debajo, MdPipe usa [MarkItDown](https://github.com/microsoft/markitdown), que es una
librería de Microsoft. Si Python no te da miedo, puedes saltarte mi aplicación entera:

```bash
pip install markitdown[all]
markitdown documento.pdf > documento.md
```

Eso hace el mismo trabajo, porque literalmente es el mismo motor. MdPipe existe para
quien no quiere abrir una terminal, no porque haga la conversión mejor.

Hay más interfaces gráficas para MarkItDown por ahí, casi todas también en Python y casi
ninguna con un ejecutable que puedas descargar. Si buscas, mira eso antes que nada: si
para probarlo tienes que clonar un repositorio, no era para ti.

## Lo que yo hago con esto

Mi caso es aburrido y probablemente parecido al tuyo. Tengo documentación técnica en PDF
que quiero poder preguntarle a una IA sin subirla a ningún sitio, y facturas y papeleo
que acaban en notas. Arrastro la carpeta, espero unos segundos y ya está.

Es una herramienta de un solo paso, y para mí eso es la mitad de la gracia.

[Descargar MdPipe.exe](https://github.com/gdols/mdpipe/releases/latest/download/MdPipe.exe)
· [Ver el código](https://github.com/gdols/mdpipe)
· [MarkItDown](https://github.com/microsoft/markitdown)
