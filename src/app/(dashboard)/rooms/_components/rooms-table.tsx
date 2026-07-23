"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
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

import { RoomCreateDialog } from "./room-create-dialog";
import { RoomEditDialog } from "./room-edit-dialog";
import { DeactivateRoomDialog } from "./deactivate-room-dialog";
import { formatString } from "~/lib/format-string";

type Room = RouterOutputs["room"]["getAll"]["rooms"][number];
const PAGE_SIZE = 10;

export function RoomsTable({ canManage }: { canManage: boolean }) {
  const utils = api.useUtils();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1); // reset to page 1 whenever the search term changes
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading } = api.room.getAll.useQuery({
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Room | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Room | null>(null);

  const invalidate = () => utils.room.getAll.invalidate();

  const rooms = data?.rooms ?? [];
  const totalPages = data?.totalPages ?? 1;
  const colSpan = canManage ? 7 : 6;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add room
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Room Type</TableHead>
              <TableHead>Room Status</TableHead>
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
            {!isLoading && rooms.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-muted-foreground h-24 text-center"
                >
                  {search ? "No room match your search." : "No room yet."}
                </TableCell>
              </TableRow>
            )}
            {rooms.map((room) => {
              const isActive = !room.deactivatedAt;

              return (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.number}</TableCell>
                  <TableCell className="font-medium">{Number(room.floor)}</TableCell>
                  <TableCell className="font-medium">
                    {room.roomType.name}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatString(room.status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {room._count.reservations} reservation
                    {room._count.reservations === 1 ? "" : "s"}
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
                          <DropdownMenuItem onClick={() => setEditTarget(room)}>
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className={isActive ? "text-destructive" : ""}
                            onClick={() => setDeactivateTarget(room)}
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

      <RoomCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={invalidate}
      />

      {editTarget && (
        <RoomEditDialog
          room={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSuccess={invalidate}
        />
      )}

      {deactivateTarget && (
        <DeactivateRoomDialog
          room={deactivateTarget}
          open={!!deactivateTarget}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
          onSuccess={invalidate}
        />
      )}
    </>
  );
}
