"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createRoomSchema,
  type CreateRoomInput,
} from "~/server/validations/room-validation";
import { api } from "~/trpc/react";
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

export function RoomCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { data: roomTypesData } = api.roomType.getAll.useQuery(
    { pageSize: 100 },
    { enabled: open },
  );

  const form = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      number: "",
      floor: 0,
      roomTypeId: "",
    },
  });

  const createMutation = api.room.create.useMutation({
    onSuccess: () => {
      toast.success("Room created");
      form.reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const roomTypeId = form.watch("roomTypeId");
  const selectedRoomType = roomTypesData?.roomTypes.find(
    (rt) => rt.id === roomTypeId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add room</DialogTitle>
          <DialogDescription>
            Create a room that can be assigned to guests during reservations and
            check-in.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate(values),
          )}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="number">Room number</Label>
              <Input
                id="number"
                placeholder="e.g. A01"
                {...form.register("number")}
                autoComplete="off"
              />
              {form.formState.errors.number && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.number.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" type="number" {...form.register("floor")} />
              {form.formState.errors.floor && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.floor.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="roomTypeId">Room type</Label>
            <Select
              value={roomTypeId}
              onValueChange={(v) =>
                form.setValue("roomTypeId", v ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger id="roomTypeId">
                <SelectValue>
                  {selectedRoomType?.name ?? "Select a room type"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {roomTypesData?.roomTypes.map((roomType) => (
                  <SelectItem key={roomType.id} value={roomType.id}>
                    {roomType.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.roomTypeId && (
              <p className="text-destructive text-sm">
                {form.formState.errors.roomTypeId.message}
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
