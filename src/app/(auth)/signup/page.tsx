import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { SignupForm } from "./_components/signup-form";


export default async function SignupPage() {
  const session = await auth();

  // Already signed in? Don't show a login form, just move on.
  if (session) redirect("/");

  return (
    <div className="bg-muted/40 flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-semibold tracking-tight">
            Create an Account
          </h1>
          <p className="text-muted-foreground text-sm">
            Please enter your details to create an account.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
