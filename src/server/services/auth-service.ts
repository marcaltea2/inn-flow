import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { consumePasswordResetToken } from "./password-reset";
import { issuePasswordResetEmail } from "./password-reset";

export async function completeResetPassword(
  token: string,
  newPassword: string,
) {
  return consumePasswordResetToken(token, newPassword);
}

export async function changeOwnPassword(userId: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash, isTempPassword: false },
  });
  return { success: true };
}

export async function forgotPassword(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, passwordHash: true },
  });

  if (user?.email && user.passwordHash) {
    await issuePasswordResetEmail(user.id, user.email).catch((err) => {
      console.error("Failed to send password reset email:", err);
    });
  }

  return { sent: true };
}

export async function checkEmailVerificationStatus(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { emailVerified: true, passwordHash: true },
  });

  if (!user?.passwordHash) return { needsVerification: false };

  return { needsVerification: !user.emailVerified };
}
