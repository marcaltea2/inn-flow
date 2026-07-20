import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@prisma/client";
import { db } from "~/server/db";
import type {
  RegisterGuestInput,
} from "../validations/guest-validation";
import { issueVerificationEmail } from "~/server/services/email-verification";
import { Role } from "@prisma/client";


const guestSelect = {
  id: true,
  email: true,
  emailVerified: true, 
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  guest: {
    select: {
      firstName: true,
      lastName: true,
    },
  },
} satisfies Prisma.UserSelect;



export async function registerGuest(
  data: RegisterGuestInput,
) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    const newUser = await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: Role.GUEST,
        isActive: true,
        guest: {
          create: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
      },
      select: guestSelect,
    });

    issueVerificationEmail(newUser.id, newUser.email!).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    return newUser;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const target =
        (err.meta?.target as string[] | undefined)?.join(", ") ?? "field";
      throw new TRPCError({
        code: "CONFLICT",
        message: `Account with this ${target} already exists.`,
      });
    }
    throw err;
  }
}