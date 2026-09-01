---
title: "Un bug de 2016 en las ecuaciones de MarkItDown"
date: 2026-09-01
summary: "Cómo buscar algo que arreglar en un repositorio con 469 pull requests abiertos, y qué encontré en la tabla que convierte las ecuaciones de Word a LaTeX."
draft: false
---

En el post anterior conté que MarkItDown 0.1.7 traía, entre otras cosas, macros LaTeX
corregidas en las ecuaciones de Word. Lo escribí como quien recibe una actualización.
Esta vez estuve al otro lado: el 31 de agosto entró en `main` un arreglo mío en esa
misma tabla.

[MdPipe](https://github.com/gdols/mdpipe) no existe sin MarkItDown. Si la librería
convierte mal, mi aplicación convierte mal. Así que devolver algo tiene menos de
altruismo que de interés propio.

## El problema no era encontrar un bug, era encontrar uno libre

MarkItDown tiene más de 170.000 estrellas y, cuando me puse, 469 pull requests abiertos.
Eso cambia la estrategia por completo.

Mi primer instinto fue el de todo el mundo: ir a los issues etiquetados como
`good first issue` u `open for contribution`. Perdí un rato ahí para nada. Cada uno de
esos issues tenía ya entre tres y cinco pull requests compitiendo. Uno sobre rutas de
Windows llevaba tres propuestas distintas sin mergear. Coger cualquiera de ellos
significaba escribir un duplicado.

Lo que sí funcionó fue mirar el problema al revés: en vez de preguntar *qué está roto*,
preguntar *dónde está mirando el mantenedor ahora mismo*. Un `git log` de los últimos
merges lo enseña gratis. Y ahí había un patrón claro: varios arreglos recientes y
seguidos en el conversor de ecuaciones OMML a LaTeX, uno de ellos del propio mantenedor.

Esa zona estaba viva y nadie la estaba peinando entera. Ahí me metí.

## Qué hace esa tabla

Word guarda las ecuaciones en OMML, un XML propio. MarkItDown las traduce a LaTeX antes
de pasar el documento a Mammoth, y esa traducción se apoya en un diccionario que asigna
caracteres Unicode a plantillas LaTeX. Los acentos, por ejemplo:

```python
"⃖": "\\overleftarrow{{{0}}}",
"⃬": "\\underrightharpoondown{{{0}}}",
"⃮": "\\underledtarrow{{{0}}}",
"⃯": "\\underrightarrow{{{0}}}",
```

Leyendo esas cuatro líneas seguidas salta a la vista. `\underledtarrow` no es ninguna
macro de LaTeX. Es `\underleftarrow` con las letras cambiadas de sitio. Sus dos vecinas,
`\overleftarrow` y `\underrightarrow`, delatan cuál era la intención.

El detalle que lo hace divertido: ese error no es de MarkItDown. Viene de
[dwml](https://github.com/xiilei/dwml), la librería de 2016 de la que se adaptó el
módulo. Buscando la cadena en GitHub aparece copiada en docling, en OnnxOCR y en unos
cuantos proyectos más. Diez años propagándose sin que nadie mirase las cuatro líneas
juntas.

No revienta nada, y por eso seguía ahí. La plantilla se formatea sin problema y la
conversión parece correcta. Simplemente el documento acaba con una macro que ningún
renderizador sabe dibujar.

## La única letra del alfabeto que no tiene sitio

El segundo hallazgo me gustó más, porque no es un descuido de nadie.

La misma tabla normaliza los caracteres matemáticos a ASCII, para que una ecuación
escrita con letras en cursiva salga como `h(x)` y no como una ristra de codepoints
raros. Cubre las mayúsculas de la `A` a la `Z` y las minúsculas de la `a` a la `z`,
recorriendo el bloque de Mathematical Alphanumeric Symbols de principio a fin.

Y ahí falta la `h`.

No por olvido. La `h` cursiva matemática **no tiene codepoint propio**. Su hueco,
`U+1D455`, está permanentemente reservado, porque Unicode decidió unificarla con
`U+210E PLANCK CONSTANT`, la constante de Planck de toda la vida de la física. Quien
escribió la tabla recorrió el rango contiguo, y la `h` no vive en ese rango.

El resultado es que era la única letra del alfabeto que se colaba sin traducir:

```
antes:  ℎ(x)=g(x)
después: h(x)=g(x)
```

Todas las demás normalizaban bien. Solo esa.

## Demostrarlo antes de proponerlo

Con 469 pull requests en cola, el que llega diciendo "creo que esto está mal" no se lee.
Así que monté cinco tests que construyen el OMML a mano, lo pasan por el conversor y
comprueban la salida. Los cinco fallan sin el arreglo y pasan con él.

Ese contraste es lo que convierte una opinión en un hecho comprobable, y le ahorra al
revisor tener que fiarse de mí. También añadí uno que recorre el alfabeto cursivo
entero, para que si mañana alguien vuelve a dejarse una letra, salte solo.

## Diecinueve días

Abrí el pull request el 12 de agosto. Firmar el CLA de Microsoft, esperar. El 31 de
agosto lo mergeó afourney, el mantenedor principal, con un comentario que me pareció
la mejor parte de todo esto:

> Thanks! Yeah, I was wondering about that symbols table after looking at it in the
> prior OMML fixes.

O sea que la corazonada era compartida. Él había pasado por esa tabla en los arreglos
anteriores y se había quedado con la mosca detrás de la oreja. Yo llegué con la
auditoría hecha.

## Lo que me llevo

Que en un repositorio enorme lo escaso no son los bugs, es el hueco. Los issues visibles
están todos cogidos, y competir ahí es tirar el trabajo. El sitio donde queda algo es
donde el equipo acaba de estar trabajando, porque han tocado la zona pero no la han
recorrido entera.

Y que la diferencia entre un pull request que se lee y uno que se cierra suele estar en
si trae una prueba de que el problema existe. No una explicación: una prueba que falla
antes y pasa después.

[Ver el pull request](https://github.com/microsoft/markitdown/pull/2293)
· [El commit en main](https://github.com/microsoft/markitdown/commit/bd7b77e2c4d648c2b673a1717c37aed053e7fd2e)
· [MdPipe](https://github.com/gdols/mdpipe)
