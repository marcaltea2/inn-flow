import { createTRPCRouter } from "../trpc";
import { permissionProcedure } from "../rbac";
import {
  createRoomSchema,
  updateRoomSchema,
  getAllRoomsSchema,
  setRoomStatusSchema,
  setRoomActiveSchema,
} from "~/server/validations/room-validation";
import {
  createRoom,
  updateRoom,
  getAllRooms,
  getRoomById,
  setRoomActive,
  setRoomStatus,
} from "~/server/services/room-service";
import { z } from "zod";

export const roomRouter = createTRPCRouter({
  getAll: permissionProcedure("staff", "view")
    .input(getAllRoomsSchema)
    .query(({ input }) => getAllRooms(input)),

  getById: permissionProcedure("staff", "view")
    .input(z.object({ amenityId: z.string().cuid() }))
    .query(({ input }) => getRoomById(input.amenityId)),

  create: permissionProcedure("staff", "manage")
    .input(createRoomSchema)
    .mutation(({ input, ctx }) => createRoom(input, ctx.session.user.id)),

  update: permissionProcedure("staff", "manage")
    .input(updateRoomSchema)
    .mutation(({ input, ctx }) => updateRoom(input, ctx.session.user.id)),

  setActive: permissionProcedure("staff", "manage")
    .input(setRoomActiveSchema)
    .mutation(({ input, ctx }) =>
      setRoomActive(input.roomId, input.isActive, ctx.session.user.id),
    ),

  setStatus: permissionProcedure("room", "setStatus")
    .input(setRoomStatusSchema)
    .mutation(({ input, ctx }) => setRoomStatus(input, ctx.session.user.id)),
});
