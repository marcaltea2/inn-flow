import { z } from "zod";
import { optionalString } from "./shared";

export const createRoomTypeSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character.")
    .max(100, "Name cannot exceed 100 characters."),
  baseRate: z.coerce
    .number({ invalid_type_error: "Base rate must be a number." })
    .positive("Base rate must be greater than 0."),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number." })
    .int("Capacity must be a whole number.")
    .min(1, "Capacity must be at least 1.")
    .max(20, "Capacity cannot exceed 20."),
  description: optionalString(
    z.string().max(500, "Description cannot exceed 500 characters."),
  ),
  amenityIds: z.array(z.string().cuid("Invalid amenity ID.")).optional(),
});

export const updateRoomTypeSchema = z.object({
  roomTypeId: z.string().cuid("Invalid room type ID."),
  name: z
    .string()
    .min(1, "Name must be at least 1 character.")
    .max(100, "Name cannot exceed 100 characters."),
  baseRate: z.coerce
    .number({ invalid_type_error: "Base rate must be a number." })
    .positive("Base rate must be greater than 0."),
  capacity: z.coerce
    .number({ invalid_type_error: "Capacity must be a number." })
    .int("Capacity must be a whole number.")
    .min(1, "Capacity must be at least 1.")
    .max(20, "Capacity cannot exceed 20."),
  description: optionalString(
    z.string().max(500, "Description cannot exceed 500 characters."),
  ),
  amenityIds: z.array(z.string().cuid("Invalid amenity ID.")).optional(),
});

export const setRoomTypeActiveSchema = z.object({
  roomTypeId: z.string().cuid("Invalid room type ID."),
  isActive: z.boolean({
    required_error: "isActive is required.",
    invalid_type_error: "isActive must be a boolean.",
  }),
});

export const getAllRoomTypesSchema = z
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

export type GetAllRoomTypesInput = z.infer<typeof getAllRoomTypesSchema>;
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;