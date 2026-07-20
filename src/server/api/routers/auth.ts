import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { validatePasswordResetToken } from "~/server/services/password-reset";
import {
  changeOwnPasswordSchema,
  completeResetPasswordSchema,
  checkEmailVerificationStatusSchema,
  forgotPasswordSchema,
} from "~/server/validations/auth-validation";
import {
  changeOwnPassword,
  completeResetPassword,
  checkEmailVerificationStatus,
  forgotPassword,
} from "~/server/services/auth-service";

export const authRouter = createTRPCRouter({
  validateResetToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(({ input }) => validatePasswordResetToken(input.token)),

  completePasswordReset: publicProcedure
    .input(completeResetPasswordSchema)
    .mutation(({ input }) =>
      completeResetPassword(input.token, input.newPassword),
    ),

  changeOwnPassword: protectedProcedure
    .input(changeOwnPasswordSchema)
    .mutation(({ input, ctx }) =>
      changeOwnPassword(ctx.session.user.id, input.newPassword),
    ),

  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(({ input }) => forgotPassword(input.email)),

  checkEmailVerificationStatus: publicProcedure
    .input(checkEmailVerificationStatusSchema)
    .query(({ input }) => checkEmailVerificationStatus(input.email)),
});
