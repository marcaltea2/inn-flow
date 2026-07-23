import { z } from "zod";
import { RoomStatus } from "@prisma/client";

export const createRoomSchema = z.object({
  number: z
    .string()
    .min(1, "Room number is required.")
    .max(20, "Room number cannot exceed 20 characters."),
  floor: z.coerce
    .number({ invalid_type_error: "Floor must be a number." })
    .int("Floor must be a whole number.")
    .optional(),
  roomTypeId: z.string().cuid("Invalid room type ID."),
});

export const updateRoomSchema = z.object({
  roomId: z.string().cuid("Invalid room ID."),
  number: z
    .string()
    .min(1, "Room number is required.")
    .max(20, "Room number cannot exceed 20 characters."),
  floor: z.coerce
    .number({ invalid_type_error: "Floor must be a number." })
    .int("Floor must be a whole number.")
    .optional(),
  roomTypeId: z.string().cuid("Invalid room type ID."),
});

export const setRoomStatusSchema = z.object({
  roomId: z.string().cuid("Invalid room ID."),
  status: z.nativeEnum(RoomStatus, {
    invalid_type_error: "Please select a valid room status.",
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type SetRoomStatusInput = z.infer<typeof setRoomStatusSchema>;