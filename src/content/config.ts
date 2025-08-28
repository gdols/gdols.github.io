import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.string(),           // ISO (YYYY-MM-DD)
    summary: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
