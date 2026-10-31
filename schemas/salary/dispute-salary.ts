import z from "zod";

export const disputeSalarySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Tell us what happened with this payment")
    .max(500, "Keep it under 500 characters"),
});

export type DisputeSalaryFormValues = z.infer<typeof disputeSalarySchema>;
