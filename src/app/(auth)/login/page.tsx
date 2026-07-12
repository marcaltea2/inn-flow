import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { LoginForm } from "./_components/login-form";

export default async function StaffLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  // Already signed in? Don't show a login form, just move on.
  if (session) redirect(callbackUrl ?? "/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>
        <LoginForm callbackUrl={callbackUrl ?? "/"} error={error} />
      </div>
    </div>
  );
}
