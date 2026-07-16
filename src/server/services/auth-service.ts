import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { consumePasswordResetToken } from "./password-reset";

export async function completeResetPassword(token: string, newPassword: string){
    return consumePasswordResetToken(token, newPassword)
}

export async function changeOwnPassword(userId: string, newPassword: string){
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db.user.update({
    where: { id: userId },
    data:  { passwordHash, isTempPassword: false }
  });
  return { success: true };
}

