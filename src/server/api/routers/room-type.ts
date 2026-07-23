import { createTRPCRouter } from "../trpc";
import { permissionProcedure } from "../rbac";
import {
  createRoomTypeSchema,
  updateRoomTypeSchema,
  getAllRoomTypesSchema,
  setRoomTypeActiveSchema,
} from "~/server/validations/room-type-validation";
import {
  createRoomType,
  updateRoomType,
  getAllRoomTypes,
  getRoomTypeById,
  setRoomTypeActive,
} from "~/server/services/room-type-service";
import { z } from "zod";

export const roomTypeRouter = createTRPCRouter({
  getAll: permissionProcedure("staff", "view")
    .input(getAllRoomTypesSchema)
    .query(({ input }) => getAllRoomTypes(input)),

  getById: permissionProcedure("staff", "view")
    .input(z.object({ amenityId: z.string().cuid() }))
    .query(({ input }) => getRoomTypeById(input.amenityId)),

  create: permissionProcedure("staff", "manage")
    .input(createRoomTypeSchema)
    .mutation(({ input, ctx }) => createRoomType(input, ctx.session.user.id)),

  update: permissionProcedure("staff", "manage")
    .input(updateRoomTypeSchema)
    .mutation(({ input, ctx }) => updateRoomType(input, ctx.session.user.id)),

  setActive: permissionProcedure("staff", "manage")
    .input(setRoomTypeActiveSchema)
    .mutation(({ input, ctx }) => setRoomTypeActive(input.roomTypeId, input.isActive, ctx.session.user.id),
    ),
});