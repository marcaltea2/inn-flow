import { createTRPCRouter } from "../trpc";
import { permissionProcedure } from "../rbac";
import {
  createAmenitySchema,
  updateAmenitySchema,
  getAllAmenitiesSchema,
  setAmenityActiveSchema,
} from "~/server/validations/amenity-validation";
import {
  createAmenity,
  updateAmenity,
  getAllAmenities,
  getAmenityById,
  setAmenityActive,
} from "~/server/services/amenity-service";
import { z } from "zod";

export const amenityRouter = createTRPCRouter({
  getAll: permissionProcedure("amenity", "manage")
    .input(getAllAmenitiesSchema)
    .query(({ input }) => getAllAmenities(input)),

  getById: permissionProcedure("amenity", "manage")
    .input(z.object({ amenityId: z.string().cuid() }))
    .query(({ input }) => getAmenityById(input.amenityId)),

  create: permissionProcedure("amenity", "manage")
    .input(createAmenitySchema)
    .mutation(({ input, ctx }) => createAmenity(input, ctx.session.user.id)),

  update: permissionProcedure("amenity", "manage")
    .input(updateAmenitySchema)
    .mutation(({ input, ctx }) => updateAmenity(input, ctx.session.user.id)),

  setActive: permissionProcedure("amenity", "manage")
    .input(setAmenityActiveSchema)
    .mutation(({ input, ctx }) =>
      setAmenityActive(input.amenityId, input.isActive, ctx.session.user.id),
    ),
});