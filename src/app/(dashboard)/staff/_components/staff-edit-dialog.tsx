"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  updateStaffSchema,
  type UpdateStaffInput,
} from "~/server/validations/staff-validation";
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
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { STAFF_ROLES } from "~/server/validations/staff-validation";
import type { Role } from "@prisma/client";
import { formatString } from "~/lib/format-string";

type StaffMember = RouterOutputs["staff"]["getAll"]["staff"][number];

export function StaffEditDialog({
  staff,
  open,
  onOpenChange,
  onSuccess,
}: {
  staff: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [emailUnlocked, setEmailUnlocked] = useState(false);

  function isStaffRole(role: Role): role is (typeof STAFF_ROLES)[number] {
    return (STAFF_ROLES as readonly Role[]).includes(role);
  }

  const form = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      userId: staff.id,
      email: staff.email ?? "", // was missing from defaultValues entirely
      role: isStaffRole(staff.role) ? staff.role : undefined,
      employeeId: staff.staff?.employeeId ?? "",
      firstName: staff.staff?.firstName ?? "",
      lastName: staff.staff?.lastName ?? "",
      phone: staff.staff?.phone ?? "",
    },
  });

  const updateMutation = api.staff.update.useMutation({
    onSuccess: () => {
      toast.success("Staff details updated");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const resendMutation = api.staff.resendVerificationEmail.useMutation({
    onSuccess: () => toast.success("Verification email sent"),
    onError: (err) => toast.error(err.message),
  });

  const emailChanged = emailUnlocked && form.watch("email") !== staff.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit staff</DialogTitle>
          <DialogDescription>
            Update this staff member&apos;s details and role.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) => {
            console.log(values);
            if (
              emailChanged &&
              !window.confirm(
                "This changes the login email and will mark it as unverified. Continue?",
              )
            ) {
              return;
            }
            updateMutation.mutate(values);
          })}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...form.register("firstName")} />

              {form.formState.errors.firstName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...form.register("lastName")} />

              {form.formState.errors.lastName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Badge variant={staff.emailVerified ? "default" : "secondary"}>
                  {staff.emailVerified ? "Verified" : "Unverified"}
                </Badge>
                {!emailUnlocked && (
                  <button
                    type="button"
                    onClick={() => setEmailUnlocked(true)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Edit email"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
            <Input
              id="email"
              type="email"
              disabled={!emailUnlocked}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                {emailUnlocked
                  ? "This is the login identity. Changing it marks the email unverified again."
                  : "Email is the login identity. Click the pencil to edit email."}
              </p>
              {!staff.emailVerified && (
                <button
                  type="button"
                  onClick={() => resendMutation.mutate({ userId: staff.id })}
                  disabled={resendMutation.isPending}
                  className="text-muted-foreground hover:text-foreground shrink-0 text-xs underline"
                >
                  {resendMutation.isPending
                    ? "Sending…"
                    : "Resend verification"}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formatString(form.watch("role"))}
                onValueChange={(v) =>
                  form.setValue("role", v as UpdateStaffInput["role"])
                }
              >
                <SelectTrigger id="role">
                  <SelectValue>{formatString(form.watch("role"))}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {formatString(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" {...form.register("employeeId")} />

              {form.formState.errors.employeeId && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />

            {form.formState.errors.phone && (
              <p className="text-destructive text-sm">
                {form.formState.errors.phone.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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
