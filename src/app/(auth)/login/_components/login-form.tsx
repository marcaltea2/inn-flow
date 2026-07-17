"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "./google-icon";
import {
  loginSchema,
  type LoginInput,
} from "~/server/validations/auth-validation";

// NextAuth's built-in error codes, mapped to copy a front-desk user will
// actually understand instead of "CredentialsSignin".
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  AccessDenied:
    "This account doesn't have access. Please Contact your manager.",
  Default: "Something went wrong signing in. Please try again.",
};

export function LoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error?: string;
}) {
  const utils = api.useUtils();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default!) : null,
  );

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleCredentialsSubmit(values: LoginInput) {
    setIsSubmitting(true);
    setFormError(null);

    const status = await utils.auth.checkEmailVerificationStatus.fetch({
      email: values.email,
    });

    if (status.needsVerification) {
      setFormError("Please verify your email before signing in.");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (result?.error) {
      const status = await utils.auth.checkEmailVerificationStatus.fetch({
        email: values.email,
      });
      setFormError(
        status.needsVerification
          ? "Please verify your email before signing in."
          : (ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.Default!),
      );
      setIsSubmitting(false);
      return;
    }
    window.location.assign(result?.url ?? callbackUrl);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          onSubmit={form.handleSubmit(handleCredentialsSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              disabled={isSubmitting}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isSubmitting}
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-destructive text-sm">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <a
              href="/forgot-password"
              className="text-muted-foreground text-xs hover:underline"
            >
              Forgot password?
            </a>
          </div>

          {formError && (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sign in
          </Button>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">OR</span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => signIn("google", { callbackUrl })}
          >
            <GoogleIcon className="mr-2 size-4" />
            Continue with Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
