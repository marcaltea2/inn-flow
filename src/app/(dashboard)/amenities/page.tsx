import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "~/server/api/rbac";
import { AmenitiesTable } from "./_components/amenities-table";


export default async function AmenitiesPage() {
const session = await auth();

  if (!session?.user || !hasPermission(session.user.role, "staff", "view")) {
    redirect("/");
  }

  const canManage = hasPermission(session.user.role, "staff", "manage");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Amenities</h1>
          <p className="text-sm text-muted-foreground">
            Manage the amenities available across your room types.
          </p>
        </div>
      </div>

      <AmenitiesTable canManage={canManage} />
    </div>
  );
}
