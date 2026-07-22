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

type Amenity = RouterOutputs["amenity"]["getAll"]["amenities"][number];

export function DeactivateAmenityDialog({
  amenity,
  open,
  onOpenChange,
  onSuccess,
}: {
  amenity: Amenity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const isActive = !amenity.deactivatedAt;

  const mutation = api.amenity.setActive.useMutation({
    onSuccess: () => {
      toast.success(isActive ? "Amenity deactivated" : "Amenity reactivated");
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
            {isActive ? "Deactivate" : "Reactivate"} &&quot;{amenity.name}&&quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isActive ? (
              <>
                It will no longer be selectable when assigning amenities to room
                types. Existing room types keep their history.
                {amenity._count.roomTypes > 0 && (
                  <span className="text-destructive mt-2 block font-medium">
                    Currently assigned to {amenity._count.roomTypes} room type
                    {amenity._count.roomTypes === 1 ? "" : "s"} — you&apos;ll need to
                    unassign it there first.
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
            onClick={() =>
              mutation.mutate({ amenityId: amenity.id, isActive: !isActive })
            }
          >
            {isActive ? "Deactivate" : "Reactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}