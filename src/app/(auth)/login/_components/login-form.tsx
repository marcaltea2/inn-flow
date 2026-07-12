"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "./google-icon";

// NextAuth's built-in error codes, mapped to copy a front-desk user will
// actually understand instead of "CredentialsSignin".
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password. Please try again.",
  AccessDenied: "This account doesn't have access. Please Contact your manager.",
  Default: "Something went wrong signing in. Please try again.",
};

export function LoginForm({
  callbackUrl,
  error,
}: {
  callbackUrl: string;
  error?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(
    error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default!) : null,
  );

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setFormError(ERROR_MESSAGES[result.error] ?? ERROR_MESSAGES.Default!);
      return;
    }
    window.location.assign(result?.url ?? callbackUrl);
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
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
