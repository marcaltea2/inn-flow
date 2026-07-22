"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api, type RouterOutputs } from "~/trpc/react";
import {
  updateAmenitySchema,
  type UpdateAmenityInput,
} from "~/server/validations/amenity-validation";
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
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { AMENITY_CATEGORIES } from "~/server/validations/amenity-validation";
import { formatCategory } from "~/lib/format-category";
import { IconPicker } from "./icon-picker";

type Amenity = RouterOutputs["amenity"]["getAll"]["amenities"][number];

export function AmenityEditDialog({
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
  const form = useForm<UpdateAmenityInput>({
    resolver: zodResolver(updateAmenitySchema),
    defaultValues: {
      amenityId: amenity.id,
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category,
      isGuestFacing: amenity.isGuestFacing,
    },
  });

  // Reset form values whenever a different amenity is opened for editing
  useEffect(() => {
    form.reset({
      amenityId: amenity.id,
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category,
      isGuestFacing: amenity.isGuestFacing,
    });
  }, [amenity, form]);

  const updateMutation = api.amenity.update.useMutation({
    onSuccess: () => {
      toast.success("Amenity updated");
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit amenity</DialogTitle>
          <DialogDescription>
            Update this amenity&apos;s details.
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
            <Input id="name" {...form.register("name")} autoComplete="off" />
            {form.formState.errors.name && (
              <p className="text-destructive text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="icon">Icon</Label>
            <div className="flex items-center gap-2">
              <IconPicker
                value={form.watch("icon")}
                onChange={(name) =>
                  form.setValue("icon", name, { shouldValidate: true })
                }
              />
              <p className="text-muted-foreground text-sm">
                {form.watch("icon") || "No icon selected"}
              </p>
            </div>
            {form.formState.errors.icon && (
              <p className="text-destructive text-sm">
                {form.formState.errors.icon.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formatCategory(form.watch("category"))}
              onValueChange={(v) =>
                form.setValue("category", v as UpdateAmenityInput["category"])
              }
            >
              <SelectTrigger id="category">
                <SelectValue>
                  {formatCategory(form.watch("category"))}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {AMENITY_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {formatCategory(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="isGuestFacing">Guest-facing</Label>
              <p className="text-muted-foreground text-xs">
                Show this amenity on the guest booking page.
              </p>
            </div>
            <Switch
              id="isGuestFacing"
              checked={form.watch("isGuestFacing")}
              onCheckedChange={(v) => form.setValue("isGuestFacing", v)}
            />
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
