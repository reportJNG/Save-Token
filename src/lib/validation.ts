import { z } from 'zod'

export const textInputSchema = z.object({
  text: z.string().max(2_000_000, 'Text is too long (2,000,000 character limit)'),
})

export type TextInputValues = z.infer<typeof textInputSchema>
