import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { Prisma, Role } from "@prisma/client";
import { db } from "~/server/db";
import type {
  CreateStaffInput,
  UpdateStaffInput,
} from "../validations/staff-validation";

// Central projection — the "DTO" for staff records.
// Never let passwordHash leave this file.
const staffSelect = {
  id: true,
  email: true,
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
    return await db.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role,
        isActive: true,
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
  } catch (err) {
    // P2002 = unique constraint violation (email, or employeeId if you index it as @unique)
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

export async function updateStaff( data: UpdateStaffInput, updatedByUserId: string, ) {
  const { userId, employeeId, firstName, lastName, phone, role } = data;

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
    return await db.user.update({
      where: { id: userId },
      data: {
        role,
        staff: {
          update: { 
            employeeId, 
            firstName, 
            lastName, 
            phone,
            updatedById: updatedByUserId,
         },
        },
      },
      select: staffSelect,
    });
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

export async function setStaffActive( userId: string, isActive: boolean, actingUserId: string,) {
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
    data: { passwordHash },
  });
  return { success: true };
}


export async function getAllStaff() {
  return db.user.findMany({
    where: {
      role: {
        in: [Role.ADMIN, Role.MANAGER, Role.FRONT_DESK, Role.HOUSEKEEPING],
      },
    },
    select: staffSelect,
    orderBy: { createdAt: "desc" },
  });
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