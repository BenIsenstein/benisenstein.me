import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/blog" }),
    schema: z.object({
        title: z.string(),
        published: z.boolean(),
        datePublished: z.date(), // in YAML this is a valid date: 2025-02-10
        dateLastUpdated: z.date(),
    }),
})

export const collections = { blog }