/**
 * Seeds the six membership plans and the admin-replaceable site assets. Run
 * with `npm run db:seed`.
 *
 * Plans follow the "Membership Plans" pages of the AVEN brochure: Executive
 * (1–2 shares, regular price, 3 days' free stay), Silver (3, 5%, 6 days),
 * Gold (5, 10%, 10 days), Platinum (10, 15%, 18 days), Diamond (20, 20%,
 * 30 days) and Royal (30, 28%, 30 days + 100% villa ownership). Free stay is
 * stored as nights (days − 1).
 *
 * unitPriceBDT is a placeholder. The brochure never prints a unit price, so
 * until Aven Limited confirms one this seed uses ৳500,000 per unit so the
 * calculator has something real to compute against; every amount it shows
 * is marked indicative for this reason. Edit it from the admin panel the
 * moment real pricing is confirmed.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_UNIT_PRICE_BDT = 500_000;

const plans = [
  { slug: "executive", name: "Executive", subtitle: "Enter the Aven community", minUnits: 1, maxUnits: 2, freeStayNights: 2, discountPercent: 0, accentColor: "#2E5A3F", featured: false, sortOrder: 0 },
  { slug: "silver", name: "Silver", subtitle: "A stronger stake, a longer stay", minUnits: 3, maxUnits: 4, freeStayNights: 5, discountPercent: 5, accentColor: "#8C8D90", featured: false, sortOrder: 1 },
  { slug: "gold", name: "Gold", subtitle: "The most chosen plan", minUnits: 5, maxUnits: 9, freeStayNights: 9, discountPercent: 10, accentColor: "#A57A4B", featured: true, sortOrder: 2 },
  { slug: "platinum", name: "Platinum", subtitle: "Premium lifestyle, higher returns", minUnits: 10, maxUnits: 19, freeStayNights: 17, discountPercent: 15, accentColor: "#2B2B2B", featured: false, sortOrder: 3 },
  { slug: "diamond", name: "Diamond", subtitle: "A month in the hills, every year", minUnits: 20, maxUnits: 29, freeStayNights: 29, discountPercent: 20, accentColor: "#A33D3A", featured: false, sortOrder: 4 },
  { slug: "royal", name: "Royal", subtitle: "100% villa ownership", minUnits: 30, maxUnits: null, freeStayNights: 29, discountPercent: 28, accentColor: "#1F1C3D", featured: false, sortOrder: 5 },
];

/**
 * The earlier four-category deck had a "Premium" plan that the brochure
 * replaces with Silver. Rename it in place rather than deleting it, so any
 * holdings already made against it keep a valid plan.
 */
async function migrateLegacyPlans() {
  const premium = await prisma.membershipPlan.findUnique({ where: { slug: "premium" } });
  const silver = await prisma.membershipPlan.findUnique({ where: { slug: "silver" } });
  if (premium && !silver) {
    await prisma.membershipPlan.update({ where: { id: premium.id }, data: { slug: "silver" } });
  } else if (premium && silver) {
    await prisma.shareHolding.updateMany({ where: { planId: premium.id }, data: { planId: silver.id } });
    await prisma.membershipPlan.delete({ where: { id: premium.id } });
  }
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
  await migrateLegacyPlans();
  const imported = await importLegacyInquiries();
  if (imported) console.log(`Checked ${imported} legacy enquiries into the CRM.`);

  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, unitPriceBDT: PLACEHOLDER_UNIT_PRICE_BDT },
      create: { ...plan, unitPriceBDT: PLACEHOLDER_UNIT_PRICE_BDT },
    });
  }

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
