import { Suspense } from "react";
import { ResetPasswordForm } from "./_components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}