import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { api } from "~/trpc/server";
import { hasPermission } from "~/server/api/rbac";
import { StaffTable } from "./_components/staff-table";

export default async function StaffPage() {
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "staff", "view")) {
    redirect("/");
  }

  const canManage = hasPermission(session.user.role, "staff", "manage");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts and roles.
          </p>
        </div>
      </div>

      <StaffTable canManage={canManage} />
    </div>
  );
}