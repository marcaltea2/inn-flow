"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import {
  createAmenitySchema,
  type CreateAmenityInput,
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
import { AmenityCategory } from "@prisma/client";
import { IconPicker } from "./icon-picker";

export function AmenityCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const form = useForm<CreateAmenityInput>({
    resolver: zodResolver(createAmenitySchema),
    defaultValues: {
      name: "",
      icon: "sparkles",
      category: AmenityCategory.SERVICES,
      isGuestFacing: true,
    },
  });

  const createMutation = api.amenity.create.useMutation({
    onSuccess: () => {
      toast.success("Amenity created");
      form.reset();
      onOpenChange(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add amenity</DialogTitle>
          <DialogDescription>
            Create a new amenity that can be assigned to room types.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((values) =>
            createMutation.mutate(values),
          )}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Free WiFi"
              {...form.register("name")}
              autoComplete="off"
            />
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
                form.setValue("category", v as CreateAmenityInput["category"])
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating…" : "Create amenity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
