"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { CenteredCard } from "../../_components/centered-card";
import { IconHeader } from "../../_components/icon-header";

const RESEND_COOLDOWN_S = 120;

export function SubmittedEmail({ email }: { email: string }) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);

  const mutation = api.auth.forgotPassword.useMutation({
    onSuccess: () => setCooldown(RESEND_COOLDOWN_S),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []); // runs once, ticks forever — no missing deps, since setCooldown's updater reads `prev`, not the outer `cooldown`

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
