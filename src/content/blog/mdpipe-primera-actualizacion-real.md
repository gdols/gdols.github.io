---
title: "La primera actualización real de MdPipe (y lo que encontré por el camino)"
date: 2026-08-05
summary: "MarkItDown publicó la 0.1.7, el manifiesto de versiones hizo su trabajo por primera vez, y de paso cayeron dos bugs que llevaban semanas escondidos."
draft: false
---

Cuando monté el control de versiones de [MdPipe](https://github.com/gdols/mdpipe) lo hice sobre
una teoría: que algún día MarkItDown publicaría una versión nueva y yo podría hacerla llegar a
todas las instalaciones sin publicar un ejecutable nuevo. La semana pasada salió MarkItDown 0.1.7
y la teoría pasó a ser práctica.

## Validar antes de publicar

La 0.1.7 trae arreglos concretos: rendimiento en gráficos de PowerPoint, macros LaTeX corregidas
en las ecuaciones de Word y presentaciones con SVG que ya no fallan. Nada rompedor sobre el papel,
pero el papel no convierte documentos. Antes de tocar el manifiesto la probé en un entorno aparte,
contra los mismos PDF, Word y Excel que uso de referencia, y comparé la salida byte a byte con la
de 0.1.6. Idéntica.

Con eso, publicar la actualización fue editar un JSON y hacer push:

```json
{
  "stableVersion": "0.1.7",
  "minimumVersion": "0.1.5",
  "compatibleVersions": ["0.1.5", "0.1.6", "0.1.7"],
  "updatedAt": "2026-08-05"
}
```

Cada instalación consulta ese manifiesto al arrancar. En su siguiente apertura, todas pasan a
0.1.7 solas. Sin instaladores, sin avisos, sin pedirle nada a nadie.

## El hueco que encontré probándolo

Al verificar el despliegue me llevé una sorpresa: mi propia instalación no se actualizaba. El
orquestador solo instalaba cuando la versión instalada quedaba fuera de la lista de compatibles,
así que tener 0.1.6 (todavía en la lista) significaba quedarse en 0.1.6 para siempre. La condición
necesitaba una pieza más:

```csharp
if (!forceReinstall && envInfo.IsReady &&
    envInfo.InstalledMarkItDownVersion is not null &&
    versionGate.IsCompatible(envInfo.InstalledMarkItDownVersion, manifest) &&
    !IsNewer(manifest.StableVersion, envInfo.InstalledMarkItDownVersion))
{
    return SetupResult.AlreadyUpToDate(envInfo.InstalledMarkItDownVersion);
}
```

Ahora "compatible" y "al día" son cosas distintas: si hay un estable más nuevo ya validado, se
actualiza aunque tu versión siga siendo válida. Es el tipo de hueco que solo aparece cuando el
sistema se usa de verdad.

## Una espera que ya no es a ciegas

De esa tanda de trabajo salió también la versión 0.2.0 de la aplicación. Lo más visible: el primer
arranque ya no es un "dame un minuto" genérico. Descargar un Python embebido y todos los
conversores lleva su tiempo, y ahora se ve exactamente qué está pasando.

![MdPipe descargando Python con progreso real](/images/mdpipe-progress.png)

Por debajo es un bucle de lectura normal y corriente que va informando cada pocos puntos
porcentuales:

```csharp
while ((read = await source.ReadAsync(buffer, cancellationToken)) > 0)
{
    await fileStream.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
    received += read;

    var pct = (int)(received * 100 / totalBytes.Value);
    if (pct >= lastReported + 5)
    {
        lastReported = pct;
        progress?.Report($"{label}... {pct}%");
    }
}
```

Las conversiones también se pueden cancelar a mitad. El detalle importante no es el botón, es que
al cancelar hay que matar el proceso de Python que quedó por debajo, o seguiría convirtiendo en
segundo plano con el usuario convencido de que paró:

```csharp
catch (OperationCanceledException)
{
    try { if (!process.HasExited) process.Kill(entireProcessTree: true); } catch { }
    throw;
}
```

![Conversión en curso con el botón de cancelar](/images/mdpipe-cancel.png)

También se pueden soltar carpetas enteras en la ventana (recorre las subcarpetas y se queda con lo
convertible) y la aplicación recuerda dónde guardaste la última vez.

## Dos bugs con moraleja

Los dos llevaban tiempo escondidos y los dos tenían la misma raíz: errores silenciados.

El primero: el código detectaba el proxy de Windows desde hacía versiones, pero nunca lo pasaba a
los procesos de Python. La detección funcionaba, la variable existía y no se usaba en ningún sitio.
El compilador no avisa de "esto se calcula pero no viaja hasta donde hace falta".

El segundo: el "reinstalar" a veces no reinstalaba nada. El zip del Python embebido extrae algunos
archivos como solo lectura, `Directory.Delete` se niega a borrarlos, y mi función de limpieza se
tragaba la excepción sin decir nada. Resultado: creías empezar de cero y seguías con el entorno
viejo. El arreglo, además de quitar el atributo antes de borrar, fue dejar de silenciar:

```csharp
catch (Exception ex) when (ex is IOException or UnauthorizedAccessException)
{
    logger.LogWarning(ex, "Couldn't fully delete {Dir}; continuing with what's there.", dir);
}
```

La moraleja me la llevo apuntada: un `catch` vacío no es tolerancia a fallos, es un bug esperando
a que alguien lo encuentre meses después.

Ahora la aplicación compila y pasa los tests en cada push con GitHub Actions, y cada etiqueta de
versión construye el ejecutable portable y lo sube a la release sola.

[Descargar MdPipe.exe](https://github.com/gdols/mdpipe/releases/latest/download/MdPipe.exe)
· [Ver el código](https://github.com/gdols/mdpipe)
· [Releases](https://github.com/gdols/mdpipe/releases)
