"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  KeyRound,
  ShieldX,
  ArrowLeft,
  Loader2,
  CircleCheck,
} from "lucide-react";
import { api } from "~/trpc/react";
import {
  setNewPasswordSchema,
  type SetNewPasswordInput,
} from "~/server/validations/auth-validation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CenteredCard } from "../../_components/centered-card";
import { IconHeader } from "../../_components/icon-header";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [isComplete, setIsComplete] = useState(false);

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
      setIsComplete(true);
    },
    onError: (err) => toast.error(err.message),
  });

  if (isComplete) {
    return (
      <CenteredCard>
        <IconHeader
          icon={<CircleCheck className="text-foreground size-6" />}
          title="Your password has been successfully reset"
          description="Your password has been reset. You can now sign in with your new password."
        />
        <Button
          className="w-full"
          onClick={() => (window.location.href = "/login")}
        >
          Back to sign in
        </Button>
      </CenteredCard>
    );
  }

  if (!token) {
    return (
      <CenteredCard>
        <IconHeader
          icon={<ShieldX className="text-foreground size-6" />}
          title="Missing reset link"
          description="This page needs a valid reset link to continue."
        />

        <a
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          Request a new link
        </a>
      </CenteredCard>
    );
  }

  if (isLoading) {
    return (
      <CenteredCard>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <Loader2 className="text-muted-foreground size-6 animate-spin" />
          <p className="text-muted-foreground text-sm">Checking your link…</p>
        </div>
      </CenteredCard>
    );
  }

  if (!validation?.ok) {
    return (
      <CenteredCard>
        <IconHeader
          icon={<ShieldX className="text-foreground size-6" />}
          title="Link expired"
          description="This reset link is invalid or has expired. Request a new one to continue."
        />

        <a
          href="/forgot-password"
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 text-sm"
        >
          <ArrowLeft className="size-3.5" />
          Request a new link
        </a>
      </CenteredCard>
    );
  }

  return (
    <CenteredCard>
      <IconHeader
        icon={<KeyRound className="text-foreground size-6" />}
        title="Set a new password"
        description="Choose a strong password you haven't used before."
      />

      <form
        onSubmit={form.handleSubmit((values) =>
          completeMutation.mutate({ token, newPassword: values.password }),
        )}
        className="flex flex-col gap-4"
      >
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
            autoFocus
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-sm">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Enter your password"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-destructive text-sm">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={completeMutation.isPending}
        >
          {completeMutation.isPending ? "Saving…" : "Set new password"}
        </Button>
      </form>
    </CenteredCard>
  );
}
