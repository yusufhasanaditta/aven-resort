/** Shapes returned by the /api/admin/* routes, shared across dashboard tabs. */

export type OverviewData = {
  userCount: number;
  holdingCount: number;
  activeHoldings: number;
  pendingHoldings: number;
  totalUnits: number;
  totalCommittedBDT: number;
  totalCollectedBDT: number;
  inquiryCount: number;
  byPlan: {
    slug: string;
    name: string;
    holdings: number;
    units: number;
    committedBDT: number;
  }[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  createdAt: string;
  holdings: {
    id: string;
    units: number;
    totalAmountBDT: number;
    status: string;
    paymentPlan: string;
    plan: { name: string };
  }[];
};

export type AdminInquiry = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  subject: string | null;
  message: string;
  createdAt: string;
};

export type AdminPlan = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  minUnits: number;
  maxUnits: number | null;
  unitPriceBDT: number;
  freeStayNights: number;
  discountPercent: number;
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
