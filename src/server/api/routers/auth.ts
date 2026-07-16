import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  validatePasswordResetToken,
  consumePasswordResetToken,
} from "~/server/services/password-reset";

export const authRouter = createTRPCRouter({
  validateResetToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => validatePasswordResetToken(input.token)),

  completePasswordReset: publicProcedure
    .input(
      z.object({
        token: z.string(),
        newPassword: z.string().min(8),
      }),
    )
    .mutation(({ input }) => consumePasswordResetToken(input.token, input.newPassword)),
});