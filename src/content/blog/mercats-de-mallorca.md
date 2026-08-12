---
title: "Mercats de Mallorca ya está en Google Play"
date: 2026-08-12
summary: "La primera app de Apiverd que sale a la calle: todos los mercados de Mallorca, gratis y sin cuentas. Y en cuanto estuvo publicada, le metí una v1.1 con mapa y navegación arreglada."
draft: false
---

Bajo el paraguas de [Apiverd](https://apiverd.com), mi estudio, acaba de salir la primera
app a la calle: **Mercats de Mallorca**, ya disponible en Google Play. Gratis, sin anuncios
y sin cuentas de usuario.

![Mercats de Mallorca — todos los mercados semanales de la isla](/images/mercats-feature.png)

La idea es de las que caben en una frase: **¿qué mercado toca hoy?** La app reúne todos los
mercados semanales de la isla —los de cada pueblo, los nocturnos de verano, los rastros— para
no tener que buscar nunca más un horario. Tiene una vista de **hoy** (los mercados del día,
ordenados por cercanía) y una de **semana** (de lunes a domingo), puedes guardar tus
**favoritos** y recibir un aviso la tarde antes, y funciona **sin conexión**. Está en catalán,
español, inglés y alemán. La ubicación se usa solo en el móvil para ordenar por distancia: no
sale de ahí.

<div class="shots">
  <img src="/images/mercats-hoy.png" alt="Vista de Hoy: mercados del día ordenados por cercanía">
  <img src="/images/mercats-semana.png" alt="Vista de Semana: mercados agrupados por día">
</div>

## Lo de publicar fue más lento de lo que esperaba

Tenía la idea de que subir la primera versión a Google Play sería más rápido. Entre la revisión
inicial, el alta de la ficha y los plazos de la cuenta nueva, se hace de rogar. Pero en cuanto
estuvo publicada no me quedé quieto: tenía media v1.1 esperando y la subí enseguida.

## v1.1: el mapa y arreglar el "cómo llegar"

La novedad grande de la 1.1 es un **mapa**: los mercados de hoy a tu alrededor, cada uno con su
pin, y al tocar uno ves el horario y la temática y puedes abrir la ruta hasta allí. De paso,
cada mercado muestra ahora la distancia en km, y el conjunto quedó más limpio: pantalla de
inicio nueva y selección de idioma con banderas en vez del globo.

Pero lo que más me picaba era el **"cómo llegar"**. En la v1.0 abría Google Maps con las
coordenadas del mercado, y ahí estaba el problema: mis coordenadas son aproximadas y a veces
caen en un campo o en una rotonda, así que Maps te llevaba lejos del sitio. La solución fue
dejar de navegar por coordenadas y hacerlo por **búsqueda de texto** —plaza, municipio,
Mallorca— y que sea Google quien geocodifique el lugar real:

```kotlin
val desti = listOfNotNull(
    mercat.lloc,
    mercat.municipi,
    "Mallorca",
).joinToString(", ")

val uri = Uri.parse(
    "https://www.google.com/maps/dir/?api=1&destination=" + Uri.encode(desti),
)
```

Ese `"Mallorca"` del final no es decorativo: evita que Maps te mande a un pueblo homónimo de la
península. Las coordenadas siguen ahí, pero ahora solo para lo que sí hacen bien: calcular la
distancia y colocar los pins del mapa.

## En resumen

Es la primera de las apps de Apiverd, y me sirve de recordatorio de que "publicado" no es la
meta sino el kilómetro cero: el primer arreglo de verdad —el de Maps— salió a los pocos días de
estar en la tienda, y con gente usándola de por medio.

[Descargar en Google Play](https://play.google.com/store/apps/details?id=com.apiverd.mercats)
· [Ficha en apiverd.com](https://apiverd.com/mercats)
