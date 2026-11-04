import z from "zod";

export const bankAccountSchema = z.object({
  bank_code: z.string().min(1, "Select your bank"),
  account_number: z
    .string()
    .trim()
    .regex(/^\d{10}$/, "Enter your 10-digit account number"),
  account_name: z
    .string()
    .trim()
    .min(3, "Enter the name on the account")
    .max(120, "Keep the name under 120 characters"),
});

export type BankAccountFormValues = z.infer<typeof bankAccountSchema>;
