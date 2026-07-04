/**
 * Typed content collections — i18n-ready.
 * English lives in src/content/en/*.json; Luganda (lg) and Swahili (sw)
 * slots are declared and take effect by adding sibling directories with
 * the same file names (see /accessibility for the language statement).
 */
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const LOCALES = ['en'] as const; // add 'lg', 'sw' when translations land
const perLocale = (name: string, locale: string) => `src/content/${locale}/${name}.json`;

const stat = z.object({
  id: z.string(),
  order: z.number(),
  label: z.string(),
  from: z.number().nullable(),
  to: z.number(),
  prefix: z.string().default(''),
  suffix: z.string().default(''),
  fromDisplay: z.string(),
  toDisplay: z.string(),
  note: z.string(),
  source: z.string(), // anchor on /sources
});

export const collections = {
  stats: defineCollection({
    loader: file(perLocale('stats', LOCALES[0])),
    schema: stat,
  }),
  eras: defineCollection({
    loader: file(perLocale('eras', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      years: z.string(),
      title: z.string(),
      copy: z.string(),
      image: z.string(),
      milestones: z.array(z.object({ year: z.string(), text: z.string() })),
    }),
  }),
  pillars: defineCollection({
    loader: file(perLocale('pillars', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      num: z.string(),
      title: z.string(),
      claim: z.string(),
      copy: z.string(),
      facts: z.array(z.object({ value: z.string(), label: z.string() })),
      image: z.string().nullable(),
      align: z.enum(['left', 'right']),
    }),
  }),
  regions: defineCollection({
    loader: file(perLocale('regions', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      name: z.string(),
      districts: z.string(),
      node: z.tuple([z.number(), z.number()]),
      stats: z.array(z.object({ value: z.string(), label: z.string() })),
      stories: z.array(z.string()),
      signals: z.array(z.string()),
      cities: z.array(z.string()),
    }),
  }),
  voices: defineCollection({
    loader: file(perLocale('voices', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      quote: z.string(),
      name: z.string(),
      place: z.string(),
      programme: z.string(),
      note: z.string().default(''),
    }),
  }),
  frames: defineCollection({
    loader: file(perLocale('frames', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      image: z.string(),
      caption: z.string(),
      place: z.string(),
      stamp: z.string(),
    }),
  }),
  next: defineCollection({
    loader: file(perLocale('next', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      title: z.string(),
      copy: z.string(),
      stat: z.string(),
    }),
  }),
  sources: defineCollection({
    loader: file(perLocale('sources', LOCALES[0])),
    schema: z.object({
      id: z.string(),
      order: z.number(),
      figure: z.string(),
      statement: z.string(),
      provenance: z.string(),
      basis: z.string(),
    }),
  }),
};
