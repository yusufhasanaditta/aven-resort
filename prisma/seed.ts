/**
 * Sets up a fresh database: the five membership plans and the admin account.
 * Runs on every build (`npm run build`), so it only ever *adds* what's
 * missing — plan prices edited in admin → Packages are never overwritten, and
 * an existing admin keeps their password. Nothing else is created: no demo
 * shareholders, holdings, payments or leads.
 *
 * Plans come from `src/data/ownership.ts` (the Share Price & Membership
 * Chart). Set SEED_RESET_PLANS=true for one run to put every plan back to the
 * chart's figures.
 */
import { randomBytes } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ownershipTiers } from "../src/data/ownership";

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

async function main() {
  const reset = process.env.SEED_RESET_PLANS === "true";
  let added = 0;
  for (const plan of plans) {
    const exists = await prisma.membershipPlan.findUnique({ where: { slug: plan.slug }, select: { id: true } });
    if (!exists) {
      await prisma.membershipPlan.create({ data: plan });
      added++;
    } else if (reset) {
      await prisma.membershipPlan.update({ where: { slug: plan.slug }, data: plan });
    }
  }
  console.log(reset ? "Membership plans reset to the price chart." : `Membership plans: ${added} added, ${plans.length - added} already set up.`);

  const adminEmail = (process.env.SEED_ADMIN_EMAIL || "admin@aventeaempire.com").toLowerCase();
  // No password in the code: set SEED_ADMIN_PASSWORD, or a random one is generated and printed once.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || randomBytes(12).toString("base64url");
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
    console.log(`Admin account created: ${adminEmail}${process.env.SEED_ADMIN_PASSWORD ? "" : ` — password: ${adminPassword}`}`);
  } else {
    console.log(`Admin account already exists: ${adminEmail}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
