/**
 * Seeds the four membership/ownership tiers and the admin-replaceable site
 * assets. Run with `npm run db:seed`.
 *
 * unitPriceBDT is a placeholder. The masterplan document states unit-share
 * ranges per category (1–2 / 3–4 / 5–9 / 10+) but never a price — every tier
 * card says "Contact for [category] Category". Until AVEN Ltd. confirms a
 * figure, this seed uses ৳500,000 per unit so the Share Calculator has
 * something real to compute against; the calculator UI marks every amount it
 * produces as indicative for this reason. Change this value (or edit it from
 * the admin panel) the moment real pricing is confirmed — nothing else in the
 * calculator needs to change, since category is derived from unit count.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PLACEHOLDER_UNIT_PRICE_BDT = 500_000;

const plans = [
  {
    slug: "executive",
    name: "Executive",
    subtitle: "Enter the community",
    minUnits: 1,
    maxUnits: 2,
    freeStayNights: 2,
    discountPercent: 0,
    accentColor: "#6B7B74",
    featured: false,
    sortOrder: 0,
  },
  {
    slug: "premium",
    name: "Premium",
    subtitle: "Greater returns, more benefits",
    minUnits: 3,
    maxUnits: 4,
    freeStayNights: 5,
    discountPercent: 15,
    accentColor: "#0E4D38",
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "platinum",
    name: "Platinum",
    subtitle: "Premium lifestyle, higher returns",
    minUnits: 5,
    maxUnits: 9,
    freeStayNights: 9,
    discountPercent: 20,
    accentColor: "#8A8F98",
    featured: false,
    sortOrder: 2,
  },
  {
    slug: "royal",
    name: "Royal",
    subtitle: "Maximum returns, exclusive perks",
    minUnits: 10,
    maxUnits: null,
    freeStayNights: 18,
    discountPercent: 30,
    accentColor: "#C9A227",
    featured: false,
    sortOrder: 3,
  },
];

const assets = [
  { key: "home.hero", url: "/renders/hanging-bridge-dusk.jpg", label: "Homepage hero" },
  { key: "wellness.hero", url: "/renders/spa-wellness-courtyard.jpg", label: "Wellness hero" },
  { key: "ownership.hero", url: "/renders/eco-villa-sunrise.jpg", label: "Ownership hero" },
  { key: "masterplan.hero", url: "/renders/masterplan-aerial.jpg", label: "Masterplan hero" },
];

async function main() {
  for (const plan of plans) {
    await prisma.membershipPlan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, unitPriceBDT: PLACEHOLDER_UNIT_PRICE_BDT },
      create: { ...plan, unitPriceBDT: PLACEHOLDER_UNIT_PRICE_BDT },
    });
  }

  for (const asset of assets) {
    await prisma.siteAsset.upsert({
      where: { key: asset.key },
      update: {},
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
        phone: "+880 1716 249448",
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
