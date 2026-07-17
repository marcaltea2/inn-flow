import crypto from "crypto";
import { db } from "~/server/db";
import { sendMail } from "~/lib/mail";

const TOKEN_TTL_MS = 1000 * 60 * 60; // 1h 

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function issuePasswordResetEmail(userId: string, email: string) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set — cannot build reset link");
  }

  // invalidate any existing reset tokens for this user first — one live link at a time
  await db.passwordResetToken.deleteMany({ where: { userId } });

  const rawToken = crypto.randomBytes(32).toString("hex");

  await db.passwordResetToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}`;

  await sendMail({
    to: email,
    subject: "Reset your inn-flow password",
    html: `
      <p>Hi,</p>
      <p>A password reset was requested for your inn-flow account.</p>
      <p><a href="${resetUrl}">Set a new password</a></p>
      <p>This link expires in 1 hour. If you didn't request this, you can ignore it — your password won't change.</p>
    `,
  });
}

export async function validatePasswordResetToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    return { ok: false as const, reason: "expired_or_invalid" as const };
  }

  return { ok: true as const, userId: record.userId };
}

export async function consumePasswordResetToken(rawToken: string, newPassword: string) {
  const bcrypt = await import("bcryptjs");
  const tokenHash = hashToken(rawToken);

  const record = await db.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    return { ok: false as const, reason: "expired_or_invalid" as const };
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { ok: true as const };
}