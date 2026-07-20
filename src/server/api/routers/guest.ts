import { createTRPCRouter } from "../trpc";
import { publicProcedure } from "../trpc";
import { registerGuestSchema } from "~/server/validations/guest-validation";
import { registerGuest } from "~/server/services/guest-service";

export const guestRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerGuestSchema)
    .mutation(({ input }) => registerGuest(input)),
});
