import { createTRPCRouter } from "../trpc";
import { permissionProcedure } from "../rbac";
import { createAmenitySchema, updateAmenitySchema, getAllAmenitiesSchema, setAmenityActiveSchema } from "~/server/validations/amenity-validation";
import { createAmenity, updateAmenity, getAllAmenities,getAmenityById, setAmenityActive } from "~/server/services/amenity-service";
import { z } from "zod";

export const amenityRouter = createTRPCRouter({
  getAll: permissionProcedure("staff", "view")
    .input(getAllAmenitiesSchema)
    .query(({ input }) => getAllAmenities(input)),

  getById: permissionProcedure("staff", "view")
    .input(z.object({ amenityId: z.string().cuid() }))
    .query(({ input }) => getAmenityById(input.amenityId)),

  create: permissionProcedure("staff", "manage")
    .input(createAmenitySchema)
    .mutation(({ input, ctx }) => createAmenity(input, ctx.session.user.id)),

  update: permissionProcedure("staff", "manage")
    .input(updateAmenitySchema)
    .mutation(({ input, ctx }) => updateAmenity(input, ctx.session.user.id)),

  setActive: permissionProcedure("staff", "manage")
    .input(setAmenityActiveSchema)
    .mutation(({ input, ctx }) =>setAmenityActive(input.amenityId, input.isActive, ctx.session.user.id), ),
});
