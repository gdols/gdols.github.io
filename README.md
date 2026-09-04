# gdols.dev

Mi web personal: un blog donde apunto cosas de .NET, Blazor y SQL, y una lista de proyectos.

Está hecha con [Astro](https://astro.build), sin JavaScript en el cliente y con un solo archivo CSS. La idea es que cargue rápido y no haya que mantener nada.

## Cómo está montada

- Los posts viven en `src/content/blog/`, un Markdown por post. El nombre del archivo es la URL (`hola-mundo.md` → `/blog/hola-mundo/`).
- Los proyectos en `src/content/proyectos/`, un archivo por proyecto con solo el frontmatter (título, descripción, tecnologías y enlaces).
- Todo lo demás es un layout (`src/layouts/Base.astro`) y los estilos (`src/styles/global.css`). No hay más.

Para escribir un post, esto arriba del Markdown:

```markdown
---
title: "Título del post"
date: 2026-07-06
summary: "Una línea que sale en el listado."
---
```

Si le pones `draft: true`, no se publica.

## Tarjetas al compartir

Al pegar una URL en X o similares sale una tarjeta grande con imagen, título y
descripción. El título es el `title` y el texto el `summary`, así que un post sin
`summary` hereda la descripción genérica del sitio.

La imagen se decide sola, por este orden:

1. El campo `image` del frontmatter, si lo pones (`image: "/images/loquesea.png"`).
2. La primera imagen del cuerpo del post.
3. `public/og.png`, la de marca, si no hay ninguna.

En los dos primeros casos no se usa la captura tal cual: `scripts/og-cards.mjs`
compone una tarjeta de 1200×630 con la imagen entera centrada sobre el fondo de
la marca, y la deja en `public/og/<slug>.png`. Es necesario porque X recorta a
1,91:1 y las capturas de móvil o de ventana se quedarían en una tira inservible.

Se genera sola antes de cada `npm run build`. Para rehacerlas a mano:

```bash
npm run og
```

Para comprobar cómo queda una URL: [opengraph.xyz](https://www.opengraph.xyz) o
el validador de tarjetas de X. Si cambias la imagen de un post ya compartido,
esas herramientas cachean, así que puede tardar en reflejarse.

## Trastear en local

```bash
npm install
npm run dev
```

Y abrir http://localhost:4321.

## Publicar

Push a `main` y listo: un workflow de GitHub Actions compila y despliega a GitHub Pages solo. El dominio va en `public/CNAME`.
