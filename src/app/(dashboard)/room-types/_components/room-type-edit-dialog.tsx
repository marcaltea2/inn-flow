"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  updateRoomTypeSchema,
  type UpdateRoomTypeInput,
} from "~/server/validations/room-type-validation";
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
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { ScrollArea } from "~/components/ui/scroll-area";

type RoomType = RouterOutputs["roomType"]["getAll"]["roomTypes"][number];

export function RoomTypeEditDialog({
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
  const { data: amenitiesData } = api.amenity.getAll.useQuery(
    { pageSize: 100 },
    { enabled: open },
  );

  const form = useForm<UpdateRoomTypeInput>({
    resolver: zodResolver(updateRoomTypeSchema),
    defaultValues: {
      roomTypeId: roomType.id,
      name: roomType.name,
      baseRate: Number(roomType.baseRate),
      capacity: roomType.capacity,
      description: roomType.description ?? "",
      amenityIds: roomType.amenities.map((amenity) => amenity.id),
    },
  });

  useEffect(() => {
    form.reset({
      roomTypeId: roomType.id,
      name: roomType.name,
      baseRate: Number(roomType.baseRate),
      capacity: roomType.capacity,
      description: roomType.description ?? "",
      amenityIds: roomType.amenities.map((amenity) => amenity.id),
    });
  }, [roomType, form]);

  const updateMutation = api.roomType.update.useMutation({
    onSuccess: () => {
      toast.success("Room type updated");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedAmenityIds = form.watch("amenityIds") ?? [];

  function toggleAmenity(id: string, checked: boolean) {
    const current = form.getValues("amenityIds") ?? [];
    form.setValue(
      "amenityIds",
      checked ? [...current, id] : current.filter((a) => a !== id),
      { shouldValidate: true },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit room type</DialogTitle>
          <DialogDescription>
            Update this room type&apos;s details.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) =>
            updateMutation.mutate(values),
          )}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Deluxe Suite"
              {...form.register("name")}
              autoComplete="off"
            />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="baseRate">Base rate</Label>
              <Input
                id="baseRate"
                type="number"
                step="0.01"
                {...form.register("baseRate")}
              />
              {form.formState.errors.baseRate && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.baseRate.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...form.register("capacity")}
              />
              {form.formState.errors.capacity && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.capacity.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-destructive text-sm">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Amenities</Label>
            <ScrollArea className="h-40 rounded-md border p-2">
              <div className="flex flex-col gap-2">
                {amenitiesData?.amenities.map((amenity) => (
                  <div key={amenity.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`amenity-${amenity.id}`}
                      checked={selectedAmenityIds.includes(amenity.id)}
                      onCheckedChange={(checked) =>
                        toggleAmenity(amenity.id, checked === true)
                      }
                    />
                    <label
                      htmlFor={`amenity-${amenity.id}`}
                      className="text-sm"
                    >
                      {amenity.name}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {form.formState.errors.amenityIds && (
              <p className="text-destructive text-sm">
                {form.formState.errors.amenityIds.message}
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
