---
title: "Cómo hice MdPipe para no depender de Python instalado"
date: 2026-07-13
summary: "Las decisiones que hay detrás del ejecutable, el entorno aislado de Python y el control de versiones de MarkItDown."
draft: false
---

[MdPipe](https://github.com/gdols/mdpipe) empezó por una molestia bastante concreta.
MarkItDown me servía para convertir documentos a Markdown, pero compartir ese flujo
con otra persona significaba pedirle que instalara Python, pip y varias dependencias.
Quería que bastara con abrir un ejecutable.

![MdPipe con un PDF de ejemplo](/images/mdpipe-app.png)

La aplicación tiene una interfaz WPF y una CLI. Las dos usan la misma lógica de
preparación y conversión, así no tengo dos comportamientos distintos que mantener.

## Una sola preparación para WPF y CLI

`SetupOrchestrator` consulta el manifiesto de compatibilidad, mira qué hay instalado
y solo prepara el entorno cuando hace falta. Este es el centro del flujo:

```csharp
var manifest = await manifestProvider.GetManifestAsync(cancellationToken);
var envInfo = await environmentManager.GetEnvironmentInfoAsync(cancellationToken);

if (!forceReinstall && envInfo.IsReady &&
    envInfo.InstalledMarkItDownVersion is not null &&
    versionGate.IsCompatible(envInfo.InstalledMarkItDownVersion, manifest))
{
    return SetupResult.AlreadyUpToDate(envInfo.InstalledMarkItDownVersion);
}

var targetVersion = versionGate.GetTargetVersion(manifest);
await environmentManager.SetupAsync(targetVersion, forceReinstall, cancellationToken);
return SetupResult.Installed(targetVersion);
```

La ventana llama a este servicio al arrancar. La CLI lo usa con `mdpipe setup`.
El código que decide si hay que instalar o actualizar solo está en un sitio.

## Versiones que he probado

No instalo automáticamente la última versión que aparezca en PyPI. Guardo en un
manifiesto las versiones que he probado y marco una de ellas como estable.

```csharp
public bool IsCompatible(string installedVersion, CompatibilityManifest manifest)
{
    if (string.IsNullOrWhiteSpace(installedVersion))
        return false;

    return manifest.CompatibleVersions.Contains(
        installedVersion,
        StringComparer.OrdinalIgnoreCase);
}

public string GetTargetVersion(CompatibilityManifest manifest) =>
    manifest.StableVersion;
```

El manifiesto se consulta en GitHub y se guarda en caché durante 24 horas. El
ejecutable también lleva una copia, de modo que una caída de GitHub no impide usar
una versión que ya estaba validada.

## Un Python que no toca el del usuario

MdPipe intenta crear un entorno virtual con un Python válido del sistema. Si no lo
encuentra, descarga la distribución embebida oficial y la deja dentro de su carpeta
de datos. No instala paquetes en el Python del usuario.

```csharp
if (ReadyPython is { } existing)
    return existing;

var systemPython = await FindSystemPythonAsync(cancellationToken);
if (systemPython is not null)
{
    await RunProcessAsync(
        systemPython,
        $"-m venv \"{VenvRoot}\"",
        cancellationToken);

    if (File.Exists(VenvPython))
        return VenvPython;
}

await BootstrapEmbeddedPythonAsync(cancellationToken);
return EmbedPython;
```

La parte que más tiempo me dio no fue la conversión. Fue preparar bien el primer
arranque. pip no siempre hereda el proxy de Windows y el Python de Microsoft Store
puede confirmar la creación de un entorno virtual sin dejar el intérprete donde se
espera. MdPipe detecta ambos casos y muestra el error real cuando no puede continuar.

## Lo que queda por mejorar

- El ejecutable actual es para Windows 10 y 11 de 64 bits.
- El primer arranque necesita conexión para descargar Python y MarkItDown.
- El binario todavía no está firmado, así que Windows puede mostrar un aviso.
- La calidad de la conversión depende del tipo y de la estructura del documento.

[Descargar MdPipe.exe](https://github.com/gdols/mdpipe/releases/latest/download/MdPipe.exe)
· [Ver el código](https://github.com/gdols/mdpipe)
· [Releases](https://github.com/gdols/mdpipe/releases)
