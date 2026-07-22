"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AmenityCreateDialog } from "./amenity-create-dialog";
import { AmenityEditDialog } from "./amenity-edit-dialog";
import { DeactivateAmenityDialog } from "./deactivate-amenity-dialog";
import { IconPreview } from "./icon-picker";

type Amenity = RouterOutputs["amenity"]["getAll"]["amenities"][number];

const PAGE_SIZE = 10;

function formatCategory(category: string) {
  return category
    .toLowerCase()
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function AmenitiesTable({ canManage }: { canManage: boolean }) {
  const utils = api.useUtils();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce: only update the actual query param 350ms after typing stops
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // reset to page 1 whenever the search term changes
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading } = api.amenity.getAll.useQuery({
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Amenity | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Amenity | null>(
    null,
  );

  const invalidate = () => utils.amenity.getAll.invalidate();

  const amenities = data?.amenities ?? [];
  const totalPages = data?.totalPages ?? 1;
  const colSpan = canManage ? 7 : 6;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add amenity
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Guest-Facing</TableHead>
              <TableHead>Used By</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-muted-foreground h-24 text-center"
                >
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && amenities.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-muted-foreground h-24 text-center"
                >
                  {search
                    ? "No amenities match your search."
                    : "No amenities yet."}
                </TableCell>
              </TableRow>
            )}
            {amenities.map((amenity) => {
              const isActive = !amenity.deactivatedAt;
              return (
                <TableRow key={amenity.id}>
                  <TableCell>
                    <IconPreview name={amenity.icon} className="size-4" />
                  </TableCell>
                  <TableCell className="font-medium">{amenity.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatCategory(amenity.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {amenity.isGuestFacing ? (
                      <Eye className="text-muted-foreground size-4" />
                    ) : (
                      <EyeOff className="text-muted-foreground size-4" />
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {amenity._count.roomTypes} room type
                    {amenity._count.roomTypes === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isActive ? "secondary" : "outline"}>
                      {isActive ? "Active" : "Deactivated"}
                    </Badge>
                  </TableCell>
                  {canManage && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setEditTarget(amenity)}
                          >
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={isActive ? "text-destructive" : ""}
                            onClick={() => setDeactivateTarget(amenity)}
                          >
                            {isActive ? "Deactivate" : "Reactivate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <AmenityCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={invalidate}
      />

      {editTarget && (
        <AmenityEditDialog
          amenity={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSuccess={invalidate}
        />
      )}

      {deactivateTarget && (
        <DeactivateAmenityDialog
          amenity={deactivateTarget}
          open={!!deactivateTarget}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
          onSuccess={invalidate}
        />
      )}
    </>
  );
}
