// lib/validation.ts
import { z } from "zod";

export const createLinkSchema = z.object({
  targetUrl: z.string().url("Please enter a valid URL."),
  code: z
    .string()
    .regex(/^[A-Za-z0-9]{6,8}$/, "Code must be 6–8 letters or digits.")
    .optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
