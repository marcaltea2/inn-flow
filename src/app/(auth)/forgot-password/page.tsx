// app/(auth)/forgot-password/page.tsx
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
import { Card, CardContent } from "~/components/ui/card";
import { SubmittedEmail } from "./_components/submitted-email";

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
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="flex flex-col gap-6 pt-10 pb-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-secondary flex size-14 items-center justify-center rounded-full">
                <KeyRound className="text-foreground size-6" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h1 className="text-lg font-semibold">Forgot your password?</h1>
                <p className="text-muted-foreground text-sm">
                  Enter your email and we&apos;ll send you a link to reset it.
                </p>
              </div>
            </div>

            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
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

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
