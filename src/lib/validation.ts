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

/** What a shareholder may change on their own profile — email stays fixed, it is their sign-in. */
export const profileSchema = registerSchema.pick({ name: true, phone: true, location: true });

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password."),
  newPassword: registerSchema.shape.password,
});

export const loginSchema = z.object({
  /** An email address or a membership number. */
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => /^\d{8,}$/.test(v) || z.string().email().safeParse(v).success, "Enter your email or membership number."),
  password: z.string().min(1, "Enter your password."),
});

export const shareOrderSchema = z.object({
  // Plans are admin-editable rows, so the slug is checked against the database in the route.
  planSlug: z.string().trim().min(1).max(40),
  units: z.coerce.number().int().min(1).max(500),
  // The installment count and down payment are fixed by the plan.
  paymentPlan: z.enum(["FULL", "INSTALLMENT"]),
});

const phone = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(20)
  .regex(/^[0-9+\s()-]+$/, "Use digits, spaces, + and - only.");

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const LEAD_STATUSES = ["NEW", "CONTACTED", "INTERESTED", "FOLLOW_UP", "CONVERTED", "CLOSED"] as const;
export const PAYMENT_METHODS = ["SSLCOMMERZ", "BANK_TRANSFER", "CASH", "CHEQUE", "BKASH", "NAGAD", "CARD", "OTHER"] as const;

/** Public "register your interest" form — every submission becomes a CRM lead. */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone,
  location: optionalText(160),
  packageSlug: optionalText(40),
  units: z.coerce.number().int().min(1).max(2700).optional().catch(undefined),
  investmentBDT: z.coerce.number().int().min(0).max(10_000_000_000).optional().catch(undefined),
  paymentPref: z.enum(["FULL", "INSTALLMENT", "UNDECIDED"]).optional().catch(undefined),
  message: optionalText(2000),
  source: optionalText(60),
});

/** Admin-side lead edits: pipeline stage, follow-up and assignment. */
export const leadUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  nextFollowUpAt: z.string().trim().max(40).nullable().optional(),
  assignedTo: z.string().trim().max(120).nullable().optional(),
  /** "Move to Leads CRM" re-files a contact request as an ordinary lead. */
  source: z.string().trim().min(1).max(60).optional(),
  priority: z.coerce.number().int().min(0).max(2).optional(),
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  phone: phone.optional(),
  location: z.string().trim().max(160).nullable().optional(),
  packageSlug: z.string().trim().max(40).nullable().optional(),
  units: z.coerce.number().int().min(1).max(2700).nullable().optional(),
  investmentBDT: z.coerce.number().int().min(0).nullable().optional(),
});

export const leadNoteSchema = z.object({
  kind: z.enum(["NOTE", "CALL", "EMAIL", "MEETING", "WHATSAPP", "SITE_VISIT"]).default("NOTE"),
  body: z.string().trim().min(1, "Write something first.").max(4000),
});

/** The formal share-purchase application, with the KYC details the registry needs. */
export const applicationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name as on your NID.").max(160),
    fatherName: optionalText(160),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    phone,
    nid: z
      .string()
      .trim()
      .regex(/^(\d{10}|\d{13}|\d{17})$/, "NID must be 10, 13 or 17 digits."),
    dateOfBirth: optionalText(20),
    address: z.string().trim().min(8, "Enter your full address.").max(400),
    occupation: optionalText(120),
    nomineeName: optionalText(160),
    nomineeRelation: optionalText(60),
    nomineePhone: optionalText(20),
    referredBy: optionalText(160),
    /** Optional: the password for the account the team opens on approval. */
    password: registerSchema.shape.password.optional().or(z.literal("")),
    confirmPassword: z.string().optional(),
    planSlug: z.string().trim().min(1).max(40),
    units: z.coerce.number().int().min(1).max(500),
    paymentPlan: z.enum(["FULL", "INSTALLMENT"]),
    notes: optionalText(2000),
    agree: z.literal(true, { message: "Please accept the terms to continue." }),
  })
  .refine((d) => !d.password || d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match.",
  });

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

/** A shareholder's NID, nominee and referrer, as the admin enters them. Blank clears a field. */
export const kycSchema = z.object({
  nid: z
    .string()
    .trim()
    .regex(/^(\d{10}|\d{13}|\d{17})?$/, "NID must be 10, 13 or 17 digits.")
    .optional()
    .transform((v) => v || null),
  nomineeName: nullableText(160),
  nomineeRelation: nullableText(60),
  referredBy: nullableText(160),
});

/** "Contact me" from the Apply chooser: just enough to call or email back. */
export const contactRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  phone,
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  message: optionalText(1000),
});

/** An offline payment recorded by the team: cash, bank transfer, bKash… */
export const manualPaymentSchema = z.object({
  holdingId: z.string().min(1),
  installmentNo: z.coerce.number().int().min(1).optional(),
  amountBDT: z.coerce.number().int().min(1, "Enter the amount received."),
  method: z.enum(PAYMENT_METHODS),
  reference: optionalText(120),
  note: optionalText(500),
  paidAt: z.string().date().optional(),
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

/** A message from the Aven team to a shareholder's inbox and email. */
export const messageSchema = z.object({
  title: z.string().trim().min(3, "Add a subject.").max(140),
  body: z.string().trim().min(3, "Write a message.").max(4000),
  href: z
    .string()
    .trim()
    .max(300)
    .regex(/^(\/(?!\/)|https:\/\/)/, "Use a site path like /account or an https:// link.")
    .optional()
    .or(z.literal("")),
});
