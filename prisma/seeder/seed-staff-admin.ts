// prisma/seed-staff-admin.ts
//
// Run once, manually: `npx tsx prisma/seed-staff-admin.ts`
//
// Why both this AND the signIn-callback bootstrap in staff-config.ts?
// - This script is the source of truth: it puts the ADMIN row in the DB
//   deliberately, before anyone signs in, so it shows up in an audit of
//   "who has admin and why" without having to read auth callback code.
// - The signIn callback is a safety net for the case where this script
//   was skipped and the designated admin just signs in — it self-heals
//   to ADMIN rather than silently landing as FRONT_DESK.
// Keep both; don't remove either.
//
// Admin auth method: Credentials (email + password) only, for now.
// Google sign-in for staff/admin is an open decision — not wired up yet.
import { PrismaClient } from "@prisma/client"; // confirm this matches ~/server/db's import path
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const adminEmail = process.env.STAFF_ADMIN_EMAIL;
  const adminPassword = process.env.STAFF_ADMIN_PASSWORD;

  if (!adminEmail) {
    throw new Error("Set STAFF_ADMIN_EMAIL before running this script.");
  }
  if (!adminPassword) {
    throw new Error("Set STAFF_ADMIN_PASSWORD before running this script.");
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await db.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      isActive: true,
      passwordHash, // re-running the seeder also resets the password — see note below
      staff: {
        upsert: {
          create: { firstName: "Marc Chino", lastName: "Altea" },
          update: {}, // Staff row already exists — nothing to change here
        },
      },
    },
    create: {
      email: adminEmail,
      role: "ADMIN",
      isActive: true,
      passwordHash,
      staff: {
        create: { firstName: "Marc Chino", lastName: "Altea" },
      },
    },
  });

  console.log(`Staff admin ready: ${admin.email} (${admin.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());