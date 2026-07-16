"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  setNewPasswordSchema,
  type SetNewPasswordInput,
} from "~/server/validations/staff-validation";

export default function ChangePasswordPage() {
  const router = useRouter();

  const form = useForm<SetNewPasswordInput>({
    resolver: zodResolver(setNewPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onChange",
  });

  const changeOwnPasswordMutation = api.auth.changeOwnPassword.useMutation({
    onSuccess: () => {
      toast.success("Password updated");
      router.push("/");
      router.refresh(); // re-fetch session so mustChangePassword flag clears
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <form
      onSubmit={form.handleSubmit((values) =>
        changeOwnPasswordMutation.mutate({ newPassword: values.password }),
      )}
      className="mx-auto flex max-w-sm flex-col gap-4 pt-16"
    >
      <h1 className="text-xl font-semibold">Set your password</h1>
      <p className="text-muted-foreground text-sm">
        You&apos;re using a temporary password. Please set your own before
        continuing.
      </p>

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

      <Button type="submit" disabled={changeOwnPasswordMutation.isPending}>
        {changeOwnPasswordMutation.isPending ? "Saving…" : "Set new password"}
      </Button>
    </form>
  );
}
