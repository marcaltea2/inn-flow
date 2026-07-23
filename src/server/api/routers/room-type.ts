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
  getAll: permissionProcedure("roomType", "manage")
    .input(getAllRoomTypesSchema)
    .query(({ input }) => getAllRoomTypes(input)),

  getById: permissionProcedure("roomType", "manage")
    .input(z.object({ amenityId: z.string().cuid() }))
    .query(({ input }) => getRoomTypeById(input.amenityId)),

  create: permissionProcedure("roomType", "manage")
    .input(createRoomTypeSchema)
    .mutation(({ input, ctx }) => createRoomType(input, ctx.session.user.id)),

  update: permissionProcedure("roomType", "manage")
    .input(updateRoomTypeSchema)
    .mutation(({ input, ctx }) => updateRoomType(input, ctx.session.user.id)),

  setActive: permissionProcedure("roomType", "manage")
    .input(setRoomTypeActiveSchema)
    .mutation(({ input, ctx }) => setRoomTypeActive(input.roomTypeId, input.isActive, ctx.session.user.id),
    ),
});