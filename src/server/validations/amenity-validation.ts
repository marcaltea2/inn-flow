import { z } from "zod";
import { AmenityCategory } from "@prisma/client";

export const AMENITY_CATEGORIES = [
  AmenityCategory.CONNECTIVITY,
  AmenityCategory.ROOM_FEATURES,
  AmenityCategory.BATHROOM,
  AmenityCategory.VIEW,
  AmenityCategory.ACCESSIBILITY,
  AmenityCategory.SERVICES,
] as const;

export const createAmenitySchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(50), // lucide-react icon name, e.g. "wifi"
  category: z.enum(AMENITY_CATEGORIES),
  isGuestFacing: z.boolean()
});

export const updateAmenitySchema = z.object({
  amenityId: z.string().cuid(),
  name: z.string().min(1).max(100),
  icon: z.string().min(1).max(50),
  category: z.enum(AMENITY_CATEGORIES),
  isGuestFacing: z.boolean(),
});

export const setAmenityActiveSchema = z.object({
  amenityId: z.string().cuid(),
  isActive: z.boolean(),
});

export const getAllAmenitiesSchema = z
  .object({
    search: z.string().trim().optional(),
    category: z.nativeEnum(AmenityCategory).optional(),
    isGuestFacing: z.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  })
  .optional()
  .default({});

export type GetAllAmenitiesInput = z.infer<typeof getAllAmenitiesSchema>;
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;