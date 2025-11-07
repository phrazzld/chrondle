import { z } from "zod";

export const EraSchema = z.enum(["BCE", "CE"]);
export type Era = z.infer<typeof EraSchema>;

export const CandidateDomainSchema = z.enum([
  "politics",
  "science",
  "culture",
  "tech",
  "sports",
  "economy",
  "war",
  "religion",
]);

export const CandidateEventSchema = z.object({
  canonical_title: z.string().min(3),
  event_text: z.string().min(3).max(100),
  domain: CandidateDomainSchema,
  geo: z.string().min(2),
  difficulty_guess: z.number().min(1).max(5),
  confidence: z.number().min(0).max(1),
  leak_flags: z.object({
    has_digits: z.boolean(),
    has_century_terms: z.boolean(),
    has_spelled_year: z.boolean(),
  }),
});

export const GeneratorOutputSchema = z.object({
  year: z.object({
    value: z.number(),
    era: EraSchema,
    digits: z.number().min(1).max(4),
  }),
  candidates: z.array(CandidateEventSchema).min(12).max(18),
});

export type CandidateEvent = z.infer<typeof CandidateEventSchema>;
export type GeneratorOutput = z.infer<typeof GeneratorOutputSchema>;
