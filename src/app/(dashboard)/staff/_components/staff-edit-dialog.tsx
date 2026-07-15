"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { STAFF_ROLES } from "~/server/validations/staff-validation";
import type { Role } from "@prisma/client";
import { formatRole } from "~/lib/format-role";

type StaffMember = RouterOutputs["staff"]["getAll"][number];

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
  function isStaffRole(role: Role): role is (typeof STAFF_ROLES)[number] {
    return (STAFF_ROLES as readonly Role[]).includes(role);
  }

  const form = useForm<UpdateStaffInput>({
    resolver: zodResolver(updateStaffSchema),
    defaultValues: {
      userId: staff.id,
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
          onSubmit={form.handleSubmit((values) =>
            updateMutation.mutate(values),
          )}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...form.register("firstName")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...form.register("lastName")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={staff.email ?? ""} disabled />
            <p className="text-muted-foreground text-xs">
              Email is the login identity and can&apos;t be changed here.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                value={ formatRole(form.watch("role"))}
                onValueChange={(v) =>
                  form.setValue("role", v as UpdateStaffInput["role"])
                }
              >
                <SelectTrigger id="role">
                    <SelectValue>
                        {formatRole(form.watch("role"))}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((role) => (
                    <SelectItem key={role} value={role}> {formatRole(role)} </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" {...form.register("employeeId")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
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
