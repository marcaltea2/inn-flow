"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  updateWalkinGuestSchema,
  type UpdateWalkInGuestInput,
} from "~/server/validations/guest-validation";
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

type Guest = RouterOutputs["guest"]["getAll"]["guests"][number];

export function GuestEditDialog({
  guest,
  open,
  onOpenChange,
  onSuccess,
}: {
  guest: Guest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const form = useForm<UpdateWalkInGuestInput>({
    resolver: zodResolver(updateWalkinGuestSchema),
    defaultValues: {
      guestId: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email ?? "",
      phone: guest.phone ?? "",
    },
  });

  const updateMutation = api.guest.updateWalkin.useMutation({
    onSuccess: () => {
      toast.success("Guest updated");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit guest</DialogTitle>
          <DialogDescription>Update this guest&apos;s contact details.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => updateMutation.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" placeholder="Enter your first name" {...form.register("firstName")} autoComplete="off" />
              {form.formState.errors.firstName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" placeholder="Enter your last name" {...form.register("lastName")} autoComplete="off" />
              {form.formState.errors.lastName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="Enter your email" type="email" {...form.register("email")} autoComplete="off" />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" placeholder="Enter your phone number" {...form.register("phone")} autoComplete="off" />
            {form.formState.errors.phone && (
              <p className="text-destructive text-sm">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}