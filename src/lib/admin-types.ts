/** Shapes returned by the /api/admin/* routes, shared across dashboard tabs. */
import type { DashHolding } from "@/lib/account";

export type LeadStatus = "NEW" | "CONTACTED" | "INTERESTED" | "FOLLOW_UP" | "CONVERTED" | "CLOSED";
export type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export type OverviewData = {
  /** "Contact me" requests not yet handled. */
  contactRequestsNew: number;
  leads: {
    total: number;
    newThisMonth: number;
    byStatus: { status: LeadStatus; count: number }[];
    conversionRate: number;
    followUpsDue: number;
    recent: {
      id: string;
      name: string;
      status: LeadStatus;
      packageSlug: string | null;
      investmentBDT: number | null;
      createdAt: string;
    }[];
  };
  pendingApplications: number;
  /** Job applications nobody has opened yet. */
  newCandidates: number;
  shareholderCount: number;
  shares: { total: number; sold: number; active: number };
  money: {
    committedBDT: number;
    collectedBDT: number;
    outstandingBDT: number;
    overdueBDT: number;
    overdueHoldings: number;
    pendingPayments: number;
  };
  collectionsByMonth: { key: string; label: string; amountBDT: number }[];
  byPlan: { slug: string; name: string; accentColor: string; holdings: number; units: number; committedBDT: number }[];
  upcomingDues: {
    holdingId: string;
    customerId: string;
    customer: string;
    phone: string;
    planName: string;
    n: number;
    of: number;
    amountBDT: number;
    dueDate: string;
    days: number;
  }[];
  activity: { id: string; actor: string; action: string; target: string | null; createdAt: string }[];
};

export type AdminLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string | null;
  packageSlug: string | null;
  units: number | null;
  investmentBDT: number | null;
  paymentPref: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  priority: number;
  nextFollowUpAt: string | null;
  lastContactedAt: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { notes: number };
  notes?: AdminLeadNote[];
};

export type AdminLeadNote = { id: string; kind: string; body: string; authorName: string; createdAt: string };

export type AdminApplication = {
  id: string;
  fullName: string;
  fatherName: string | null;
  email: string;
  phone: string;
  nid: string;
  dateOfBirth: string | null;
  address: string;
  occupation: string | null;
  nomineeName: string | null;
  nomineeRelation: string | null;
  nomineePhone: string | null;
  referredBy: string | null;
  /** The applicant chose their own password on the form. */
  hasPassword?: boolean;
  planSlug: string;
  units: number;
  paymentPlan: "FULL" | "INSTALLMENT";
  installmentMonths: number | null;
  quotedTotalBDT: number;
  notes: string | null;
  status: ApplicationStatus;
  adminNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  holdingId: string | null;
  createdAt: string;
  /** Null until the application is approved and the account opened. */
  user: { id: string; name: string; email: string } | null;
};

/** A holding as the admin sees it: the shared ledger plus who owns it. */
export type AdminHolding = DashHolding & {
  customer: { id: string; name: string; email: string; phone: string };
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  createdAt: string;
  memberId: string;
  photoUrl: string | null;
  nid: string | null;
  nomineeName: string | null;
  nomineeRelation: string | null;
  referredBy: string | null;
  shareNumbers: string[];
  units: number;
  committedBDT: number;
  paidBDT: number;
  remainingBDT: number;
  overdueCount: number;
  holdingCount: number;
  nextDue: { amountBDT: number; dueDate: string } | null;
};

export type AdminCustomerDetail = AdminCustomer & {
  holdings: DashHolding[];
  payments: AdminPayment[];
  applications: AdminApplication[];
};

export type AdminPayment = {
  id: string;
  receiptNo: string;
  holdingId: string;
  customer: { id: string; name: string; phone: string };
  planName: string;
  units: number;
  installmentNo: number;
  installmentLabel: string;
  amountBDT: number;
  method: string;
  tranId: string;
  reference: string | null;
  note: string | null;
  recordedBy: string | null;
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
};

export type AdminPlan = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  minUnits: number;
  maxUnits: number | null;
  unitPriceBDT: number;
  fullPriceBDT: number;
  downPaymentBDT: number;
  installmentCount: number;
  freeStayNights: number;
  accentColor: string;
  featured: boolean;
  sortOrder: number;
};

export type AdminAsset = {
  id: string;
  key: string;
  url: string;
  label: string;
  updatedAt: string;
};

export type AdminActivity = {
  id: string;
  actor: string;
  action: string;
  target: string | null;
  detail: string | null;
  createdAt: string;
};
