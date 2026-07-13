import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/proyectos" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()).default([]),
    page: z.string().optional(),
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    order: z.number().default(0),
  }),
});

export const collections = { blog, proyectos };
