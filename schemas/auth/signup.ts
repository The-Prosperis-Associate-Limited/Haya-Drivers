import { passwordValidationRegex } from "@/lib/utils";
import z from "zod";

export const signupSchema = z.object({
  client_type: z.enum(["INDIVIDUAL", "ORGANISATION"]),
  full_name: z.string().trim().min(2, "Please enter a name"),
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      passwordValidationRegex,
      "Password must include a letter, a number and a special character",
    ),
  accepted_terms: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms of Service and Privacy Policy",
  }),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
