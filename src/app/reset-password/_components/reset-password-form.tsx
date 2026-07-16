"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  setNewPasswordSchema,
  type SetNewPasswordInput,
} from "~/server/validations/staff-validation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const form = useForm<SetNewPasswordInput>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const { data: validation, isLoading } = api.auth.validateResetToken.useQuery(
    { token },
    { enabled: !!token, retry: false },
  );

  const completeMutation = api.auth.completePasswordReset.useMutation({
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error("This link is invalid or has expired.");
        return;
      }
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

  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        completeMutation.mutate({ token, newPassword: values.password }),
      )}
      className="mx-auto flex max-w-sm flex-col gap-4 pt-16"
    >
      <h1 className="text-xl font-semibold">Set a new password</h1>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password && (
          <p className="text-destructive text-sm">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...form.register("confirmPassword")}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-destructive text-sm">
            {form.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={completeMutation.isPending}>
        {completeMutation.isPending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}