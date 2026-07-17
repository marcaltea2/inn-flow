// app/(auth)/forgot-password/submitted-email.tsx
"use client";

import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

const RESEND_COOLDOWN_S = 120;

export function SubmittedEmail({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(0);

  const mutation = api.auth.forgotPassword.useMutation({
    onSuccess: () => startCooldown(),
  });

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN_S);
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-10 pb-8 text-center">
            <div className="bg-secondary flex size-14 items-center justify-center rounded-full">
              <MailCheck className="text-foreground size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h1 className="text-lg font-semibold">Check your email</h1>
              <p className="text-muted-foreground text-sm">
                We sent a password reset link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Please check your inbox.
              </p>
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full"
              disabled={cooldown > 0 || mutation.isPending}
              onClick={() => mutation.mutate({ email })}
            >
              {mutation.isPending
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend email"}
            </Button>

            <a
              href="/login"
              className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 text-sm"
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
