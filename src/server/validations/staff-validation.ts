import { z } from "zod";
import { Role } from "@prisma/client";

export const STAFF_ROLES = [
  Role.ADMIN,
  Role.MANAGER,
  Role.FRONT_DESK,
  Role.HOUSEKEEPING,
] as const;

export const createStaffSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
  role: z.enum(STAFF_ROLES),
  employeeId: z.string().max(100).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(11).optional(),
});

export const updateStaffSchema = z.object({
  userId: z.string().cuid(),
  email: z.string().email().toLowerCase().trim(),
  role: z.enum(STAFF_ROLES).optional(),
  employeeId: z.string().max(100).optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(11).optional(),
});

export const resetStaffPasswordSchema = z.object({
  userId: z.string().cuid(),
  newPassword: z.string().min(8),
});


export const sendPasswordResetLinkSchema = z.object({
  userId: z.string().cuid(),
});

export const setStaffActiveSchema = z.object({
  userId: z.string().cuid(),
  isActive: z.boolean(),
});


export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;

