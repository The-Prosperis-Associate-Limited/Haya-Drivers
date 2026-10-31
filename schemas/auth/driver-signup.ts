import { passwordValidationRegex } from "@/lib/utils";
import z from "zod";

export const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Please enter your full name"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      passwordValidationRegex,
      "Password must include a letter, a number and a special character",
    ),
  referral_code: z.string().trim().max(16).optional(),
  accepted_terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms of Service and Privacy Policy",
  }),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
