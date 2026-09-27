/**
 * Seeds the membership plans and the admin-replaceable site assets. Run
 * with `npm run db:seed`.
 *
 * Plans come from `src/data/ownership.ts`, which transcribes the "Share
 * Price & Membership Chart": Executive, Gold, Platinum, Diamond and Royal, each
 * with an installment price, a full-payment price, a down payment and a fixed
 * number of monthly installments. Free stay is stored as nights (days − 1).
 * Re-running the seed overwrites plan pricing with the chart's figures.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ownershipTiers } from "../src/data/ownership";
import { planForUnits } from "../src/lib/shares";

const prisma = new PrismaClient();

const plans = ownershipTiers.map((t, i) => ({
  slug: t.id,
  name: t.name,
  subtitle: t.subtitle,
  minUnits: t.minUnits,
  maxUnits: t.maxUnits,
  unitPriceBDT: t.installmentPriceBDT,
  fullPriceBDT: t.fullPriceBDT,
  downPaymentBDT: t.downPaymentBDT,
  installmentCount: t.installmentCount,
  freeStayNights: t.freeStayDays - 1,
  accentColor: t.accent,
  featured: t.featured,
  sortOrder: i,
}));

/**
 * Plans the price chart no longer sells — the old "Premium" and "Silver" —
 * are retired. Any holdings made against them move to whichever current plan
 * covers their share count, so every holding keeps a valid plan.
 */
async function retireLegacyPlans() {
  const current = await prisma.membershipPlan.findMany({ where: { slug: { in: plans.map((p) => p.slug) } } });
  const retired = await prisma.membershipPlan.findMany({
    where: { slug: { notIn: plans.map((p) => p.slug) } },
    include: { holdings: { select: { id: true, units: true } } },
  });
  for (const old of retired) {
    for (const h of old.holdings) {
      await prisma.shareHolding.update({ where: { id: h.id }, data: { planId: planForUnits(current, h.units).id } });
    }
    await prisma.membershipPlan.delete({ where: { id: old.id } });
  }
  return retired.map((p) => p.slug);
}

// Page hero images the admin Media tab can replace. The homepage banner is
// edited under Content instead, with the rest of the hero copy.
const assets = [
  { key: "wellness.hero", url: "/renders/yoga-tea-garden.jpg", label: "Wellness page hero" },
  { key: "ownership.hero", url: "/renders/eco-villa-sunrise.jpg", label: "Ownership page hero" },
  { key: "amenities.hero", url: "/renders/hanging-bridge-night.jpg", label: "Amenities page hero" },
  { key: "accommodations.hero", url: "/renders/hotel-facade.jpg", label: "Stay page hero" },
];

/** Contact-form enquiries from before the CRM existed become leads, once. */
async function importLegacyInquiries() {
  const inquiries = await prisma.inquiry.findMany();
  for (const q of inquiries) {
    const exists = await prisma.lead.findFirst({ where: { email: q.email.toLowerCase(), createdAt: q.createdAt } });
    if (exists) continue;
    await prisma.lead.create({
      data: {
        name: q.name,
        email: q.email.toLowerCase(),
        phone: q.phone,
        message: [q.subject, q.message].filter(Boolean).join(" — "),
        source: `contact-form:${q.type}`,
        createdAt: q.createdAt,
      },
    });
  }
  return inquiries.length;
}

async function main() {
  const imported = await importLegacyInquiries();
  if (imported) console.log(`Checked ${imported} legacy enquiries into the CRM.`);

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
  }
  const retired = await retireLegacyPlans();
  if (retired.length) console.log(`Retired plans: ${retired.join(", ")}.`);

  await prisma.siteAsset.deleteMany({ where: { key: { in: ["home.hero", "masterplan.hero"] } } });
  for (const asset of assets) {
    await prisma.siteAsset.upsert({
      where: { key: asset.key },
      update: { label: asset.label },
      create: asset,
    });
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@aventeaempire.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "AVEN Admin",
        email: adminEmail,
        phone: "+880 1619-788921",
        location: "Dhaka, Bangladesh",
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin account: ${adminEmail} / ${adminPassword} — change this password immediately after first login.`);
  }

  console.log(`Seeded ${plans.length} membership plans and ${assets.length} site assets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
