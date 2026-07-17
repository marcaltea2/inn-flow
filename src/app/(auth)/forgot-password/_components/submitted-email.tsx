// app/(auth)/forgot-password/submitted-email.tsx
"use client";

import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { CenteredCard } from "../../_components/centered-card";
import { IconHeader } from "../../_components/icon-header";

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
    <CenteredCard>
      <IconHeader
        icon={<MailCheck className="text-foreground size-6" />}
        title="Check your email"
        description={
          <>
            We sent a password reset link to{" "}
            <span className="text-foreground font-medium">{email}</span>. Please
            check your inbox.
          </>
        }
      />
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
        className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1 text-sm"
      >
        <ArrowLeft className="size-3.5" />
        Back to sign in
      </a>
    </CenteredCard>
  );
}
