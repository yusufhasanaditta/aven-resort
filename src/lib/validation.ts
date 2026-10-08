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

/**
 * Online buyers pay by installments only. A full payment is arranged with the
 * management team and recorded by an admin as a share sale.
 */
const installmentsOnly = z
  .literal("INSTALLMENT", { message: "Full payment is arranged directly with the Aven management team." })
  .default("INSTALLMENT");

export const shareOrderSchema = z.object({
  // Plans are admin-editable rows, so the slug is checked against the database in the route.
  planSlug: z.string().trim().min(1).max(40),
  units: z.coerce.number().int().min(1).max(500),
  // The installment count and down payment are fixed by the plan.
  paymentPlan: installmentsOnly,
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
    paymentPlan: installmentsOnly,
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

/** Money received offline — cash, bank transfer, bKash… — any amount; it is applied to the schedule in order. */
export const offlinePaymentSchema = z.object({
  amountBDT: z.coerce.number().int("Whole taka only.").min(1, "Enter the amount received.").max(10_000_000_000),
  /** What the money is for, in the team's words: "December", "Down payment"… */
  label: optionalText(80),
  method: z.enum(PAYMENT_METHODS),
  reference: optionalText(120),
  note: optionalText(500),
  paidAt: z.string().date().optional(),
});

/** An offline payment recorded by the team against an existing holding. */
export const manualPaymentSchema = offlinePaymentSchema.extend({ holdingId: z.string().min(1) });

/** An office discount, in whole taka, with an optional reason ("Early-bird", "Referral"…). */
export const discountAmount = z.coerce.number().int("Whole taka only.").min(0, "The discount can't be negative.").max(1_000_000_000);

export const discountFields = {
  discountBDT: discountAmount.optional().default(0),
  discountNote: z.string().trim().max(200).optional(),
};

/** A share sale closed at the office: shares put in a shareholder's name, with the money received now (if any). */
export const shareSaleSchema = z.object({
  userId: z.string().min(1, "Choose the shareholder."),
  units: z.coerce.number().int().min(1, "At least one share.").max(2700),
  paymentPlan: z.enum(["FULL", "INSTALLMENT"]),
  payment: offlinePaymentSchema.optional(),
  ...discountFields,
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

/** Empty means "cleared": stored as null, so an edit can remove a field. */
const clearableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null);

/** A job circular as written in admin → Careers; the editor always sends every field. */
export const jobPostSchema = z.object({
  title: z.string().trim().min(3, "Give the position a title.").max(140),
  reference: clearableText(80),
  level: clearableText(60),
  department: z.string().trim().min(2, "Name the department.").max(80),
  employmentType: z.string().trim().min(2).max(40),
  location: z.string().trim().min(2, "Where is the job based?").max(120),
  vacancies: z.coerce.number().int().min(1, "At least one vacancy.").max(999).nullish().catch(null),
  salary: clearableText(120),
  experience: clearableText(200),
  education: clearableText(300),
  deadline: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
    .nullish()
    .or(z.literal(""))
    // Noon UTC keeps the calendar day the same in every time zone.
    .transform((v) => (v ? new Date(`${v}T12:00:00Z`) : null)),
  summary: z.string().trim().min(20, "Write a short summary of the role (a sentence or two).").max(600),
  description: clearableText(20_000),
  responsibilities: clearableText(8_000),
  requirements: clearableText(8_000),
  benefits: clearableText(8_000),
  howToApply: clearableText(4_000),
  images: z
    .array(z.string().trim().regex(/^(\/(?!\/)|https:\/\/)/, "Images must be uploads or https:// links."))
    .max(12, "Up to 12 images.")
    .default([]),
  links: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Every button needs a name.").max(40),
        url: z.string().trim().min(3, "Every button needs a link.").max(500),
      }),
    )
    .max(6, "Up to 6 buttons.")
    .default([]),
  updates: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Give every update a date."),
        title: z.string().trim().min(3, "Give every update a title.").max(140),
        body: z.string().trim().max(2000).default(""),
        url: z.string().trim().max(500).default(""),
      }),
    )
    .max(30, "Up to 30 updates.")
    .default([]),
  circularUrl: z
    .string()
    .trim()
    .regex(/^(\/media\/[\w-]+|https:\/\/\S+)$/, "Upload the circular as a PDF, or paste an https:// link.")
    .nullish()
    .or(z.literal(""))
    .transform((v) => v || null),
  circularName: clearableText(200),
  contactEmail: z.string().trim().email("Enter a valid email.").max(160).nullish().or(z.literal("")).transform((v) => v || null),
  contactPhone: clearableText(40),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
  featured: z.boolean().default(false),
  applyOnline: z.boolean().default(true),
});

/** A job application from the website's form (the CV travels beside it, checked on its own). */
export const jobApplicationSchema = z.object({
  jobId: z.string().trim().max(40).nullish().transform((v) => v || null),
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(160),
  phone,
  address: clearableText(200),
  currentPosition: clearableText(160),
  experience: clearableText(80),
  education: clearableText(200),
  expectedSalary: clearableText(80),
  noticePeriod: clearableText(80),
  profileUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^https?:\/\/\S+$/, "Paste a full link starting with https://")
    .nullish()
    .or(z.literal(""))
    .transform((v) => v || null),
  coverLetter: clearableText(5_000),
  consent: z.literal("yes", { message: "Please confirm the details are true." }),
});

export const CANDIDATE_STATUSES = ["NEW", "REVIEWING", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"] as const;

/** The hiring team's notes on an application. */
export const candidateUpdateSchema = z.object({
  status: z.enum(CANDIDATE_STATUSES).optional(),
  rating: z.number().int().min(0).max(5).nullish(),
  notes: z.string().trim().max(5_000).nullish(),
});

/** One change from the page editor. An image must be a file on this site (an upload or a built-in picture). */
export const siteEditSchema = z
  .object({
    kind: z.enum(["text", "image"]),
    original: z.string().trim().min(1).max(10_000),
    value: z.string().trim().max(20_000),
    page: z.string().trim().max(300).nullish(),
  })
  .refine((e) => e.kind === "text" || /^\/(?!\/)\S+$/.test(e.value), { message: "Choose an uploaded image.", path: ["value"] });
