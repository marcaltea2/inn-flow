"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, KeyRound } from "lucide-react";
import { api } from "~/trpc/react";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "~/server/validations/auth-validation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SubmittedEmail } from "./_components/submitted-email";
import { CenteredCard } from "../_components/centered-card";
import { IconHeader } from "../_components/icon-header";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const mutation = api.auth.forgotPassword.useMutation({
    onSuccess: (_, variables) => setSubmittedEmail(variables.email),
  });

  if (submittedEmail) {
    return <SubmittedEmail email={submittedEmail} />;
  }

  return (
    <CenteredCard>
      <IconHeader
        icon={<KeyRound className="text-foreground size-6" />}
        title="Forgot your password?"
        description="Enter your email and we'll send you a link to reset it."
      />

      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            autoFocus
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <a
        href="/login"
        className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </a>
    </CenteredCard>
  );
}
