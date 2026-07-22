"use client";

import { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

// Curated set of icons relevant to hotel amenities — keeps the picker focused
// instead of dumping all ~1500 lucide icons into an unusable wall.
const AMENITY_ICON_NAMES = [
  "wifi", "car", "coffee", "utensils", "waves", "dumbbell", "bath",
  "wind", "snowflake", "flame", "tv", "phone", "briefcase", "shirt",
  "washing-machine", "refrigerator", "microwave", "bed", "bed-double",
  "sofa", "lamp", "door-open", "key", "shield-check", "lock",
  "camera", "baby", "dog", "cigarette", "cigarette-off", "wine",
  "beer", "cup-soda", "ice-cream", "pizza", "sun", "sunrise",
  "mountain", "trees", "flower", "umbrella", "palmtree", "anchor",
  "sailboat", "bike", "footprints", "accessibility", "elevator",
  "luggage", "map-pin", "clock", "calendar", "check-circle",
  "star", "heart", "gift", "party-popper", "music", "gamepad-2",
  "book-open", "printer", "wrench", "sparkles", "fan", "plug",
  "battery-charging", "monitor", "headphones", "volume-2",
] as const;

function toPascalCase(kebab: string) {
  return kebab
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join("");
}

export function IconPreview({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as unknown as Record<string, LucideIcons.LucideIcon>)[
    toPascalCase(name)
  ];
  if (!Icon) return <LucideIcons.HelpCircle className={className ?? "size-5"} />;
  return <Icon className={className ?? "size-5"} />;
}

export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconName: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return AMENITY_ICON_NAMES;
    return AMENITY_ICON_NAMES.filter((name) => name.includes(q));
  }, [search]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="border-input hover:bg-accent flex size-9 shrink-0 items-center justify-center rounded-md border transition-colors"
        aria-label="Choose icon"
      >
        <IconPreview name={value} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an icon</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search icons…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
              autoFocus
            />
          </div>

          <div className="grid max-h-80 grid-cols-6 gap-2 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <p className="text-muted-foreground col-span-6 py-8 text-center text-sm">
                No icons match &quot;{search}&quot;.
              </p>
            )}
            {filtered.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "hover:bg-accent flex flex-col items-center gap-1 rounded-md border p-2 transition-colors",
                  value === name ? "border-primary bg-accent" : "border-transparent",
                )}
                title={name}
              >
                <IconPreview name={name} className="size-5" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}