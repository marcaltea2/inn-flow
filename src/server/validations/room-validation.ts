import { z } from "zod";
import { RoomStatus } from "@prisma/client";

export const createRoomSchema = z.object({
  number: z.string().min(1).max(20),
  floor: z.coerce.number().int().optional(),
  roomTypeId: z.string().cuid(),
});

export const updateRoomSchema = z.object({
  roomId: z.string().cuid(),
  number: z.string().min(1).max(20),
  floor: z.coerce.number().int().optional(),
  roomTypeId: z.string().cuid(),
});

export const setRoomStatusSchema = z.object({
  roomId: z.string().cuid(),
  status: z.nativeEnum(RoomStatus),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type SetRoomStatusInput = z.infer<typeof setRoomStatusSchema>;