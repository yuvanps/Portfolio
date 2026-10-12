import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One optional Markdown write-up per project: src/content/projects/<slug>.md
// The filename (without .md) must equal the project's slug in data/portfolio.json.
// Files starting with "_" (e.g. _template.md) are ignored.
const projects = defineCollection({
  loader: glob({ pattern: '[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    // Optional safety check; scripts/validate-portfolio.mjs verifies it matches the filename.
    slug: z.string().optional(),
    // Optional override for the page's meta description.
    summary: z.string().optional(),
    // Set to true to hide a write-up while it is still being drafted.
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects };
