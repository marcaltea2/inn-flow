import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Prisma, Role } from "@prisma/client";
import { db } from "~/server/db";
import type {
  CreateStaffInput,
  UpdateStaffInput,
  GetAllStaffInput,
} from "../validations/staff-validation";
import { issueVerificationEmail } from "~/server/services/email-verification";
import { issuePasswordResetEmail } from "~/server/services/password-reset";

const RESEND_COOLDOWN_MS = 1000 * 60 * 5; // 5 minutes

// Central projection — the "DTO" for staff records.
// Never let passwordHash leave this file.
const staffSelect = {
  id: true,
  email: true,
  emailVerified: true, // FIX: was missing — StaffEditDialog badge needs this
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  staff: {
    select: {
      employeeId: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
} satisfies Prisma.UserSelect;

export async function createStaff(
  data: CreateStaffInput,
  createdByUserId: string,
) {
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    const newUser = await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        isActive: true,
        isTempPassword: true,
        staff: {
          create: {
            employeeId: data.employeeId,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            createdById: createdByUserId,
          },
        },
      },
      select: staffSelect,
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
        message: `A staff account with this ${target} already exists.`,
      });
    }
    throw err;
  }
}

export async function updateStaff(
  data: UpdateStaffInput,
  updatedByUserId: string,
) {
  const { userId, email, employeeId, firstName, lastName, phone, role } = data;

  // Guard: don't let the last remaining admin get demoted.
  if (role && role !== Role.ADMIN) {
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (target?.role === Role.ADMIN) {
      const adminCount = await db.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (adminCount <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot change the role of the last remaining admin.",
        });
      }
    }
  }

  try {
    const current = await db.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!current) {
      throw new TRPCError({
        code: "NOT_FOUND", // was CONFLICT — NOT_FOUND is the correct code for "record doesn't exist"
        message: "Staff member not found.",
      });
    }

    const emailChanged = current.email !== email;

    if (emailChanged) {
      const conflict = await db.user.findUnique({
        where: { email },
      });

      if (conflict && conflict.id !== userId) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "That email is already in use by another account.",
        });
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        role,
        email, // FIX: was missing — the actual write of the new email
        ...(emailChanged && { emailVerified: null }), // FIX: was missing — mailbox unconfirmed until re-verified
        staff: {
          update: {
            employeeId: data.employeeId ?? null,
            firstName,
            lastName,
            phone: data.phone ?? null,
            updatedById: updatedByUserId,
          },
        },
      },
      select: staffSelect,
    });

    if (emailChanged) {
      issueVerificationEmail(updatedUser.id, updatedUser.email!).catch(
        (err) => {
          console.error("Failed to send verification email:", err);
        },
      );
    }

    return updatedUser;
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Staff member not found.",
      });
    }
    throw err;
  }
}

export async function resendVerificationEmail(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerified: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Staff member not found.",
    });
  }

  if (user.emailVerified) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Email is already verified.",
    });
  }

  if (!user.email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This account has no email set.",
    });
  }

  const recentToken = await db.emailVerificationToken.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  if (recentToken) {
    const elapsed = Date.now() - recentToken.createdAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const secondsLeft = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Please wait ${secondsLeft}s before resending.`,
      });
    }
  }

  await issueVerificationEmail(user.id, user.email);

  return { sent: true };
}

export async function setStaffActive(
  userId: string,
  isActive: boolean,
  actingUserId: string,
) {
  if (userId === actingUserId && !isActive) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "You cannot deactivate your own account.",
    });
  }

  if (!isActive) {
    const target = await db.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (target?.role === Role.ADMIN) {
      const activeAdminCount = await db.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (activeAdminCount <= 1) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot deactivate the last remaining active admin.",
        });
      }
    }
  }

  return db.user.update({
    where: { id: userId },
    data: {
      isActive,
      staff: {
        update: {
          deactivatedAt: isActive ? null : new Date(),
          deactivatedById: isActive ? null : actingUserId,
          updatedById: actingUserId,
        },
      },
    },
    select: staffSelect,
  });
}

export async function resetStaffPassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, isTempPassword: true },
  });
  return { success: true };
}

export async function sendPasswordResetLink(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Staff member not found.",
    });
  }

  if (!user.email) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This account has no email set.",
    });
  }

  await issuePasswordResetEmail(user.id, user.email);

  return { sent: true };
}

export async function getAllStaff(input: GetAllStaffInput) {
  const { search, page, pageSize } = input;

  const where: Prisma.UserWhereInput = {
    role: {
      in: [Role.ADMIN, Role.MANAGER, Role.FRONT_DESK, Role.HOUSEKEEPING],
    },
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { staff: { firstName: { contains: search, mode: "insensitive" } } },
        { staff: { lastName: { contains: search, mode: "insensitive" } } },
        { staff: { employeeId: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [staff, total] = await Promise.all([
    db.user.findMany({
      where,
      select: staffSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  return {
    staff,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getStaffById(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: staffSelect,
  });
  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Staff member not found.",
    });
  }
  return user;
}
