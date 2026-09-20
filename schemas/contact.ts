import { z } from 'zod';

/**
 * Contact form contract. Validation copy is English - the site's UI language.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, { error: 'Please tell me your name.' })
    .max(80, { error: 'That name is a little too long.' }),
  email: z.email({ error: 'Please enter a valid email address.' }),
  message: z
    .string()
    .min(20, { error: 'A few more words, please - at least 20 characters.' })
    .max(2_000, { error: 'Keep it under 2000 characters.' }),
});

export type ContactRequest = z.infer<typeof contactSchema>;
