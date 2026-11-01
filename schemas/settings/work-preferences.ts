import z from "zod";

export const workPreferencesSchema = z.object({
  expected_monthly_rate: z
    .string()
    .trim()
    .regex(/^\d*$/, "Digits only, e.g. 250000")
    .optional()
    .or(z.literal("")),
  availability: z
    .array(
      z.object({
        day_range: z.string().trim().min(1, "Name the day or range"),
        start: z.string().trim().min(1, "Set a start time"),
        end: z.string().trim().min(1, "Set an end time"),
      }),
    )
    .max(7, "Seven rows cover every day of the week"),
});

export type WorkPreferencesFormValues = z.infer<typeof workPreferencesSchema>;
