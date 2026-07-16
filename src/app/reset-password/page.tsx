"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: validation, isLoading } = api.auth.validateResetToken.useQuery(
    { token },
    { enabled: !!token, retry: false },
  );

  const completeMutation = api.auth.completePasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Password updated. You can now sign in.");
      router.push("/login");
    },
    onError: (err) => toast.error(err.message),
  });

  if (!token) {
    return <p>Missing reset token.</p>;
  }

  if (isLoading) {
    return <p>Checking link…</p>;
  }

  if (!validation?.ok) {
    return (
      <p>
        This link is invalid or has expired. Ask your admin to send a new
        password reset link.
      </p>
    );
  }

  const canSubmit = password.length >= 8 && password === confirmPassword;

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-16">
      <h1 className="text-xl font-semibold">Set a new password</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
        />
        {confirmPassword.length > 0 && password !== confirmPassword && (
          <p className="text-destructive text-xs">Passwords don&apos;t match.</p>
        )}
      </div>

      <Button
        disabled={!canSubmit || completeMutation.isPending}
        onClick={() => completeMutation.mutate({ token, newPassword: password })}
      >
        {completeMutation.isPending ? "Saving…" : "Set new password"}
      </Button>
    </div>
  );
}