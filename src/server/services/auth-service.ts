import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { consumePasswordResetToken, issuePasswordResetEmail } from "./password-reset";
import { Role } from "@prisma/client";
import type {
  ChangeOwnPasswordInput,
  CompleteResetPasswordInput,
  ForgotPasswordInput,
  CheckEmailVerificationStatusInput,
} from "../validations/auth-validation"; // adjust path to wherever these live

export async function completeResetPassword(input: CompleteResetPasswordInput) {
  return consumePasswordResetToken(input.token, input.newPassword);
}

export async function changeOwnPassword(
  userId: string,
  input: ChangeOwnPasswordInput,
) {
  const passwordHash = await bcrypt.hash(input.newPassword, 12);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, isTempPassword: false },
  });
  return { success: true };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await db.user.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, passwordHash: true },
  });

  if (user?.email && user.passwordHash) {
    await issuePasswordResetEmail(user.id, user.email).catch((err) => {
      console.error("Failed to send password reset email:", err);
    });
  }

  return { sent: true };
}

export async function checkEmailVerificationStatus(
  input: CheckEmailVerificationStatusInput,
) {
  const user = await db.user.findUnique({
    where: { email: input.email },
    select: { emailVerified: true, passwordHash: true, role: true },
  });

  if (user?.role === Role.GUEST || !user?.passwordHash) {
    return { needsVerification: false };
  }

  return { needsVerification: !user.emailVerified };
}