---
title: "Mercats de Mallorca v1.3: ficha, filtros y calendario"
date: 2026-08-25
summary: "Desde que salió en Play, la app ha ganado dos cosas gordas: filtros de verdad y una ficha por mercado con mapa, calendario y aviso de errores. Y por debajo, un poco de honestidad con los datos."
draft: false
---

Cuando [publiqué Mercats de Mallorca](/blog/mercats-de-mallorca/) la app ya hacía lo básico:
qué mercado toca hoy, la semana entera y un mapa. Desde entonces han caído dos
actualizaciones (v1.2 y v1.3) y me apetecía contarlas, porque son justo el tipo de cosas
que solo se te ocurren cuando la app la usa gente de verdad.

## La ficha: tocar un mercado y verlo todo

Lo más visible de la 1.3 es que ahora cada mercado tiene su **ficha**. En la lista va solo
la primera frase (se lee mucho mejor), y al tocar se abre la pantalla completa: descripción,
horario, cuándo es la próxima vez, un mapa para situarte y los botones de cómo llegar,
guardar, avisarme y añadir al calendario.

<div class="shots">
  <img src="/images/mercats-ficha.png" alt="Ficha del mercado de Sineu: descripción, horario, mapa y botones">
  <img src="/images/mercats-filtros.png" alt="Filtros por día, pueblo y temática en la vista de Semana">
</div>

## Código molón 1: al calendario sin pedir permisos

El botón de "añadir al calendario" es de mis detalles favoritos, porque es puro Android bien
hecho: no pido el permiso de calendario (que asusta y para qué), sino que lanzo un intent y
es la app de calendario quien enseña el evento para que lo guardes tú. Si el mercado no tiene
hora publicada, va como evento de todo el día.

```kotlin
fun Context.afegeixAlCalendari(mercat: Mercat, data: LocalDate, titol: String) {
    val intent = Intent(Intent.ACTION_INSERT)
        .setData(CalendarContract.Events.CONTENT_URI)
        .putExtra(CalendarContract.Events.TITLE, titol)
        .putExtra(CalendarContract.Events.EVENT_LOCATION, adrecaText(mercat))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    val rang = horariRang(mercat.horari)
    if (rang == null) {
        intent.putExtra(CalendarContract.EXTRA_EVENT_ALL_DAY, true)
            .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, data.milisegons(LocalTime.MIDNIGHT))
    } else {
        intent.putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, data.milisegons(rang.first))
            .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, data.milisegons(rang.second))
    }
    startActivity(intent)
}
```

Un permiso menos que pedir es un permiso menos que explicar.

## Filtros de verdad

La 1.2 trajo los filtros, que era lo que más me pedían: buscar un pueblo, elegir días y
temática, y que funcione igual en Hoy, en Semana y en el mapa. Parece poca cosa hasta que
tienes 150 mercados y quieres solo los artesanales del sábado cerca de ti.

## Código molón 2: que lo quincenal no salga cada semana

Este es el que más me gustó resolver. Había mercados quincenales y mensuales saliendo
**todas** las semanas, porque el código solo miraba el día, no *qué* semana era. La lógica
quedó así:

```kotlin
fun Mercat.esCelebraEl(data: LocalDate): Boolean {
    if (temporada?.inclou(data) == false) return false
    if (frequencia == Frequencia.DIARIA) return true
    if (dia.iso != data.dayOfWeek.value) return false

    return when (frequencia) {
        Frequencia.QUINZENAL -> referencia?.let { ChronoUnit.DAYS.between(it, data).mod(14L) == 0L } ?: true
        Frequencia.MENSUAL   -> setmanaDelMes?.let { data.esLaSetmana(it) } ?: true
        else -> true
    }
}

/** ¿Es esta la n-ésima vez que cae este día de la semana dentro del mes? -1 = la última. */
private fun LocalDate.esLaSetmana(n: Int): Boolean =
    if (n == -1) plusWeeks(1).monthValue != monthValue else (dayOfMonth - 1) / 7 == n - 1
```

Me gustan dos cosas de aquí. La primera, el truco de la última semana: en vez de contar
cuántas semanas tiene el mes, miro si sumar siete días ya me cambia de mes; si sí, es la
última. La segunda, los `?: true`: si en los datos no sé desde cuándo contar los quince días,
o qué semana del mes toca, el mercado sale igual. Prefiero que salga de más y que alguien
llegue un día que no tocaba, antes que esconderlo y que se pierda uno que sí. Y por eso
mismo, cuando el ayuntamiento no publica la hora, la app lo dice con un "aprox." en vez de
inventarse una: poner una hora exacta la haría pasar por segura, y no lo es.

## Avisar de errores desde dentro

Lo último: en cada ficha hay un "¿hay algo que no cuadra?". Un horario cambia, un mercado se
mueve de plaza, y quien mejor lo sabe es quien está allí. Recoger eso desde dentro de la app
vale más que cualquier fuente que consulte yo desde casa.

[Descargar en Google Play](https://play.google.com/store/apps/details?id=com.apiverd.mercats)
· [Ficha en apiverd.com](https://apiverd.com/mercats)
