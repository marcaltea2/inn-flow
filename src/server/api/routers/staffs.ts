// server/api/routers/staff.ts
import { createTRPCRouter } from "../trpc";
import { permissionProcedure } from "../rbac";
import {
  createStaffSchema,
  updateStaffSchema,
  resetStaffPasswordSchema,
  setStaffActiveSchema,
} from "~/server/validations/staff-validation";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  setStaffActive,
  resetStaffPassword,
} from "~/server/services/staff-service";
import { z } from "zod";

export const staffRouter = createTRPCRouter({
  getAll: permissionProcedure("staff", "view").query(() => getAllStaff()),

  getById: permissionProcedure("staff", "view")
    .input(z.object({ userId: z.string().cuid() }))
    .query(({ input }) => getStaffById(input.userId)),

  create: permissionProcedure("staff", "manage")
    .input(createStaffSchema)
    .mutation(({ input, ctx }) => createStaff(input, ctx.session.user.id)),

  update: permissionProcedure("staff", "manage")
    .input(updateStaffSchema)
    .mutation(({ input, ctx }) => updateStaff(input, ctx.session.user.id)),

  setActive: permissionProcedure("staff", "manage")
    .input(setStaffActiveSchema)
    .mutation(({ input, ctx }) => setStaffActive(input.userId, input.isActive, ctx.session.user.id)),

  resetPassword: permissionProcedure("staff", "manage")
    .input(resetStaffPasswordSchema)
    .mutation(({ input }) => resetStaffPassword(input.userId, input.newPassword)),
});