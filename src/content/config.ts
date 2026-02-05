import { defineCollection, z } from 'astro:content';

const modules = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    duration: z.string(),
    icon: z.string(),
    xpReward: z.number(),
    objectives: z.array(z.string()),
  }),
});

export const collections = { modules };
