import crypto from "crypto";
import { db } from "~/server/db";
import { sendMail } from "~/lib/mail";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 48; // 48h

function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function issueVerificationEmail(userId: string, email: string) {
  await db.emailVerificationToken.deleteMany({ where: { userId } });

  const rawToken = crypto.randomBytes(32).toString("hex");

  await db.emailVerificationToken.create({
    data: {
      userId,
      email,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${rawToken}`;

  await sendMail({
    to: email,
    subject: "Confirm your inn-flow account email",
    html: `
      <p>Hi,</p>
      <p>Please confirm this email address is correct for your inn-flow staff account.</p>
      <p><a href="${verifyUrl}">Confirm email address</a></p>
      <p>This link expires in 48 hours. If you didn't expect this, you can ignore it.</p>
    `,
  });
}

export async function verifyEmailToken(rawToken: string) {
  const tokenHash = hashToken(rawToken);

  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt < new Date()) {
    return { ok: false as const, reason: "expired_or_invalid" as const };
  }

  const user = await db.user.findUnique({ where: { id: record.userId } });

  if (user?.email !== record.email) {
    await db.emailVerificationToken.delete({ where: { id: record.id } });
    return { ok: false as const, reason: "stale_email" as const };
  }

  await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    db.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
  ]);

  return { ok: true as const };
}
