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
type Room = RouterOutputs["room"]["getAll"]["rooms"][number];

export function DeactivateRoomDialog({
  room,
  open,
  onOpenChange,
  onSuccess,
}: {
  room: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isActive = !room.deactivatedAt;

  const mutation = api.room.setActive.useMutation({
    onSuccess: () => {
      toast.success(
        isActive ? "Room deactivated" : "Room reactivated",
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
            {isActive ? "Deactivate" : "Reactivate"} &quot;{room.number}
            &quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                It will no longer be selectable when assigning amenities to room
                types. Existing room types keep their history.
                {room._count.reservations > 0 && (
                  <span className="text-destructive mt-2 block font-medium">
                    Currently assigned to {room._count.reservations} reservation
                    {room._count.reservations === 1 ? "" : "s"} — you&apos;ll need
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
            disabled={mutation.isPending || room._count.reservations > 0}
            onClick={() =>
              mutation.mutate({ roomId: room.id, isActive: !isActive })
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
