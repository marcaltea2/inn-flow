"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
import { StaffCreateDialog } from "./staff-create-dialog";
import { StaffEditDialog } from "./staff-edit-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { DeactivateStaffDialog } from "./deactivate-staff-dialog";
import { formatRole } from "~/lib/format-role";

type StaffMember = RouterOutputs["staff"]["getAll"]["staff"][number];

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  MANAGER: "secondary",
  FRONT_DESK: "outline",
  HOUSEKEEPING: "outline",
};

const PAGE_SIZE = 10;

export function StaffTable({ canManage }: { canManage: boolean }) {
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

  const { data, isLoading } = api.staff.getAll.useQuery({
    search: search || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(
    null,
  );

  const invalidate = () => utils.staff.getAll.invalidate();

  const staff = data?.staff ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            placeholder="Search by name, email, or ID…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
        {canManage && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add staff
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              {canManage && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!isLoading && staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground h-24 text-center">
                  {search ? "No staff match your search." : "No staff accounts yet."}
                </TableCell>
              </TableRow>
            )}
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.staff?.firstName} {member.staff?.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground">{member.email}</TableCell>
                <TableCell>
                  <Badge variant={roleBadgeVariant[member.role]}>
                    {formatRole(member.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={member.isActive ? "secondary" : "outline"}>
                    {member.isActive ? "Active" : "Deactivated"}
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
                        <DropdownMenuItem onClick={() => setEditTarget(member)}>
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setResetTarget(member)}>
                          Reset password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={member.isActive ? "text-destructive" : ""}
                          onClick={() => setDeactivateTarget(member)}
                        >
                          {member.isActive ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
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

      <StaffCreateDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={invalidate} />

      {editTarget && (
        <StaffEditDialog
          staff={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onSuccess={invalidate}
        />
      )}

      {resetTarget && (
        <ResetPasswordDialog
          staff={resetTarget}
          open={!!resetTarget}
          onOpenChange={(open) => !open && setResetTarget(null)}
        />
      )}

      {deactivateTarget && (
        <DeactivateStaffDialog
          staff={deactivateTarget}
          open={!!deactivateTarget}
          onOpenChange={(open) => !open && setDeactivateTarget(null)}
          onSuccess={invalidate}
        />
      )}
    </>
  );
}