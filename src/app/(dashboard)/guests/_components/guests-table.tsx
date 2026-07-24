"use client";

import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
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
import { GuestCreateDialog } from "./guest-create-dialog";
import { GuestEditDialog } from "./guest-edit-dialog";

type Guest = RouterOutputs["guest"]["getAll"]["guests"][number];
const PAGE_SIZE = 10;

export function GuestsTable({ canManage }: { canManage: boolean }) {
  const utils = api.useUtils();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isLoading } = api.guest.getAll.useQuery({
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Guest | null>(null);

  const invalidate = () => utils.guest.getAll.invalidate();

  const guests = data?.guests ?? [];
  const totalPages = data?.totalPages ?? 1;
  const colSpan = canManage ? 6 : 5;

  function isRegistered(guest: Guest) {
    return Boolean(guest.dateOfBirth && guest.idNumber);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or phone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add guest
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Reservations</TableHead>
              <TableHead>Registration</TableHead>
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
            {!isLoading && guests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={colSpan}
                  className="text-muted-foreground h-24 text-center"
                >
                  {search ? "No guests match your search." : "No guests yet."}
                </TableCell>
              </TableRow>
            )}
            {guests.map((guest) => {
              const registered = isRegistered(guest);
              return (
                <TableRow key={guest.id}>
                  <TableCell className="font-medium">
                    {guest.firstName} {guest.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.email ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest.phone ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {guest._count.reservations} reservation
                    {guest._count.reservations === 1 ? "" : "s"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={registered ? "secondary" : "outline"}>
                      {registered ? "Complete" : "Pending"}
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
                            onClick={() => setEditTarget(guest)}
                          >
                            Edit details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            render={
                              <Link
                                href={`/guests/${guest.id}/registration-card`}
                              >
                                {registered
                                  ? "View registration"
                                  : "Complete registration"}
                              </Link>
                            }
                          ></DropdownMenuItem>
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

      <GuestCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={invalidate}
      />

      {editTarget && (
        <GuestEditDialog
          guest={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSuccess={invalidate}
        />
      )}
    </>
  );
}
