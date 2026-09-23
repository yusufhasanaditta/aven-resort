import { z } from "zod";

/** Shared validation for anything that touches the account or share system. */

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20)
    .regex(/^[0-9+\s()-]+$/, "Use digits, spaces, + and - only."),
  location: z.string().trim().min(2, "Enter your city or country.").max(160),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(200)
    .regex(/[A-Za-z]/, "Password needs at least one letter.")
    .regex(/[0-9]/, "Password needs at least one number."),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const shareOrderSchema = z.object({
  planSlug: z.enum(["executive", "premium", "platinum", "royal"]),
  units: z.coerce.number().int().min(1).max(500),
  paymentPlan: z.enum(["FULL", "INSTALLMENT"]),
  installmentMonths: z.coerce.number().int().min(2).max(24).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ShareOrderInput = z.infer<typeof shareOrderSchema>;

/** Flattens a Zod error into the {field: message} shape the forms expect. */
export function zodErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
