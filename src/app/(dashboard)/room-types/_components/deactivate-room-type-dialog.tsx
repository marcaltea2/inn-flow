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

type RoomType = RouterOutputs["roomType"]["getAll"]["roomTypes"][number];

export function DeactivateRoomTypeDialog({
  roomType,
  open,
  onOpenChange,
  onSuccess,
}: {
  roomType: RoomType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isActive = !roomType.deactivatedAt;

  const mutation = api.roomType.setActive.useMutation({
    onSuccess: () => {
      toast.success(
        isActive ? "Room type deactivated" : "Room type reactivated",
      );
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message), // surfaces the in-use CONFLICT message from the service layer
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isActive ? "Deactivate" : "Reactivate"} &quot;{roomType.name}
            &quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                It will no longer be selectable when assigning amenities to room
                types. Existing room types keep their history.
                {roomType._count.rooms > 0 && (
                  <span className="text-destructive mt-2 block font-medium">
                    Currently assigned to {roomType._count.rooms} room type
                    {roomType._count.rooms === 1 ? "" : "s"} — you&apos;ll need
                    to unassign it there first.
                  </span>
                )}
              </>
            ) : (
              "It will become available again for assigning to room types."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={mutation.isPending}
            onClick={() =>
              mutation.mutate({ roomTypeId: roomType.id, isActive: !isActive })
            }
          >
            {mutation.isPending
              ? isActive
                ? "Deactivating…"
                : "Reactivating…"
              : isActive
                ? "Deactivate"
                : "Reactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
