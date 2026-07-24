"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type StaffMember = RouterOutputs["staff"]["getAll"]["staff"][number];

export function ResetPasswordDialog({
  staff,
  open,
  onOpenChange,
}: {
  staff: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [directMode, setDirectMode] = useState(false);
  const [password, setPassword] = useState("");

  const sendLinkMutation = api.staff.sendPasswordResetLink.useMutation({
    onSuccess: () => {
      toast.success(`Password reset link sent to ${staff.email}`);
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const directMutation = api.staff.resetPassword.useMutation({
    onSuccess: () => {
      toast.success(`Password reset for ${staff.email}`);
      setPassword("");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            {directMode
              ? `Set a new temporary password for ${staff.email} directly.`
              : `Send a password reset link to ${staff.email}. They'll set their own new password.`}
          </DialogDescription>
        </DialogHeader>

        {directMode && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              placeholder="Enter new password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setDirectMode((v) => !v)}
          className="text-muted-foreground hover:text-foreground text-left text-xs underline"
        >
          {directMode
            ? "Send a reset link instead"
            : "Set password directly instead (in-person onboarding)"}
        </button>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {directMode ? (
            <Button
              disabled={password.length < 8 || directMutation.isPending}
              onClick={() =>
                directMutation.mutate({ userId: staff.id, newPassword: password })
              }
            >
              {directMutation.isPending ? "Resetting…" : "Set password"}
            </Button>
          ) : (
            <Button
              disabled={sendLinkMutation.isPending}
              onClick={() => sendLinkMutation.mutate({ userId: staff.id })}
            >
              {sendLinkMutation.isPending ? "Sending…" : "Send reset link"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}