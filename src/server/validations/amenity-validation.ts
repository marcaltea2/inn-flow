import { z } from "zod";

export const createAmenitySchema = z.object({
  name: z.string().min(1).max(100),
});

export const updateAmenitySchema = z.object({
  amenityId: z.string().cuid(),
  name: z.string().min(1).max(100),
});

export const setAmenityActiveSchema = z.object({
  amenityId: z.string().cuid(),
  isActive: z.boolean(),
});

export const getAllAmenitiesSchema = z
  .object({
    search: z.string().trim().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(10),
  })
  .optional()
  .default({});

export type GetAllAmenitiesInput = z.infer<typeof getAllAmenitiesSchema>;
export type CreateAmenityInput = z.infer<typeof createAmenitySchema>;
export type UpdateAmenityInput = z.infer<typeof updateAmenitySchema>;
