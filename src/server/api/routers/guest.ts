import { createTRPCRouter } from "../trpc";
import { publicProcedure } from "../trpc";
import { permissionProcedure } from "../rbac";
import {
  registerGuestSchema,
  createWalkInGuestSchema,
  updateWalkinGuestSchema,
  completeGuestRegistrationCardSchema,
  getAllGuestsSchema,
  setGuestActiveSchema,
} from "~/server/validations/guest-validation";
import {
  createWalkinGuest,
  updateWalkinGuest,
  completeGuestRegistrationCard,
  registerGuest,
  getAllGuests,
  getGuestById,
  setGuestActive,
} from "~/server/services/guest-service";
import { z } from "zod";

export const guestRouter = createTRPCRouter({
  getAll: permissionProcedure("guest", "manage")
    .input(getAllGuestsSchema)
    .query(({ input }) => getAllGuests(input)),

  getById: permissionProcedure("guest", "manage")
    .input(z.object({ guestId: z.string().cuid() }))
    .query(({ input }) => getGuestById(input.guestId)),
  
  register: publicProcedure
    .input(registerGuestSchema)
    .mutation(({ input }) => registerGuest(input)),

  createWalkin: permissionProcedure("guest", "manage")
    .input(createWalkInGuestSchema)
    .mutation(({ input, ctx }) => createWalkinGuest(input, ctx.session.user.id)),

  updateWalkin: permissionProcedure("guest", "manage")
    .input(updateWalkinGuestSchema)
    .mutation(({ input, ctx }) => updateWalkinGuest(input, ctx.session.user.id)),

  completeRegistration: permissionProcedure("guest", "manage")
    .input(completeGuestRegistrationCardSchema)
    .mutation(({ input, ctx }) => completeGuestRegistrationCard(input, ctx.session.user.id)),

  setActive: permissionProcedure("guest", "manage")
    .input(setGuestActiveSchema)
    .mutation(({ input, ctx }) => setGuestActive(input.roomId, input.isActive, ctx.session.user.id)),

});
