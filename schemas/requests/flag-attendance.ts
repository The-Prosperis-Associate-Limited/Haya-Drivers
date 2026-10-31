import z from "zod";

export const flagAttendanceSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Tell us what went wrong that day")
    .max(500, "Keep it under 500 characters"),
});

export type FlagAttendanceFormValues = z.infer<typeof flagAttendanceSchema>;
