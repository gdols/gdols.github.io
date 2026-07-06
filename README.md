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

## Trastear en local

```bash
npm install
npm run dev
```

Y abrir http://localhost:4321.

## Publicar

Push a `main` y listo: un workflow de GitHub Actions compila y despliega a GitHub Pages solo. El dominio va en `public/CNAME`.
