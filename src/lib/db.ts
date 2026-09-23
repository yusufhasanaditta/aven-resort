import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton.
 *
 * Next.js hot-reloads route modules in dev, which would otherwise open a new
 * SQLite connection on every edit. Stashing the client on `globalThis` keeps
 * one connection alive across reloads — the standard Prisma-with-Next.js
 * pattern.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
