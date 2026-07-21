"use client";

import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

type StaffMember = RouterOutputs["staff"]["getAll"]["staff"][number];

export function DeactivateStaffDialog({
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
  const mutation = api.staff.setActive.useMutation({
    onSuccess: () => {
      toast.success(staff.isActive ? "Staff account deactivated" : "Staff account reactivated");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message), // surfaces last-admin guard errors from the service layer
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {staff.isActive ? "Deactivate" : "Reactivate"} {staff.staff?.firstName}{" "}
            {staff.staff?.lastName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {staff.isActive
              ? "They'll immediately lose the ability to sign in. This doesn't delete their account or history."
              : "They'll be able to sign in again with their existing credentials."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              mutation.mutate({ userId: staff.id, isActive: !staff.isActive })
            }
          >
            {staff.isActive ? "Deactivate" : "Reactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}