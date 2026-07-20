import { verifyEmailToken } from "~/server/services/email-verification";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <p>Missing verification token.</p>;
  }

  const result = await verifyEmailToken(token);

  if (!result.ok) {
    return (
      <p>
        This link is invalid or has expired. Ask your admin to resend the
        verification email.
      </p>
    );
  }

  return <p>Email confirmed. You&apos;re all set.</p>;
}