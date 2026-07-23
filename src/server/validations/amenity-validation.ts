import { z } from "zod";
import { AmenityCategory } from "@prisma/client";

export const createAmenitySchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character.")
    .max(100, "Name cannot exceed 100 characters."),
  icon: z
    .string()
    .min(1, "Icon is required.")
    .max(50, "Icon name cannot exceed 50 characters."), // lucide-react icon name, e.g. "wifi"
  category: z.nativeEnum(AmenityCategory, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  isGuestFacing: z.boolean({
    required_error: "isGuestFacing is required.",
    invalid_type_error: "isGuestFacing must be true or false.",
  }),
});

export const updateAmenitySchema = z.object({
  amenityId: z.string().cuid("Invalid amenity ID."),
  name: z
    .string()
    .min(1, "Name must be at least 1 character.")
    .max(100, "Name cannot exceed 100 characters."),
  icon: z
    .string()
    .min(1, "Icon is required.")
    .max(50, "Icon name cannot exceed 50 characters."),
  category: z.nativeEnum(AmenityCategory, {
    errorMap: () => ({ message: "Please select a valid category." }),
  }),
  isGuestFacing: z.boolean({
    required_error: "isGuestFacing is required.",
    invalid_type_error: "isGuestFacing must be true or false.",
  }),
});

export const setAmenityActiveSchema = z.object({
  amenityId: z.string().cuid("Invalid amenity ID."),
  isActive: z.boolean({
    required_error: "isActive is required.",
    invalid_type_error: "isActive must be true or false.",
  }),
});

export const getAllAmenitiesSchema = z
  .object({
    search: z.string().trim().optional(),
    category: z.nativeEnum(AmenityCategory, {
      invalid_type_error: "Please select a valid category.",
    }).optional(),
    isGuestFacing: z.boolean().optional(),
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

export type GetAllAmenitiesInput = z.infer<typeof getAllAmenitiesSchema>;
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;