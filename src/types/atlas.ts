import { z } from "zod";

export const NATIONS = ["water", "earth", "fire", "air"] as const;
export const BOOKS = [1, 2, 3] as const;

export const NationSchema = z.enum(NATIONS);
export const BookSchema = z.union([z.literal(1), z.literal(2), z.literal(3)]);

/** Episode id, e.g. "2-15" = Book 2, episode 15. */
export const EpisodeIdSchema = z.string().regex(/^[1-3]-\d{1,2}$/, "episode id must look like '2-15'");

const SourceSchema = z.url({ protocol: /^https$/, error: "source must be an https URL" });

export const EpisodeSchema = z.object({
  id: EpisodeIdSchema,
  book: BookSchema,
  number: z.number().int().positive(),
  title: z.string().min(1),
  source: SourceSchema,
});

export const AppearanceSchema = z.object({
  episode: EpisodeIdSchema,
  /** True when the location is only shown in a flashback in this episode. */
  flashback: z.boolean().optional(),
  /** True when the location is only shown in a dream or vision in this episode. */
  dream: z.boolean().optional(),
});

export const LocationSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1),
  nation: NationSchema,
  /** [x, z] on the stylized map; -x is west, -z is north. */
  position: z.tuple([z.number(), z.number()]),
  summary: z.string().min(1),
  appearances: z.array(AppearanceSchema).min(1),
  source: SourceSchema,
  /** Set only if a fact comes from outside the original 61-episode series. */
  nonSeriesSource: z.string().optional(),
});

export const EventSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  episode: EpisodeIdSchema,
  location: z.string().min(1),
  summary: z.string().min(1),
  source: SourceSchema,
  nonSeriesSource: z.string().optional(),
});

export type Nation = z.infer<typeof NationSchema>;
export type Book = z.infer<typeof BookSchema>;
export type EpisodeId = z.infer<typeof EpisodeIdSchema>;
export type Episode = z.infer<typeof EpisodeSchema>;
export type Appearance = z.infer<typeof AppearanceSchema>;
export type AtlasLocation = z.infer<typeof LocationSchema>;
export type AtlasEvent = z.infer<typeof EventSchema>;
