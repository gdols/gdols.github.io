---
title: "MdPipe, de la 0.2 a la 0.7: cinco versiones y una que no abría"
date: 2026-09-04
summary: "Lotes tres a ocho veces más rápidos, una lista de formatos que ya no se inventa nada, varios fallos que se comían archivos sin decirlo, y la release que publiqué con 167 tests en verde y que no arrancaba."
draft: false
---

Hace un mes conté cómo la 0.2.0 se actualizaba sola a través del manifiesto. Desde
entonces han salido cinco versiones más de [MdPipe](https://github.com/gdols/mdpipe),
hasta la 0.7.0. En vez de listarlas una a una, prefiero contar lo que tienen en común:
casi todo el trabajo ha ido a que la aplicación deje de fallar en silencio.

![MdPipe con dos documentos en la lista, listo para convertir](/images/mdpipe-app-es.png)

## Un motor por lote, no uno por archivo

Convertir un documento cuesta alrededor de una décima de segundo. Arrancar Python y
cargar el motor cuesta dos segundos. Y MdPipe estaba pagando esos dos segundos **por
cada archivo**, así que en un lote el trabajo real era ruido comparado con el arranque.

Ahora todo el lote comparte un mismo proceso. Cinco archivos pasaron de 13,8 segundos a
4, y veinte de unos 55 a 6,5. Entre tres y ocho veces más rápido según el tamaño del
lote, sin tocar nada de la conversión en sí.

De paso puse un tiempo límite por documento. Antes, un archivo corrupto podía dejar la
conversión colgada para siempre; ahora falla él solo y el resto sigue.

## Preguntarle al motor en vez de mantener una lista

MdPipe enseñaba una lista de formatos escrita a mano, y esa lista ya había derivado:
le faltaban tres formatos que sí funcionaban y ofrecía dos, `.doc` y `.ppt`, que nunca
llegaron a funcionar y solo aparecían más tarde en forma de error.

Ahora la lista se le pregunta a MarkItDown, al que está instalado en tu ordenador, así
que no puede mentir.

![Diálogo con los 28 formatos que MarkItDown reconoce](/images/mdpipe-formatos.png)

Esa lista solo decide qué se recoge al soltar una carpeta entera. Si arrastras un
archivo suelto se intenta convertir sea cual sea su extensión, y si tienes ficheros con
la extensión mal puesta, la casilla *Intentar con todos los archivos* deja que el motor
decida por el contenido.

La interfaz también sale en castellano si Windows está en castellano, y en inglés en
cualquier otro caso.

## Dejar de perder cosas sin decirlo

Aquí es donde estaba lo importante, y son cuatro fallos con la misma forma: la
aplicación hacía algo mal y no lo contaba.

**Un lote podía comerse un documento.** Al convertir un árbol de carpetas hacia una
única carpeta de salida, la estructura se aplana. Así que `2025\informe.pdf` y
`2026\informe.pdf` acababan los dos como `informe.md`, y el segundo pisaba al primero
sin avisar. Ahora el segundo se guarda como `informe-2.md` y el cambio de nombre se
informa.

**Una carpeta sin permisos tiraba el comando entero.** Si en el árbol había algo que no
puedes leer, la conversión moría del todo en vez de saltárselo. Ahora se salta y las
carpetas omitidas se listan.

**Soltar una carpeta congelaba la ventana.** MdPipe recorría el árbol completo antes de
hacer nada más, y mientras tanto Windows la pintaba como "no responde". Soltar mi
carpeta de Documentos eran casi cinco segundos así, y una carpeta llena de proyectos,
doce. Ahora el recorrido va por detrás, te enseña cuántos archivos lleva encontrados y
puedes pararlo, quedándote con los que ya salieron.

**Los archivos soltados durante la instalación desaparecían.** El primer arranque se va
unos minutos descargando Python y MarkItDown, y lo que soltaras mientras tanto se
perdía sin mensaje. Ahora se queda en la lista esperando a que termine.

## El día que publiqué algo que no abría

La 0.6.0 estuvo publicada una hora. No abría: mostraba un cuadro de error y ahí se
acababa. Fue una línea de interfaz en la barra de avisos nueva, nada que ver con
convertir ni con los archivos de nadie.

Lo incómodo no es el fallo, es que **167 tests pasaron en esa release**. Los 167
comprobaban lógica y ninguno había abierto jamás una ventana, así que una versión que
no arrancaba pasó por el filtro sin despeinarse. La pillé yo una hora después y nadie
la había descargado, pero eso fue suerte, no proceso.

La 0.7.0 es la respuesta a eso, y por fuera no trae nada. Ni formatos nuevos, ni más
velocidad, ni un fallo que hubieras notado. Lo que trae es que ahora la compilación
**arranca el ejecutable que acaba de construir y espera a que aparezca la ventana**. Si
no aparece, no se adjunta nada y no hay release que descargar. Comprobé además que ese
test falla de verdad volviendo a meter el error original.

Ya de paso puse bajo test las dos piezas que no lo estaban: el motor de conversión, que
es lo que de verdad convierte tus documentos y cuyos tests solo cubrían una función que
ordena mensajes de error, y la parte que instala Python, que es el origen de casi todos
los "no me instala" que me han llegado. El motor ahora se prueba contra un proceso al
que se le manda petar, colgarse y responder incoherencias a propósito.

## Lo que me llevo

En la entrada anterior escribí que un `catch` vacío no es tolerancia a fallos, es un bug
esperando. Un mes después la lección es la hermana de aquella: **un test que pasa no
dice que el programa funcione, dice que lo que se probó funciona**. Tenía 167 y ninguno
había abierto la aplicación.

Los fallos de esta tanda son casi todos del mismo tipo. No reventaban: se comían un
archivo, se saltaban una carpeta, se quedaban con una lista de formatos que ya no era
verdad. Nada de eso sale en un log ni en un informe de error, porque para la aplicación
todo fue bien.

[Descargar MdPipe.exe](https://github.com/gdols/mdpipe/releases/latest/download/MdPipe.exe)
· [Ver el código](https://github.com/gdols/mdpipe)
· [Releases](https://github.com/gdols/mdpipe/releases)
