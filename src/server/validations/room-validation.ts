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
  roomTypeId: z.string().cuid("Invalid room type."),
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

export const setRoomActiveSchema = z.object({
  roomId: z.string().cuid("Invalid room ID."),
  isActive: z.boolean({
    required_error: "isActive is required.",
    invalid_type_error: "isActive must be true or false.",
  }),
});


export const getAllRoomsSchema = z
  .object({
    search: z.string().trim().optional(),
    page: z.coerce
      .number({ invalid_type_error: "Page must be a number." })
      .int("Page must be a whole number.")
      .min(1, "Page must be at least 1.")
      .default(1),
    pageSize: z.coerce
      .number({ invalid_type_error: "Page size must be a number." })
      .int("Page size must be a whole number.")
      .min(1, "Page size must be at least 1.")
      .max(100, "Page size cannot exceed 100.")
      .default(10),
  })
  .optional()
  .default({});

export type GetAllRoomInput = z.infer<typeof getAllRoomsSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type SetRoomStatusInput = z.infer<typeof setRoomStatusSchema>;
