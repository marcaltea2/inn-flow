import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "~/server/api/rbac";
import { RoomsTable } from "./_components/rooms-table";

export default async function page() {
  const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "staff", "view")) {
    redirect("/");
  }

  const canManage = hasPermission(session.user.role, "roomType", "manage");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rooms</h1>  
          <p className="text-muted-foreground text-sm">
             Manage individual rooms, their assigned room types, and availability.
          </p>
        </div>
      </div>

      <RoomsTable canManage={canManage} />
    </div>
  );
}
