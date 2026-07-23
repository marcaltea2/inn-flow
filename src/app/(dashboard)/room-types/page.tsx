import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "~/server/api/rbac";
import { RoomTypesTable } from "./_components/room-types-table";

export default async function RoomTypesPage() {
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "staff", "view")) {
    redirect("/");
  }

  const canManage = hasPermission(session.user.role, "staff", "manage");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Room Types</h1>
          <p className="text-sm text-muted-foreground">
            Manage room categories, rates, and capacity.
          </p>
        </div>
      </div>

      <RoomTypesTable canManage={canManage} />
    </div>
  );
}
