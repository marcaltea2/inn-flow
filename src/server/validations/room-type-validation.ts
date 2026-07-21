import { z } from "zod";
import { optionalString } from "./shared";

export const createRoomTypeSchema = z.object({
  name: z.string().min(1).max(100),
  baseRate: z.coerce.number().positive("Base rate must be greater than 0"),
  capacity: z.coerce.number().int().min(1).max(20),
  description: optionalString(z.string().max(1000)),
  amenityIds: z.array(z.string().cuid()).optional(),
});

export const updateRoomTypeSchema = z.object({
  roomTypeId: z.string().cuid(),
  name: z.string().min(1).max(100),
  baseRate: z.coerce.number().positive("Base rate must be greater than 0"),
  capacity: z.coerce.number().int().min(1).max(20),
  description: optionalString(z.string().max(1000)),
  amenityIds: z.array(z.string().cuid()).optional(),
});

export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;