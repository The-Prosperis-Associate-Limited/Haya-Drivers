import z from "zod";

export const resolveFlagSchema = z.object({
  note: z
    .string()
    .trim()
    .min(5, "Add a short note - the client and driver both see it")
    .max(500, "Keep it under 500 characters"),
});

export type ResolveFlagFormValues = z.infer<typeof resolveFlagSchema>;
