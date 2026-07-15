"use client";

import { useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import { Button } from "~/components/ui/button";
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

type StaffMember = RouterOutputs["staff"]["getAll"][number];

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  MANAGER: "secondary",
  FRONT_DESK: "outline",
  HOUSEKEEPING: "outline",
};

export function StaffTable({
  initialData,
  canManage,
}: {
  initialData: StaffMember[];
  canManage: boolean;
}) {
  const utils = api.useUtils();
  const { data: staff } = api.staff.getAll.useQuery(undefined, { initialData });

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null);
  const [resetTarget, setResetTarget] = useState<StaffMember | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<StaffMember | null>(
    null,
  );

  const invalidate = () => utils.staff.getAll.invalidate();

  return (
    <>
      <div className="flex justify-end">
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
            {staff.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground h-24 text-center"
                >
                  No staff accounts yet.
                </TableCell>
              </TableRow>
            )}
            {staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">
                  {member.staff?.firstName} {member.staff?.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {member.email}
                </TableCell>
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
                        <DropdownMenuItem
                          onClick={() => setResetTarget(member)}
                        >
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

      <StaffCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={invalidate}
      />

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
